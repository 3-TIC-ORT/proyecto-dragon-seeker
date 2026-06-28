connect2Server();

localStorage.removeItem("dragonardo");

let dragones = [];
let usuario = JSON.parse(localStorage.getItem("usuario"));
if (!usuario) {
  alert("No hay usuario registrado, logueate");
  window.location.href = "/inicioSesion/inicioSesion.html";
}

// Si entraste al inventario desde una pelea (boton DRAGON, para cambiar de
// dragon en medio del combate), no podes ni volver al mapa ni CURAR: la pelea
// sigue en curso y curar ahi seria hacer trampa.
const enPelea = localStorage.getItem("origenInventario") === "pelea";

const botonMapa = document.querySelector(".botonMapa");
if (botonMapa && enPelea) {
  botonMapa.remove();
}

const containerDragon = document.getElementById("dragonContainer");
const botonElegir = document.getElementById("botonElegir");
const contadorCuraciones = document.getElementById("contadorCuraciones");
let tarjetaSeleccionada = null;

// Cupo de curaciones rapidas (boton Curar). El backend manda cuantas quedan; al
// llegar a 0 no se puede curar desde el inventario hasta renovar en la casita.
let curacionesRestantes = null;
let curacionesMax = null;

const idpartida = Number(localStorage.getItem("partida"));
postEvent("obtenerdragonesUsuario", { idpartida }, (data) => {
  // Ocultamos del inventario los dragones sin arte propio: los placeholders
  // genericos (img/N.png) de mapas 2/3 que todavia no estan en juego. Solo se
  // muestran los que tienen su SVG. Cuando alguno reciba su imagen real (.svg),
  // reaparece solo sin tocar nada mas.
  dragones = (data.dragones || []).filter(
    (d) => typeof d.imagen === "string" && d.imagen.toLowerCase().endsWith(".svg"),
  );
  curacionesRestantes = data.curacionesRestantes;
  curacionesMax = data.curacionesMax;
  actualizarContadorCuraciones();
  mostrarDragones();
});

// Muestra el cupo de curaciones rapidas en el header (oculto durante la pelea,
// donde no se puede curar). Al llegar a 0 avisa que hay que ir a la casita.
function actualizarContadorCuraciones() {
  if (!contadorCuraciones) return;
  if (enPelea || curacionesRestantes == null) {
    contadorCuraciones.hidden = true;
    return;
  }
  contadorCuraciones.hidden = false;
  const sinCupo = curacionesRestantes <= 0;
  contadorCuraciones.classList.toggle("sinCuraciones", sinCupo);
  contadorCuraciones.textContent = sinCupo
    ? `Curaciones rápidas 0/${curacionesMax} · curá en la casita para renovar`
    : `Curaciones rápidas ${curacionesRestantes}/${curacionesMax}`;
}

// Relaciones de tipo (mismas que en la pelea) para recomendar el dragon que mas
// conviene contra el rival actual.
const TIPO_RELACIONES = {
  tierra: { efectivo: "electrico", debil: ["agua", "hielo"] },
  fuego: { efectivo: "hielo", debil: ["agua"] },
  hielo: { efectivo: "tierra", debil: ["fuego"] },
  electrico: { efectivo: "agua", debil: ["tierra"] },
  agua: { efectivo: "fuego", debil: ["electrico"] },
};
function multiplicadorTipo(tipoAtaque, tipoDefensor) {
  const rel = TIPO_RELACIONES[tipoAtaque];
  if (!rel) return 1;
  if (rel.efectivo === tipoDefensor) return 2;
  if (rel.debil.includes(tipoDefensor)) return 0.5;
  return 1;
}

// La recomendacion solo aplica cuando estas eligiendo con quien pelear (hay un
// rival cargado y venis de una pelea/encuentro). Desde el mapa no hay "caso".
const rival = JSON.parse(localStorage.getItem("dragon_enemigo") || "null");
const eligiendoParaPelea =
  !!rival &&
  ["pelea", "encuentro"].includes(localStorage.getItem("origenInventario"));

// "En combate" = venis de una pelea YA EMPEZADA (tiraste un ataque). Solo en ese
// caso traer un dragon DISTINTO cuenta como relevo (entra a vida llena pero pega
// mas flojo y da menos XP). El flag peleaIniciada lo setea la pelea, scopeado al
// rival. dragonActivoId es el dragon que venias usando: volver a elegirlo cancela
// el cambio (no cuenta como relevo).
const peleaIniciadaStore = JSON.parse(
  localStorage.getItem("peleaIniciada") || "null",
);
const enCombate =
  enPelea &&
  !!rival &&
  !!peleaIniciadaStore &&
  peleaIniciadaStore.instanceId === rival.instanceId;
