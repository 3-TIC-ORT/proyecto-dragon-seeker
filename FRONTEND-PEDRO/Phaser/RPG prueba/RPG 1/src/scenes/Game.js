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
        this.player = this.physics.add.sprite(0, 96, 'dude'); 
        
        //colliders
        this.player.setCollideWorldBounds(true);

        obstaculos.setCollisionByExclusion([-1]);
       // this.physics.add.collider(this.player, obstaculos);
    }


    update() {

    }
}