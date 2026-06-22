import { bloquearboton, desbloquearBoton } from "./pelea.js";

connect2Server();

let ataque1 = document.getElementById("ataque1");
let ataque2 = document.getElementById("ataque2");
let ataque3 = document.getElementById("ataque3");
let ataque4 = document.getElementById("ataque4");
let BotonAdopcion = document.getElementById("adoptar");

let barravidaUsuario = document.getElementById("vida_chimuelo");
let vidaTextoUsuario = document.getElementById("vidaTexto_chimuelo");

let barravidaEnemigo = document.getElementById("vida_amarillo");
let vidaTextoEnemigo = document.getElementById("vidaTexto_amarillo");

let imagenamarillo = document.getElementById("amarillo");
let gifAmarillo = document.getElementById("AtaqueAmarillo");
let imagenchimuelo = document.getElementById("chimuelo");
let gifChimuelo = document.getElementById("AtaqueChimuelo");
let nombredragon = document.getElementById("nombreDragon");
let nombredragonmalo = document.getElementById("nombreDragonMalo");
let tipoUsuario = document.getElementById("tipo_usuario");
let nivelUsuario = document.getElementById("nivel_usuario");
let tipoEnemigo = document.getElementById("tipo_enemigo");
let nivelEnemigo = document.getElementById("nivel_enemigo");

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

let usuario = JSON.parse(localStorage.getItem("usuario"));
let dragon = JSON.parse(localStorage.getItem("dragonardo"));
let dragonEnemigo = JSON.parse(localStorage.getItem("dragon_enemigo"));

// El progreso que devuelve el backend (progreso.json) no incluye imagen/nombre/id
// del dragon: esos viven en el catalogo y se setean al elegirlo en el inventario.
// Por eso al actualizar el dragon del usuario se MERGEA sobre el dragon actual en
// vez de pisarlo; si no, se rompen el sprite y el id en el head-to-head y en la
// siguiente pelea (BACKEND/undefined e iddragon undefined).
function actualizarDragonardo(progreso) {
  dragon = { ...dragon, ...progreso };
  localStorage.setItem("dragonardo", JSON.stringify(dragon));
}

if (!dragon.vidaInicial) {
  dragon.vidaInicial = dragon.vida;
  localStorage.setItem("dragonardo", JSON.stringify(dragon));
}
imagenchimuelo.src = `../BACKEND/${dragon.imagen}`;

if (!dragonEnemigo.vidaInicial) {
  dragonEnemigo.vidaInicial = dragonEnemigo.vida;
  localStorage.setItem("dragon_enemigo", JSON.stringify(dragonEnemigo));
}
imagenamarillo.src = `../BACKEND/${dragonEnemigo.imagen}`;
// Un dragon ya adoptado (habilitado) no se puede volver a adoptar: si te lo
// volves a cruzar en el mapa, podes pelear pero el unico premio es experiencia.
let yaAdoptado = dragonEnemigo.habilitado === true;

if (!yaAdoptado && dragonEnemigo.vida <= 30) {
  desbloquearBoton();
  BotonAdopcion.onclick = null;
} else {
  bloquearboton();
  BotonAdopcion.onclick = (e) => {
    e.preventDefault();
    console.log(
      yaAdoptado
        ? "Este dragón ya es tuyo, no se puede adoptar de nuevo"
        : "Todavía no lo podés adoptar",
    );
  };
}

nombredragon.innerText = dragon.nombre;
nombredragonmalo.innerText = dragonEnemigo.nombre;

if (tipoUsuario) tipoUsuario.innerText = (dragon.tipo ?? "?").toUpperCase();
if (nivelUsuario) nivelUsuario.innerText = `Nv ${dragon.nivel ?? 1}`;
if (tipoEnemigo)
  tipoEnemigo.innerText = (dragonEnemigo.tipo ?? "?").toUpperCase();