const dragonActivoId = Number(localStorage.getItem("dragonActivoId"));

// Aviso del costo del relevo (solo si estas en combate y podes traer relevo).
const avisoRelevo = document.getElementById("avisoRelevo");
if (avisoRelevo && enCombate) {
  avisoRelevo.textContent =
    "Estás en combate: traer un dragón distinto cuenta como relevo. Entra con vida llena, pero sus golpes son 30% menos efectivos y ganás menos XP. Si te arrepentís, volvé a elegir el dragón que venías usando y no cuenta como cambio.";
  avisoRelevo.hidden = false;
}

// Indice del dragon que mas conviene contra el rival: mejor efectividad de tipo,
// solo entre los adoptados y con vida; desempata por nivel y luego por vida.
function calcularRecomendado() {
  if (!eligiendoParaPelea) return -1;
  let mejor = -1;
  let mejorPuntaje = -Infinity;
  for (let i = 0; i < dragones.length; i++) {
    const d = dragones[i];
    if (d.habilitado !== true || (d.vida ?? 0) <= 0) continue;
    const mult = multiplicadorTipo(d.tipo, rival.tipo);
    const puntaje = mult * 1000 + (d.nivel ?? 1) * 10 + (d.vida ?? 0) / 100;
    if (puntaje > mejorPuntaje) {
      mejorPuntaje = puntaje;
      mejor = i;
    }
  }
  return mejor;
}

