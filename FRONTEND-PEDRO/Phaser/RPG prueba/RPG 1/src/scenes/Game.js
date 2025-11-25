import { Player } from "../GameObjects/player.js";
import { NPC } from "../GameObjects/npc.js";
import { Minero } from "../GameObjects/minero.js";

connect2Server();

// Escuchar el evento que trae los dragones del JSON
getEvent("obtenerdragones", (data) => {
  const dragones = data.dragones;

  // filtra los dragones que están en mapa 1
  window.dragonesSeleccionados = dragones.filter((d) => d.mapa === 1);
});

export class Game extends Phaser.Scene {
  constructor() {
    super("Game");
  }

  preload() {
    //Carga del mapa
    this.load.image("tiles", "assets/town_forest_tiles.png");
    this.load.tilemapTiledJSON("map", "assets/mapa_grande.json");

    //asignacion del sprite al personaje
    this.load.spritesheet("dude", "assets/dude.png", {
      frameWidth: 32,
      frameHeight: 46,
    });

    //asignacion del sprite al dragon
    window.dragonesData?.forEach((d) => {
      this.load.image("dragon_" + d.id, d.imagen);
    });

    //asignacopn del spirte al viejo
    this.load.image("chimuelo", "assets/pinguino.png");

    //asignacion de la coke
    this.load.image("coke", "assets/coke.png");
  }
  create(data) {
    this.messageText = this.add
      .text(860, 15, "", {
        fontSize: "20px",
        fill: "#000000",
        backgroundColor: "#f7e8ad",
        padding: { x: 10, y: 5 },
        fontFamily: "Pixelify Sans",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(1000)
      .setVisible(false);

    const map = this.make.tilemap({ key: "map" });
    const tileset = map.addTilesetImage("mapa 2", "tiles");

    //creacion de las capas
    const ground = map.createLayer("piso", tileset, 0, 0);
    const camino = map.createLayer("camino", tileset, 0, 0);
    const obstaculos = map.createLayer("obstaculos", tileset, 0, 0);
    const casa = map.createLayer("casa", tileset, 0, 0);
    const puertas = map.createLayer("puertas visibles", tileset, 0, 0);
    const corral_dragones = map.createLayer("corral dragones", tileset, 0, 0);

    //spawn jugador
    const startX = data?.x ?? 16;
    const startY = data?.y ?? 160;

    //movimiento
    this.cursors = this.input.keyboard.createCursorKeys();

    //se activa la tecla E
    this.keyE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

    //creo el Player
    this.player = new Player(this, startX, startY, this.cursors);

    //creacion de los dragones
    this.dragons = this.physics.add.group();
    // si ya llegaron por socket:
    if (window.dragonesData) {
      window.dragonesData.forEach((d) => {
        // Crear NPC en la posición inicial del dragón
        const x = Phaser.Math.Between(896, 1424);
        const y = Phaser.Math.Between(32, 352);
        const npc = new NPC(this, x, y);

        // Asignar la imagen (textura) del dragón
        npc.setTexture(d.imagenKey);

        this.grupoDragones.add(npc);
      });
    }

    //creo la coke
    const coke = this.physics.add.sprite(256, 160, "coke");

    coke.setImmovable(true); // no se mueve
    this.physics.add.overlap(this.player, coke, this.pickUpCoke, null, this);

    //dragon especial
    this.chimuelo = new Minero(this, 350, 160);

    //colliders
    obstaculos.setCollisionByExclusion([-1]);
    casa.setCollisionByExclusion([-1]);
    corral_dragones.setCollisionByExclusion([-1]);

    //colliders con el player
    this.physics.add.collider(this.player, obstaculos);
    this.physics.add.collider(this.player, casa);

    //colliders con el dragon
    this.physics.add.collider(this.dragons, obstaculos);
    this.physics.add.collider(this.dragons, corral_dragones);
    this.physics.add.collider(this.dragons, casa);
    this.physics.add.collider(this.dragons, this.dragons);

    //worldbounds
    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    //camara
    this.cameras.main.startFollow(this.player);
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    // trigger para pasar al Mapa2
    const trigger = map.findObject("puertas", (obj) => obj.name === "door");
    this.door = this.physics.add.sprite(trigger.x, trigger.y, null);
    this.door.setSize(trigger.width, trigger.height);
    this.door.setVisible(false);

    //puerta de acceso a la casa (cambio de escena)
    this.physics.add.overlap(this.player, this.door, () => {
      this.scene.start("Casa", { x: 368, y: 448 }); // posición inicial en Mapa2
    });

    //cambio de escena a la batalla
    /*this.physics.add.overlap(this.player, this.dragons, () => {
      window.location.href = "../../../../inventario/inventario.html";
    });*/

    this.physics.add.overlap(
      this.player,
      this.chimuelo,
      this.tryGiveCoke,
      null,
      this
    );

    this.cokeGiven = false;

    this.showingInteractMessage = false;
  }

  pickUpCoke(player, coke) {
    this.hasCoke = true; // variable que indica que el jugador tiene la coca
    coke.disableBody(true, true); // desaparece del mapa
    this.showMessage("Agarraste la coca!");
  }

  tryGiveCoke(player, chimuelo) {
    if (this.cokeGiven === true) return;

    if (!this.showingInteractMessage) {
      this.showMessage("Presioná E para interactuar");
    }

    this.nearChimuelo = chimuelo;
  }

  showMessage(text) {
    this.messageText.setText(text);
    this.messageText.setVisible(true);

    // Oculta el mensaje después de 2 segundos
    this.time.delayedCall(2000, () => {
      this.messageText.setVisible(false);
    });
  }

  update() {
    if (this.nearChimuelo && Phaser.Input.Keyboard.JustDown(this.keyE)) {
      this.showingInteractMessage = false;

      if (this.hasCoke && !this.cokeGiven) {
        this.hasCoke = false;
        this.cokeGiven = true;
        this.showMessage("Gracias por la coca");
        this.chimuelo.setTint(0x00ff00);
        this.nearChimuelo = null;
      } else if (!this.hasCoke) {
        this.showMessage("No tenés la Coca todavía!");
      }
    }
  }
}
