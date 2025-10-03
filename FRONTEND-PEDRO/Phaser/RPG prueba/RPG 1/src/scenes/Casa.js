import {Player} from '../GameObjects/player.js'

export class Game extends Phaser.Scene {
    constructor() {
        super('Casa');

    }
        create(){

        const casa = this.make.tilemap({key: "casa"});   
        const tileset = this.addTilesetImage("mapa 2", "tiles");
        //capas
        const suelo_casa = casa.createLayer("suelo casa", tileset, 0, 0);
        const cofres = casa.createLayer("objetos",  tileset, 0, 0);

        //colliders
        suelo_casa.setCollisionByExclusion([-1]);
        this.physics.add.colider(this.player, suelo_casa);
    }
}