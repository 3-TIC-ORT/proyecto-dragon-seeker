import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ruta = path.join(__dirname, "estadoJuego.json");

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

export function guardarEstadoUsuario(idusuario, estado) {
  const lista = leer();
  const idx = lista.findIndex(
    (e) => e.user === idusuario && e.mapa === estado.mapa,
  );

  const registro = {
    user: idusuario,
    ...estado,
    actualizado: Date.now(), // ✅ timestamp para saber cuál es el último
  };

  if (idx !== -1) {
    lista[idx] = registro;
  } else {
    lista.push(registro);
  }
  guardar(lista);
  return { exito: true };
}

export function obtenerEstadoUsuario(idusuario, mapa) {
  const lista = leer();
  return lista.find((e) => e.user === idusuario && e.mapa === mapa) ?? null;
}

// ✅ NUEVO: devuelve el estado más reciente del usuario, sin filtrar por mapa
export function obtenerUltimoEstadoUsuario(idusuario) {
  const lista = leer();
  const registros = lista.filter((e) => e.user === idusuario);

  if (registros.length === 0) return null;

  return registros.reduce((ultimo, actual) =>
    (actual.actualizado ?? 0) > (ultimo.actualizado ?? 0) ? actual : ultimo,
  );
}
