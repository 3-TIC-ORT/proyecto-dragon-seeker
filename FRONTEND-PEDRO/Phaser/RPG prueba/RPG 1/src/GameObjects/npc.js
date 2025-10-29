export class NPC extends Phaser.Physics.Arcade.Sprite{
    constructor(scene, x, y, ){
        super(scene, x, y, 'dragon');
        
        scene.add.existing(this);
        scene.physics.add.existing(this);
    
        this.speed = 50;

        this.minX = 100;
        this.maxX = 300;
        this.minY = 200;
        this.maxY = 400;
    
        // Definimos la secuencia de movimiento
        this.patrolSteps = [
          { dx: 1, dy: 0, time: 4000 },  // derecha
          { dx: 0, dy: 0, time: 1000 },  // pausa
          { dx: -1, dy: -1, time: 2000 }, // arriba
          { dx: 0, dy: 0, time: 1000 },  // pausa
          { dx: 1, dy: 0, time: 3000 }, // izquierda
          { dx: 0, dy: 0, time: 1000 },  // pausa
          { dx: 0, dy: 1, time: 4000 },  // abajo
          { dx: 0, dy: 0, time: 1000 }   // pausa
        ];
    
        this.currentStep = 0;
        this.timeElapsed = 0;
        
        this.initanimations()
      }

      initanimations(){
          
          this.anims.create({
            key: 'npc-left',
            frames: this.anims.generateFrameNumbers('dragon', { start: 0, end: 3 }),
            frameRate: 8,
            repeat: -1
          });
      }

      preUpdate(t, dt) {
        super.preUpdate(t, dt);
    
        this.timeElapsed += dt;
        const step = this.patrolSteps[this.currentStep];
    
        // Movimiento
        this.setVelocity(step.dx * this.speed, step.dy * this.speed);
    
        // --- Animaciones según dirección ---
        if (step.dx === 0 && step.dy === 0) {
          // Pausa → quieto
          this.anims.stop();
        } else if (step.dx > this.minX) {
          this.setFlipX(true);
            this.anims.play('npc-left', true);
          } else if (step.dx < this.maxX) {  
            this.setFlipX(false);
            this.anims.play('npc-left', true);
        } else if (step.dy > this.minY) {
          
        } else if (step.dy < this.maxX) {
          
        }
    
        // Cambiar de paso cuando se cumple el tiempo
        if (this.timeElapsed >= step.time) {
          this.timeElapsed = 0;
          this.currentStep = (this.currentStep + 1) % this.patrolSteps.length;
        }
      }
}
