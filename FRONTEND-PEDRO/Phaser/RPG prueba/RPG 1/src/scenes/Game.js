import { Player } from "../GameObjects/player.js";
import { NPC } from "../GameObjects/npc.js";
import { Minero } from "../GameObjects/minero.js";
import { gameData } from "./Objetos.js";
import { guardarEstado, getPartidaId } from "../utils/persistencia.js";
import { DialogoRPG } from "../utils/DialogoRPG.js";

connect2Server();

export class Game extends Phaser.Scene {
  constructor() {
    super("Game");

    const idpartida = getPartidaId();

    // Trae rivales del mapa ya escalados al nivel del jugador
    postEvent("obtenerdragonesMapa", { idpartida }, (data) => {
      const dragones = data.dragones;

      // filtra los dragones que están en mapa 1
      this.dragonesSeleccionados = dragones.filter(
        (d) => d.mapa === 1 && !d.especial,
      );

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
    this.load.image("cartel_curadero", "assets/cartel curadero.png");
    this.load.image("carteles", "assets/carteles.png");

    this.load.tilemapTiledJSON("map", "assets/mapa1.json");

    //asignacion del sprite al personaje
    this.load.spritesheet("player", "assets/player.png", {
      frameWidth: 32,
      frameHeight: 32,
    });

    // spritesheets de los 6 dragones del mapa 1 y chimuelo
    this.load.spritesheet(
      "terragon",
      "../../../../../../BACKEND/img/mapa/terragon_mapa.png",
      {
        frameWidth: 32,
        frameHeight: 32,
      },
    );
    this.load.spritesheet(
      "oso",
      "../../../../../../BACKEND/img/mapa/oso_mapa.png",
      {
        frameWidth: 32,
        frameHeight: 32,
      },
    );
    this.load.spritesheet(
      "escarcha",
      "../../../../../../BACKEND/img/mapa/escarcha_mapa.png",
      {
        frameWidth: 38,
        frameHeight: 37,
      },
    );
    this.load.spritesheet(
      "burbu",
      "../../../../../../BACKEND/img/mapa/burbu_mapa.png",
      {
        frameWidth: 32,
        frameHeight: 32,
      },
    );
    this.load.spritesheet(
      "chimuelo",
      "../../../../../../BACKEND/img/mapa/chimuelo_mapa.png",
      {
        frameWidth: 32,
        frameHeight: 32,
      },
    );
    this.load.spritesheet(
      "amarillo",
      "../../../../../../BACKEND/img/mapa/amarillo_mapa.png",
      {
        frameWidth: 32,
        frameHeight: 32,
      },
    );
    this.load.spritesheet(
      "llamafuria",
      "../../../../../../BACKEND/img/mapa/llamafuria_mapa.png",
      {
        frameWidth: 32,
        frameHeight: 32,
      },
    );
    this.load.spritesheet(
      "bengal",
      "../../../../../../BACKEND/img/mapa/bengal_mapa.png",
      {
        frameWidth: 32,
        frameHeight: 32,
      },
    );
    this.load.spritesheet(
      "burpi",
      "../../../../../../BACKEND/img/mapa/burpi_mapa.png",
      {
        frameWidth: 32,
        frameHeight: 37,
      },
    );
    this.load.spritesheet(
      "golemVerde",
      "../../../../../../BACKEND/img/mapa/golemVerde_mapa.png",
      {
        frameWidth: 32,
        frameHeight: 32,
      },
    );
    this.load.spritesheet(
      "rocabrava",
      "../../../../../../BACKEND/img/mapa/rocabrava_mapa.png",
      {
        frameWidth: 32,
        frameHeight: 37,
      },
    );
    this.load.spritesheet(
      "tormato",
      "../../../../../../BACKEND/img/mapa/tormato_mapa.png",
      {
        frameWidth: 32,
        frameHeight: 32,
      },
    );
    this.load.spritesheet(
      "truenoz",
      "../../../../../../BACKEND/img/mapa/truenoz_mapa.png",
      {
        frameWidth: 32,
        frameHeight: 32,
      },
    );
    this.load.spritesheet(
      "tsunami",
      "../../../../../../BACKEND/img/mapa/tsunami_mapa.png",
      {
        frameWidth: 32,
        frameHeight: 37,
      },
    );
    this.load.spritesheet(
      "yetihelado",
      "../../../../../../BACKEND/img/mapa/yetihelado_mapa.png",
      {
        frameWidth: 38,
        frameHeight: 37,
      },
    );

    //asignacopn del spirte al viejo
    this.load.image("minero", "assets/pinguino.png");

    //asignacion de la coke
    this.load.image("coke", "assets/coke.png");
  }
  create(data) {
    this.cambiandoEscena = false;

    this.partidaId = getPartidaId();
    // Al volver al mapa se borra cualquier intencion de pelea pendiente, asi una
    // visita casual al inventario (boton huevo) nunca termina mandando a la pelea.
    localStorage.removeItem("origenInventario");

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

    this.dialogo = new DialogoRPG(this);

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
    const ts8 = map.addTilesetImage("cartel curadero", "cartel_curadero");
    const ts9 = map.addTilesetImage("carteles", "carteles");

    const allTilesets = [ts1, ts2, ts3, ts4, ts5, ts6, ts7, ts8, ts9];

    const suelo = map.createLayer("suelo", allTilesets, 0, 0);
    const caminoCiud = map.createLayer("camino ciudad", allTilesets, 0, 0);
    const caminoNorm = map.createLayer("Camino normal", allTilesets, 0, 0);
    const decoracion = map.createLayer("decoracion", allTilesets, 0, 0);
    const pasto = map.createLayer("Pasto", allTilesets, 0, 0);
    const cartel_curadero = map.createLayer(
      "cartel curadero",
      allTilesets,
      0,
      0,
    );

    cartel_curadero.setDepth(2);

    const casasCiudad = map.createLayer("casas ciudad", allTilesets, 0, 0);
    casasCiudad.setDepth(3);
    const hojasArboles = map.createLayer("hojas arboles", allTilesets, 0, 0);
    hojasArboles.setDepth(2.5);
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
    const casa_inferior = map.createLayer("casa_inferior", allTilesets, 0, 0);
    const carteles = map.createLayer("carteles", allTilesets, 0, 0);

    //movimiento
    this.cursors = this.input.keyboard.createCursorKeys();

    //se activa la tecla E
    this.keyE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

    //creo el Player
    this.player = new Player(this, startX, startY, this.cursors);
    this.player.setDepth(1);

    this.sceneStarted = true;

    // Al entrar/volver al mapa no se dispara ningun encuentro hasta que el player
    // quede separado de todos los dragones. Evita el re-encuentro instantaneo
    // cuando se vuelve de una pelea/inventario y el dragon quedo guardado encima.
    this.battleCooldown = true;

    this.spawnZone = map.findObject(
      "spawn dragons",
      (obj) => obj.name === "spawn_dragons",
    );
    this.spawnZone2 = map.findObject(
      "spawn dragons",
      (obj) => obj.name === "spawn_dragons2",
    );
    this.spawnZone3 = map.findObject(
      "spawn dragons",
      (obj) => obj.name === "spawn_dragons3",
    );

    console.log("spawnZone:", this.spawnZone);
    console.log("spawnZone2:", this.spawnZone2);
    console.log("spawnZone3:", this.spawnZone3);
    //creacion de los dragones
    this.dragons = this.physics.add.group();

    //mapa de id de dragon → key del spritesheet del mapa (img/mapa/*_mapa.png).
    //Se keyea por id (no por imagen) porque imagen ahora apunta al SVG de display.
    this.keyMap = {
      1: "terragon",
      16: "oso",
      13: "escarcha",
      10: "burbu",
      4: "chimuelo",
      7: "amarillo",
      5: "llamafuria",
      2: "rocabrava",
      3: "golemVerde",
      9: "truenoz",
      11: "tsunami",
      15: "yetihelado",
      19: "tormato",
      20: "bengal",
      6: "burpi",
    };

    this.spawnDragonsEnZona = (cantidad, zona) => {
      if (!this.dragonesSeleccionados) return;

      const dragones = Phaser.Utils.Array.Shuffle([
        ...this.dragonesSeleccionados,
      ]).slice(0, cantidad);

      dragones.forEach((d) => {
        const x = Phaser.Math.Between(zona.x, zona.x + zona.width);
        const y = Phaser.Math.Between(zona.y, zona.y + zona.height);
        const key = this.keyMap[d.id];
        const dragon = new NPC(this, x, y, key);
        dragon.setBounce(1);
        dragon.setCollideWorldBounds(true);
        dragon.body.setAllowGravity(false);
        dragon.info = d;
        dragon.instanceId = `${d.id}_${Date.now()}_${Math.random()}`;
        dragon.zona = zona.name; // ← marca a qué zona pertenece
        this.dragons.add(dragon);
      });
    };

    this.spawnDragons = (cantidad) => {
      this.spawnDragonsEnZona(cantidad, this.spawnZone);
    };

    this.spawnInitialDragons = () => {
      if (!this.dragonesSeleccionados || this.initialSpawnDone) return;
      this.spawnDragonsEnZona(5, this.spawnZone);
      this.spawnDragonsEnZona(3, this.spawnZone2);
      this.spawnDragonsEnZona(3, this.spawnZone3);
      this.initialSpawnDone = true;
    };

    // ÚNICO lugar donde se restauran o spawnean dragones
    postEvent(
      "obtenerEstadoJuego",
      { idpartida: this.partidaId, mapa: 1 },
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
    this.physics.add.collider(this.player, colisionesGroup);

    //colliders con el dragon
    this.physics.add.collider(this.dragons, decoracion);
    this.physics.add.collider(this.dragons, colisionesGroup);
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
      // Desde el mapa el inventario es para ver/elegir dragon activo: vuelve al mapa.
      localStorage.setItem("origenInventario", "mapa");
      window.location.href = "../../../../inventario/inventario.html";
    });

    // BOTON CERRAR SESION (arriba a la izquierda)
    this.botonSalir = this.add
      .text(16, 16, "Salir", {
        fontSize: "20px",
        fill: "#ffffff",
        backgroundColor: "rgba(0,0,0,0.55)",
        padding: { x: 12, y: 7 },
        fontFamily: "Pixelify Sans",
      })
      .setScrollFactor(0)
      .setDepth(2000)
      .setInteractive({ useHandCursor: true });

    this.botonSalir.on("pointerover", () =>
      this.botonSalir.setColor("#ffd83d"),
    );
    this.botonSalir.on("pointerout", () => this.botonSalir.setColor("#ffffff"));
    this.botonSalir.on("pointerdown", () => this.cerrarSesion());

    // BOTON CAMBIAR / CREAR PARTIDA (debajo de Salir)
    this.botonPartidas = this.add
      .text(16, 60, "Partidas", {
        fontSize: "20px",
        fill: "#ffffff",
        backgroundColor: "rgba(0,0,0,0.55)",
        padding: { x: 12, y: 7 },
        fontFamily: "Pixelify Sans",
      })
      .setScrollFactor(0)
      .setDepth(2000)
      .setInteractive({ useHandCursor: true });

    this.botonPartidas.on("pointerover", () =>
      this.botonPartidas.setColor("#ffd83d"),
    );
    this.botonPartidas.on("pointerout", () =>
      this.botonPartidas.setColor("#ffffff"),
    );
    this.botonPartidas.on("pointerdown", () => this.irAPartidas());

    // trigger para pasar a la casa
    const triggerCasa = map.findObject("puertas", (obj) => obj.name === "door");
    this.door = this.physics.add.sprite(triggerCasa.x, triggerCasa.y, null);
    this.door.setSize(triggerCasa.width, triggerCasa.height);
    this.door.setVisible(false);

    //puerta de acceso a la casa (cambio de escena)
    this.physics.add.overlap(this.player, this.door, () => {
      if (this.cambiandoEscena) return; // evita que se llame múltiples veces
      this.cambiandoEscena = true;

      const dragonesSpawneados = this.dragons.getChildren().map((d) => ({
        instanceId: d.instanceId,
        id: d.info.id,
        x: Math.round(d.x),
        y: Math.round(d.y),
        zona: d.zona, // ← agregar
      }));

      postEvent(
        "guardarEstadoJuego",
        {
          idpartida: getPartidaId(),
          estado: {
            mapa: 1,
            x: Math.round(this.player.x),
            y: Math.round(this.player.y),
            dragonesSpawneados,
          },
        },
        () => {
          // ✅ recién cuando el backend confirmó, cambiamos de escena
          this.scene.start("Casa", { x: 368, y: 576 });
        },
      );
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

    //puerta de acceso a la zonaBoss (requiere nivel promedio mínimo)
    this.nearZonaBoss = false;

    this.physics.add.overlap(this.player, this.zonaBoss, () => {
      this.nearZonaBoss = true;
      if (this.cambiandoEscena || this.dialogo.abierto || this.zonaBossCooldown)
        return;
      this.zonaBossCooldown = true; // se activa al dispararse, se resetea al alejarse

      const idpartida = getPartidaId();

      postEvent("verificarAccesoZonaBoss", { idpartida }, (res) => {
        if (!res.exito) return;

        if (res.puedePasar) {
          this.dialogo.confirmar(
            `Nivel promedio: ${res.promedio}. ¿Querés entrar a la zona del jefe?`,
            () => {
              this.cambiandoEscena = true;

              const dragonesSpawneados = this.dragons
                .getChildren()
                .map((d) => ({
                  instanceId: d.instanceId,
                  id: d.info.id,
                  x: Math.round(d.x),
                  y: Math.round(d.y),
                  zona: d.zona, // ← agregar
                }));

              postEvent(
                "guardarEstadoJuego",
                {
                  idpartida,
                  estado: {
                    mapa: 1,
                    x: Math.round(this.player.x),
                    y: Math.round(this.player.y),
                    dragonesSpawneados,
                  },
                },
                () => {
                  this.scene.start("zonaBoss", { x: 32, y: 544 });
                },
              );
            },
            () => {},
          );
        } else {
          this.dialogo.aviso(
            `Necesitás nivel promedio ${res.nivelMinimo} (tenés ${res.promedio}).`,
            () => {},
          );
        }
      });
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

    // Aviso unico de desbloqueo de la zona del jefe: la primera vez que el nivel
    // promedio alcanza el minimo, lo anunciamos al volver al mapa. El flag por
    // partida evita repetirlo cada vez que se entra al mapa.
    const flagBoss = `bossDesbloqueadoAvisado_${this.partidaId}`;
    if (!localStorage.getItem(flagBoss)) {
      postEvent(
        "verificarAccesoZonaBoss",
        { idpartida: this.partidaId },
        (res) => {
          if (res && res.exito && res.puedePasar) {
            localStorage.setItem(flagBoss, "1");
            this.dialogo.aviso(
              "¡Desbloqueaste la zona del jefe! Buscá el portal del jefe en el mapa para enfrentarlo.",
            );
          }
        },
      );
    }
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
        const dragon = new NPC(this, ds.x, ds.y, this.keyMap[dragonInfo.id]);
        dragon.setBounce(1);
        dragon.setCollideWorldBounds(true);
        dragon.body.setAllowGravity(false);
        dragon.info = dragonInfo;
        dragon.instanceId = ds.instanceId;
        dragon.zona = ds.zona ?? "spawn_dragons"; // ← única línea nueva
        this.dragons.add(dragon);
      });
      this.initialSpawnDone = true;
    } else {
      this.spawnInitialDragons();
    }
  }

  // ✅ NUEVO método para guardar
  guardarEstado() {
    const dragonesSpawneados = this.dragons.getChildren().map((d) => ({
      instanceId: d.instanceId,
      id: d.info.id,
      x: Math.round(d.x),
      y: Math.round(d.y),
      zona: d.zona, // ← agregar
    }));

    guardarEstado(1, this.player, dragonesSpawneados);
  }

  // Cerrar sesion desde el mapa: pide confirmacion (overlay) y, si acepta,
  // guarda el estado y vuelve a la pantalla de inicio.
  cerrarSesion() {
    if (typeof window.mostrarOverlayConfirmar !== "function") {
      this.hacerLogout();
      return;
    }
    window.mostrarOverlayConfirmar({
      titulo: "¿Cerrar sesión?",
      detalle:
        "Los cambios de la partida en curso quedan guardados.\n¿Querés cerrar sesión?",
      textoConfirmar: "CERRAR SESIÓN",
      textoCancelar: "CANCELAR",
      onConfirmar: () => this.hacerLogout(),
    });
  }

  // Guarda el estado actual del mapa y ejecuta el callback recien cuando el
  // backend confirma (mismo patron que las puertas de cambio de escena).
  guardarEstadoYluego(callback) {
    const dragonesSpawneados = this.dragons.getChildren().map((d) => ({
      instanceId: d.instanceId,
      id: d.info.id,
      x: Math.round(d.x),
      y: Math.round(d.y),
      zona: d.zona, // ← agregar
    }));

    postEvent(
      "guardarEstadoJuego",
      {
        idpartida: getPartidaId(),
        estado: {
          mapa: 1,
          x: Math.round(this.player.x),
          y: Math.round(this.player.y),
          dragonesSpawneados,
        },
      },
      callback,
    );
  }

  hacerLogout() {
    // Guarda y, al confirmar, limpia la sesion y vuelve a la pantalla de inicio.
    this.guardarEstadoYluego(() => {
      for (const clave of [
        "usuario",
        "partida",
        "dragon_enemigo",
        "vidaFinalRival",
        "dragonardo",
        "origenInventario",
        "resultado",
      ]) {
        localStorage.removeItem(clave);
      }
      window.location.href = "http://127.0.0.1:5501/menu/splash.html";
    });
  }

  // Cambiar / crear partida: guarda la partida actual (seguis logueado) y va a
  // la pantalla de partidas a elegir otra o crear una nueva.
  irAPartidas() {
    this.guardarEstadoYluego(() => {
      window.location.href = "http://127.0.0.1:5501/menu/partida.html";
    });
  }

  dragonEnemigo(player, dragon) {
    if (this.battleCooldown) return;
    this.battleCooldown = true;

    // oculta y desactiva al dragón para que no siga colisionando/renderizando,
    // pero SIN sacarlo de this.dragons -> sigue siendo guardado por guardarEstado()
    dragon.disableBody(true, true);

    // pasamos info + instanceId a la pantalla de batalla
    localStorage.setItem(
      "dragon_enemigo",
      JSON.stringify({ ...dragon.info, instanceId: dragon.instanceId }),
    );

    // limpiamos cualquier valor previo: solo se setea si ganás o capturás
    localStorage.removeItem("dragon_eliminado");

    // guarda el estado actual, INCLUYENDO este dragón con su posición
    this.guardarEstado();

    // Si ya tenes un dragon equipado CON vida, vas directo al head-to-head y de
    // ahi a la pelea. Si no tenes (o el equipado quedo en 0), primero pasas por
    // el inventario a elegir uno (origen "encuentro" -> head-to-head -> pelea).
    const equipado = JSON.parse(localStorage.getItem("dragonardo"));
    if (equipado && (equipado.vida ?? 0) > 0) {
      window.location.href = "../../../../enfrentamiento/enfrentamiento.html";
    } else {
      localStorage.setItem("origenInventario", "encuentro");
      window.location.href = "../../../../inventario/inventario.html";
    }
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
    if (!this.nearZonaBoss) {
      // si te alejaste, reseteamos para que al volver pueda dispararse de nuevo
      this.zonaBossCooldown = false;
    }
    this.nearZonaBoss = false;

    if (this.dialogo.abierto) {
      this.dialogo.manejarInput(this.cursors, this.keyE);
      this.player.setVelocity(0);
      return;
    }

    // Habilita los encuentros recien cuando los dragones ya estan en el mapa y
    // el player no esta encima de ninguno (ver battleCooldown inicial en create()).
    if (
      this.battleCooldown &&
      this.initialSpawnDone &&
      !this.physics.overlap(this.player, this.dragons)
    ) {
      this.battleCooldownTimer = this.time.delayedCall(3000, () => {
        this.battleCooldown = false;
        this.battleCooldownTimer = null;
      });
    }

    /* if (this.nearMinero) {
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
    */

    //si quedan menos de 4 dragones spawnean 2
    // zona 1: menos de 4 → spawn 2
    if (
      this.initialSpawnDone &&
      this.dragonesSeleccionados &&
      this.dragons.getChildren().filter((d) => d.zona === "spawn_dragons")
        .length < 4
    ) {
      this.spawnDragonsEnZona(2, this.spawnZone);
    }

    // zona 2: menos de 2 → spawn 2
    if (
      this.initialSpawnDone &&
      this.dragonesSeleccionados &&
      this.dragons.getChildren().filter((d) => d.zona === "spawn_dragons2")
        .length < 2
    ) {
      this.spawnDragonsEnZona(2, this.spawnZone2);
    }

    // zona 3: menos de 2 → spawn 2
    if (
      this.initialSpawnDone &&
      this.dragonesSeleccionados &&
      this.dragons.getChildren().filter((d) => d.zona === "spawn_dragons3")
        .length < 2
    ) {
      this.spawnDragonsEnZona(2, this.spawnZone3);
    }
  }
}
