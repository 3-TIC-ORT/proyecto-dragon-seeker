import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { habilitardragon } from "./progresousuario.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ruta = path.join(__dirname, "partidas.json");

// Dragon con el que arranca toda partida nueva (Llamafuria, id 4).
const DRAGON_INICIAL = 4;

function leer() {
  try {
    return JSON.parse(fs.readFileSync(ruta, "utf-8") || "[]");
  } catch {
    fs.writeFileSync(ruta, "[]");
    return [];
  }
}

function guardar(datos) {
  fs.writeFileSync(ruta, JSON.stringify(datos, null, 2));
}

// Crea una partida nueva para el usuario (un perfil puede tener varias).
// No borra ni toca las anteriores. Le da el dragon inicial a la partida.
export function crearPartida(idusuario, nombre) {
  const usuario = Number(idusuario);
  if (!Number.isInteger(usuario) || usuario <= 0) {
    return { exito: false, mensaje: "Usuario invalido" };
  }

  let nombreLimpio =
    typeof nombre === "string" ? nombre.trim().slice(0, 30) : "";
  if (!nombreLimpio) nombreLimpio = "Partida";

  const lista = leer();
  const nuevoId = lista.reduce((max, p) => Math.max(max, p.id), 0) + 1;
  const ahora = Date.now();

  const partida = {
    id: nuevoId,
    usuario,
    nombre: nombreLimpio,
    creada: ahora,
    actualizada: ahora,
  };

  lista.push(partida);
  guardar(lista);

  // El progreso/estado se keyean por partida: el dragon inicial es de la partida.
  habilitardragon(nuevoId, DRAGON_INICIAL);

  return { exito: true, mensaje: "Partida creada", partida };
}

// Lista las partidas de un usuario (para la pantalla de elegir/crear partida).
export function listarPartidas(idusuario) {
  const usuario = Number(idusuario);
  if (!Number.isInteger(usuario) || usuario <= 0) {
    return { exito: false, mensaje: "Usuario invalido", partidas: [] };
  }
  const partidas = leer().filter((p) => p.usuario === usuario);
  return { exito: true, partidas };
}
