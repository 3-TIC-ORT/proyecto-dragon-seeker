let ataque1 = document.getElementById("ataque1");
let ataque2 = document.getElementById("ataque2");
let ataque3 = document.getElementById("ataque3");
let ataque4 = document.getElementById("ataque4");
let chimuelo = {
    name: 'chimuelo',
    health: 100,
    strength: 10,
    defense: 9,
    speed: 6,
  };
  console.log(chimuelo)
  console.log(amarillo)
  let amarillo = {
    name: 'amarillo',
    health: 100,
    strength: 8,
    defense: 7,
    speed: 7,
  };
  function ataquechimuelo (){
   

    console.log(amarillo)
  }
  whoGoFirst(chimuelo, amarillo);
  document.querySelector('ataque1').addEventListener('click', ataquechimuelo () {
    chimueloTurn(chimuelo, amarillo);
  });