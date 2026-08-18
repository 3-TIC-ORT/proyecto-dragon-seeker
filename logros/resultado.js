// Pantalla de resultado reutilizable. Lee localStorage.resultado:
//   { tipo: "exito"|"fracaso", titulo, detalle, sprite?, destino? }
// Muestra el mensaje y, al CONTINUAR, va a `destino` (por defecto, el mapa).

let acertijoMostrado = false;

const URL_MAPA =
  "http://127.0.0.1:5501/FRONTEND-PEDRO/Phaser/RPG%20prueba/RPG%201/index.html";

const datos = JSON.parse(localStorage.getItem("resultado") || "null");
const destino = (datos && datos.destino) || URL_MAPA;

const pantalla = document.getElementById("pantalla");
pantalla.classList.add(datos && datos.tipo === "fracaso" ? "fracaso" : "exito");

// La subida de nivel tiene su propio tratamiento (banner + numero) para que se
// distinga claramente de una victoria con XP normal.
if (datos && datos.subioNivel) {
  pantalla.classList.add("nivelUp");
}

// Variante "ganaste el juego" (derrota del boss final): estilo celebratorio y
// boton con texto propio (lo define datos.textoBoton).
if (datos && datos.juegoGanado) {
  pantalla.classList.add("juegoGanado");
}

if (datos) {
  document.getElementById("titulo").textContent = datos.titulo || "";
  document.getElementById("detalle").textContent = datos.detalle || "";

  if (datos.textoBoton) {
    document.getElementById("btnContinuar").textContent = datos.textoBoton;
  }

  if (datos.subioNivel && datos.nivel != null) {
    const badge = document.getElementById("nivelBadge");
    document.getElementById("nivelNumero").textContent = datos.nivel;
    badge.hidden = false;
  }

  if (datos.sprite) {
    const img = document.getElementById("sprite");
    img.src = datos.sprite;
    img.hidden = false;
  }
}

document.getElementById("btnContinuar").addEventListener("click", () => {
  if (datos && datos.captura === true && !acertijoMostrado) {
    acertijoMostrado = true;

    document.getElementById("titulo").textContent = "Un mensaje misterioso...";
    document.getElementById("detalle").textContent =
      "Donde los árboles guardan silencio y el oro no es metal, allí duerme lo que buscás.";

    const img = document.getElementById("sprite");
    if (img) img.hidden = true;

    const badge = document.getElementById("nivelBadge");
    if (badge) badge.hidden = true;

    document.getElementById("btnContinuar").textContent = "Mapa";
    return;
  }

  localStorage.removeItem("resultado");
  window.location.href = destino;
});
