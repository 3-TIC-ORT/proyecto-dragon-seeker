let ataque1 = document.getElementById("ataque1");
let ataque2 = document.getElementById("ataque2");
let ataque3 = document.getElementById("ataque3");
let ataque4 = document.getElementById("ataque4");
let vidaChimuelo = document.getElementById("vida_chimuelo")
let vidaAmarillo = document.getElementById("vida_amarillo")
let amarillo = document.getElementById("amarillo")
let chimuelo = document.getElementById("chimuelo")

vidaChimuelo.innerHTML = "100"
vidaAmarillo.innerHTML = "100"

chimuelo = {
    name: 'chimuelo',
    health: 100,
    strength: 10,
    defense: 9,
    speed: 6,
  };
  console.log(chimuelo)
  console.log(amarillo)
amarillo = {
    name: 'amarillo',
    health: 100,
    strength: 8,
    defense: 7,
    speed: 7,
  };
  function ataquechimuelo (){
    vidaAmarillo - 30;
    console.log(vidaAmarillo)
  }
  
  ataque1.addEventListener('click', ataquechimuelo);