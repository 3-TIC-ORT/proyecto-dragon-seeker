export class Game extends Phaser.Scene {
    constructor() {
        super('Game');

    }
    preload() {
        this.load.image("tiles", "assets/town_forest_tiles.png");
        this.load.tilemapTiledJSON("map", "assets/mapa_embebido.json");
    }
    create() {
        const map = this.make.tilemap({key: "map"});
        const tileset = map.addTilesetImage("Woods", "tiles");
        
        const ground = map.createLayer("suelo", tileset, 0, 0);
        const camino = map.createLayer("camino", tileset, 0, 0);
        const coliders = map.createLayer("coliders", tileset, 0, 0);
        const decorado = map.createLayer("Decorado", tileset, 0, 0);

        this.player = this.physics.add.sprite(0, 96, 'dude'); 

        this.player.setCollideWorldBounds(true);
        colliders.setCollisionByProperty({ collides: true });
        this.physics.add.collider(this.player, colliders);
    }


    update() {

    }
}