connect2Server();

export class NPC extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, "dragons");

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
    // this.initanimations();
  }
  preload() {}
  // aca van las animaciones de cada uno pero todavia no estan
  // initanimations() {}

  preUpdate(t, dt) {
    super.preUpdate(t, dt);

    // Movimiento
    this.setVelocity(
      this.direction.x * this.speed,
      this.direction.y * this.speed,
    );

    if (
      this.body.blocked.left ||
      this.body.blocked.right ||
      this.body.blocked.up ||
      this.body.blocked.down
    ) {
      this.updatePatrol();
    }

    // Animaciones según dirección
    /*if (this.direction.x === 0 && this.direction.y === 0) {
      // Pausa → quieto
      this.anims.stop();
    } else if (this.direction.x > 0) {
      this.setFlipX(true);
    } else if (this.direction.x < 0) {
      this.setFlipX(false);
    }*/
  }

  update() {}

  // 🔥 Rebote real contra otro dragón
  handleDragonCollision(otherDragon) {
    if (this.scene.time.now - this.lastCollision < 200) return;

    // Normal del choque
    const normal = new Phaser.Math.Vector2(
      this.x - otherDragon.x,
      this.y - otherDragon.y,
    ).normalize();

    // Copiamos velocidad actual
    const velocity = new Phaser.Math.Vector2(
      this.body.velocity.x,
      this.body.velocity.y,
    );

    // Reflejar velocidad
    velocity.reflect(normal);

    // Actualizar direction para que coincida
    this.direction = velocity.clone().normalize();
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
