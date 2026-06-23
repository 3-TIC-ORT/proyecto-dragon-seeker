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
let stageAmarillo = document.getElementById("stageAmarillo");
let imagenchimuelo = document.getElementById("chimuelo");
let gifChimuelo = document.getElementById("AtaqueChimuelo");
let stageChimuelo = document.getElementById("stageChimuelo");
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

// Gifs de ataque por dragon (en BACKEND/img). El indice coincide con el orden de
// ataques[] del dragon en dragones.json: boton/ataque 0 -> gif 0, etc. Los que no
// estan aca (ej. Llamafuria id 5, o dragones que no aparecen en el mapa) caen al
// sprite estatico via gifDeAtaque/mostrarGifAtaque, sin romper la pelea.
const GIFS_ATAQUE = {
  1: ["ataque terragon 1.gif", "ataque terragon 2.gif", "ataque terragon 3.gif", "ataque terragon 4.gif"],
  2: ["rocabrava_attack_nightmare.gif", "rocabrava_attack_shadow_claw.gif", "rocabrava_attack_soul_drain.gif", "rocabrava_attack_void_rift.gif"],
  3: ["golem verde_attack_charge.gif", "golem verde_attack_claw_slash.gif", "golem verde_attack_fire_breath.gif", "golem verde_attack_tail_whip.gif"],
  4: ["ataque chimuelo 1.gif", "ataque chimuelo 2.gif", "ataque chimuelo 3.gif", "ataque chimuelo 4.gif"],
  6: ["burpi_attack_fire.gif", "burpi_attack_inferno.gif", "burpi_attack_lava.gif", "burpi_attack_scorched.gif"],
  7: ["ataque amarillo 1.gif", "ataque amarillo 2.gif", "ataque amarillo 3.gif", "ataque amarillo 4.gif"],
  9: ["truenoz_attack_charge.gif", "truenoz_attack_claw_slash.gif", "truenoz_attack_fire_breath.gif", "truenoz_attack_tail_whip.gif"],
  10: ["ataque burbu 1.gif", "ataque burbu 2.gif", "ataque burbu 3.gif", "ataque burbu 4.gif"],
  11: ["tsunami_attack_bubble_barrage.gif", "tsunami_attack_hydro_cannon.gif", "tsunami_attack_tidal_wave.gif", "tsunami_attack_whirlpool.gif"],
  13: ["ataque escarcha 1.gif", "ataque escarcha 3.gif", "ataque escarcha 4.gif", "ataque escarcha 7.gif"],
  15: ["yetihelado_attack_breath.gif", "yetihelado_attack_claw.gif", "yetihelado_attack_leap_fix.gif", "yetihelado_attack_tail_fix.gif"],
  16: ["ataque oso 1.gif", "ataque oso 2.gif", "ataque oso 3.gif", "ataque oso 4.gif"],
  19: ["tormato_attack_charge.gif", "tormato_attack_claw_slash.gif", "tormato_attack_fire_breath.gif", "tormato_attack_tail_whip.gif"],
  20: ["bengal_attack_charge.gif", "bengal_attack_claw_slash.gif", "bengal_attack_fire_breath.gif", "bengal_attack_tail_whip.gif"],
};

// Gifs de ataque del boss. Keyeado por id de boss (NO va en GIFS_ATAQUE: el boss
// 1 comparte id con Terragon). Se elige via esBoss en gifDeAtaque/precargarGifs.
const GIFS_ATAQUE_BOSS = {
  1: ["ataque boss 1.gif", "ataque boss 2.gif", "ataque boss 3.gif", "ataque boss 4.gif"],
};

// URL del gif del ataque `indice` de `dragonObj`, o null si no hay (fallback).
// encodeURI porque varios nombres tienen espacios ("ataque X N", "golem verde_").
function gifDeAtaque(dragonObj, indice) {
  if (!dragonObj) return null;
  const lista = dragonObj.esBoss
    ? GIFS_ATAQUE_BOSS[dragonObj.id]
    : GIFS_ATAQUE[dragonObj.id];
  if (!lista || !lista[indice]) return null;
  return encodeURI(`../BACKEND/img/${lista[indice]}`);
}

// El dragon ocupa los 32px de abajo de cada gif (el resto es el efecto, que sube).
const ALTO_DRAGON_PX = 32;

// Escala el gif para que esos 32px de abajo midan lo mismo que el SVG (100% del
// stage); el efecto sobresale por arriba. Asi el dragon queda del mismo tamaño y
// posicion que el sprite estatico sin importar el alto del frame (32/40/48/64).
// El boss no sigue esa convencion de encuadre: se encuadra entero al stage (100%).
function ajustarAltoGif(gifEl, esBoss) {
  if (esBoss) {
    gifEl.style.height = "100%";
    return;
  }
  if (!gifEl.naturalHeight) return;
  gifEl.style.height = (gifEl.naturalHeight / ALTO_DRAGON_PX) * 100 + "%";
}