if (nivelEnemigo) nivelEnemigo.innerText = `Nv ${dragonEnemigo.nivel ?? 1}`;
if (tipoUsuario) tipoUsuario.dataset.tipo = dragon.tipo ?? "normal";
if (tipoEnemigo) tipoEnemigo.dataset.tipo = dragonEnemigo.tipo ?? "normal";

let idpartida = Number(localStorage.getItem("partida"));
let iddragon = dragon.id;

// HUIR y DRAGON (cambiar de dragon activo) salen de la pelea sin que termine por
// victoria/derrota: hay que guardar la vida actual antes de navegar, si no el
// daño recibido se pierde y el dragon vuelve a aparecer con vida llena.
let BotonDragon = document.getElementById("botonDragon");
let ModalConfirmar = document.getElementById("modalConfirmar");

BotonDragon.addEventListener("click", () => {
  // El rival solo vive en localStorage (no en el backend): si no lo volvemos a
  // guardar aca, al volver de elegir dragon se relee el "dragon_enemigo" de
  // localStorage tal cual estaba ANTES de la pelea, con vida llena.
  localStorage.setItem("dragon_enemigo", JSON.stringify(dragonEnemigo));

  // El dragon que elijas en el inventario tiene que entrar a la pelea con el
  // mismo % de vida que le quedaba a este. Guardamos ese % para que el
  // inventario lo aplique sobre el dragon nuevo al confirmar la eleccion.
  const vidaMax = dragon.vidaMax || dragon.vidaInicial || dragon.vida;
  const porcentajeVida = vidaMax > 0 ? dragon.vida / vidaMax : 0;
  localStorage.setItem("porcentajeVidaCambio", String(porcentajeVida));

  postEvent("actualizarVida", { idpartida, iddragon, vida: dragon.vida }, () => {
    localStorage.setItem("origenInventario", "pelea");
    window.location.href = "../inventario/inventario.html";
  });
});

ModalConfirmar.addEventListener("click", () => {
  postEvent("actualizarVida", { idpartida, iddragon, vida: dragon.vida }, () => {
    window.location.href =
      "http://127.0.0.1:5501/FRONTEND-PEDRO/Phaser/RPG%20prueba/RPG%201/index.html";
  });
});

let batallaTerminada = false;
let turnoUsuario = true;

vidaTextoUsuario.innerText = dragon.vida;
vidaTextoEnemigo.innerText = dragonEnemigo.vida;

actualizarBarraVida(
  barravidaUsuario,
  vidaTextoUsuario,
  dragon.vida,
  dragon.vidaInicial,
);
actualizarBarraVida(
  barravidaEnemigo,
  vidaTextoEnemigo,
  dragonEnemigo.vida,
  dragonEnemigo.vidaInicial,
);

function actualizarBarraVida(
  elementoRelleno,
  elementoTexto,
  vidaActual,
  vidaInicial,
) {
  let porcentaje = (vidaActual / vidaInicial) * 100;

  elementoRelleno.style.width = porcentaje + "%";

  if (porcentaje > 80) elementoRelleno.style.background = "green";
  else if (porcentaje > 60) elementoRelleno.style.background = "orange";
  else if (porcentaje > 30) elementoRelleno.style.background = "yellow";
  else elementoRelleno.style.background = "red";

  elementoTexto.innerText = `Hp (${vidaActual} / ${vidaInicial})`;
}

function etiquetaAtaque(i) {
  const a = dragon.ataques[i];
  if (!a) return "Sin ataque";
  const desbloqueado =
    a.desbloqueado ?? dragon.desbloqueados?.includes(a.nombre) ?? a.nivel <= 1;
  if (!desbloqueado) return `${a.nombre} (Nv ${a.nivel})`;
  const mult = multiplicadorTipo(dragon.tipo, dragonEnemigo.tipo);
  const clase = mult > 1 ? "modBueno" : mult < 1 ? "modMalo" : "modNeutro";
  return `${a.nombre} <span class="mod ${clase}">×${mult}</span>`;
}

