/*
    Cargar comidas en memoria desde el JSON
*/
getEvent("infoDragones", { nombre, tipo, nivel, vida, fuerza, especial, mapa }, (dragon) => {
  //  dragones = data;                   // Asignar el JSON a la variable comidas
  //  mostrarDragones()
})

//let dragones = [];
//const container = document.getElementById('dragonContainer');

//function mostrarDragones(){
 // dragones.forEach(dragon=> {
 //   container.innerHTML += `
 //     <div class = "tarjeta">
  //    <h4>${dragon.nombre}</h4>
  //    <p>${dragon.tipo}</p>
  //    <p>${dragon.nivel}</p>
   //   <p>${dragon.vida}</p>
   //   <p>${dragon.fuerza}</p>
   //   <p>${dragon.especial}</p>
   //   <p>${dragon.mapa}</p>
   //   </div>
   // `})}
let botontrucho = document.getElementById("botontrucho");
  let dragontrucho = {
    nombre: 'chimuelo',
    viddaChimuelo: 200,
    strength: 10,
    defense: 9,
    speed: 6,
  }
function guardarEnLocalStorage (){
  localStorage.setItem("datotrucho", JSON.stringify(dragontrucho));
  console.log(dragontrucho)
}

botontrucho.addEventListener('click', guardarEnLocalStorage);