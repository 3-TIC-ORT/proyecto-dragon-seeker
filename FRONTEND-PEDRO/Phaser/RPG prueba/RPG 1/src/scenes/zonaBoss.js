import { Player } from "../GameObjects/player.js";
import { NPC } from "../GameObjects/npc.js";

connect2Server();

export class zonaBoss extends Phaser.Scene {
  constructor() {
    super("zonaBoss");
  }

  preload() {
    this.load.image("todos_los_conjuntos", "assets/todos_los_conjuntos.png");
    this.load.image("camino_normal", "assets/camino_normal.png");
    this.load.image("arbol", "assets/arbol.png");

    this.load.tilemapTiledJSON("zonaBoss", "assets/zonaBoss.json");

    this.load.spritesheet("player", "assets/player.png", {
      frameWidth: 32,
      frameHeight: 32,
    });
  }

  create() {
    const zonaBoss = this.make.tilemap({ key: "zonaBoss" });

    //creacion de las capas
    const ts1 = zonaBoss.addTilesetImage(
      "TODOS los conjuntos de patrones",
      "todos_los_conjuntos",
    );
    const ts2 = zonaBoss.addTilesetImage("arbol", "arbol");
    const ts3 = zonaBoss.addTilesetImage("Camino normal +", "camino_normal");

    const allTilesets = [ts1, ts2, ts3];

    const suelo = zonaBoss.createLayer("suelo", allTilesets, 0, 0);
    const camino_normal = zonaBoss.createLayer(
      "Camino normal",
      allTilesets,
      0,
      0,
    );
    const decoracion = zonaBoss.createLayer("decoracion", allTilesets, 0, 0);
    const hojasArboles = zonaBoss.createLayer(
      "hojas arboles",
      allTilesets,
      0,
      0,
    );
    const pasto = zonaBoss.createLayer("pasto", allTilesets, 0, 0);

    //creando las teclas para movimiento
    this.cursors = this.input.keyboard.createCursorKeys();

    // Spawn del jugador en la posición recibida desde Mapa1
    this.player = new Player(this, 0, 544, this.cursors);

    //worldbounds
    this.physics.world.setBounds(
      0,
      0,
      zonaBoss.widthInPixels,
      zonaBoss.heightInPixels,
    );

    //camara
    this.cameras.main.startFollow(this.player);
    this.cameras.main.setBounds(
      0,
      0,
      zonaBoss.widthInPixels,
      zonaBoss.heightInPixels,
    );
    this.cameras.main.setRoundPixels(true);
  }

  update() {}
}
