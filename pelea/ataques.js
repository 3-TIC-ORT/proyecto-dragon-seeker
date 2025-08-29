let ataque1 = document.getElementById("ataque1");
let ataque2 = document.getElementById("ataque2");
let ataque3 = document.getElementById("ataque3");
let ataque4 = document.getElementById("ataque4");
let barravidaChimuelo = document.getElementById("vida_chimuelo")
let barravidaAmarillo = document.getElementById("vida_amarillo")
let amarillo = document.getElementById("amarillo")
let imagenchimuelo = document.getElementById("chimuelo")
let gifChimuelo = document.getElementById("AtaqueChimuelo")

barravidaChimuelo.innerHTML = "100"
barravidaAmarillo.innerHTML = "100"

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
    vidaAmarillo - 30;
    console.log(amarillo)
  }
  
  ataque1.addEventListener('click', ataquechimuelo);