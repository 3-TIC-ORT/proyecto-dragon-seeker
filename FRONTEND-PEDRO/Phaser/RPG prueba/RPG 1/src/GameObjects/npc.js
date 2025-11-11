export class NPC extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, "dragon");

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.speed = 50;
    this.direction = new Phaser.Math.Vector2(1, 0); // comienza yendo a la derecha

    // cada dragón tiene un temporizador para cambiar de dirección
    this.changeDirEvent = scene.time.addEvent({
      delay: 2000, // cada 2 segundos
      callback: this.updatePatrol,
      callbackScope: this,
      loop: true,
    });

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

  update() {
    // Si choca con los bordes del mundo o con algo sólido:
    if (this.body.blocked.left || this.body.blocked.right) {
      this.direction.x *= -1;
      this.setVelocityX(this.direction.x * this.speed);
      this.flipX = this.direction.x < 0;
    }

    if (this.body.blocked.up || this.body.blocked.down) {
      this.direction.y *= -1;
      this.setVelocityY(this.direction.y * this.speed);
    }
  }

  // cambio de dirección aleatorio
  updatePatrol() {
    const dirs = [
      new Phaser.Math.Vector2(1, 0), // derecha
      new Phaser.Math.Vector2(-1, 0), // izquierda
      new Phaser.Math.Vector2(0, 1), // abajo
      new Phaser.Math.Vector2(0, -1), // arriba
      new Phaser.Math.Vector2(0, 0), // quieto
    ];
    this.direction = Phaser.Utils.Array.GetRandom(dirs);
  }
}
