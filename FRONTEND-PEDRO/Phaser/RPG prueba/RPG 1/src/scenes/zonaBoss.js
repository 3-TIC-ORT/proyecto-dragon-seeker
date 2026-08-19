import { Player } from "../GameObjects/player.js";
import { NPC } from "../GameObjects/npc.js";
import { guardarEstado } from "../utils/persistencia.js";

connect2Server();

export class zonaBoss extends Phaser.Scene {
  constructor() {
    super("zonaBoss");
  }

  preload() {
    this.load.image("todos_los_conjuntos", "assets/todos_los_conjuntos.png");
    this.load.image("camino_normal", "assets/camino_normal.png");
    this.load.image("arbol_dorado", "assets/arbol_dorado.png");
    this.load.image(
      "arbusto_dorado_flores",
      "assets/Arbusto_dorado_flores.png"
    );

    this.load.tilemapTiledJSON("zonaBoss", "assets/zonaBoss.json");

    this.load.spritesheet("player", "assets/player.png", {
      frameWidth: 32,
      frameHeight: 32,
    });

    this.load.spritesheet(
      "bossRoca",
      "../../../../../../BACKEND/img/boss1.png",
      {
        frameWidth: 128,
        frameHeight: 128,
      }
    );

    this.load.image("coke", "assets/coke.png");
  }

  create(data) {
    const zonaBoss = this.make.tilemap({ key: "zonaBoss" });

    //creacion de las capas
    const ts1 = zonaBoss.addTilesetImage(
      "TODOS los conjuntos de patrones",
      "todos_los_conjuntos"
    );
    const ts2 = zonaBoss.addTilesetImage("arbol dorado", "arbol_dorado");
    const ts3 = zonaBoss.addTilesetImage("Camino normal +", "camino_normal");
    const ts4 = zonaBoss.addTilesetImage(
      "Arbusto dorado flores",
      "arbusto_dorado_flores"
    );

    const allTilesets = [ts1, ts2, ts3, ts4];

    const suelo = zonaBoss.createLayer("suelo", allTilesets, 0, 0);
    const camino_normal = zonaBoss.createLayer(
      "Camino normal",
      allTilesets,
      0,
      0
    );
    const decoracion = zonaBoss.createLayer("decoracion", allTilesets, 0, 0);
    const hojasArboles = zonaBoss.createLayer(
      "hojas arboles",
      allTilesets,
      0,
      0
    );
    hojasArboles.setDepth(2.5);
    const pasto = zonaBoss.createLayer("pasto", allTilesets, 0, 0);

    //creando las teclas para movimiento
    this.cursors = this.input.keyboard.createCursorKeys();

    // ✅ posición default por si entra sin data
    const startX = data?.x ?? 0;
    const startY = data?.y ?? 544;

    // Spawn del jugador en la posición recibida desde Mapa1
    this.player = new Player(this, startX, startY, this.cursors);
    this.player.setDepth(1);

    const codigoX = this.physics.add.sprite(1568, 544, "coke");

    //worldbounds
    this.physics.world.setBounds(
      0,
      0,
      zonaBoss.widthInPixels,
      zonaBoss.heightInPixels
    );

    //camara
    this.cameras.main.startFollow(this.player);
    this.cameras.main.setBounds(
      0,
      0,
      zonaBoss.widthInPixels,
      zonaBoss.heightInPixels
    );
    this.cameras.main.setRoundPixels(true);

    //colliders
    decoracion.setCollisionByExclusion([-1]);
    this.physics.add.collider(this.player, decoracion);

    // ✅ grupo del boss + collider registrado sobre el grupo (aunque esté vacío)
    this.bossGroup = this.physics.add.group();
    this.physics.add.collider(this.bossGroup, decoracion);

    // Arranca en cooldown y solo se habilita cuando el player NO esta sobre el
    // boss (ver update). Asi, al retomar la partida o huir de la pelea, aunque
    // respawnees encima del boss NO te reengancha al instante: hay que alejarse
    // primero. bossSpawned evita resetear el cooldown antes de que el boss exista.
    this.battleCooldown = true;
    this.bossSpawned = false;

    // ✅ pedir y spawnear el boss
    /*postEvent("obtenerBossMapa", { mapa: 1 }, (res) => {
      console.log("DEBUG respuesta obtenerBossMapa:", JSON.stringify(res));
      if (!res.exito) {
        console.log("DEBUG no exito, mensaje:", res.mensaje);
        return;
      }

      const boss = res.boss;
      console.log("DEBUG boss recibido:", JSON.stringify(boss));

      const bossSprite = new NPC(this, 1568, 544, "bossRoca");
      console.log(
        "DEBUG bossSprite creado:",
        bossSprite.x,
        bossSprite.y,
        bossSprite.visible,
        bossSprite.texture.key,
      );

      bossSprite.setCollideWorldBounds(true);
      bossSprite.info = boss;
      bossSprite.instanceId = `boss_${boss.id}`;

      this.bossGroup.add(bossSprite);

      this.physics.add.overlap(
        this.player,
        this.bossGroup,
        this.bossEncuentro,
        null,
        this,
      );

      // El boss ya esta en escena: a partir de aca update puede rehabilitar el
      // encuentro cuando el player se aleje del boss.
      this.bossSpawned = true;
    });*/

    //letra
    this.physics.add.overlap(this.player, codigoX, () => {
      codigoX.disableBody(true, true);

      postEvent(
        "marcarTieneCodigoX",
        { idpartida: Number(localStorage.getItem("partida")) },
        () => {
          localStorage.setItem(
            "resultado",
            JSON.stringify({
              tipo: "exito",
              titulo: "¡La palabra es creatividad!",
              detalle: "Ve a por las demás.\n\nGracias por jugar.",
              sprite: "../../../../../../BACKEND/img/15.png",
              juegoGanado: true,
              textoBoton: "VOLVER AL INICIO",
              destino: "http://127.0.0.1:5501/menu/splash.html",
            })
          );
          window.location.href = "../../../../logros/resultado.html"; // ajustá la ruta si es distinta
        }
      );
    });
  }

