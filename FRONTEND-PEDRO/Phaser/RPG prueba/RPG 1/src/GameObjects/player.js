export class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, "dude");

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.initAnimations();
  }

  initAnimations() {
    this.anims.create({
      key: "left",
      frames: this.anims.generateFrameNumbers("dude", { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: "turn",
      frames: [{ key: "dude", frame: 4 }],
      frameRate: 1,
    });

    this.anims.create({
      key: "right",
      frames: this.anims.generateFrameNumbers("dude", { start: 5, end: 8 }),
      frameRate: 10,
      repeat: -1,
    });
  }

  moveLeft() {
    this.setVelocityX(-150);
    this.anims.play("left", true);
  }
  moveRight() {
    this.setVelocityX(150);
    this.anims.play("right", true);
  }
  moveUp() {
    this.setVelocityY(-150);
  }
  moveDown() {
    this.setVelocityY(150);
  }
  idle() {
    this.setVelocity(0);
    this.anims.play("turn");
  }

  preUpdate(time, delta) {
    super.preUpdate(time, delta); // ⚠️ mantiene las animaciones activas

    // Movimiento horizontal
    if (this.cursors.left.isDown) {
      this.moveLeft();
    } else if (this.cursors.right.isDown) {
      this.moveRight();
    } else {
      this.idle();
    }

    // Movimiento vertical
    if (this.cursors.up.isDown) {
      this.moveUp();
    } else if (this.cursors.down.isDown) {
      this.moveDown();
    } else {
      this.idle();
    }

    // Si no se mueve, animación quieto
    if (this.body.velocity.x === 0 && this.body.velocity.y === 0) {
      this.anims.play("turn", true);
    }
  }
}
