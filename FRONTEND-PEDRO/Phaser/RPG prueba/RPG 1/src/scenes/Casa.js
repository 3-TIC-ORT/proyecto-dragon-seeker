import {Player} from '../GameObjects/player.js'

export class Casa extends Phaser.Scene {
    constructor() {
        super('Casa');

    }

    preload(){
        //carga el mapa
        this.load.image("tiles", "assets/town_forest_tiles.png");
        this.load.tilemapTiledJSON("casa", "assets/casa_adentro.json");
        
        //asignacion del sprite al personaje
        this.load.spritesheet('dude', 'assets/dude.png', {frameWidth: 32, frameHeight: 48});
    }

        create(data){

            const casa = this.make.tilemap({key: "casa"});   
            const tileset = casa.addTilesetImage("mapa 2", "tiles");
            //capas
            const suelo_casa = casa.createLayer("suelo casa", tileset, 0, 0);
            const cofres = casa.createLayer("objetos",  tileset, 0, 0);

            //colliders
            cofres.setCollisionByExclusion([-1]);
          
            this.physics.add.collider(this.player, cofres);

              // Spawn del jugador en la posición recibida desde Mapa1
            this.player = this.physics.add.sprite(352, 480, 'dude');
            this.physics.add.collider(this.player, cofres);

            this.cameras.main.startFollow(this.player);
    }
    
}