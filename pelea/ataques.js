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

let usuario = JSON.parse(localStorage.getItem("usuario"))
console.log (usuario)
let idusuario = usuario.id
let dragon = JSON.parse(localStorage.getItem("dragonardo"));
console.log (dragon)
let iddragon = dragon.id

barravidaUsuario.innerHTML = dragon.vida
barravidaEnemigo.innerHTML = 100

ataque1.innerText = dragon.ataques[0]?.nombre || "Sin ataque";
ataque2.innerText = dragon.ataques[1]?.nombre || "Sin ataque";
ataque3.innerText = dragon.ataques[2]?.nombre || "Sin ataque";
ataque4.innerText = dragon.ataques[3]?.nombre || "Sin ataque";
let amarillo = {
    name: 'amarillo',
    vidaAmarillo: 100,
    strength: 8,
    defense: 7,
    speed: 7,
  };
  function ataqueUsuario (i){
    let ataque = dragon.ataques[i]; 
    if (!ataque) return;
    gifChimuelo.style.display = "block";
    imagenchimuelo.style.display = "none";
    let daño = ataque.daño + dragon.fuerza;
    amarillo.vidaAmarillo -= daño;
    console.log(amarillo);
    barravidaEnemigo.innerText = amarillo.vidaAmarillo;
    terminarTurno()
  }
  function ataqueEnemigo (){
    setTimeout(() => {
    gifAmarillo.style.display = "block";
    imagenamarillo.style.display = "none";
    dragon.vida -= 20;
    console.log(dragon);
    barravidaUsuario.innerText = dragon.vida;
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

    if (dragon.vida <= 0 || amarillo.vidaAmarillo <= 0) {
      console.log("termino la pelea")
      [ataque1, ataque2, ataque3, ataque4].disabled = true;
      if (dragon.vida <= 0 && amarillo.vidaAmarillo >= 0){
        alert("game over fraca, perdiste")
        postEvent("actualizarVida", { vida }, () => {
      })}
      else if (dragon.vida >= 0 && amarillo.vidaAmarillo <= 0){
        alert("ganaste brooo")
        let expGanada = 50;
        postEvent("sumarexperiencia", {iddragon: iddragon, cantidad: expGanada, idusuario: idusuario}, (data) => {
          console.log(data.mensaje)
          console.log("nuevo nivel:", data.progreso.nivel)
          console.log("Ataques desbloqueados:", data.progreso.desbloqueados);
          localStorage.setItem("dragonardo", JSON.stringify(data.progreso));
        })
      }
    }
  }
    //window.location.href = '.RPG 1/index.html';
  //}
  BotonAdopcion.addEventListener ('click', () =>{
  if (amarillo.vidaAmarillo >= 30) {
    BotonAdopcion.disabled = true;
  }})
  
  ataque1.addEventListener('click', () => ataqueUsuario(0));
  ataque2.addEventListener('click', () => ataqueUsuario(1));
  ataque3.addEventListener('click', () => ataqueUsuario(2));
  ataque4.addEventListener('click', () => ataqueUsuario(3));