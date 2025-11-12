import { Player } from "../GameObjects/player.js";
import { NPC } from "../GameObjects/npc.js";

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
    this.load.spritesheet("dragon", "assets/dragon.png", {
      frameWidth: 32,
      frameHeight: 32,
    });
    //asignacopn del spirte al viejo
    this.load.spritesheet("chimuelo", "assets/viejo_npc.png", {
      frameWidth: 32,
      frameHeight: 32,
    });
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

    //creo el Player
    this.player = new Player(this, startX, startY, this.cursors);

    //creo la coke
    const coke = this.physics.add.sprite(256, 160, "coke");

    coke.setImmovable(true); // no se mueve
    this.physics.add.overlap(this.player, coke, this.pickUpCoke, null, this);

    //dragon especial
    this.chimuelo = new NPC(this, 350, 160);

    //dragon
    this.dragons = this.physics.add.group();

    for (let i = 0; i < 5; i++) {
      const x = Phaser.Math.Between(896, 1424);
      const y = Phaser.Math.Between(32, 352);
      const dragon = new NPC(this, x, y);
      this.dragons.add(dragon);

      dragon.setBounce(1, 1).setCollideWorldBounds(true);
    }

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
  }
  pickUpCoke(player, coke) {
    this.hasCoke = true; // variable que indica que el jugador tiene la coca
    coke.disableBody(true, true); // desaparece del mapa
    this.showMessage("Agarraste la coca!");
  }
  giveCokeToNPC(player, npc) {
    if (this.hasCoke) {
      // ✅ si el jugador tiene la coca
      this.showMessage("Le diste la Coca al NPC!");
      this.hasCoke = false; // ❌ ya no la tiene
      // Podés poner una animación, sonido, o cambiar el diálogo
    } else {
      this.showMessage("No tenés la Coca todavía!");
    }
  }
  showMessage(text) {
    this.messageText.setText(text);
    this.messageText.setVisible(true);

    // Oculta el mensaje después de 2 segundos
    this.time.delayedCall(3000, () => {
      this.messageText.setVisible(false);
    });
  }

  update() {
    // actualizamos cada dragón
    this.dragons.children.iterate((dragon) => {
      dragon.update();
    });
  }
}
