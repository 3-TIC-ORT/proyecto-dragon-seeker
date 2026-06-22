// Pantalla previa a la pelea (head-to-head): muestra tu dragon vs el rival y al
// confirmar arranca la batalla. Solo lee localStorage, no usa backend.
//   dragonardo     = tu dragon equipado (lo setea el inventario)
//   dragon_enemigo = el rival con el que chocaste en el mapa (lo setea Game.js)

const dragonardo = JSON.parse(localStorage.getItem("dragonardo"));
const rival = JSON.parse(localStorage.getItem("dragon_enemigo"));

const URL_PELEA = "../pelea/peleadesplegada.html";

// Rellena un lado del enfrentamiento con los datos de un dragon.
function pintarLado(dragon, idSprite, idNombre, idDatos) {
  const sprite = document.getElementById(idSprite);
  const nombre = document.getElementById(idNombre);
  const datos = document.getElementById(idDatos);
  if (!dragon) return;

  // Solo seteo el sprite si hay imagen, para no pedir BACKEND/undefined (404).
  if (dragon.imagen) {
    sprite.src = `../BACKEND/${dragon.imagen}`;
  }
  sprite.alt = dragon.nombre ?? "";
  nombre.textContent = dragon.nombre ?? ""; // textContent: no se interpreta como HTML
  const tipo = dragon.tipo ? ` · ${dragon.tipo}` : "";
  datos.textContent = `Lv ${dragon.nivel ?? "?"}${tipo}`;
}

pintarLado(dragonardo, "spriteUsuario", "nombreUsuario", "datosUsuario");
pintarLado(rival, "spriteRival", "nombreRival", "datosRival");

document.getElementById("botonPelear").addEventListener("click", () => {
  window.location.href = URL_PELEA;
});
