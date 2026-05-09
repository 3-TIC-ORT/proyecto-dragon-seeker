import { Player } from "../GameObjects/player.js";
import { NPC } from "../GameObjects/npc.js";
import { Minero } from "../GameObjects/minero.js";
import { gameData } from "./Objetos.js";

connect2Server();

export class Game extends Phaser.Scene {
  constructor() {
    super("Game");

    // Escuchar el evento que trae los dragones del JSON
    getEvent("obtenerdragones", (data) => {
      const dragones = data.dragones;

      // filtra los dragones que están en mapa 1
      this.dragonesSeleccionados = dragones.filter((d) => d.mapa === 1);

      //asignacion del sprite al dragon
      this.dragonesSeleccionados?.forEach((d) => {
        this.load.image("dragon_" + d.id, "../../../../BACKEND/" + d.imagen);
      });

      this.load.start();
    });
  }

  preload() {
    //Carga del mapa
    this.load.image("tiles", "assets/town_forest_tiles.png");
    this.load.tilemapTiledJSON("map", "assets/mapa_grande.json");

    //asignacion del sprite al personaje
    this.load.spritesheet("dude", "assets/dude.png", {
      frameWidth: 32,
      frameHeight: 46,
    });

    //asignacopn del spirte al viejo
    this.load.image("chimuelo", "assets/pinguino.png");

    //asignacion de la coke
    this.load.image("coke", "assets/coke.png");
  }
  create(data) {
    const margin = 10;
    const cam = this.cameras.main;

    this.messageText = this.add
      .text(0, 0, "", {
        fontSize: "20px",
        fill: "#000000",
        backgroundColor: "#f7e8ad",
        padding: { x: 10, y: 5 },
        fontFamily: "Pixelify Sans",
        wordWrap: { width: cam.width * 0.3 },
      })
      .setOrigin(1, 0)
      .setScrollFactor(0)
      .setDepth(1000)
      .setVisible(false);

    // esto lo deja PERFECTO arriba derecha
    this.messageText.setPosition(cam.width - margin, margin);

    const map = this.make.tilemap({ key: "map" });
    const tileset = map.addTilesetImage("mapa 2", "tiles");

    //creacion de las capas
    const ground = map.createLayer("piso", tileset, 0, 0);
    const camino = map.createLayer("camino", tileset, 0, 0);
    const obstaculos = map.createLayer("obstaculos", tileset, 0, 0);
    const casa = map.createLayer("casa", tileset, 0, 0);
    const puertas = map.createLayer("puertas visibles", tileset, 0, 0);
    const corral_dragones = map.createLayer("corral dragones", tileset, 0, 0);

    corral_dragones.setVisible(false);

    //spawn jugador
    const startX = data?.x ?? 16;
    const startY = data?.y ?? 160;

    //movimiento
    this.cursors = this.input.keyboard.createCursorKeys();

    //se activa la tecla E
    this.keyE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

    //creo el Player
    this.player = new Player(this, startX, startY, this.cursors);

    this.sceneStarted = true;

    const spawnZone = map.findObject(
      "spawn dragons",
      (obj) => obj.name === "spawn_dragons",
    );

    //creacion de los dragones
    this.dragons = this.physics.add.group();

    this.spawnDragons = (cantidad) => {
      if (!this.dragonesSeleccionados) return;

      const dragones_mapa1 = Phaser.Utils.Array.Shuffle([
        ...this.dragonesSeleccionados,
      ]).slice(0, cantidad);

      dragones_mapa1.forEach((d) => {
        const x = Phaser.Math.Between(
          spawnZone.x,
          spawnZone.x + spawnZone.width,
        );

        const y = Phaser.Math.Between(
          spawnZone.y,
          spawnZone.y + spawnZone.height,
        );

        const dragon = new NPC(this, x, y);

        dragon.setBounce(1);
        dragon.setCollideWorldBounds(true);
        dragon.body.setAllowGravity(false);

        //guardamos la info del dragon
        dragon.info = d;

        dragon.setCollideWorldBounds(true);

        //dragon.setTexture("dragon_" + d.id);

        this.dragons.add(dragon);
      });
    };

    //funcion que crea los  5 dragones iniciales
    this.spawnInitialDragons = () => {
      if (!this.dragonesSeleccionados) return;

      if (!this.initialSpawnDone) {
        this.spawnDragons(5);
        this.initialSpawnDone = true;
      }
    };

    // Si el JSON ya llegó crear los dragones ahora
    if (this.dragonesSeleccionados) {
      this.spawnInitialDragons();
    }

    //creo la coke
    if (!gameData.hasCoke && !gameData.cokeGiven) {
      const coke = this.physics.add.sprite(256, 160, "coke");

      coke.setImmovable(true);
      this.physics.add.overlap(this.player, coke, this.pickUpCoke, null, this);
    }

    //dragon especial
    this.chimuelo = new Minero(this, 350, 160);

    //colliders
    obstaculos.setCollisionByExclusion([-1]);
    casa.setCollisionByExclusion([-1]);
    corral_dragones.setCollisionByExclusion([-1]);

    //colliders con el player
    this.physics.add.collider(this.player, obstaculos);
    this.physics.add.collider(this.player, casa);

    //colliders con el dragon
    this.physics.add.collider(this.dragons, obstaculos);
    this.physics.add.collider(this.dragons, corral_dragones);
    this.physics.add.collider(this.dragons, casa);
    this.physics.add.collider(this.dragons, this.dragons, (d1, d2) => {
      d1.handleDragonCollision(d2);
      d2.handleDragonCollision(d1);
    });

    //worldbounds
    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    //camara
    this.cameras.main.startFollow(this.player);
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    // trigger para pasar al Mapa2
    const trigger = map.findObject("puertas", (obj) => obj.name === "door");
    this.door = this.physics.add.sprite(trigger.x, trigger.y, null);
    this.door.setSize(trigger.width, trigger.height);
    this.door.setVisible(false);

    //puerta de acceso a la casa (cambio de escena)
    this.physics.add.overlap(this.player, this.door, () => {
      this.scene.start("Casa", { x: 368, y: 448 }); // posición inicial en Mapa2
    });

    //paso de informacion del dragonEnemigo y cambio de escena
    this.physics.add.overlap(
      this.player,
      this.dragons,
      this.dragonEnemigo,
      null,
      this,
    );

    this.cokeGiven = false;
    this.interactionMessage = false;

    this.nearChimuelo = false;
    this.showingInteractMessage = false;

    this.physics.add.overlap(
      this.player,
      this.chimuelo,
      this.tryGiveCoke,
      null,
      this,
    );
  }

