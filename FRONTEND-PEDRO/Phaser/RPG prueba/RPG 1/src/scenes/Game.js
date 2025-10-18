import {Player} from '../GameObjects/player.js'

export class Game extends Phaser.Scene {
    constructor() {
        super('Game');

    }
    preload() {
        //Carga del mapa
        this.load.image("tiles", "assets/town_forest_tiles.png");
        this.load.tilemapTiledJSON("map", "assets/mapa_grande.json");


        //asignacion del sprite al personaje
         this.load.spritesheet('dude', 'assets/dude.png', {frameWidth: 32, frameHeight: 48});
    }
    create() {
        const map = this.make.tilemap({key: "map"});
        const tileset = map.addTilesetImage("mapa 2", "tiles");
        //creacion de las capas
        const ground = map.createLayer("piso", tileset, 0, 0);
        const camino = map.createLayer("camino", tileset, 0, 0);
        const obstaculos = map.createLayer("obstaculos", tileset, 0, 0);
        const casa = map.createLayer("casa", tileset, 0, 0);
        const puertas = map.createLayer("puertas visibles", tileset, 0, 0);
        
        //jugador
     
        this.player = new Player (this, 16, 160);
        //colliders
        obstaculos.setCollisionByExclusion([-1]);
        this.physics.add.collider(this.player, obstaculos);
        casa.setCollisionByExclusion([-1]);
        this.physics.add.collider(this.player, casa);
      
        //movimiento
        this.cursors = this.input.keyboard.createCursorKeys();
       
       //camara
       this.cameras.main.startFollow(this.player);
       this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
       
           // --- Trigger para pasar al Mapa2 ---
        const trigger = map.findObject("puertas", obj => obj.name === "door"); 
        this.door = this.physics.add.sprite(trigger.x, trigger.y, null);
        this.door.setSize(trigger.width, trigger.height);
        this.door.setVisible(false);

        this.physics.add.overlap(this.player, this.door, () => {
            this.scene.start('Casa', { x: 352, y: 480 }); // posición inicial en Mapa2
        });
    }


    update() {
        
        //this.player.setVelocity(0); //setea la velocidad en cero
        if((this.cursors.left.isDown) || (this.cursors.right.isDown) || (this.cursors.up.isDown) || (this.cursors.down.isDown)){

            if (this.cursors.left.isDown){
                this.player.moveLeft();
            }
            else if (this.cursors.right.isDown){
                this.player.moveRight();
            }
            if (this.cursors.up.isDown){
                this.player.moveUp();
            }
            else if (this.cursors.down.isDown){
                this.player.moveDown();
            }
        }
        else{
            this.player.idle();
        }
    }
}