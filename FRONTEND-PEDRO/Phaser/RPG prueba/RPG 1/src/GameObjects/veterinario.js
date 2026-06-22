export class Veterinario extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y, textureKey) {
    super(scene, x, y, "veterinario");

    this.textureKey = textureKey;

    scene.add.existing(this);

    this.initAnimations();
  }

  initAnimations() {
    this.anims.create({
      key: "idle",
      frames: this.anims.generateFrameNumbers("veterinario", {
        start: 0,
        end: 2,
      }),
      frameRate: 3,
      repeat: -1,
    });

    this.play("idle", true);
  }
}
