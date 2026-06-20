import { Player } from "../GameObjects/player.js";
import { guardarEstado } from "../utils/persistencia.js";

connect2Server();

export class Casa extends Phaser.Scene {
  constructor() {
    super("Casa");
  }

  preload() {
    //carga el mapa
    this.load.image("tiles", "assets/casa_interna.png");
    this.load.tilemapTiledJSON("casa", "assets/curadero.json");

    //asignacion del sprite al personaje
    this.load.spritesheet("player", "assets/player.png", {
      frameWidth: 32,
      frameHeight: 32,
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
    const tileset = casa.addTilesetImage("Decoracion casa interna", "tiles");

    //capas
    const piso = casa.createLayer("Piso", tileset, 0, 0);

    const alfombras = casa.createLayer("Alfombras", tileset, 0, 0);
    const paredes = casa.createLayer("Paredes ventana", tileset, 0, 0);
    const decoracion = casa.createLayer("Decoracion", tileset, 0, 0);

    const limit = casa.createLayer("bloques invisibles", tileset, 0, 0);
    limit.setVisible(false);

    //creando las teclas para movimiento
    this.cursors = this.input.keyboard.createCursorKeys();

    // ✅ posición default por si entra sin data
    const startX = data?.x ?? 368;
    const startY = data?.y ?? 448;

    // Spawn del jugador en la posición recibida desde Mapa1
    this.player = new Player(this, startX, startY, this.cursors);

    //colliders
    decoracion.setCollisionByExclusion([-1]);
    this.physics.add.collider(this.player, decoracion);
    paredes.setCollisionByExclusion([-1]);
    this.physics.add.collider(this.player, paredes);
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
    this.door.setVisible(false);

    this.keyE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

    //healer
    /*const healerObjects = casa.getObjectLayer("Healers").objects;

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

    this.nearHealer = false;
    this.showingInteractMessage = false;

    this.physics.add.overlap(
      this.player,
      this.healer,
      this.handleHealer,
      null,
      this,
    );*/

    this.physics.add.overlap(this.player, this.door, () => {
      this.scene.start("Game", { x: 256, y: 320 }); // posición cuando sale del mapa 2
    });

    // ✅ guardar estado al cerrar/recargar
    window.addEventListener("beforeunload", () => {
      guardarEstado(2, this.player);
    });
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
      const idpartida = Number(localStorage.getItem("partida"));

      postEvent("curarDragones", { idpartida }, (respuesta) => {
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
