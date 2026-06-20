// Migracion de una sola vez: pasa progreso.json y estadoJuego.json del modelo
// viejo (keyeado por `user`) al nuevo (keyeado por `partida`).
// Crea una "Partida 1" por cada usuario que tenga datos y re-keya sus filas.
// Correr una vez desde BACKEND/:  node migrar-partidas.js
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rutaProgreso = path.join(__dirname, "progreso.json");
const rutaEstado = path.join(__dirname, "estadoJuego.json");
const rutaPartidas = path.join(__dirname, "partidas.json");

const leer = (r) => JSON.parse(fs.readFileSync(r, "utf-8") || "[]");
const guardar = (r, d) => fs.writeFileSync(r, JSON.stringify(d, null, 2));

const progreso = leer(rutaProgreso);
const estado = leer(rutaEstado);

// Usuarios que tienen datos en el modelo viejo (filas con `user`).
const usuariosConDatos = new Set();
for (const fila of progreso) if (fila.user !== undefined) usuariosConDatos.add(fila.user);
for (const fila of estado) if (fila.user !== undefined) usuariosConDatos.add(fila.user);

if (usuariosConDatos.size === 0) {
  console.log("Nada para migrar (no hay filas con `user`).");
  process.exit(0);
}

// Una partida por usuario. id incremental, nombre "Partida 1".
const partidas = [];
const partidaPorUsuario = new Map();
let nextId = 1;
const ahora = Date.now();
for (const usuario of usuariosConDatos) {
  const id = nextId++;
  partidaPorUsuario.set(usuario, id);
  partidas.push({ id, usuario, nombre: "Partida 1", creada: ahora, actualizada: ahora });
}

// Re-keyar: reemplazar `user` por `partida` en cada fila.
const reKeyar = (filas) =>
  filas.map((fila) => {
    if (fila.user === undefined) return fila; // ya migrada
    const { user, ...resto } = fila;
    return { partida: partidaPorUsuario.get(user), ...resto };
  });

guardar(rutaPartidas, partidas);
guardar(rutaProgreso, reKeyar(progreso));
guardar(rutaEstado, reKeyar(estado));

console.log(`Migracion OK. Partidas creadas: ${partidas.length}.`);
console.log(partidas.map((p) => `  usuario ${p.usuario} -> partida ${p.id}`).join("\n"));