  bossEncuentro(player, bossSprite) {
    console.log(
      "DEBUG bossEncuentro disparado. battleCooldown =",
      this.battleCooldown
    );
    if (this.battleCooldown) return;
    this.battleCooldown = true;

    bossSprite.disableBody(true, true);

    localStorage.setItem(
      "dragon_enemigo",
      JSON.stringify({ ...bossSprite.info, instanceId: bossSprite.instanceId })
    );
    localStorage.removeItem("dragon_eliminado");

    // guardamos el estado de la zona boss antes de saltar a la pelea
    guardarEstado(3, this.player);

    console.log("DEBUG redirigiendo a pelea con boss:", bossSprite.info);

    // Mismo ruteo que un encuentro normal del mapa (ver Game.js): si tenes un
    // dragon equipado con vida, vas directo al head-to-head; si no, pasas por el
    // inventario a elegir (origen "encuentro" -> head-to-head -> pelea). Sin el
    // flag origenInventario, el inventario te devolvia al mapa en vez de pelear.
    const equipado = JSON.parse(localStorage.getItem("dragonardo"));
    if (equipado && (equipado.vida ?? 0) > 0) {
      window.location.href = "../../../../enfrentamiento/enfrentamiento.html";
    } else {
      localStorage.setItem("origenInventario", "encuentro");
      window.location.href = "../../../../inventario/inventario.html";
    }
  }

  update() {
    // Rehabilita el encuentro con el boss recien cuando el player ya no esta
    // encima (mismo patron que battleCooldown en Game.js). Evita el re-trigger
    // automatico al respawnear sobre el boss tras huir o retomar la partida.
    if (
      this.battleCooldown &&
      this.bossSpawned &&
      this.bossGroup &&
      !this.physics.overlap(this.player, this.bossGroup)
    ) {
      this.battleCooldown = false;
    }
  }
}
