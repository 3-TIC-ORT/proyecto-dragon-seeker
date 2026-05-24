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
  if (idx !== -1) {
    lista[idx] = { user: idusuario, ...estado };
  } else {
    lista.push({ user: idusuario, ...estado });
  }
  guardar(lista);
  return { exito: true };
}

export function obtenerEstadoUsuario(idusuario, mapa) {
  const lista = leer();
  return lista.find((e) => e.user === idusuario && e.mapa === mapa) ?? null;
}
