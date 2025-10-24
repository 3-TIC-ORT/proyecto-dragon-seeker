export class NPC extends Phaser.Physics.Arcade.Sprite{
    constructor(scene, x, y, ){
        super(scene, x, y, 'dragon');
        
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.leftLimit = 170;
        this.rightLimit = 300;
        this.setVelocityX(0);
    }

    update(time, delta){
    super.update(time, delta);

        // Movimiento entre los límites
        if ( 224> this.rightLimit) {
            this.setVelocityX(-50);
            this.flipX = true; // mira hacia la izquierda
        } 
        else if (224 < this.leftLimit) {
            this.setVelocityX(50);
            this.flipX = false; // mira hacia la derecha
        }
    }
}