  dragonEnemigo(player, dragon) {
    localStorage.setItem("dragon_enemigo", JSON.stringify(dragon.info));

    console.log(dragon.info);
    window.location.href = "../../../../inventario/inventario.html";
  }

  pickUpCoke(player, coke) {
    gameData.hasCoke = true; // variable que indica que el jugador tiene la coca

    coke.disableBody(true, true); // desaparece del mapa
    this.showMessage("Agarraste la coca!");
  }

  tryGiveCoke(player, chimuelo) {
    this.nearChimuelo = true;
  }

  showMessage(text) {
    this.interactionMessage = true;

    this.messageText.setText(text);
    this.messageText.setVisible(true);

    // cancela timer anterior
    if (this.hideMessageTimer) {
      this.hideMessageTimer.remove(false);
    }

    // crea nuevo timer
    this.hideMessageTimer = this.time.delayedCall(2000, () => {
      this.messageText.setVisible(false);
      this.interactionMessage = false;
    });
  }

  update() {
    if (this.nearChimuelo) {
      if (!this.showingInteractMessage && !gameData.cokeGiven) {
        this.messageText.setText("Presioná E para interactuar");
        this.messageText.setVisible(true);
        this.showingInteractMessage = true;
      }
    } else {
      // si te alejás, se oculta
      if (!this.interactionMessage) {
        this.messageText.setVisible(false);
      }
      this.showingInteractMessage = false;
    }

    if (this.nearChimuelo && Phaser.Input.Keyboard.JustDown(this.keyE)) {
      if (gameData.hasCoke && !gameData.cokeGiven) {
        gameData.hasCoke = false;
        gameData.cokeGiven = true;

        this.showMessage("Gracias por la coca");
        this.chimuelo.setTint(0x00ff00);
        this.nearChimuelo = false;
      } else if (!gameData.hasCoke && !gameData.cokeGiven) {
        this.interactionMessage = true;
        this.showMessage("No tenés la Coca todavía!");
      }
    }

    this.nearChimuelo = false;

    //si quedan menos de 4 dragones spawnean 2
    if (this.dragons.countActive(true) < 4 && this.dragonesSeleccionados) {
      this.spawnDragons(2);
    }
  }
}
