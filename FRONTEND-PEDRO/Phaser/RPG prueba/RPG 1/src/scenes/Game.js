import { Player } from "../GameObjects/player.js";
import { NPC } from "../GameObjects/npc.js";
import { Minero } from "../GameObjects/minero.js";

connect2Server();

export class Game extends Phaser.Scene {
  constructor() {
    super("Game");

    // Escuchar el evento que trae los dragones del JSON
    getEvent("obtenerdragones", (data) => {
      const dragones = data.dragones;

      // filtra los dragones que están en mapa 1
      this.dragonesSeleccionados = dragones.filter((d) => d.mapa === 1);

      this.dragonesSeleccionados?.forEach((d) => {
        this.load.image("dragon_" + d.id, "../../../../BACKEND/" + d.imagen);
      });

      this.load.start();
    });
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

    this.sceneStarted = true;

    //creacion de los dragones
    this.dragons = this.physics.add.group();

    this.spawnDragons = (cantidad) => {
      if (!this.dragonesSeleccionados) return;

      const dragones_mapa1 = Phaser.Utils.Array.Shuffle([
        ...this.dragonesSeleccionados,
      ]).slice(0, cantidad);

      dragones_mapa1.forEach((d) => {
        const x = Phaser.Math.Between(896, 1424);
        const y = Phaser.Math.Between(32, 352);

        const dragon = new NPC(this, x, y);
        dragon.setTexture("dragon_" + d.id);

        this.dragons.add(dragon);
      });
    };

    //funcion que crea los  5 dragones iniciales
    this.spawnInitialDragons = () => {
      if (!this.dragonesSeleccionados) return;

      if (!this.initialSpawnDone) {
        this.spawnDragons(5);
        this.initialSpawnDone = true;
      }
    };

    // Si el JSON ya llegó crear los dragones ahora
    if (this.dragonesSeleccionados) {
      this.spawnInitialDragons();
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
    this.interactionProcess = false;
  }

  pickUpCoke(player, coke) {
    this.hasCoke = true; // variable que indica que el jugador tiene la coca
    coke.disableBody(true, true); // desaparece del mapa
    this.showMessage("Agarraste la coca!");
  }

  tryGiveCoke(player, chimuelo) {
    if (this.cokeGiven === true) return;
    if (this.interactionProcess === true) return;
    this.showMessage("Presioná E para interactuar");

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
      if (this.hasCoke && !this.cokeGiven) {
        this.hasCoke = false;
        this.cokeGiven = true;
        this.showMessage("Gracias por la coca");
        this.chimuelo.setTint(0x00ff00);
        this.nearChimuelo = null;
      } else if (!this.hasCoke) {
        this.interactionProcess === true;
        this.showMessage("No tenés la Coca todavía!");
      }
    }

    //si quedan menos de 4 dragones spawnean 2
    if (this.dragons.countActive(true) < 4 && this.dragonesSeleccionados) {
      this.spawnDragons(2);
    }
  }
}
