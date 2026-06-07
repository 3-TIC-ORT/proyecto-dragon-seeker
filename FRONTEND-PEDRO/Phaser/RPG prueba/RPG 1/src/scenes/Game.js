import { Player } from "../GameObjects/player.js";
import { NPC } from "../GameObjects/npc.js";
import { Minero } from "../GameObjects/minero.js";
import { gameData } from "./Objetos.js";

connect2Server();

export class Game extends Phaser.Scene {
  constructor() {
    super("Game");

    const usuarioActual = JSON.parse(localStorage.getItem("usuario"));
    const idusuario = usuarioActual?.id;

    // Trae rivales del mapa ya escalados al nivel del jugador
    postEvent("obtenerdragonesMapa", { idusuario }, (data) => {
      const dragones = data.dragones;

      // filtra los dragones que están en mapa 1
      this.dragonesSeleccionados = dragones.filter((d) => d.mapa === 1);

      // solo marca que los dragones están listos, no spawnea
      this.dragonesListos = true;

      // si el estado del backend ya llegó antes, procesá ahora
      if (this.estadoJuegoRecibido) {
        this.procesarEstadoInicial();
      }

      this.load.start();
    });
  }

  preload() {
    //Carga del mapa
    //this.load.image("tiles", "assets/town_forest_tiles.png");
    this.load.image("todos_los_conjuntos", "assets/todos_los_conjuntos.png");
    this.load.image("cp_camino_ciudad", "assets/cp_camino_ciudad.png");
    this.load.image(
      "casa_doble_naturaleza",
      "assets/casa_doble_naturaleza.png",
    );
    this.load.image("casa", "assets/casa.png");
    this.load.image("camino_normal", "assets/camino_normal.png");
    this.load.image("arbol_manzanas", "assets/arbol_manzanas.png");
    this.load.image("arbol", "assets/arbol.png");
    this.load.image("huevoDragon", "assets/huevoDragon.png");
    this.load.tilemapTiledJSON("map", "assets/mapa1.json");

    //asignacion del sprite al personaje
    this.load.spritesheet("player", "assets/player.png", {
      frameWidth: 32,
      frameHeight: 32,
    });

    // spritesheets de los 6 dragones del mapa 1
    this.load.spritesheet(
      "terragon",
      "../../../../../../BACKEND/img/terragon.png",
      {
        frameWidth: 32,
        frameHeight: 32,
      },
    );
    this.load.spritesheet("oso", "../../../../../../BACKEND/img/oso.png", {
      frameWidth: 32,
      frameHeight: 32,
    });
    this.load.spritesheet(
      "escarcha",
      "../../../../../../BACKEND/img/escarcha.png",
      {
        frameWidth: 32,
        frameHeight: 32,
      },
    );
    this.load.spritesheet("burbu", "../../../../../../BACKEND/img/burbu.png", {
      frameWidth: 32,
      frameHeight: 32,
    });
    this.load.spritesheet(
      "chimuelo",
      "../../../../../../BACKEND/img/chimuelo.png",
      {
        frameWidth: 32,
        frameHeight: 32,
      },
    );
    this.load.spritesheet(
      "amarillo",
      "../../../../../../BACKEND/img/amarillo.png",
      {
        frameWidth: 32,
        frameHeight: 32,
      },
    );

    //asignacopn del spirte al viejo
    this.load.image("minero", "assets/pinguino.png");

    //asignacion de la coke
    this.load.image("coke", "assets/coke.png");
  }
  create(data) {
    const usuarioActual = JSON.parse(localStorage.getItem("usuario"));
    this.userId = usuarioActual?.id;

    // posición default hasta que llegue el estado del backend
    const startX = data?.x ?? 720;
    const startY = data?.y ?? 460;

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

    //creacion de las capas
    const ts1 = map.addTilesetImage(
      "TODOS los conjuntos de patrones",
      "todos_los_conjuntos",
    );
    const ts2 = map.addTilesetImage("Arbol con manzanas", "arbol_manzanas");
    const ts3 = map.addTilesetImage("Casa", "casa");
    const ts4 = map.addTilesetImage("Arbol 128x128", "arbol");
    const ts5 = map.addTilesetImage(
      "Casa doble naturaleza",
      "casa_doble_naturaleza",
    );
    const ts6 = map.addTilesetImage("Camino normal +", "camino_normal");
    const ts7 = map.addTilesetImage("CP Camino Ciudad", "cp_camino_ciudad");

    const allTilesets = [ts1, ts2, ts3, ts4, ts5, ts6, ts7];

    const suelo = map.createLayer("suelo", allTilesets, 0, 0);
    const caminoCiud = map.createLayer("camino ciudad", allTilesets, 0, 0);
    const caminoNorm = map.createLayer("Camino normal", allTilesets, 0, 0);
    const decoracion = map.createLayer("decoracion", allTilesets, 0, 0);
    const pasto = map.createLayer("Pasto", allTilesets, 0, 0);
    const casasCiudad = map.createLayer("casas ciudad", allTilesets, 0, 0);
    const hojasArboles = map.createLayer("hojas arboles", allTilesets, 0, 0);
    hojasArboles.setDepth(2);
    const corralDragones = map.createLayer(
      "corral dragones",
      allTilesets,
      0,
      0,
    );
    const puertasVisibles = map.createLayer(
      "puertas visibles",
      allTilesets,
      0,
      0,
    );

    //movimiento
    this.cursors = this.input.keyboard.createCursorKeys();

    //se activa la tecla E
    this.keyE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

    //creo el Player
    this.player = new Player(this, startX, startY, this.cursors);
    this.player.setDepth(1);

    this.sceneStarted = true;

    const spawnZone = map.findObject(
      "spawn dragons",
      (obj) => obj.name === "spawn_dragons",
    );

    //creacion de los dragones
    this.dragons = this.physics.add.group();

    //mapa de imagen del JSON → key del spritesheet
    this.keyMap = {
      "img/terragon.png": "terragon",
      "img/oso.png": "oso",
      "img/escarcha.png": "escarcha",
      "img/burbu.png": "burbu",
      "img/chimuelo.png": "chimuelo",
      "img/amarillo.png": "amarillo",
    };

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
        const key = this.keyMap[d.imagen];
        const dragon = new NPC(this, x, y, key);
        dragon.setBounce(1);
        dragon.setCollideWorldBounds(true);
        dragon.body.setAllowGravity(false);
        dragon.info = d;
        // ✅ id único por instancia
        dragon.instanceId = `${d.id}_${Date.now()}_${Math.random()}`;
        this.dragons.add(dragon);
      });
    };

    //funcion que crea los 5 dragones iniciales
    this.spawnInitialDragons = () => {
      if (!this.dragonesSeleccionados || this.initialSpawnDone) return;
      this.spawnDragons(5);
      this.initialSpawnDone = true;
    };

    // ÚNICO lugar donde se restauran o spawnean dragones
    postEvent(
      "obtenerEstadoJuego",
      { idusuario: this.userId, mapa: 1 },
      (res) => {
        this.estadoGuardado = res.estado;
        this.estadoJuegoRecibido = true;

        // si los dragones ya llegaron antes, procesá ahora
        if (this.dragonesListos) {
          this.procesarEstadoInicial();
        }
      },
    );

    // ✅ guardar estado al cerrar/recargar
    window.addEventListener("beforeunload", () => {
      this.guardarEstado();
    });

    //creo la coke
    /* if (!gameData.hasCoke && !gameData.cokeGiven) {
    const coke = this.physics.add.sprite(256, 160, "coke");

    coke.setImmovable(true);
    this.physics.add.overlap(this.player, coke, this.pickUpCoke, null, this);
  }*/

    //dragon especial
    //this.minero = new Minero(this, 350, 160);

    //colliders
    decoracion.setCollisionByExclusion([-1]);
    const colisionesGroup = this.physics.add.staticGroup();
    const colisionesObjetos = map.getObjectLayer("collisions").objects;

    colisionesObjetos.forEach((obj) => {
      const rect = this.add.rectangle(
        obj.x + obj.width / 2,
        obj.y + obj.height / 2,
        obj.width,
        obj.height,
      );
      this.physics.add.existing(rect, true); // true = estático
      colisionesGroup.add(rect);
    });

    corralDragones.setCollisionByExclusion([-1]);
    corralDragones.setVisible(false);

    //colliders con el player
    this.physics.add.collider(this.player, decoracion);
    this.physics.add.collider(this.player, casasCiudad);
    this.physics.add.collider(this.player, colisionesGroup);

    //colliders con el dragon
    this.physics.add.collider(this.dragons, decoracion);
    this.physics.add.collider(this.dragons, casasCiudad);
    this.physics.add.collider(this.dragons, corralDragones);

    this.physics.add.collider(this.dragons, this.dragons, (d1, d2) => {
      d1.handleDragonCollision(d2);
      d2.handleDragonCollision(d1);
    });

    //worldbounds
    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    //camara
    this.cameras.main.startFollow(this.player);
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.cameras.main.setRoundPixels(true);

    // BOTON INVENTARIO DRAGONES

    this.botonInventario = this.add.image(cam.width - 45, 30, "huevoDragon");

    this.botonInventario
      .setScrollFactor(0)
      .setDepth(2000)
      .setScale(0.08)
      .setInteractive({ useHandCursor: true });

    this.botonInventario.on("pointerdown", () => {
      window.location.href = "../../../../inventario/inventario.html";
    });

    // trigger para pasar a la casa
    const triggerCasa = map.findObject("puertas", (obj) => obj.name === "door");
    this.door = this.physics.add.sprite(triggerCasa.x, triggerCasa.y, null);
    this.door.setSize(triggerCasa.width, triggerCasa.height);
    this.door.setVisible(false);

    //puerta de acceso a la casa (cambio de escena)
    this.physics.add.overlap(this.player, this.door, () => {
      this.scene.start("Casa", { x: 368, y: 448 }); // posición inicial en casa
    });

    //trigger para pasar a la zonaBoss
    const triggerZonaBoss = map.findObject(
      "zonaBoss",
      (obj) => obj.name === "zonaBoss",
    );
    this.zonaBoss = this.physics.add.sprite(
      triggerZonaBoss.x,
      triggerZonaBoss.y,
      null,
    );
    this.zonaBoss.setSize(triggerZonaBoss.width, triggerZonaBoss.height);
    this.zonaBoss.setVisible(false);

    //puerta de acceso a la zonaBoss (cambio de escena)
    this.physics.add.overlap(this.player, this.zonaBoss, () => {
      this.scene.start("zonaBoss", { x: 0, y: 544 }); // posición inicial en zonaBoss
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

    this.nearMinero = false;
    this.showingInteractMessage = false;

    this.physics.add.overlap(
      this.player,
      this.minero,
      this.tryGiveCoke,
      null,
      this,
    );
  }

  procesarEstadoInicial() {
    if (this.initialSpawnDone) return;

    const dragonEliminadoId = localStorage.getItem("dragon_eliminado") ?? "";
    localStorage.removeItem("dragon_eliminado");

    const dragonesGuardados = (
      this.estadoGuardado?.dragonesSpawneados ?? []
    ).filter((d) => d.instanceId !== dragonEliminadoId);

    if (dragonesGuardados.length > 0) {
      if (this.estadoGuardado?.x)
        this.player.setPosition(this.estadoGuardado.x, this.estadoGuardado.y);

      dragonesGuardados.forEach((ds) => {
        const dragonInfo = this.dragonesSeleccionados?.find(
          (d) => d.id === ds.id,
        );
        if (!dragonInfo) return;
        const dragon = new NPC(
          this,
          ds.x,
          ds.y,
          this.keyMap[dragonInfo.imagen],
        );
        dragon.setBounce(1);
        dragon.setCollideWorldBounds(true);
        dragon.body.setAllowGravity(false);
        dragon.info = dragonInfo;
        dragon.instanceId = ds.instanceId;
        this.dragons.add(dragon);
      });
      this.initialSpawnDone = true;
    } else {
      this.spawnInitialDragons();
    }
  }

  // ✅ NUEVO método para guardar
  guardarEstado() {
    const usuarioActual = JSON.parse(localStorage.getItem("usuario"));
    postEvent(
      "guardarEstadoJuego",
      {
        idusuario: usuarioActual.id,
        estado: {
          mapa: 1,
          x: Math.round(this.player.x),
          y: Math.round(this.player.y),
          dragonesSpawneados: this.dragons.getChildren().map((d) => ({
            instanceId: d.instanceId,
            id: d.info.id,
            x: Math.round(d.x),
            y: Math.round(d.y),
          })),
        },
      },
      () => {},
    );
  }

  dragonEnemigo(player, dragon) {
    if (this.battleCooldown) return;
    this.battleCooldown = true; // ✅ evita que se llame dos veces seguidas

    // ✅ eliminás el dragón del grupo antes de salir
    dragon.disableBody(true, true);
    this.dragons.remove(dragon, true, true);

    // ✅ guardar estado antes de la batalla (sin el dragón con el que chocaste)
    const dragonesActuales = this.dragons
      .getChildren()
      .filter((d) => d !== dragon)
      .map((d) => ({
        instanceId: d.instanceId,
        id: d.info.id,
        x: Math.round(d.x),
        y: Math.round(d.y),
      }));

    localStorage.setItem("dragon_eliminado", dragon.instanceId); // ✅ instanceId, no id numérico
    localStorage.setItem("dragon_enemigo", JSON.stringify(dragon.info));

    this.guardarEstado();
    window.location.href = "../../../../inventario/inventario.html";
  }

  pickUpCoke(player, coke) {
    gameData.hasCoke = true; // variable que indica que el jugador tiene la coca

    coke.disableBody(true, true); // desaparece del mapa
    this.showMessage("Agarraste la coca!");
  }

  tryGiveCoke(player, minero) {
    this.nearMinero = true;
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
    if (this.nearMinero) {
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

    if (this.nearMinero && Phaser.Input.Keyboard.JustDown(this.keyE)) {
      if (gameData.hasCoke && !gameData.cokeGiven) {
        gameData.hasCoke = false;
        gameData.cokeGiven = true;

        this.showMessage("Gracias por la coca");
        this.minero.setTint(0x00ff00);
        this.nearMinero = false;
      } else if (!gameData.hasCoke && !gameData.cokeGiven) {
        this.interactionMessage = true;
        this.showMessage("No tenés la Coca todavía!");
      }
    }

    this.nearMinero = false;

    //si quedan menos de 4 dragones spawnean 2
    if (
      this.initialSpawnDone &&
      this.dragons.countActive(true) < 4 &&
      this.dragonesSeleccionados
    ) {
      this.spawnDragons(2);
    }
  }
}
