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

// Seguridad: a los jefes (boss de zona) no se los puede adoptar. El boton de la
// pelea ya no se habilita para ellos, pero por las dudas se corta aca tambien.
if (dragonEnemigo && dragonEnemigo.esBoss === true) {
  window.location.href =
    "http://127.0.0.1:5501/FRONTEND-PEDRO/Phaser/RPG%20prueba/RPG%201/index.html";
}

// Mostrar el dragon que se esta por adoptar (nombre + sprite real)
const nombreDragonEl = document.getElementById("nombreDragon");
const spriteEl = document.querySelector(".dragon .sprite");
if (dragonEnemigo && nombreDragonEl) nombreDragonEl.innerText = dragonEnemigo.nombre;
if (dragonEnemigo && spriteEl) spriteEl.src = `../BACKEND/${dragonEnemigo.imagen}`;

function obtenerLongitudPorVida() {
  const vida = Number(localStorage.getItem("vidaFinalRival"));

  // El umbral adoptable es 30% de la vida maxima del rival (mismo criterio que
  // habilita el boton en la pelea). El largo de la secuencia escala con cuanta
  // vida le quedaba DENTRO de ese rango: cuanto mas vida tenia, mas larga
  // (mas dificil). Se usa porcentaje para que sea justo entre rivales con
  // distinta vidaMax.
  const FRACCION_ADOPTABLE = 0.3;
  const vidaMax =
    dragonEnemigo?.vidaMax ??
    dragonEnemigo?.vidaInicial ??
    dragonEnemigo?.vida ??
    0;
  const umbral = vidaMax * FRACCION_ADOPTABLE;
  // 0 = casi muerto (secuencia corta), 1 = justo en el umbral (secuencia larga)
  const frac = umbral > 0 ? Math.max(0, Math.min(1, vida / umbral)) : 0;

  if (frac <= 1 / 6) return 3;
  if (frac <= 2 / 6) return 4;
  if (frac <= 3 / 6) return 5;
  if (frac <= 4 / 6) return 6;
  if (frac <= 5 / 6) return 7;
  return 8;
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

  const idpartida = Number(localStorage.getItem("partida"));
  postEvent(
    "adoptarDragon",
    { partida: idpartida, dragon: dragonEnemigo.id, estado },
    (respuesta) => {
      if (!respuesta || respuesta.exito === false) {
        alert(respuesta?.mensaje || "No se pudo adoptar el dragón.");
        return;
      }

      localStorage.setItem("dragonardo", JSON.stringify(dragonEnemigo));
      localStorage.setItem(
        "resultado",
        JSON.stringify({
          tipo: "exito",
          titulo: `¡Adoptaste a ${dragonEnemigo.nombre}!`,
          detalle: "Ahora forma parte de tu equipo.",
          sprite: `../BACKEND/${dragonEnemigo.imagen}`,
        }),
      );
      window.location.href = "../logros/resultado.html";
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
    // Aviso diseñado (overlay) en vez del alert pelado: al cerrar vuelve a
    // mostrarse la secuencia para el segundo (y ultimo) intento.
    window.mostrarOverlayFracaso({
      titulo: "¡Casi!",
      detalle: "Fallaste la secuencia.\nTe queda un último intento.",
      textoBoton: "REINTENTAR",
      onCerrar: () => setTimeout(mostrarSecuencia, 400),
    });
  } else {
    // Fracaso -> overlay in-place (no pantalla aparte).
    window.mostrarOverlayFracaso({
      titulo: "No lo lograste",
      detalle: `${dragonEnemigo.nombre} se escapó. ¡La próxima será!`,
      destino:
        "http://127.0.0.1:5501/FRONTEND-PEDRO/Phaser/RPG%20prueba/RPG%201/index.html",
    });
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
