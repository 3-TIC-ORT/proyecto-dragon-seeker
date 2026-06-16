let secuencia = []; // Secuencia generada por el juego
let secuenciaUsuario = []; // Secuencia ingresada por el usuario
let intento = 1; // Tiene 2 intentos
let aceptandoInput = false; // Solo se puede replicar una vez que termino de mostrarse

const botones = document.querySelectorAll(".btn");
const menuBotones = document.getElementById("menudeataques");
const usuario = JSON.parse(localStorage.getItem("usuario"));
const dragonEnemigo = JSON.parse(localStorage.getItem("dragon_enemigo"));

// Centraliza el estado de input: ademas del flag, marca/desmarca visualmente
// los botones para que se note cuando NO se puede clickear (durante la secuencia).
function setAceptandoInput(valor) {
  aceptandoInput = valor;
  if (menuBotones) menuBotones.classList.toggle("bloqueado", !valor);
}

if (!usuario) {
  alert("Debes iniciar sesión antes de adoptar.");
  window.location.href = "/inicioSesion/inicioSesion.html";
}

if (!dragonEnemigo) {
  alert("No se encontró el dragón enemigo para adoptar.");
  window.location.href = "../FRONTEND-PEDRO/Phaser/RPG prueba/RPG 1/index.html";
}

function obtenerLongitudPorVida() {
  let vida = Number(localStorage.getItem("vidaFinalRival"));

  if (vida <= 5) return 3;
  if (vida <= 10) return 4;
  if (vida <= 15) return 5;
  if (vida <= 20) return 6;
  if (vida <= 25) return 7;
  if (vida <= 30) return 8;
}

function generarSecuencia() {
  let longitud = obtenerLongitudPorVida();
  secuencia = [];
  for (let i = 0; i < longitud; i++) {
    const num = Math.floor(Math.random() * 8) + 1; // 1 a 8
    secuencia.push(num);
  }
}

// Muestra la secuencia iluminando los botones
function mostrarSecuencia() {
  let delay = 0;

  // Mientras se muestra la secuencia el jugador no puede tocar nada
  setAceptandoInput(false);

  secuencia.forEach((num, i) => {
    const btn = botones[num - 1];

    setTimeout(() => {
      btn.classList.add("iluminar");
      setTimeout(() => btn.classList.remove("iluminar"), 500);
    }, delay);

    delay += 800;
  });

  // Recien cuando termino de mostrarse toda la secuencia se habilita el input
  setTimeout(() => {
    setAceptandoInput(true);
  }, delay);
}

// Empieza el juego
function iniciarJuego() {
  generarSecuencia(); // 4 elementos random
  secuenciaUsuario = [];
  intento = 1;

  setAceptandoInput(false); // arranca bloqueado hasta que se muestre la secuencia
  setTimeout(mostrarSecuencia, 500);
}

function adoptarDragon() {
  // Vida con la que quedo el rival al terminar la pelea (vida restante real).
  // Si por algun motivo no esta seteada, se usa la vida actual del enemigo.
  const vidaRestante = localStorage.getItem("vidaFinalRival");
  const estado = {
    nivel: dragonEnemigo.nivel,
    vida: vidaRestante !== null ? Number(vidaRestante) : dragonEnemigo.vida,
    vidaMax: dragonEnemigo.vidaMax ?? dragonEnemigo.vidaInicial,
    fuerza: dragonEnemigo.fuerza,
    tipo: dragonEnemigo.tipo,
    exp: dragonEnemigo.exp ?? 0,
  };

  postEvent(
    "adoptarDragon",
    { user: usuario.id, dragon: dragonEnemigo.id, estado },
    (respuesta) => {
      if (!respuesta || respuesta.exito === false) {
        alert(respuesta?.mensaje || "No se pudo adoptar el dragón.");
        return;
      }

      alert("¡Adoptaste al dragón correctamente!");
      localStorage.setItem("dragonardo", JSON.stringify(dragonEnemigo));
      window.location.href =
        "../FRONTEND-PEDRO/Phaser/RPG prueba/RPG 1/index.html";
    },
  );
}

// Compara lo que puso el usuario
function verificar() {
  if (secuenciaUsuario.length !== secuencia.length) return;

  const correcta = secuencia.every((n, i) => n === secuenciaUsuario[i]);

  if (correcta) {
    console.log("¡Secuencia correcta! Pasás.");
    adoptarDragon();
    return;
  }

  // Si falló
  if (intento === 1) {
    intento++;
    secuenciaUsuario = [];
    alert("Fallaste, te queda un intento.");
    setTimeout(mostrarSecuencia, 500);
  } else {
    alert("Fallaste otra vez. Volvés al mapa.");
    window.location.href = "mapa.html"; // CAMBIÁ ESTO
  }
}

// Click del jugador
botones.forEach((btn) => {
  btn.addEventListener("click", () => {
    // Se ignora cualquier click mientras la secuencia se esta mostrando
    if (!aceptandoInput) return;

    const valor = Number(btn.textContent);
    secuenciaUsuario.push(valor);

    if (secuenciaUsuario.length === secuencia.length) {
      setAceptandoInput(false); // evita clicks de mas mientras se verifica
      verificar();
    }
  });
});

// Arranca automáticamente
iniciarJuego();
