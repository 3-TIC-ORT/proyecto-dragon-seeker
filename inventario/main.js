connect2Server();

localStorage.removeItem("dragonardo");

let dragones = [];
let usuario = JSON.parse(localStorage.getItem("usuario"));
if (!usuario) {
  alert("No hay usuario registrado, logueate");
  window.location.href = "/inicioSesion/inicioSesion.html";
}

const containerDragon = document.getElementById("dragonContainer");
const botonElegir = document.getElementById("botonElegir");
let tarjetaSeleccionada = null;

const idpartida = Number(localStorage.getItem("partida"));
postEvent("obtenerdragonesUsuario", { idpartida }, (data) => {
  dragones = data.dragones;
  mostrarDragones();
});

function mostrarDragones() {
  containerDragon.innerHTML = "";

  for (let i = 0; i < dragones.length; i++) {
    let dragon = dragones[i];
    let habilitado = dragon.habilitado === true;

    let tarjeta = document.createElement("div");
    tarjeta.classList.add("tarjeta");
    tarjeta.dataset.index = i;

    if (dragon.especial === true) {
      tarjeta.classList.add("dragonEspecial");
    } else {
      tarjeta.classList.add("dragonNormal");
    }

    if (!habilitado) {
      tarjeta.classList.add("dragonBloqueado");
    }

    // Stats y progreso de XP (solo para dragones adoptados).
    // experiencianecesaria(nivel) = 100 * nivel (igual que el backend).
    let statsHTML = "";
    if (habilitado) {
      const necesaria = 100 * dragon.nivel;
      const exp = dragon.exp ?? 0;
      const pct = Math.min(100, Math.round((exp / necesaria) * 100));
      statsHTML = `
        <div class="stats">
          <span class="stat">VIDA ${dragon.vida}</span>
          <span class="stat">FUERZA ${dragon.fuerza}</span>
        </div>
        <div class="xpBarra">
          <div class="xpRelleno" style="width:${pct}%"></div>
          <span class="xpTexto">XP ${exp}/${necesaria}</span>
        </div>
      `;
    }

    tarjeta.innerHTML = `
      <div class="retrato">
        <img src="../BACKEND/${dragon.imagen}" alt="${dragon.nombre}" class="imgDragon">
      </div>
      <div class="info">
        <h4 class="nombre">${dragon.nombre}</h4>
        <p class="nivel">Lv ${dragon.nivel}</p>
        <p class="tipo">${habilitado ? dragon.tipo : "No adoptado"}</p>
        ${statsHTML}
      </div>
    `;

    containerDragon.appendChild(tarjeta);
  }
}

// Seleccionar una tarjeta (no navega todavia; el boton "Elegir dragon" confirma)
function seleccionarDragon(e) {
  let tarjeta = e.target.closest(".tarjeta");
  if (!tarjeta || tarjeta.classList.contains("dragonBloqueado")) {
    return;
  }
  if (tarjetaSeleccionada) {
    tarjetaSeleccionada.classList.remove("seleccionada");
  }
  tarjeta.classList.add("seleccionada");
  tarjetaSeleccionada = tarjeta;
  botonElegir.classList.add("visible");
}

// Confirmar la eleccion: guarda el dragon activo y vuelve al origen.
// Desde el mapa -> vuelve al mapa. Desde una pelea -> vuelve a la pelea.
function elegirDragon() {
  if (!tarjetaSeleccionada) {
    return;
  }
  let indice = tarjetaSeleccionada.dataset.index;
  let dragon = dragones[indice];
  localStorage.setItem("dragonardo", JSON.stringify(dragon));

  const origen = localStorage.getItem("origenInventario");
  localStorage.removeItem("origenInventario");
  if (origen === "pelea") {
    window.location.href = "../pelea/peleadesplegada.html";
  } else {
    window.location.href =
      "http://127.0.0.1:5501/FRONTEND-PEDRO/Phaser/RPG%20prueba/RPG%201/index.html";
  }
}

containerDragon.addEventListener("click", seleccionarDragon);
botonElegir.addEventListener("click", elegirDragon);
