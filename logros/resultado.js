// Pantalla de resultado reutilizable. Lee localStorage.resultado:
//   { tipo: "exito"|"fracaso", titulo, detalle, sprite?, destino? }
// Muestra el mensaje y, al CONTINUAR, va a `destino` (por defecto, el mapa).
const URL_MAPA =
  "http://127.0.0.1:5501/FRONTEND-PEDRO/Phaser/RPG%20prueba/RPG%201/index.html";

const datos = JSON.parse(localStorage.getItem("resultado") || "null");
const destino = (datos && datos.destino) || URL_MAPA;

const pantalla = document.getElementById("pantalla");
pantalla.classList.add(datos && datos.tipo === "fracaso" ? "fracaso" : "exito");

if (datos) {
  document.getElementById("titulo").textContent = datos.titulo || "";
  document.getElementById("detalle").textContent = datos.detalle || "";
  if (datos.sprite) {
    const img = document.getElementById("sprite");
    img.src = datos.sprite;
    img.hidden = false;
  }
}

document.getElementById("btnContinuar").addEventListener("click", () => {
  localStorage.removeItem("resultado");
  window.location.href = destino;
});
