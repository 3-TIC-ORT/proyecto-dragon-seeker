import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ruta = path.join(__dirname, "progreso.json");
const rutaCatalogo = path.join(__dirname, "dragones.json");

export function leer() {
  try {
    return JSON.parse(fs.readFileSync(ruta, "utf-8") || "[]");
  } catch {
    fs.writeFileSync(ruta, "[]");
    return [];
  }
}

function leerCatalogo() {
  return JSON.parse(fs.readFileSync(rutaCatalogo, "utf-8")).dragones;
}

function guardar(datos) {
  fs.writeFileSync(ruta, JSON.stringify(datos, null, 2));
}

export function buscar(lista, partida, dragon) {
  return lista.find((x) => x.partida === partida && x.dragon === dragon);
}

function asegurar(lista, partida, dragon) {
  let reg = buscar(lista, partida, dragon);

  if (!reg) {
    const base = leerCatalogo().find((d) => d.id === dragon);
    const ataquesBase = base?.ataques ?? [];
    reg = {
      partida,
      dragon,
      habilitado: false,
      nivel: 1,
      exp: 0,
      vida: base?.vidaMax ?? 100,
      vidaMax: base?.vidaMax ?? 100,
      fuerza: base?.fuerza ?? 10,
      tipo: base?.tipo ?? "normal",
      ataques: ataquesBase.map((a) => ({
        nombre: a.nombre,
        nivel: a.nivel,
        dano: a.dano,
      })),
      desbloqueados: ataquesBase
        .filter((a) => a.nivel <= 1)
        .map((a) => a.nombre),
    };
    lista.push(reg);
  }
  return reg;
}

function experiencianecesaria(nivel) {
  return 100 * nivel;
}

export function sumarexperiencia(iddragon, cantidad, idpartida) {
  const lista = leer();
  const reg = asegurar(lista, idpartida, iddragon);
  reg.exp += cantidad;
  let subidas = 0;
  while (reg.exp >= experiencianecesaria(reg.nivel)) {
    reg.exp -= experiencianecesaria(reg.nivel);
    reg.nivel++;
    subidas++;
    aumentarestadisticas(iddragon, { vida: 10, fuerza: 5 }, idpartida, lista);
    desbloquearataques(iddragon, reg.nivel, idpartida, lista);
  }

  guardar(lista);
  return {
    exito: true,
    mensaje:
      subidas > 0
        ? `Subiste ${subidas} nivel(es)!`
        : `Experiencia sumada ${cantidad}xp`,
    progreso: reg,
  };
}

export function verificarsubidanivel(iddragon, idpartida) {
  const lista = leer();
  const reg = asegurar(lista, idpartida, iddragon);
  const falta = experiencianecesaria(reg.nivel) - reg.exp;
  return {
    exito: true,
    nivel: reg.nivel,
    exp: reg.exp,
    falta: falta > 0 ? falta : 0,
  };
}

export function desbloquearataques(iddragon, nivel, idpartida, lista0 = null) {
  const lista = lista0 || leer();
  const reg = asegurar(lista, idpartida, iddragon);
  const nuevos = reg.ataques
    .filter((a) => a.nivel <= nivel)
    .map((a) => a.nombre)
    .filter((n) => !reg.desbloqueados.includes(n));

  if (nuevos.length > 0) {
    reg.desbloqueados.push(...nuevos);
    if (!lista0) guardar(lista);
    return { exito: true, mensaje: `nuevos ataques:  ${nuevos.join(",")}` };
  }
  if (!lista0) guardar(lista);
  return { exito: true, mensaje: "no hay ataques nuevos" };
}

export function aumentarestadisticas(
  iddragon,
  incremento,
  idpartida,
  lista0 = null,
) {
  const lista = lista0 || leer();
  const reg = asegurar(lista, idpartida, iddragon);
  reg.vida += incremento.vida || 0;
  reg.fuerza += incremento.fuerza || 0;

  if (!lista0) guardar(lista);
  return {
    exito: true,
    mensaje: `+${incremento.vida} vida, +${incremento.fuerza} fuerza.`,
  };
}