[ataque1, ataque2, ataque3, ataque4].forEach((btn, i) => {
  btn.innerHTML = etiquetaAtaque(i);
  const a = dragon.ataques[i];
  const desbloqueado = a
    ? (a.desbloqueado ??
      dragon.desbloqueados?.includes(a.nombre) ??
      a.nivel <= 1)
    : false;
  btn.dataset.desbloqueado = desbloqueado ? "true" : "false";
});

function checkFinDeBatalla() {
  if (batallaTerminada) return true;

  if (dragon.vida <= 0) {
    batallaTerminada = true;
    deshabilitarAtaques();
    bloquearboton();
    BotonAdopcion.onclick = (e) => e.preventDefault();

    setTimeout(() => {
      gifChimuelo.style.display = "none";
      imagenchimuelo.style.display = "block";
      gifAmarillo.style.display = "none";
      imagenamarillo.style.display = "block";

      postEvent(
        "actualizarVida",
        {
          idpartida: idpartida,
          iddragon: iddragon,
          vida: dragon.vida,
        },
        (data) => {
          if (data.exito) {
            actualizarDragonardo(data.progreso);
          }
          // Fracaso -> overlay in-place (no pantalla aparte).
          window.mostrarOverlayFracaso({
            titulo: "Perdiste",
            detalle: `${dragonEnemigo.nombre} te derrotó.`,
            destino:
              "http://127.0.0.1:5501/FRONTEND-PEDRO/Phaser/RPG%20prueba/RPG%201/index.html",
          });
        },
      );
    }, 800);

    return true;
  }

  if (dragonEnemigo.vida <= 0) {
    batallaTerminada = true;
    deshabilitarAtaques();
    bloquearboton();
    BotonAdopcion.onclick = (e) => e.preventDefault();

    setTimeout(() => {
      gifChimuelo.style.display = "none";
      imagenchimuelo.style.display = "block";
      gifAmarillo.style.display = "none";
      imagenamarillo.style.display = "block";

      localStorage.setItem("dragon_eliminado", dragonEnemigo.instanceId);

      let expGanada = 50;

      postEvent(
        "actualizarVida",
        {
          idpartida: idpartida,
          iddragon: iddragon,
          vida: dragon.vida,
        },
        (data) => {
          if (data.exito) {
            actualizarDragonardo(data.progreso);
          }
        },
      );

      postEvent(
        "sumarexperiencia",
        {
          iddragon: iddragon,
          cantidad: expGanada,
          idpartida: idpartida,
        },
        (data) => {
          actualizarDragonardo(data.progreso);
          let detalle = `Derrotaste a ${dragonEnemigo.nombre}.\n+${expGanada} XP`;
          if (
            typeof data.mensaje === "string" &&
            data.mensaje.toLowerCase().includes("subiste")
          ) {
            detalle += `\n¡Subiste al nivel ${data.progreso.nivel}!`;
          }
          localStorage.setItem(
            "resultado",
            JSON.stringify({
              tipo: "exito",
              titulo: "¡Ganaste!",
              detalle,
              sprite: dragon?.imagen ? `../BACKEND/${dragon.imagen}` : undefined,
            }),
          );
          window.location.href = "../logros/resultado.html";
        },
      );
    }, 800);

    return true;
  }

  return false;
}