// Hace el crossfade al gif del ataque: setea el gif y prende la clase del stage
// (el CSS cruza opacidad SVG<->gif, ambos al mismo tamaño/posicion -> sin salto).
// Si el dragon no tiene gif para ese ataque, deja el sprite estatico: pelea igual.
function mostrarGifAtaque(stageEl, gifEl, dragonObj, indice) {
  const url = gifDeAtaque(dragonObj, indice);
  if (!url) {
    stageEl.classList.remove("atacando");
    return;
  }
  const esBoss = !!dragonObj.esBoss;
  gifEl.onload = () => ajustarAltoGif(gifEl, esBoss);
  gifEl.src = url;
  if (gifEl.complete && gifEl.naturalHeight) ajustarAltoGif(gifEl, esBoss);
  stageEl.classList.add("atacando");
}

// Vuelve al sprite estatico (crossfade inverso).
function ocultarGifAtaque(stageEl) {
  stageEl.classList.remove("atacando");
}

// Precarga los gifs de un dragon para que el primer ataque no tenga stutter ni
// frame en blanco: cuando se hace el swap el navegador ya los tiene en cache.
function precargarGifs(dragonObj) {
  const lista = dragonObj?.esBoss
    ? GIFS_ATAQUE_BOSS[dragonObj.id]
    : GIFS_ATAQUE[dragonObj?.id];
  if (!lista) return;
  lista.forEach((f) => {
    const im = new Image();
    im.src = encodeURI(`../BACKEND/img/${f}`);
  });
}

let usuario = JSON.parse(localStorage.getItem("usuario"));
let dragon = JSON.parse(localStorage.getItem("dragonardo"));
let dragonEnemigo = JSON.parse(localStorage.getItem("dragon_enemigo"));

// Precarga los gifs de ambos dragones (ya inicializados arriba) para que el
// primer ataque no tenga stutter ni frame en blanco.
precargarGifs(dragon);
precargarGifs(dragonEnemigo);

// Facing: mismo criterio que el head-to-head (enfrentamiento, .lado-rival): todos
// los dragones estan dibujados mirando para el mismo lado, asi que el jugador
// queda con el arte original y SOLO se espeja al rival -> quedan de frente.
stageAmarillo.classList.add("espejado");

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
// Los jefes (boss de zona) NO se pueden adoptar nunca: el boton ADOPTAR
// directamente no aparece en su pelea.
let esBoss = dragonEnemigo.esBoss === true;
if (esBoss && BotonAdopcion) {
  BotonAdopcion.style.display = "none";
  const menuPrincipal = document.getElementById("menuPrincipal");
  if (menuPrincipal) menuPrincipal.classList.add("sinAdoptar");
}

// La adopcion se habilita cuando el rival queda con POCA vida. Como los rivales
// escalan y cada uno tiene una vidaMax distinta, el umbral es un PORCENTAJE de
// su vida maxima (no un valor absoluto, que seria injusto entre rivales).
const FRACCION_ADOPTABLE = 0.3; // 30% de la vida maxima del rival
const umbralAdopcion =
  (dragonEnemigo.vidaMax ?? dragonEnemigo.vidaInicial ?? dragonEnemigo.vida) *
  FRACCION_ADOPTABLE;

