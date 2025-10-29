/*
    Cargar comidas en memoria desde el JSON
*/
//postEvent("infoDragones", { nombre, tipo, nivel, vida, fuerza, especial, mapa }, (dragon) => {
//fetch('./BACKEND/dragones.json')          // Ruta al archivo JSON
  //.then(response => response.json())  // Convertir la respuesta en JSON
  //.then(data => {                     // Aquí tienes acceso al JSON en formato de objeto JS
   // console.log('dragones cargadas desde JSON:');
   // console.log(data);
  //  dragones = data;                   // Asignar el JSON a la variable comidas
  //  mostrarDragones()
 // }).catch(error => {                   // Manejo de errores al leer el archivo JSON
 //   console.error('Error al leer el archivo JSON:', error);
 // });

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
    viddaChimuelo: 100,
    strength: 10,
    defense: 9,
    speed: 6,
  }
function guardarEnLocalStorage (){
  localStorage.setItem("datotrucho", dragontrucho);
  console.log(dragontrucho)
}

botontrucho.addEventListener('click', guardarEnLocalStorage);