function ataqueUsuario(i) {
  if (batallaTerminada) return;
  if (!turnoUsuario) return;

  let ataque = dragon.ataques[i];
  if (!ataque) return;

  const desbloqueado =
    ataque.desbloqueado ??
    dragon.desbloqueados?.includes(ataque.nombre) ??
    ataque.nivel <= 1;
  if (!desbloqueado) return;

  turnoUsuario = false;
  deshabilitarAtaques();

  gifChimuelo.style.display = "block";
  imagenchimuelo.style.display = "none";

  let danoBase = ataque.dano ?? 0;
  let fuerzaBase = dragon.fuerza ?? 0;
  let mult = multiplicadorTipo(dragon.tipo, dragonEnemigo.tipo);
  let danoTotal = Math.round((danoBase + fuerzaBase) * mult);
  dragonEnemigo.vida -= danoTotal;
  if (dragonEnemigo.vida < 0) dragonEnemigo.vida = 0;

  actualizarBarraVida(
    barravidaEnemigo,
    vidaTextoEnemigo,
    dragonEnemigo.vida,
    dragonEnemigo.vidaInicial,
  );

  console.log(
    `Ataque del usuario: ${danoTotal}, vida rival: ${dragonEnemigo.vida}`,
  );

  if (checkFinDeBatalla()) return;

  terminarTurno();
}

function elegirAtaqueRival() {
  const nivelRival = dragonEnemigo.nivel ?? 1;
  const disponibles = (dragonEnemigo.ataques || []).filter(
    (a) => a.nivel <= nivelRival,
  );
  if (disponibles.length === 0) return { nombre: "Golpe", dano: 5 };
  return disponibles[Math.floor(Math.random() * disponibles.length)];
}

function ataqueEnemigo() {
  if (batallaTerminada) return;

  setTimeout(() => {
    if (batallaTerminada) return;

    gifAmarillo.style.display = "block";
    imagenamarillo.style.display = "none";

    const ataqueRival = elegirAtaqueRival();
    const danoBase = ataqueRival.dano ?? 0;
    const fuerzaBase = dragonEnemigo.fuerza ?? 0;
    const mult = multiplicadorTipo(dragonEnemigo.tipo, dragon.tipo);
    const dano = Math.round((danoBase + fuerzaBase) * mult);
    dragon.vida -= dano;
    if (dragon.vida < 0) dragon.vida = 0;

    actualizarBarraVida(
      barravidaUsuario,
      vidaTextoUsuario,
      dragon.vida,
      dragon.vidaInicial,
    );

    console.log(`Ataque enemigo: ${dano}, vida dragón: ${dragon.vida}`);

    checkFinDeBatalla();
    terminarTurno2();
  }, 2000);
}

function terminarTurno() {
  if (batallaTerminada) return;
  setTimeout(() => {
    if (batallaTerminada) return;
    gifChimuelo.style.display = "none";
    imagenchimuelo.style.display = "block";
  }, 1500);
  if (!batallaTerminada) {
    ataqueEnemigo();
  }
}

function terminarTurno2() {
  setTimeout(() => {
    gifAmarillo.style.display = "none";
    imagenamarillo.style.display = "block";
    if (!batallaTerminada) {
      turnoUsuario = true;
      habilitarAtaques();
    }
  }, 1500);

  if (!yaAdoptado && dragonEnemigo.vida <= 30) {
    desbloquearBoton();
    BotonAdopcion.onclick = null;
    BotonAdopcion.onclick = () => {
      localStorage.setItem("dragon_eliminado", dragonEnemigo.instanceId);
      localStorage.setItem("vidaFinalRival", dragonEnemigo.vida);
    };
  } else {
    bloquearboton();
    BotonAdopcion.onclick = (e) => {
      e.preventDefault();
      console.log(
        yaAdoptado
          ? "Este dragón ya es tuyo, no se puede adoptar de nuevo"
          : "Todavía no lo podés adoptar",
      );
    };
  }
}

function deshabilitarAtaques() {
  ataque1.disabled = true;
  ataque2.disabled = true;
  ataque3.disabled = true;
  ataque4.disabled = true;
}

function habilitarAtaques() {
  ataque1.disabled = false;
  ataque2.disabled = false;
  ataque3.disabled = false;
  ataque4.disabled = false;
}

ataque1.addEventListener("click", () => ataqueUsuario(0));
ataque2.addEventListener("click", () => ataqueUsuario(1));
ataque3.addEventListener("click", () => ataqueUsuario(2));
ataque4.addEventListener("click", () => ataqueUsuario(3));
