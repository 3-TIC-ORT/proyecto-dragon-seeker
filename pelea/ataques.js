let ataque1 = document.getElementById("ataque1");
let ataque2 = document.getElementById("ataque2");
let ataque3 = document.getElementById("ataque3");
let ataque4 = document.getElementById("ataque4");
let BotonAdopcion = document.getElementById("adoptar")
let barravidaChimuelo = document.getElementById("vida_chimuelo")
let barravidaAmarillo = document.getElementById("vida_amarillo")
let imagenamarillo = document.getElementById("amarillo")
let gifAmarillo = document.getElementById ("AtaqueAmarillo")
let imagenchimuelo = document.getElementById("chimuelo")
let gifChimuelo = document.getElementById("AtaqueChimuelo")

barravidaChimuelo.innerHTML = 100
barravidaAmarillo.innerHTML = 100

chimuelo = {
    name: 'chimuelo',
    viddaChimuelo: 100,
    strength: 10,
    defense: 9,
    speed: 6,
  };
  console.log(chimuelo)
  console.log(amarillo)
amarillo = {
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
    gifAmarillo.style.display = "block";
    imagenamarillo.style.display = "none";
    chimuelo.viddaChimuelo -= 20;
    console.log(chimuelo);
    barravidaChimuelo.innerText -= 20;
    terminarTurno2()
  }
  function terminarTurno (){
    gifChimuelo.style.display = "none";
    imagenchimuelo.style.display = "block";
    console.log ("termino el ataque")
    ataqueEnemigo()
  }
  function terminarTurno2 (){
    gifAmarillo.style.display = "none";
    imagenamarillo.style.display = "block";
    console.log ("termino el ataque enemigo")
    ataquechimuelo()
  }
  BotonAdopcion.addEventListener ('click', function(e){})
  if (vidaAmarillo >= 30) {
    e.preventDefault();
    bloquearboton();
  } else {
    botonNormal();
  }
  
  ataque1.addEventListener('click', ataquechimuelo);