function numeroValido(valor, minimo, maximo, porDefecto) {
  const n = Number(valor);
  if (!Number.isFinite(n)) return porDefecto;
  return Math.min(maximo, Math.max(minimo, Math.round(n)));
}

export function habilitardragon(partida, dragon, estado = null) {
  const lista = leer();
  const reg = asegurar(lista, partida, dragon);

  reg.habilitado = true;

  // Si viene el estado del rival (al adoptarlo tras la pelea), se guarda al
  // dragon en su version actual: nivel, vida restante y stats escaladas.
  // Todo lo que llega del cliente se valida y se clampea antes de persistir.
  if (estado && typeof estado === "object") {
    reg.nivel = numeroValido(estado.nivel, 1, 100, reg.nivel);
    reg.fuerza = numeroValido(estado.fuerza, 1, 9999, reg.fuerza);
    reg.exp = numeroValido(estado.exp, 0, 999999, 0);

    const vidaMax = numeroValido(estado.vidaMax, 1, 99999, reg.vidaMax);
    reg.vidaMax = vidaMax;
    // la vida restante nunca puede superar la vida maxima ni ser negativa
    reg.vida = numeroValido(estado.vida, 0, vidaMax, vidaMax);

    if (typeof estado.tipo === "string" && estado.tipo.length <= 20) {
      reg.tipo = estado.tipo;
    }

    // recalculo los ataques desbloqueados segun el nivel con el que se adopta
    reg.desbloqueados = reg.ataques
      .filter((a) => a.nivel <= reg.nivel)
      .map((a) => a.nombre);
  }

  guardar(lista);
  return {
    exito: true,
    mensaje: "dragon adoptado!",
    progreso: reg,
  };
}

export function actualizarVida(idpartida, iddragon, vidaNueva) {
  const lista = leer();
  // Buscar si el dragón ya existe en el progreso de la partida
  let reg = buscar(lista, idpartida, iddragon);

  // Solo actualizar si el dragón ya existe en el progreso de la partida
  if (!reg) {
    return {
      exito: false,
      mensaje: "Este dragón no pertenece a la partida",
    };
  }

  reg.vida = vidaNueva;
  guardar(lista);
  return {
    exito: true,
    mensaje: "vida actualizada",
    progreso: reg,
  };
}

// PROVISORIO (revertir cuando este el curandero/medico posta): cura UN dragon
// puntual restaurando su vida al maximo. Lo usa el boton "Curar" del inventario
// como stopgap mientras no existe la curacion real en el curadero.
export function curarDragon(idpartida, iddragon) {
  const lista = leer();
  const reg = buscar(lista, idpartida, iddragon);

  if (!reg) {
    return { exito: false, mensaje: "Este dragón no pertenece a la partida" };
  }

  reg.vida = reg.vidaMax;
  guardar(lista);
  return { exito: true, mensaje: "Dragón curado", progreso: reg };
}

export function curarDragones(idpartida) {
  const lista = leer();

  const dragonesDeLaPartida = lista.filter(
    (p) => p.partida === idpartida && p.habilitado === true,
  );

  const rutaDragones = path.join(__dirname, "dragones.json");
  const dragonesBase = JSON.parse(
    fs.readFileSync(rutaDragones, "utf-8"),
  ).dragones;

  dragonesDeLaPartida.forEach((reg) => {
    const dragonBase = dragonesBase.find((d) => d.id === reg.dragon);
    console.log("DragonBase encontrado:", dragonBase);
    if (dragonBase) {
      reg.vida = dragonBase.vidaMax;
    }
  });

  guardar(lista);
  return { exito: true, mensaje: "Dragones curados" };
}

export function marcarTieneCodigoX(idpartida) {
  const lista = leer();
  let reg = lista.find((x) => x.partida === idpartida && x.dragon === 0);
  if (!reg) {
    reg = { partida: idpartida, dragon: 0, tieneCodigoX: true };
    lista.push(reg);
  } else {
    reg.tieneCodigoX = true;
  }
  guardar(lista);
  return { exito: true };
}
