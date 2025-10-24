export class NPC extends Phaser.Physics.Arcade.Sprite{
    constructor(scene, x, y, ){
        super(scene, x, y, 'dragon');
        
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.leftLimit = 768;
        this.rightLimit = 1152;
        this.setVelocityX(0);
    }

    preUpdate(time, delta){
    super.preUpdate(time, delta);

        // Movimiento entre los límites
        if ( this.x> this.rightLimit) {
            this.setVelocityX(-50);
            this.flipX = false; // mira hacia la izquierda
        } 
        else if (this.x < this.leftLimit) {
            this.setVelocityX(50);
            this.flipX = true; // mira hacia la derecha
        }
    }
}
