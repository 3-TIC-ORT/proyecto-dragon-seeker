import {Player} from '../GameObjects/player.js'

export class Game extends Phaser.Scene {
    constructor() {
        super('Game');

    }
    preload() {
        //Carga del mapa
        this.load.image("tiles", "assets/town_forest_tiles.png");
        this.load.tilemapTiledJSON("map", "assets/mapa_embebido.json");

        //asignacion del sprite al personaje
         this.load.spritesheet('dude', 'assets/dude.png', {frameWidth: 32, frameHeight: 48});
    }
    create() {
        const map = this.make.tilemap({key: "map"});
        const tileset = map.addTilesetImage("Woods", "tiles");
        //creacion de las capas
        const ground = map.createLayer("suelo", tileset, 0, 0);
        const camino = map.createLayer("camino", tileset, 0, 0);
        const obstaculos = map.createLayer("coliders", tileset, 0, 0);
        const decorado = map.createLayer("Decorado", tileset, 0, 0);
        
        //jugador
     
        this.player = new Player (this, 0, 96);
        //colliders
        this.player.setCollideWorldBounds(true);

        obstaculos.setCollisionByExclusion([-1]);
        this.physics.add.collider(this.player, obstaculos);
        decorado.setCollisionByExclusion([-1]);
        this.physics.add.collider(this.player, decorado);
       //movimiento
       this.cursors = this.input.keyboard.createCursorKeys();
       
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