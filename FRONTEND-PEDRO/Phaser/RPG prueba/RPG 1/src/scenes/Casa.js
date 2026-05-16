import { Player } from "../GameObjects/player.js";

connect2Server();

export class Casa extends Phaser.Scene {
  constructor() {
    super("Casa");
  }

  preload() {
    //carga el mapa
    this.load.image("tiles", "assets/town_forest_tiles.png");
    this.load.image("healerPokemon", "assets/healerPokemon.png");
    this.load.tilemapTiledJSON("casa", "assets/casa_adentro.json");

    //asignacion del sprite al personaje
    this.load.spritesheet("dude", "assets/dude.png", {
      frameWidth: 32,
      frameHeight: 48,
    });
  }

  create(data) {
    const margin = 10;
    const cam = this.cameras.main;

    this.messageText = this.add
      .text(0, 0, "", {
        fontSize: "20px",
        fill: "#000000",
        backgroundColor: "#f7e8ad",
        padding: { x: 10, y: 5 },
        fontFamily: "Pixelify Sans",
        wordWrap: { width: cam.width * 0.3 },
      })
      .setPosition(cam.width - margin, margin)
      .setScrollFactor(0)
      .setDepth(1000)
      .setVisible(false);

    const casa = this.make.tilemap({ key: "casa" });
    const tileset = casa.addTilesetImage("mapa 2", "tiles");
    const healer = casa.addTilesetImage("healerPokemon", "healerPokemon");
    //capas
    const suelo_casa = casa.createLayer("suelo casa", tileset, 0, 0);
    const cofres = casa.createLayer("objetos", [tileset, healer], 0, 0);
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
    const doorTrigger = casa.findObject(
      "puertas",
      (obj) => obj.name === "door",
    );
    this.door = this.physics.add.sprite(doorTrigger.x, doorTrigger.y, null);
    this.door.setSize(doorTrigger.width, doorTrigger.height);
    this.door.setVisible(true);

    this.keyE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

    //healer
    const healerObjects = casa.getObjectLayer("Healers").objects;

    const healerTrigger = casa.findObject(
      "Healers",
      (obj) => obj.name === "Healer",
    );
    this.healer = this.physics.add.sprite(
      healerTrigger.x,
      healerTrigger.y,
      null,
    );
    this.healer.setSize(healerTrigger.width, healerTrigger.height);
    this.healer.setVisible(true);

    this.physics.add.overlap(this.player, this.door, () => {
      this.scene.start("Game", { x: 992, y: 320 }); // posición cuando sale del mapa 2
    });

    this.nearHealer = false;
    this.showingInteractMessage = false;

    this.physics.add.overlap(
      this.player,
      this.healer,
      this.handleHealer,
      null,
      this,
    );
  }

  showMessage(text) {
    this.interactionMessage = true;

    this.messageText.setText(text);
    this.messageText.setVisible(true);

    // cancela timer anterior
    if (this.hideMessageTimer) {
      this.hideMessageTimer.remove(false);
    }

    // crea nuevo timer
    this.hideMessageTimer = this.time.delayedCall(2000, () => {
      this.messageText.setVisible(false);
      this.interactionMessage = false;
    });
  }

  handleHealer() {
    if (!this.showingInteractMessage) {
      this.messageText.setText("Presioná E para interactuar");
      this.messageText.setVisible(true);
      this.showingInteractMessage = true;
    }

    if (Phaser.Input.Keyboard.JustDown(this.keyE)) {
      let usuario = JSON.parse(localStorage.getItem("usuario"));

      postEvent("curarDragones", { idusuario: usuario.id }, (respuesta) => {
        console.log("Respuesta:", respuesta);
        if (respuesta.exito) {
          this.showMessage("¡Tus dragones fueron curados!");
        }
      });
    }
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
