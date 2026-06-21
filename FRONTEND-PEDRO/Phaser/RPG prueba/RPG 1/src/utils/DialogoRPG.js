export class DialogoRPG {
  constructor(scene) {
    this.scene = scene;
    this.abierto = false;
    this.opcionSeleccionada = 0;
    this.elementos = [];
    this.botones = [];
    this.onSi = null;
    this.onNo = null;
  }

  confirmar(texto, onSi, onNo) {
    this._abrir(texto, onSi, onNo ?? (() => {}), true);
  }

  aviso(texto, onCerrar) {
    this._abrir(texto, onCerrar ?? (() => {}), onCerrar ?? (() => {}), false);
  }

  _abrir(texto, onSi, onNo, dosOpciones) {
    const scene = this.scene;

    this.abierto = true;
    this.opcionSeleccionada = 0;
    this.onSi = onSi;
    this.onNo = onNo;

    if (scene.player) scene.player.setVelocity(0);
    scene.playerBloqueado = true;

    const cam = scene.cameras.main;
    const centerX = cam.width / 2;
    const centerY = cam.height / 2;

    const overlay = scene.add.rectangle(
      centerX,
      centerY,
      cam.width,
      cam.height,
      0x000000,
      0.55,
    );
    overlay.setScrollFactor(0).setDepth(3000);

    const boxWidth = 360;
    const boxHeight = 160;
    const boxX = centerX - boxWidth / 2;
    const boxY = centerY - boxHeight / 2;

    const box = scene.add.graphics();
    box.setScrollFactor(0).setDepth(3001);
    box.fillStyle(0x1a1208, 1);
    box.fillRoundedRect(boxX, boxY, boxWidth, boxHeight, 10);
    box.lineStyle(4, 0xc9a64a, 1);
    box.strokeRoundedRect(boxX, boxY, boxWidth, boxHeight, 10);

    const mensaje = scene.add
      .text(centerX, boxY + 40, texto, {
        fontSize: "18px",
        fill: "#f7e8ad",
        fontFamily: "Pixelify Sans",
        align: "center",
        wordWrap: { width: boxWidth - 40 },
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(3002);

    const btnY = boxY + boxHeight - 40;

    if (dosOpciones) {
      const btnSi = this._crearBoton(centerX - 70, btnY, "Sí", 0);
      const btnNo = this._crearBoton(centerX + 70, btnY, "No", 1);
      this.botones = [btnSi, btnNo];
      this.elementos = [overlay, box, mensaje, ...btnSi, ...btnNo];
    } else {
      const btnOk = this._crearBoton(centerX, btnY, "Entendido", 0);
      this.botones = [btnOk];
      this.elementos = [overlay, box, mensaje, ...btnOk];
    }

    this._actualizarSeleccion();
  }

  _crearBoton(x, y, label, index) {
    const scene = this.scene;
    const w = 90;
    const h = 36;

    const bg = scene.add.graphics();
    bg.setScrollFactor(0).setDepth(3002);

    const text = scene.add
      .text(x, y, label, {
        fontSize: "16px",
        fill: "#f7e8ad",
        fontFamily: "Pixelify Sans",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(3003);

    const hitZone = scene.add
      .zone(x, y, w, h)
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(3003)
      .setInteractive({ useHandCursor: true });

    hitZone.on("pointerover", () => {
      this.opcionSeleccionada = index;
      this._actualizarSeleccion();
    });

    hitZone.on("pointerdown", () => {
      this.opcionSeleccionada = index;
      this.confirmar_();
    });

    bg.boxX = x - w / 2;
    bg.boxY = y - h / 2;
    bg.boxW = w;
    bg.boxH = h;

    return [bg, text, hitZone];
  }

  _actualizarSeleccion() {
    this.botones.forEach(([bg], i) => {
      bg.clear();
      const activo = i === this.opcionSeleccionada;
      bg.fillStyle(activo ? 0xc9a64a : 0x2a1f12, 1);
      bg.fillRoundedRect(bg.boxX, bg.boxY, bg.boxW, bg.boxH, 6);
      bg.lineStyle(2, 0xc9a64a, 1);
      bg.strokeRoundedRect(bg.boxX, bg.boxY, bg.boxW, bg.boxH, 6);
    });
  }

  confirmar_() {
    const callback = this.opcionSeleccionada === 0 ? this.onSi : this.onNo;
    this.cerrar();
    if (callback) callback();
  }

  cerrar() {
    this.elementos.forEach((el) => el.destroy());
    this.elementos = [];
    this.botones = [];
    this.abierto = false;
    this.scene.playerBloqueado = false;
  }

  // se llama desde el update() de la escena mientras el diálogo está abierto
  manejarInput(cursors, keyE) {
    if (!this.abierto) return;

    if (this.botones.length > 1) {
      if (
        Phaser.Input.Keyboard.JustDown(cursors.left) ||
        Phaser.Input.Keyboard.JustDown(cursors.right)
      ) {
        this.opcionSeleccionada = this.opcionSeleccionada === 0 ? 1 : 0;
        this._actualizarSeleccion();
      }
    }

    if (Phaser.Input.Keyboard.JustDown(keyE)) {
      this.confirmar_();
    }
  }
}
