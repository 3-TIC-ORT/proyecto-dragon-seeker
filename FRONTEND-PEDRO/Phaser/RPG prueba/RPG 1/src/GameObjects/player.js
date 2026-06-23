export class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, cursors) {
    super(scene, x, y, "player");

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.cursors = cursors;

    this.setBounce(0).setCollideWorldBounds(true);

    this.initAnimations();
  }

  initAnimations() {
    this.anims.create({
      key: "walk",
      frames: this.anims.generateFrameNumbers("player", { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: "idle",
      frames: this.anims.generateFrameNumbers("player", { start: 10, end: 13 }),
      frameRate: 5,
      repeat: -1,
    });

    this.anims.create({
      key: "up",
      frames: this.anims.generateFrameNumbers("player", { start: 7, end: 9 }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: "down",
      frames: this.anims.generateFrameNumbers("player", { start: 4, end: 6 }),
      frameRate: 10,
      repeat: -1,
    });
  }

  moveLeft() {
    this.setVelocityX(-150);
    this.setVelocityY(0); // ← agregar
    this.setFlipX(true);
    this.anims.play("walk", true);
  }

  moveRight() {
    this.setVelocityX(150);
    this.setVelocityY(0); // ← agregar
    this.setFlipX(false);
    this.anims.play("walk", true);
  }

  moveUp() {
    this.setVelocityY(-150);
    this.setVelocityX(0); // ← agregar
    this.anims.play("up", true);
  }

  moveDown() {
    this.setVelocityY(150);
    this.setVelocityX(0); // ← agregar
    this.anims.play("down", true);
  }

  idle() {
    this.setVelocity(0);
    this.anims.play("idle", true);
  }

  preUpdate(time, delta) {
    super.preUpdate(time, delta); // mantiene las animaciones activas
    // Movimiento horizontal
    if (this.cursors.left.isDown) {
      this.moveLeft();
    } else if (this.cursors.right.isDown) {
      this.moveRight();
    } else if (this.cursors.up.isDown) {
      this.moveUp();
    } else if (this.cursors.down.isDown) {
      this.moveDown();
    } else {
      this.idle();
    }
  }
}
