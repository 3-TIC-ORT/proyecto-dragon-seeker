connect2Server();

// URL absoluta del mapa (mismo destino que usa inicioSesion/login.js).
const URL_MAPA =
  "http://127.0.0.1:5501/FRONTEND-PEDRO/Phaser/RPG%20prueba/RPG%201/index.html";

const usuario = JSON.parse(localStorage.getItem("usuario"));
if (!usuario) {
  // Sin sesion no se puede elegir partida: volver al login.
  window.location.href = "../inicioSesion/inicioSesion.html";
}

const btnCargar = document.getElementById("btnCargar");
const listaPartidas = document.getElementById("listaPartidas");
const btnNueva = document.getElementById("btnNueva");
const formNueva = document.getElementById("formNueva");
const inputNombre = document.getElementById("nombrePartida");
const btnCrear = document.getElementById("btnCrear");

let partidasCargadas = [];

// Entra a una partida: la guarda como activa y va al mapa.
// A partir de aca todo el juego lee localStorage.partida.
function entrarAPartida(idpartida) {
  localStorage.setItem("partida", idpartida);
  window.location.href = URL_MAPA;
}

// Pinta la lista desplegable con una fila por partida guardada.
function mostrarPartidas() {
  listaPartidas.innerHTML = "";

  if (partidasCargadas.length === 0) {
    const vacio = document.createElement("p");
    vacio.className = "item-partida vacio";
    vacio.textContent = "No tenés partidas guardadas";
    listaPartidas.appendChild(vacio);
    return;
  }

  for (const p of partidasCargadas) {
    const item = document.createElement("button");
    item.type = "button";
    item.className = "item-partida";
    item.textContent = p.nombre; // textContent: el nombre no se interpreta como HTML
    item.addEventListener("click", () => entrarAPartida(p.id));
    listaPartidas.appendChild(item);
  }
}

function cargarPartidas() {
  postEvent("listarPartidas", { idusuario: usuario.id }, (res) => {
    if (res && res.exito) {
      partidasCargadas = res.partidas;
      mostrarPartidas();
    }
  });
}

// CARGAR PARTIDA: despliega/oculta la lista de partidas (cierra el form de nueva).
btnCargar.addEventListener("click", () => {
  formNueva.hidden = true;
  listaPartidas.hidden = !listaPartidas.hidden;
});

// NUEVA PARTIDA: despliega/oculta el form de nombre (cierra la lista).
btnNueva.addEventListener("click", () => {
  listaPartidas.hidden = true;
  formNueva.hidden = !formNueva.hidden;
  if (!formNueva.hidden) inputNombre.focus();
});

// CREAR: valida el nombre, crea la partida y entra a ella.
btnCrear.addEventListener("click", () => {
  const nombre = inputNombre.value.trim();
  if (!nombre) {
    inputNombre.focus();
    return;
  }
  postEvent("crearPartida", { idusuario: usuario.id, nombre }, (res) => {
    if (res && res.exito) {
      entrarAPartida(res.partida.id);
    } else {
      alert(res?.mensaje || "No se pudo crear la partida.");
    }
  });
});

// Icono "salir": vuelve a la pantalla de Jugar.
document.getElementById("iconoSalir").addEventListener("click", () => {
  window.location.href = "jugar.html";
});

cargarPartidas();
