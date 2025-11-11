connect2Server();

import { bloquearboton, desbloquearBoton } from './pelea.js';

let ataque1 = document.getElementById("ataque1");
let ataque2 = document.getElementById("ataque2");
let ataque3 = document.getElementById("ataque3");
let ataque4 = document.getElementById("ataque4");
let BotonAdopcion = document.getElementById("adoptar");
let barravidaUsuario = document.getElementById("vida_chimuelo");
let barravidaEnemigo = document.getElementById("vida_amarillo");
let imagenamarillo = document.getElementById("amarillo");
let gifAmarillo = document.getElementById("AtaqueAmarillo");
let imagenchimuelo = document.getElementById("chimuelo");
let gifChimuelo = document.getElementById("AtaqueChimuelo");

let usuario = JSON.parse(localStorage.getItem("usuario"));
let dragon = JSON.parse(localStorage.getItem("dragonardo"));

let idusuario = usuario.id;
let iddragon = dragon.id;

let batallaTerminada = false;

barravidaUsuario.innerText = dragon.vida;
barravidaEnemigo.innerText = 100;

ataque1.innerText = dragon.ataques[0]?.nombre || "Sin ataque";
ataque2.innerText = dragon.ataques[1]?.nombre || "Sin ataque";
ataque3.innerText = dragon.ataques[2]?.nombre || "Sin ataque";
ataque4.innerText = dragon.ataques[3]?.nombre || "Sin ataque";

let amarillo = {
  name: "amarillo",
  vidaAmarillo: 100,
  strength: 8,
  defense: 7,
  speed: 7,
};

function checkFinDeBatalla() {
  if (batallaTerminada) return true; 

  if (dragon.vida <= 0) {
    batallaTerminada = true;
    deshabilitarAtaques();

    setTimeout(() => {
      gifChimuelo.style.display = "none";
      imagenchimuelo.style.display = "block";
      gifAmarillo.style.display = "none";
      imagenamarillo.style.display = "block";

      alert("Game over fraca, perdiste");

      postEvent("actualizarVida", {
        idusuario: idusuario,
        iddragon: iddragon,
        vida: dragon.vida,
      }, (data) => {
        if (data.exito) {
          localStorage.setItem("dragonardo", JSON.stringify(data.progreso));
        }
      });
    }, 800);

    return true;
  }

  if (amarillo.vidaAmarillo <= 0) {
    batallaTerminada = true;
    deshabilitarAtaques();

    setTimeout(() => {
      gifChimuelo.style.display = "none";
      imagenchimuelo.style.display = "block";
      gifAmarillo.style.display = "none";
      imagenamarillo.style.display = "block";

      alert("¡Ganaste brooo!");

      let expGanada = 50;
      postEvent("sumarexperiencia", {
        iddragon: iddragon,
        cantidad: expGanada,
        idusuario: idusuario
      }, (data) => {
        console.log(data.mensaje);
        console.log("Nuevo nivel:", data.progreso.nivel);
        localStorage.setItem("dragonardo", JSON.stringify(data.progreso));
      });
    }, 800);

    return true;
  }

  return false;
}

function ataqueUsuario(i) {
  if (batallaTerminada) return;

  let ataque = dragon.ataques[i];
  if (!ataque) return;

  gifChimuelo.style.display = "block";
  imagenchimuelo.style.display = "none";

  let daño = ataque.daño + dragon.fuerza;
  amarillo.vidaAmarillo -= daño;
  if (amarillo.vidaAmarillo < 0) amarillo.vidaAmarillo = 0;

  barravidaEnemigo.innerText = amarillo.vidaAmarillo;

  console.log(`Ataque del usuario: ${daño}, vida rival: ${amarillo.vidaAmarillo}`);

  if (checkFinDeBatalla()) return;

  terminarTurno();
}

function ataqueEnemigo() {
  if (batallaTerminada) return;

  setTimeout(() => {
    if (batallaTerminada) return;

    gifAmarillo.style.display = "block";
    imagenamarillo.style.display = "none";

    let daño = 20;
    dragon.vida -= daño;
    if (dragon.vida < 0) dragon.vida = 0;

    barravidaUsuario.innerText = dragon.vida;

    console.log(`Ataque enemigo: ${daño}, vida dragón: ${dragon.vida}`);

    checkFinDeBatalla();
    terminarTurno2();
  }, 2000);
}

function terminarTurno() {
  setTimeout(() => {
    gifChimuelo.style.display = "none";
    imagenchimuelo.style.display = "block";
  }, 1500);
  ataqueEnemigo();
}

function terminarTurno2() {
  setTimeout(() => {
    gifAmarillo.style.display = "none";
    imagenamarillo.style.display = "block";
  }, 1500);

  if (amarillo.vidaAmarillo <= 30) {
    desbloquearBoton();
  } else {
    bloquearboton();
  }
}

function deshabilitarAtaques() {
  ataque1.disabled = true;
  ataque2.disabled = true;
  ataque3.disabled = true;
  ataque4.disabled = true;
}

BotonAdopcion.addEventListener("click", () => {
  if (amarillo.vidaAmarillo >= 30) {
    BotonAdopcion.disabled = true;
  }
});

ataque1.addEventListener("click", () => ataqueUsuario(0));
ataque2.addEventListener("click", () => ataqueUsuario(1));
ataque3.addEventListener("click", () => ataqueUsuario(2));
ataque4.addEventListener("click", () => ataqueUsuario(3));