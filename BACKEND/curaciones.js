import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ruta = path.join(__dirname, "curaciones.json");

// Curaciones rapidas: las del boton "Curar" del inventario (cura un dragon a vida
// llena al instante). Son comodas pero LIMITADAS: tenes un cupo por partida que
// se gasta de a una. Para renovarlas hay que ir a curar a la casita (curadero),
// que ademas cura a todos los dragones. curaciones.json = { "<idpartida>": restantes }.
export const MAX_CURACIONES_RAPIDAS = 5;

function leer() {
  try {
    return JSON.parse(fs.readFileSync(ruta, "utf-8") || "{}");
  } catch {
    fs.writeFileSync(ruta, "{}");
    return {};
  }
}

function guardar(datos) {
  fs.writeFileSync(ruta, JSON.stringify(datos, null, 2));
}

// Las curaciones rapidas que le quedan a una partida. Si nunca uso ninguna (no
// hay fila), arranca con el cupo completo.
export function obtenerCuraciones(idpartida) {
  const datos = leer();
  const guardado = datos[String(idpartida)];
  const restantes = Number.isInteger(guardado)
    ? guardado
    : MAX_CURACIONES_RAPIDAS;
  return { restantes, max: MAX_CURACIONES_RAPIDAS };
}

// Gasta una curacion rapida si quedan. Devuelve si pudo + las restantes.
export function consumirCuracion(idpartida) {
  const { restantes, max } = obtenerCuraciones(idpartida);
  if (restantes <= 0) {
    return { exito: false, restantes: 0, max };
  }
  const datos = leer();
  datos[String(idpartida)] = restantes - 1;
  guardar(datos);
  return { exito: true, restantes: datos[String(idpartida)], max };
}

// Renueva el cupo de curaciones rapidas al maximo. Se llama al curar en la casita.
export function renovarCuraciones(idpartida) {
  const datos = leer();
  datos[String(idpartida)] = MAX_CURACIONES_RAPIDAS;
  guardar(datos);
  return { restantes: MAX_CURACIONES_RAPIDAS, max: MAX_CURACIONES_RAPIDAS };
}
