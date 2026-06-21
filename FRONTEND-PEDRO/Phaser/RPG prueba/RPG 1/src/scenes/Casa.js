import { Player } from "../GameObjects/player.js";
import { guardarEstado } from "../utils/persistencia.js";
import { Veterinario } from "../GameObjects/veterinario.js";
import { DialogoRPG } from "../utils/DialogoRPG.js";

connect2Server();

export class Casa extends Phaser.Scene {
  constructor() {
    super("Casa");
  }

  preload() {
    //carga el mapa
    this.load.image("tiles", "assets/casa_interna.png");
    this.load.tilemapTiledJSON("casa", "assets/curadero.json");

    //asignacion del sprite al player
    this.load.spritesheet("player", "assets/player.png", {
      frameWidth: 32,
      frameHeight: 32,
    });

    //asignacion del sprite al veterinario
    this.load.spritesheet("veterinario", "assets/veterinario.png", {
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
      .setPosition(margin, margin)
      .setScrollFactor(0)
      .setDepth(1000)
      .setVisible(false);

    this.dialogo = new DialogoRPG(this);

    const casa = this.make.tilemap({ key: "casa" });
    const tileset = casa.addTilesetImage("Decoracion casa interna", "tiles");

    //capas
    const piso = casa.createLayer("Piso", tileset, 0, 0);

    const alfombras = casa.createLayer("Alfombras", tileset, 0, 0);
    const paredes = casa.createLayer("Paredes ventana", tileset, 0, 0);
    const decoracion = casa.createLayer("Decoracion", tileset, 0, 0);
    decoracion.setDepth(2);
    const estantes_inferiores = casa.createLayer(
      "estantes inferiores",
      tileset,
      0,
      0,
    );

    const limit = casa.createLayer("bloques invisibles", tileset, 0, 0);
    limit.setVisible(false);

    //creando las teclas para movimiento
    this.cursors = this.input.keyboard.createCursorKeys();

    // ✅ posición default por si entra sin data
    const startX = data?.x ?? 80;
    const startY = data?.y ?? 416;

    // Spawn del jugador en la posición recibida desde Mapa1
    this.player = new Player(this, startX, startY, this.cursors);
    this.player.setDepth(1);

    this.veterinario = new Veterinario(this, 96, 165);
    this.veterinario.setDepth(1.5);

    //colliders
    const colisionesGroup = this.physics.add.staticGroup();
    const colisionesObjetos = casa.getObjectLayer("colisiones").objects;

    colisionesObjetos.forEach((obj) => {
      const rect = this.add.rectangle(
        obj.x + obj.width / 2,
        obj.y + obj.height / 2,
        obj.width,
        obj.height,
      );
      this.physics.add.existing(rect, true); // true = estático
      colisionesGroup.add(rect);
    });

    decoracion.setCollisionByExclusion([-1]);
    this.physics.add.collider(this.player, decoracion);
    paredes.setCollisionByExclusion([-1]);
    this.physics.add.collider(this.player, paredes);
    limit.setCollisionByExclusion([-1]);
    this.physics.add.collider(this.player, limit);
    this.physics.add.collider(this.player, colisionesGroup);

    //worldbounds
    this.physics.world.setBounds(0, 0, casa.widthInPixels, casa.heightInPixels);
    this.player.setBounce(0).setCollideWorldBounds(true);

    //camara
    this.cameras.main.setBounds(0, 0, casa.widthInPixels, casa.heightInPixels);
    this.cameras.main.startFollow(this.player);

    // BOTON INVENTARIO DRAGONES
    this.botonInventario = this.add.image(cam.width - 45, 30, "huevoDragon");

    this.botonInventario
      .setScrollFactor(0)
      .setDepth(2000)
      .setScale(0.08)
      .setInteractive({ useHandCursor: true });

    this.botonInventario.on("pointerdown", () => {
      // Desde el mapa el inventario es para ver/elegir dragon activo: vuelve al mapa.
      localStorage.setItem("origenInventario", "mapa");
      window.location.href = "../../../../inventario/inventario.html";
    });

    //puerta
    const doorTrigger = casa.findObject(
      "puertas",
      (obj) => obj.name === "door",
    );

    this.door = this.physics.add.sprite(doorTrigger.x, doorTrigger.y, null);
    this.door.setSize(doorTrigger.width, doorTrigger.height);
    this.door.setVisible(false);

    this.keyE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

    // trigger del curadero/veterinario
    const curaderoTrigger = casa.findObject(
      "curadero",
      (obj) => obj.name === "curadero",
    );
    this.curadero = this.physics.add.sprite(
      curaderoTrigger.x,
      curaderoTrigger.y,
      null,
    );
    this.curadero.setSize(curaderoTrigger.width, curaderoTrigger.height);
    this.curadero.setVisible(false);
    this.curadero.body.setAllowGravity(false);
    this.curadero.body.moves = false;

    this.nearCurandero = false;
    this.showingInteractMessageCurandero = false;

    this.physics.add.overlap(
      this.player,
      this.curadero,
      this.handleCurandero,
      null,
      this,
    );

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

  handleCurandero() {
    this.nearCurandero = true;
    if (this.dialogo.abierto) return;

    if (!this.showingInteractMessageCurandero) {
      this.messageText.setText("Presioná E para interactuar");
      this.messageText.setVisible(true);
      this.showingInteractMessageCurandero = true;
    }

    if (Phaser.Input.Keyboard.JustDown(this.keyE)) {
      this.messageText.setVisible(false);
      this.dialogo.confirmar(
        "¿Querés curar a tus dragones?",
        () => {
          const idpartida = Number(localStorage.getItem("partida"));
          postEvent("curarDragones", { idpartida }, (respuesta) => {
            if (respuesta.exito) {
              this.showMessage("¡Tus dragones fueron curados!");
            }
          });
        },
        () => {},
      );
    }
  }

  update() {
    // resetea el estado de "cerca del curadero" cada frame;
    // si seguís en overlap, handleCurandero lo vuelve a poner en true
    if (!this.nearCurandero) {
      if (this.showingInteractMessageCurandero) {
        this.messageText.setVisible(false);
        this.showingInteractMessageCurandero = false;
      }
    }
    this.nearCurandero = false; // se resetea, y si hay overlap este frame, handleCurandero lo vuelve a marcar true

    if (this.dialogo.abierto) {
      this.dialogo.manejarInput(this.cursors, this.keyE);
      this.player.setVelocity(0);
      return;
    }

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
