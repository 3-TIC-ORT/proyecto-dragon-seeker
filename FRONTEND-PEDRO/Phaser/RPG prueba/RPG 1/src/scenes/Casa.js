import { Player } from "../GameObjects/player.js";
import { guardarEstado } from "../utils/persistencia.js";
import { Veterinario } from "../GameObjects/veterinario.js";

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

    // ✅ estado del diálogo de confirmación
    this.dialogoAbierto = false;
    this.opcionSeleccionada = 0; // 0 = Sí, 1 = No
    this.dialogoElements = [];

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

  // === Sistema de diálogo de confirmación tipo RPG ===

  mostrarConfirmacion(texto, onSi, onNo) {
    this.dialogoAbierto = true;
    this.opcionSeleccionada = 0;
    this.onConfirmarSi = onSi;
    this.onConfirmarNo = onNo;

    // bloquea movimiento del player
    this.player.setVelocity(0);
    this.playerBloqueado = true;

    const cam = this.cameras.main;
    const centerX = cam.width / 2;
    const centerY = cam.height / 2;

    // overlay negro difuminado (fondo)
    const overlay = this.add.rectangle(
      cam.width / 2,
      cam.height / 2,
      cam.width,
      cam.height,
      0x000000,
      0.55,
    );
    overlay.setScrollFactor(0).setDepth(3000);

    // caja del diálogo
    const boxWidth = 360;
    const boxHeight = 160;
    const boxX = centerX - boxWidth / 2;
    const boxY = centerY - boxHeight / 2;

    const box = this.add.graphics();
    box.setScrollFactor(0).setDepth(3001);
    box.fillStyle(0x1a1208, 1); // fondo oscuro tipo madera/pergamino
    box.fillRoundedRect(boxX, boxY, boxWidth, boxHeight, 10);
    box.lineStyle(4, 0xc9a64a, 1); // borde dorado
    box.strokeRoundedRect(boxX, boxY, boxWidth, boxHeight, 10);

    // texto de la pregunta
    const pregunta = this.add
      .text(centerX, boxY + 35, texto, {
        fontSize: "18px",
        fill: "#f7e8ad",
        fontFamily: "Pixelify Sans",
        align: "center",
        wordWrap: { width: boxWidth - 40 },
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(3002);

    // botones Sí / No
    const btnY = boxY + boxHeight - 40;
    const btnSi = this.crearBotonDialogo(centerX - 70, btnY, "Sí", 0);
    const btnNo = this.crearBotonDialogo(centerX + 70, btnY, "No", 1);

    this.dialogoElements = [overlay, box, pregunta, ...btnSi, ...btnNo];
    this.botonesDialogo = [btnSi, btnNo]; // para resaltar la opción seleccionada

    this.actualizarSeleccionDialogo();
  }

  crearBotonDialogo(x, y, label, index) {
    const w = 90;
    const h = 36;

    const bg = this.add.graphics();
    bg.setScrollFactor(0).setDepth(3002);

    const text = this.add
      .text(x, y, label, {
        fontSize: "16px",
        fill: "#f7e8ad",
        fontFamily: "Pixelify Sans",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(3003);

    // zona clickeable
    const hitZone = this.add
      .zone(x, y, w, h)
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(3003)
      .setInteractive({ useHandCursor: true });

    hitZone.on("pointerover", () => {
      this.opcionSeleccionada = index;
      this.actualizarSeleccionDialogo();
    });

    hitZone.on("pointerdown", () => {
      this.opcionSeleccionada = index;
      this.confirmarOpcionDialogo();
    });

    // guardo referencia de posición/tamaño en el propio gráfico para redibujar
    bg.boxX = x - w / 2;
    bg.boxY = y - h / 2;
    bg.boxW = w;
    bg.boxH = h;

    return [bg, text, hitZone];
  }

  actualizarSeleccionDialogo() {
    this.botonesDialogo.forEach(([bg], i) => {
      bg.clear();
      const activo = i === this.opcionSeleccionada;
      bg.fillStyle(activo ? 0xc9a64a : 0x2a1f12, 1);
      bg.fillRoundedRect(bg.boxX, bg.boxY, bg.boxW, bg.boxH, 6);
      bg.lineStyle(2, 0xc9a64a, 1);
      bg.strokeRoundedRect(bg.boxX, bg.boxY, bg.boxW, bg.boxH, 6);
    });
  }

  confirmarOpcionDialogo() {
    const callback =
      this.opcionSeleccionada === 0 ? this.onConfirmarSi : this.onConfirmarNo;
    this.cerrarDialogo();
    if (callback) callback();
  }

  cerrarDialogo() {
    this.dialogoElements.forEach((el) => el.destroy());
    this.dialogoElements = [];
    this.dialogoAbierto = false;
    this.playerBloqueado = false;
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
    if (this.dialogoAbierto) return;

    if (!this.showingInteractMessageCurandero) {
      this.messageText.setText("Presioná E para interactuar");
      this.messageText.setVisible(true);
      this.showingInteractMessageCurandero = true;
    }

    if (Phaser.Input.Keyboard.JustDown(this.keyE)) {
      this.messageText.setVisible(false);
      this.mostrarConfirmacion(
        "¿Querés curar a tus dragones?",
        () => {
          const idpartida = Number(localStorage.getItem("partida"));
          postEvent("curarDragones", { idpartida }, (respuesta) => {
            if (respuesta.exito) {
              this.showMessage("¡Tus dragones fueron curados!");
            }
          });
        },
        () => {}, // no hace nada si elige "No"
      );
    }
  }

  update() {
    if (this.dialogoAbierto) {
      if (
        Phaser.Input.Keyboard.JustDown(this.cursors.left) ||
        Phaser.Input.Keyboard.JustDown(this.cursors.right)
      ) {
        this.opcionSeleccionada = this.opcionSeleccionada === 0 ? 1 : 0;
        this.actualizarSeleccionDialogo();
      }
      if (Phaser.Input.Keyboard.JustDown(this.keyE)) {
        this.confirmarOpcionDialogo();
      }
      this.player.setVelocity(0);
      return; // bloquea el resto del update (movimiento) mientras el diálogo está abierto
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
