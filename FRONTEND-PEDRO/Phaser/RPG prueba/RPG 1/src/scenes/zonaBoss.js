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
    this.load.image("arbol", "assets/arbol.png");

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
      },
    );
  }

  create(data) {
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

    //colliders
    decoracion.setCollisionByExclusion([-1]);
    this.physics.add.collider(this.player, decoracion);

    // ✅ grupo del boss + collider registrado sobre el grupo (aunque esté vacío)
    this.bossGroup = this.physics.add.group();
    this.physics.add.collider(this.bossGroup, decoracion);

    this.battleCooldown = false;

    // ✅ pedir y spawnear el boss
    postEvent("obtenerBossMapa", { mapa: 1 }, (res) => {
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
    });

    // ✅ guardar estado al cerrar/recargar
    window.addEventListener("beforeunload", () => {
      guardarEstado(3, this.player);
    });

    //puerta
    const doorTrigger = zonaBoss.findObject(
      "puertaMapa1",
      (obj) => obj.name === "doorMap",
    );

    this.door = this.physics.add.sprite(doorTrigger.x, doorTrigger.y, null);
    this.door.setSize(doorTrigger.width, doorTrigger.height);
    this.door.setVisible(false);

    this.physics.add.overlap(this.player, this.door, () => {
      this.scene.start("Game", { x: 2932, y: 416 }); // posición cuando sale del mapa 2
    });
  }

  bossEncuentro(player, bossSprite) {
    console.log(
      "DEBUG bossEncuentro disparado. battleCooldown =",
      this.battleCooldown,
    );
    if (this.battleCooldown) return;
    this.battleCooldown = true;

    bossSprite.disableBody(true, true);

    localStorage.setItem("dragon_enemigo", JSON.stringify(bossSprite.info));
    localStorage.removeItem("dragon_eliminado");

    console.log("DEBUG redirigiendo a pelea con boss:", bossSprite.info);

    window.location.href = "../../../../inventario/inventario.html";
  }

  update() {}
}
