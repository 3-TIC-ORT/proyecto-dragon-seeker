connect2Server();

localStorage.removeItem("dragonardo");

let dragones = [];
let usuario = JSON.parse(localStorage.getItem("usuario"));
if (!usuario) {
  alert("No hay usuario registrado, logueate");
  window.location.href = "/inicioSesion/inicioSesion.html";
}

// Si entraste al inventario desde una pelea, no podes volver al mapa desde aca:
// la pelea sigue en curso y solo se sale de ella huyendo o ganando/perdiendo.
const botonMapa = document.querySelector(".botonMapa");
if (botonMapa && localStorage.getItem("origenInventario") === "pelea") {
  botonMapa.remove();
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

    // Dragon adoptado pero sin vida: no puede pelear ni ser el dragon activo.
    let sinVida = habilitado && (dragon.vida ?? 0) <= 0;
    if (sinVida) {
      tarjeta.classList.add("dragonSinVida");
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
        ${sinVida ? '<p class="avisoSinVida">Sin vida - no puede pelear</p>' : ""}
        ${statsHTML}
      </div>
      ${
        habilitado
          ? `<button type="button" class="botonCurar" data-iddragon="${dragon.id}">Curar</button>`
          : ""
      }
    `;

    containerDragon.appendChild(tarjeta);
  }
}

// Seleccionar una tarjeta (no navega todavia; el boton "Elegir dragon" confirma)
function seleccionarDragon(e) {
  let tarjeta = e.target.closest(".tarjeta");
  if (
    !tarjeta ||
    tarjeta.classList.contains("dragonBloqueado") ||
    tarjeta.classList.contains("dragonSinVida")
  ) {
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

  const origen = localStorage.getItem("origenInventario");
  localStorage.removeItem("origenInventario");

  if (origen === "pelea") {
    // Cambio de dragon en medio de una pelea: el nuevo dragon entra con el
    // mismo % de vida que le quedaba al que estaba peleando antes de cambiarlo.
    const porcentajeVida = Number(localStorage.getItem("porcentajeVidaCambio"));
    localStorage.removeItem("porcentajeVidaCambio");

    if (Number.isFinite(porcentajeVida)) {
      const vidaMax = dragon.vidaMax || dragon.vida;
      const vidaAjustada = Math.max(
        0,
        Math.min(vidaMax, Math.round(vidaMax * porcentajeVida)),
      );
      dragon = { ...dragon, vida: vidaAjustada, vidaInicial: vidaMax };

      postEvent(
        "actualizarVida",
        { idpartida, iddragon: dragon.id, vida: vidaAjustada },
        () => {
          localStorage.setItem("dragonardo", JSON.stringify(dragon));
          window.location.href = "../pelea/peleadesplegada.html";
        },
      );
      return;
    }

    localStorage.setItem("dragonardo", JSON.stringify(dragon));
    window.location.href = "../pelea/peleadesplegada.html";
    return;
  }

  localStorage.setItem("dragonardo", JSON.stringify(dragon));
  if (origen === "encuentro") {
    // Elegiste dragon recien al chocar un rival: pasa por el head-to-head.
    window.location.href = "../enfrentamiento/enfrentamiento.html";
  } else {
    window.location.href =
      "http://127.0.0.1:5501/FRONTEND-PEDRO/Phaser/RPG%20prueba/RPG%201/index.html";
  }
}

// Click en el contenedor: si tocaste el boton "Curar" cura ese dragon; si no,
// selecciona la tarjeta.
function onClickTarjeta(e) {
  const botonCurar = e.target.closest(".botonCurar");
  if (botonCurar) {
    curarDragon(Number(botonCurar.dataset.iddragon));
    return;
  }
  seleccionarDragon(e);
}

// PROVISORIO (revertir cuando este el curandero/medico posta): cura un dragon
// restaurando su vida al maximo en el backend y refresca la lista.
function curarDragon(iddragon) {
  postEvent("curarDragon", { idpartida, iddragon }, (res) => {
    if (res && res.exito) {
      const d = dragones.find((x) => x.id === iddragon);
      if (d) d.vida = res.progreso.vida;
      tarjetaSeleccionada = null;
      botonElegir.classList.remove("visible");
      mostrarDragones();
    } else {
      alert(res?.mensaje || "No se pudo curar el dragón.");
    }
  });
}

containerDragon.addEventListener("click", onClickTarjeta);
botonElegir.addEventListener("click", elegirDragon);
