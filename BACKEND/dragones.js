import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ruta = path.join(__dirname, "dragones.json");
const rutaprogreso = path.join(__dirname, "progreso.json");

function leerdragones() {
  const texto = fs.readFileSync(ruta, "utf-8");
  return JSON.parse(texto);
}

function leerprogreso() {
  const texto = fs.readFileSync(rutaprogreso, "utf-8");
  return JSON.parse(texto);
}

export function determinartipodragon(idzona, dificultad) {
  const data = leerdragones();
  const dragon = data.dragones.find((d) => d.mapa === idzona);
  if (!dragon) {
    return {
      exito: false,
      mensaje: "No se encontro ningun dragon en esta zona.",
    };
  }
  return { exito: true, tipo: dragon.tipo, nombre: dragon.nombre };
}

export function enviardatosdragon(iddragon, idusuario) {
  const data = leerdragones();
  const dragon = data.dragones.find((d) => d.id === iddragon);
  if (!dragon) {
    return { exito: false, mensaje: "No se encontro el dragon pedido." };
  }
  return { exito: true, dragon };
}

export function iniciarbatalledragon(idusuario, iddragon, ubicacion) {
  const data = leerdragones();
  const dragon = data.dragones.find((d) => d.id === iddragon);
  if (!dragon) {
    return {
      exito: false,
      mensaje: "No se encontro el dragon para la batalla.",
    };
  }
  const batalla = {
    idusuario,
    ubicacion,
    dragon: {
      nombre: dragon.nombre,
      tipo: dragon.tipo,
      vida: dragon.vida,
      vidaMaxima: dragon.vida,
      fuerza: dragon.fuerza,
      ataques: dragon.ataques,
    },
  };
  return { exito: true, mensaje: "Batalla bien iniciada", batalla };
}

function nivelMaxJugador(progreso, idpartida) {
  if (idpartida === null || idpartida === undefined) return 1;
  const propios = progreso.filter((p) => p.partida === idpartida);
  if (propios.length === 0) return 1;
  return propios.reduce((max, p) => Math.max(max, p.nivel ?? 1), 1);
}

function escalarRival(d, nivelJugador) {
  const offset = Math.floor(Math.random() * 5) - 2; // -2..+2
  const nivel = Math.max(1, nivelJugador + offset);
  const factorVida = 1 + 0.15 * (nivel - 1);
  const factorFuerza = 1 + 0.1 * (nivel - 1);
  const vidaEscalada = Math.round((d.vida ?? 50) * factorVida);
  const fuerzaEscalada = Math.round((d.fuerza ?? 10) * factorFuerza);

  const ataquesDisponibles = (d.ataques || []).filter((a) => a.nivel <= nivel);
  return {
    ...d,
    habilitado: false,
    nivel,
    vida: vidaEscalada,
    vidaMax: vidaEscalada,
    vidaInicial: vidaEscalada,
    fuerza: fuerzaEscalada,
    ataques: ataquesDisponibles.map((a) => ({
      nombre: a.nombre,
      nivel: a.nivel,
      dano: a.dano,
      desbloqueado: true,
    })),
  };
}

export function obtenerlistadragones(idpartida = null, escalarRivales = false) {
  const base = leerdragones();
  const progreso = leerprogreso();

  if (!base || !base.dragones) {
    return { exito: false, mensaje: "No se pudo leer la base de dragones" };
  }

  const nivelJugador = nivelMaxJugador(progreso, idpartida);

  const dragoensactualizados = base.dragones.map((d) => {
    const prog =
      idpartida !== null && idpartida !== undefined
        ? progreso.find((p) => p.dragon === d.id && p.partida === idpartida)
        : progreso.find((p) => p.dragon === d.id);

    if (!prog) {
      return escalarRivales
        ? escalarRival(d, nivelJugador)
        : { ...d, habilitado: false };
    }

    return {
      ...d,
      habilitado: prog.habilitado ?? false,
      nivel: prog.nivel ?? d.nivel,
      exp: prog.exp ?? 0,
      vida: prog.vida ?? d.vida,
      fuerza: prog.fuerza ?? d.fuerza,
      desbloqueados: prog.desbloqueados ?? [],
      ataques: (d.ataques || []).map((atBase) => {
        return {
          nombre: atBase.nombre,
          nivel: atBase.nivel,
          dano: atBase.dano,
          desbloqueado:
            atBase.nivel <= 1 ||
            (prog.desbloqueados?.includes(atBase.nombre) ?? false),
        };
      }),
    };
  });
  return { exito: true, dragones: dragoensactualizados };
}

export function obtenerBossMapa(idzona) {
  const data = leerdragones();

  if (!data || !data.bosses) {
    return { exito: false, mensaje: "No se pudo leer la base de bosses" };
  }

  const boss = data.bosses.find((b) => b.mapa === idzona);

  if (!boss) {
    return { exito: false, mensaje: "No se encontro boss para esta zona" };
  }

  return { exito: true, boss };
}

export function verificarAccesoZonaBoss(idpartida, nivelMinimoPromedio = 6) {
  const data = leerdragones();
  const progreso = leerprogreso();

  const dragonesPropios = progreso
    .filter((p) => p.partida === idpartida && p.habilitado === true)
    .sort((a, b) => b.nivel - a.nivel)
    .slice(0, 5);

  if (dragonesPropios.length === 0) {
    return {
      exito: true,
      puedePasar: false,
      promedio: 0,
      nivelMinimo: nivelMinimoPromedio,
      mensaje: "No tenés dragones habilitados todavía.",
    };
  }

  const sumaNiveles = dragonesPropios.reduce((acc, d) => acc + d.nivel, 0);
  const promedio = sumaNiveles / dragonesPropios.length;

  const puedePasar = promedio >= nivelMinimoPromedio;

  return {
    exito: true,
    puedePasar,
    promedio: Math.round(promedio * 10) / 10,
    nivelMinimo: nivelMinimoPromedio,
    cantidadDragones: dragonesPropios.length,
  };
}
