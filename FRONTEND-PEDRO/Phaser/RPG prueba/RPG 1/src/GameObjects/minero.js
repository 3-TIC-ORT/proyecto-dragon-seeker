export class Minero extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, "minero");

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setImmovable(true);
    this.setScale(1.2);
  }
}
