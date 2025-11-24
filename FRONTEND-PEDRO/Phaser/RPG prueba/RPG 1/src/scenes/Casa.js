import { Player } from "../GameObjects/player.js";

connect2Server();

export class Casa extends Phaser.Scene {
  constructor() {
    super("Casa");
  }

  preload() {
    //carga el mapa
    this.load.image("tiles", "assets/town_forest_tiles.png");
    this.load.tilemapTiledJSON("casa", "assets/casa_adentro.json");

    //asignacion del sprite al personaje
    this.load.spritesheet("dude", "assets/dude.png", {
      frameWidth: 32,
      frameHeight: 48,
    });
  }

  create(data) {
    const casa = this.make.tilemap({ key: "casa" });
    const tileset = casa.addTilesetImage("mapa 2", "tiles");
    //capas
    const suelo_casa = casa.createLayer("suelo casa", tileset, 0, 0);
    const cofres = casa.createLayer("objetos", tileset, 0, 0);
    const limit = casa.createLayer("bloques invisibles", tileset, 0, 0);

    //creando las teclas para movimiento
    this.cursors = this.input.keyboard.createCursorKeys();

    // Spawn del jugador en la posición recibida desde Mapa1
    this.player = new Player(this, data.x, data.y, this.cursors);

    //colliders
    cofres.setCollisionByExclusion([-1]);
    this.physics.add.collider(this.player, cofres);
    limit.setCollisionByExclusion([-1]);
    this.physics.add.collider(this.player, limit);

    //worldbounds
    this.physics.world.setBounds(0, 0, casa.widthInPixels, casa.heightInPixels);
    this.player.setBounce(0).setCollideWorldBounds(true);

    //camara
    this.cameras.main.setBounds(0, 0, casa.widthInPixels, casa.heightInPixels);
    this.cameras.main.startFollow(this.player);

    //puerta
    const trigger = casa.findObject("puertas", (obj) => obj.name === "door");
    this.door = this.physics.add.sprite(trigger.x, trigger.y, null);
    this.door.setSize(trigger.width, trigger.height);
    this.door.setVisible(false);

    this.physics.add.overlap(this.player, this.door, () => {
      this.scene.start("Game", { x: 1232, y: 624 }); // posición inicial en Mapa2
    });
  }

  update() {
    if (
      this.cursors.left.isDown ||
      this.cursors.right.isDown ||
      this.cursors.up.isDown ||
      this.cursors.down.isDown
    ) {
      if (this.cursors.left.isDown) {
        this.player.moveLeft();
      }
      if (this.cursors.right.isDown) {
        this.player.moveRight();
      }
      if (this.cursors.up.isDown) {
        this.player.moveUp();
      }
      if (this.cursors.down.isDown) {
        this.player.moveDown();
      }
    } else {
      this.player.idle();
    }
  }
}
