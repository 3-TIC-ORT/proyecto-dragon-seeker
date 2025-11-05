export class NPC extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, "dragon");

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.speed = 50;
    this.direction = new Phaser.Math.Vector2(1, 0); // comienza yendo a la derecha
    //this.setCollideWorldBounds(true); // no sale del mapa
    //this.body.setBounce(1, 1); // rebota automáticamente

    // cada dragón tiene un temporizador para cambiar de dirección
    this.changeDirEvent = scene.time.addEvent({
      delay: 2000, // cada 2 segundos
      callback: this.updatePatrol,
      callbackScope: this,
      loop: true,
    });

    this.currentStep = 0;
    this.timeElapsed = 0;

    this.initanimations();
  }

  initanimations() {
    this.anims.create({
      key: "dragon-left",
      frames: this.anims.generateFrameNumbers("dragon", { start: 0, end: 3 }),
      frameRate: 8,
      repeat: -1,
    });
  }

  preUpdate(t, dt) {
    super.preUpdate(t, dt);

    // Movimiento
    this.setVelocity(
      this.direction.x * this.speed,
      this.direction.y * this.speed
    );

    // --- Animaciones según dirección ---
    if (this.direction.x === 0 && this.direction.y === 0) {
      // Pausa → quieto
      this.anims.stop();
    } else if (this.direction.x > 0) {
      this.setFlipX(true);
      this.anims.play("dragon-left", true);
    } else if (this.direction.x < 0) {
      this.setFlipX(false);
      this.anims.play("dragon-left", true);
    }
  }
  // cambio de dirección aleatorio
  updatePatrol() {
    // 2% de probabilidad por frame de cambiar dirección (da efecto aleatorio)

    const dirs = [
      new Phaser.Math.Vector2(1, 0), // derecha
      new Phaser.Math.Vector2(-1, 0), // izquierda
      new Phaser.Math.Vector2(0, 1), // abajo
      new Phaser.Math.Vector2(0, -1), // arriba
      new Phaser.Math.Vector2(0, 0),
    ];
    this.direction = Phaser.Utils.Array.GetRandom(dirs);
  }
}