if (!yaAdoptado && !esBoss && dragonEnemigo.vida <= umbralAdopcion) {
  desbloquearBoton();
  BotonAdopcion.onclick = null;
} else {
  bloquearboton();
  BotonAdopcion.onclick = (e) => {
    e.preventDefault();
    console.log(
      esBoss
        ? "A los jefes no se los puede adoptar"
        : yaAdoptado
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

function ataqueDesbloqueado(a) {
  if (!a) return false;
  return (
    a.desbloqueado ?? dragon.desbloqueados?.includes(a.nombre) ?? a.nivel <= 1
  );
}

// El boton muestra SOLO el nombre (asi entra bien); el tipo y la eficacia van en
// la caja de la pregunta, que en modo ataques pasa a mostrar esa info.
function etiquetaAtaque(i) {
  const a = dragon.ataques[i];
  if (!a) return "Sin ataque";
  if (!ataqueDesbloqueado(a)) return `${a.nombre} (Nv ${a.nivel})`;
  return a.nombre;
}

const infoTipo = document.getElementById("infoTipo");
const infoEfecto = document.getElementById("infoEfecto");

// Llena la caja con el tipo + la eficacia del ataque i (color segun multiplicador)
function mostrarInfoAtaque(i) {
  if (!infoTipo) return;
  const a = dragon.ataques[i];
  if (!a) {
    infoTipo.textContent = "Sin ataque";
    infoEfecto.textContent = "";
    infoEfecto.className = "infoEfecto";
    return;
  }
  if (!ataqueDesbloqueado(a)) {
    infoTipo.textContent = "Bloqueado";
    infoEfecto.textContent = `Se desbloquea en Nv ${a.nivel}`;
    infoEfecto.className = "infoEfecto";
    return;
  }
  infoTipo.textContent = `Tipo ${(dragon.tipo ?? "?").toUpperCase()}`;
  const mult = multiplicadorTipo(dragon.tipo, dragonEnemigo.tipo);
  const etiqueta =
    mult > 1 ? "Muy eficaz" : mult < 1 ? "Poco eficaz" : "Eficacia normal";
  const clase = mult > 1 ? "efBueno" : mult < 1 ? "efMalo" : "efNeutro";
  infoEfecto.textContent = `${etiqueta} ×${mult}`;
  infoEfecto.className = `infoEfecto ${clase}`;
}

[ataque1, ataque2, ataque3, ataque4].forEach((btn, i) => {
  btn.innerHTML = etiquetaAtaque(i);
  btn.dataset.desbloqueado = ataqueDesbloqueado(dragon.ataques[i])
    ? "true"
    : "false";
  btn.addEventListener("mouseenter", () => mostrarInfoAtaque(i));
  btn.addEventListener("focus", () => mostrarInfoAtaque(i));
});

// Arranca mostrando el primer ataque desbloqueado (se ve al tocar LUCHAR).
const primerDesbloqueado = dragon.ataques.findIndex((a) => ataqueDesbloqueado(a));
mostrarInfoAtaque(primerDesbloqueado >= 0 ? primerDesbloqueado : 0);

function checkFinDeBatalla() {
  if (batallaTerminada) return true;

  if (dragon.vida <= 0) {
    batallaTerminada = true;
    deshabilitarAtaques();
    bloquearboton();
    BotonAdopcion.onclick = (e) => e.preventDefault();

    setTimeout(() => {
      ocultarGifAtaque(stageChimuelo);
      ocultarGifAtaque(stageAmarillo);

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
      ocultarGifAtaque(stageChimuelo);
      ocultarGifAtaque(stageAmarillo);

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
          const subioNivel =
            typeof data.mensaje === "string" &&
            data.mensaje.toLowerCase().includes("subiste");
          let detalle = `Derrotaste a ${dragonEnemigo.nombre}.\n+${expGanada} XP`;
          if (subioNivel) {
            detalle += `\n${dragon.nombre} alcanzó el nivel ${data.progreso.nivel}.`;
          }
          localStorage.setItem(
            "resultado",
            JSON.stringify({
              tipo: "exito",
              titulo: subioNivel ? "¡SUBIÓ DE NIVEL!" : "¡Ganaste!",
              detalle,
              subioNivel,
              nivel: subioNivel ? data.progreso.nivel : undefined,
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

  mostrarGifAtaque(stageChimuelo, gifChimuelo, dragon, i);

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

// Devuelve el ataque elegido del rival y su indice en dragonEnemigo.ataques
// (el indice se usa para el gif correspondiente). Si no hay ataques disponibles,
// indice -1 -> sin gif (fallback al sprite estatico).
function elegirAtaqueRival() {
  const nivelRival = dragonEnemigo.nivel ?? 1;
  const indices = [];
  // (a.nivel ?? 1): el boss trae ataques sin "nivel" -> sin esto quedaban todos
  // fuera y el boss solo pegaba "Golpe" (sin gif). Asi quedan disponibles.
  (dragonEnemigo.ataques || []).forEach((a, i) => {
    if ((a.nivel ?? 1) <= nivelRival) indices.push(i);
  });
  if (indices.length === 0) {
    return { ataque: { nombre: "Golpe", dano: 5 }, indice: -1 };
  }
  const indice = indices[Math.floor(Math.random() * indices.length)];
  return { ataque: dragonEnemigo.ataques[indice], indice };
}

function ataqueEnemigo() {
  if (batallaTerminada) return;

  setTimeout(() => {
    if (batallaTerminada) return;

    const { ataque: ataqueRival, indice: indiceRival } = elegirAtaqueRival();
    mostrarGifAtaque(stageAmarillo, gifAmarillo, dragonEnemigo, indiceRival);

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
    ocultarGifAtaque(stageChimuelo);
  }, 1500);
  if (!batallaTerminada) {
    ataqueEnemigo();
  }
}

function terminarTurno2() {
  setTimeout(() => {
    ocultarGifAtaque(stageAmarillo);
    if (!batallaTerminada) {
      turnoUsuario = true;
      habilitarAtaques();
    }
  }, 1500);

  if (!yaAdoptado && !esBoss && dragonEnemigo.vida <= umbralAdopcion) {
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
        esBoss
          ? "A los jefes no se los puede adoptar"
          : yaAdoptado
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
