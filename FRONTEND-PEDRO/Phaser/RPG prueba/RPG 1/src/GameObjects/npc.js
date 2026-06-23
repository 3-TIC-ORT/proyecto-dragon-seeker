connect2Server();

export class NPC extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, dragonKey) {
    super(scene, x, y, dragonKey);

    this.dragonKey = dragonKey;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.speed = 50;
    this.direction = new Phaser.Math.Vector2(1, 0); // comienza yendo a la derecha

    // Activar world bounds
    this.setCollideWorldBounds(true);

    // cada dragón tiene un temporizador para cambiar de dirección
    this.changeDirEvent = scene.time.addEvent({
      delay: 2000, // cada 2 segundos
      callback: this.updatePatrol,
      callbackScope: this,
      loop: true,
    });

    this.lastCollision = 0;

    // es para las animaciones
    this.initAnimations();
  }
  preload() {}
  // aca van las animaciones de cada uno pero todavia no estan
  initAnimations() {
    // Verificar si la textura existe y tiene más de un frame
    if (!this.scene.textures.exists(this.dragonKey)) {
      console.error("La textura no existe:", this.dragonKey);
      return;
    }

    // Animación de Caminar
    if (!this.scene.anims.exists(this.dragonKey + "_walk")) {
      // Obtenemos los frames de forma segura
      const frames = this.scene.anims.generateFrameNumbers(this.dragonKey, {
        start: 0,
        end: 3,
      });

      // Si por alguna razón frames está vacío o es indefinido, evitamos el crash
      if (frames && frames.length > 0) {
        this.scene.anims.create({
          key: this.dragonKey + "_walk",
          frames: frames,
          frameRate: 6,
          repeat: -1,
        });
      }
    }

    // Animación de Idle
    if (!this.scene.anims.exists(this.dragonKey + "_idle")) {
      this.scene.anims.create({
        key: this.dragonKey + "_idle",
        frames: [{ key: this.dragonKey, frame: 0 }],
        frameRate: 1,
      });
    }

    // Solo dar play si la animación se creó correctamente
    if (this.scene.anims.exists(this.dragonKey + "_idle")) {
      this.play(this.dragonKey + "_idle");
    }
  }

  preUpdate(t, dt) {
    super.preUpdate(t, dt);

    // Movimiento
    this.setVelocity(
      this.direction.x * this.speed,
      this.direction.y * this.speed,
    );

    // Girar sprite
    if (this.direction.x < 0) {
      this.setFlipX(true);
    } else if (this.direction.x > 0) {
      this.setFlipX(false);
    }

    if (this.direction.length() > 0) {
      this.play(this.dragonKey + "_walk", true);
    } else {
      this.play(this.dragonKey + "_idle", true);
    }

    if (
      this.body.blocked.left ||
      this.body.blocked.right ||
      this.body.blocked.up ||
      this.body.blocked.down
    ) {
      this.updatePatrol();
    }
  }

  update() {}

  handleDragonCollision(otherDragon) {
    const normal = new Phaser.Math.Vector2(
      this.x - otherDragon.x,
      this.y - otherDragon.y,
    ).normalize();

    const velocity = new Phaser.Math.Vector2(
      this.body.velocity.x,
      this.body.velocity.y,
    );

    velocity.reflect(normal);

    this.setVelocity(velocity.x, velocity.y);

    this.direction = velocity.clone().normalize();

    //cambiar dirección de patrulla después del choque
    this.updatePatrol();
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
