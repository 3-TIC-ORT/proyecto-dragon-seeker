import { bloquearboton } from './pelea.js';
import { desbloquearBoton } from './pelea.js';
let ataque1 = document.getElementById("ataque1");
let ataque2 = document.getElementById("ataque2");
let ataque3 = document.getElementById("ataque3");
let ataque4 = document.getElementById("ataque4");
let BotonAdopcion = document.getElementById("adoptar")
let barravidaUsuario = document.getElementById("vida_chimuelo")
let barravidaEnemigo = document.getElementById("vida_amarillo")
let imagenamarillo = document.getElementById("amarillo")
let gifAmarillo = document.getElementById ("AtaqueAmarillo")
let imagenchimuelo = document.getElementById("chimuelo")
let gifChimuelo = document.getElementById("AtaqueChimuelo")

let dragontrucho = JSON.parse(localStorage.getItem("datotrucho"));
console.log (dragontrucho)

barravidaUsuario.innerHTML = dragontrucho.viddaChimuelo
barravidaEnemigo.innerHTML = 100

let chimuelo = {
    name: 'chimuelo',
    viddaChimuelo: 100,
    strength: 10,
    defense: 9,
    speed: 6,
  };
let amarillo = {
    name: 'amarillo',
    vidaAmarillo: 100,
    strength: 8,
    defense: 7,
    speed: 7,
  };
  function ataquechimuelo (){
    gifChimuelo.style.display = "block";
    imagenchimuelo.style.display = "none";
    amarillo.vidaAmarillo -= 30;
    console.log(amarillo);
    barravidaAmarillo.innerText -= 30;
    terminarTurno()
  }
  function ataqueEnemigo (){
    setTimeout(() => {
    gifAmarillo.style.display = "block";
    imagenamarillo.style.display = "none";
    chimuelo.viddaChimuelo -= 20;
    console.log(chimuelo);
    barravidaChimuelo.innerText -= 20;
    terminarTurno2()
    }, 2000);
  }
  function terminarTurno (){
    setTimeout(() => {
      gifChimuelo.style.display = "none";
      imagenchimuelo.style.display = "block";
    }, 1500);
    console.log ("termino el ataque")
    ataqueEnemigo()
  }
  function terminarTurno2 (){
    setTimeout(() => {
    gifAmarillo.style.display = "none";
    imagenamarillo.style.display = "block";
    }, 1500);
    if (amarillo.vidaAmarillo <= 30) {
      console.log("desbloquear")
      desbloquearBoton();
    }
    else {
      bloquearboton()
    }
    console.log ("termino el ataque enemigo")
  }
  BotonAdopcion.addEventListener ('click', function(e){
  if (amarillo.vidaAmarillo >= 30) {
    e.preventDefault();
  }})
  
  
  ataque1.addEventListener('click', ataquechimuelo);