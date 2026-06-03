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

export function buscar(lista, user, dragon) {
  return lista.find((x) => x.user === user && x.dragon === dragon);
}

function asegurar(lista, user, dragon) {
  let reg = buscar(lista, user, dragon);

  if (!reg) {
    const base = leerCatalogo().find((d) => d.id === dragon);
    const ataquesBase = base?.ataques ?? [];
    reg = {
      user,
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

export function sumarexperiencia(iddragon, cantidad, idusuario) {
  const lista = leer();
  const reg = asegurar(lista, idusuario, iddragon);
  reg.exp += cantidad;
  let subidas = 0;
  while (reg.exp >= experiencianecesaria(reg.nivel)) {
    reg.exp -= experiencianecesaria(reg.nivel);
    reg.nivel++;
    subidas++;
    aumentarestadisticas(iddragon, { vida: 10, fuerza: 5 }, idusuario, lista);
    desbloquearataques(iddragon, reg.nivel, idusuario, lista);
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

export function verificarsubidanivel(iddragon, idusuario) {
  const lista = leer();
  const reg = asegurar(lista, idusuario, iddragon);
  const falta = experiencianecesaria(reg.nivel) - reg.exp;
  return {
    exito: true,
    nivel: reg.nivel,
    exp: reg.exp,
    falta: falta > 0 ? falta : 0,
  };
}

export function desbloquearataques(iddragon, nivel, idusuario, lista0 = null) {
  const lista = lista0 || leer();
  const reg = asegurar(lista, idusuario, iddragon);
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
  idusuario,
  lista0 = null,
) {
  const lista = lista0 || leer();
  const reg = asegurar(lista, idusuario, iddragon);
  reg.vida += incremento.vida || 0;
  reg.fuerza += incremento.fuerza || 0;

  if (!lista0) guardar(lista);
  return {
    exito: true,
    mensaje: `+${incremento.vida} vida, +${incremento.fuerza} fuerza.`,
  };
}

export function habilitardragon(user, dragon) {
  const lista = leer();
  const reg = asegurar(lista, user, dragon);

  reg.habilitado = true;

  guardar(lista);
  return {
    exito: true,
    mensaje: "dragon adoptado!",
    progreso: reg,
  };
}

export function actualizarVida(idusuario, iddragon, vidaNueva) {
  const lista = leer();
  // Buscar si el dragón ya existe en el progreso del usuario
  let reg = buscar(lista, idusuario, iddragon);

  // Solo actualizar si el dragón ya existe en progreso del usuario (es su dragón)
  if (!reg) {
    return {
      exito: false,
      mensaje: "Este dragón no pertenece al usuario",
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

export function curarDragones(idusuario) {
  const lista = leer();
  console.log("Lista completa:", lista);
  console.log("Buscando usuario:", idusuario, "tipo:", typeof idusuario);

  const dragonesDelUsuario = lista.filter(
    (p) => p.user === idusuario && p.habilitado === true,
  );
  console.log("Dragones encontrados:", dragonesDelUsuario);

  const rutaDragones = path.join(__dirname, "dragones.json");
  const dragonesBase = JSON.parse(
    fs.readFileSync(rutaDragones, "utf-8"),
  ).dragones;

  dragonesDelUsuario.forEach((reg) => {
    const dragonBase = dragonesBase.find((d) => d.id === reg.dragon);
    console.log("DragonBase encontrado:", dragonBase);
    if (dragonBase) {
      reg.vida = dragonBase.vidaMax;
    }
  });

  guardar(lista);
  return { exito: true, mensaje: "Dragones curados" };
}