function mostrarDragones() {
  containerDragon.innerHTML = "";

  const recomendado = calcularRecomendado();

  for (let i = 0; i < dragones.length; i++) {
    let dragon = dragones[i];
    let habilitado = dragon.habilitado === true;

    let tarjeta = document.createElement("div");
    tarjeta.classList.add("tarjeta");
    tarjeta.dataset.index = i;
    tarjeta.dataset.iddragon = dragon.id;

    if (dragon.especial === true) {
      tarjeta.classList.add("dragonEspecial");
    } else {
      tarjeta.classList.add("dragonNormal");
    }

    if (!habilitado) {
      tarjeta.classList.add("dragonBloqueado");
    }

    // Estado de salud del dragon (solo aplica a los adoptados).
    // vidaMax viene del backend; el % decide cuan critico esta y si hay que curar.
    const vida = dragon.vida ?? 0;
    const vidaMax = dragon.vidaMax || dragon.vida || 1;
    const pctVida = Math.max(0, Math.min(100, Math.round((vida / vidaMax) * 100)));

    let sinVida = habilitado && vida <= 0;
    // "Necesita curacion" = adoptado y por debajo del 100% de vida.
    let necesitaCura = habilitado && vida < vidaMax;
    // "Critico" = sin vida o por debajo del 30%: tinte rojo mas fuerte + pulso.
    let critico = habilitado && pctVida <= 30;

    if (sinVida) {
      tarjeta.classList.add("dragonSinVida");
    }
    if (necesitaCura) {
      tarjeta.classList.add("necesitaCura");
    }
    if (critico) {
      tarjeta.classList.add("vidaCritica");
    }

    // Dragon recomendado contra el rival actual (mejor efectividad de tipo).
    const esRecomendado = i === recomendado;
    if (esRecomendado) {
      tarjeta.classList.add("recomendado");
    }

    // Dragon que venis usando en el combate: elegirlo de nuevo NO cuenta como
    // relevo (es la salida si te arrepentiste de cambiar).
    const esActivo = enCombate && dragon.id === dragonActivoId;
    if (esActivo) {
      tarjeta.classList.add("dragonEnCombate");
    }

    // Cartel de estado: distingue sin vida / critico / herido.
    let avisoHTML = "";
    if (sinVida) {
      avisoHTML = '<p class="avisoSalud avisoCritico">Sin vida - no puede pelear</p>';
    } else if (critico) {
      avisoHTML = '<p class="avisoSalud avisoCritico">¡Estado crítico! Necesita curación</p>';
    } else if (necesitaCura) {
      avisoHTML = '<p class="avisoSalud">Necesita curación</p>';
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
          <span class="stat">VIDA ${vida}/${vidaMax}</span>
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
        ${esRecomendado ? '<span class="badgeRecomendado">Recomendado</span>' : ""}
        ${esActivo ? '<span class="badgeEnCombate">En combate · volver sin costo</span>' : ""}
        <h4 class="nombre">${dragon.nombre}</h4>
        <p class="nivel">Lv ${dragon.nivel}</p>
        <p class="tipo">${habilitado ? dragon.tipo : "No adoptado"}</p>
        ${avisoHTML}
        ${statsHTML}
      </div>
      ${
        necesitaCura && !enPelea
          ? curacionesRestantes <= 0
            ? `<button type="button" class="botonCurar botonCurarSinCupo" disabled title="Sin curaciones rápidas. Curá en la casita.">Sin curaciones</button>`
            : `<button type="button" class="botonCurar" data-iddragon="${dragon.id}">Curar</button>`
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
    // Cambio de dragon durante una pelea. El relevo (penalizacion) se decide
    // ACA, al confirmar la eleccion, no al apretar DRAGON:
    //  - RELEVO = estas en combate (ya peleaste) y elegis un dragon DISTINTO.
    //    Entra a vida LLENA, pero la pelea lo penaliza (golpes -30%, menos XP) y
    //    es tu unico cambio del combate (se marca cambioDePelea).
    //  - NO es relevo si todavia no empezaste a pelear (cambio previo, corregir
    //    el matchup) o si volves a elegir el MISMO dragon (te arrepentiste). En
    //    esos casos entra con su vida actual y no cuenta como cambio.
    // La vida restante de ambos se conserva: el saliente ya se persistio al
    // cambiar y el que entra se persiste al terminar la pelea.
    const vidaMax = dragon.vidaMax || dragon.vida;
    const volverAlMismo = dragon.id === dragonActivoId;
    const esRelevo = enCombate && !volverAlMismo;

    if (esRelevo) {
      localStorage.setItem(
        "cambioDePelea",
        JSON.stringify({ instanceId: rival.instanceId }),
      );
    }

    const vida = esRelevo
      ? vidaMax
      : Math.max(0, Math.min(vidaMax, dragon.vida ?? vidaMax));
    dragon = { ...dragon, vida, vidaInicial: vidaMax };

    postEvent(
      "actualizarVida",
      { idpartida, iddragon: dragon.id, vida },
      () => {
        localStorage.setItem("dragonardo", JSON.stringify(dragon));
        window.location.href = "../pelea/peleadesplegada.html";
      },
    );
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
// restaurando su vida al maximo en el backend y refresca la lista. Gasta una
// curacion rapida del cupo de la partida (el backend lo controla y devuelve las
// restantes); si no quedan, no cura y avisa que hay que ir a la casita.
function curarDragon(iddragon) {
  // Corte temprano del lado del cliente (el backend igual valida): sin cupo, no
  // mandamos el pedido y avisamos.
  if (curacionesRestantes <= 0) {
    alert("Te quedaste sin curaciones rápidas. Curá en la casita para renovarlas.");
    return;
  }
  postEvent("curarDragon", { idpartida, iddragon }, (res) => {
    // El backend siempre informa el cupo restante (incluso al fallar): lo reflejamos.
    if (res && typeof res.curacionesRestantes === "number") {
      curacionesRestantes = res.curacionesRestantes;
      if (typeof res.curacionesMax === "number") curacionesMax = res.curacionesMax;
      actualizarContadorCuraciones();
    }

    if (res && res.exito) {
      const d = dragones.find((x) => x.id === iddragon);
      if (d) d.vida = res.progreso.vida;
      tarjetaSeleccionada = null;
      botonElegir.classList.remove("visible");
      mostrarDragones();

      // Feedback de curado: la tarjeta destella en verde un instante para que
      // se note el cambio de estado (de "necesita curacion" a sano).
      const tarjeta = containerDragon.querySelector(
        `.tarjeta[data-iddragon="${iddragon}"]`,
      );
      if (tarjeta) {
        tarjeta.classList.add("recienCurado");
        setTimeout(() => tarjeta.classList.remove("recienCurado"), 1200);
      }
    } else {
      // Sin cupo u otro fallo: refrescamos para que los botones Curar pasen a
      // "Sin curaciones", y avisamos.
      mostrarDragones();
      alert(res?.mensaje || "No se pudo curar el dragón.");
    }
  });
}

containerDragon.addEventListener("click", onClickTarjeta);
botonElegir.addEventListener("click", elegirDragon);
