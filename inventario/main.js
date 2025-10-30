let dragones = [];
getEvent("obtenerDragones", {}, (data) => {
  dragones = data;                   // Asignar el JSON a la variable dragones
  mostrarDragones()
})

const containerDragon = document.getElementById('dragonContainer');

function mostrarDragones() {
containerDragon.innerHTML = ""; // Limpia antes de agregar
for (let i = 0; i < dragones.length; i++) {
  let dragon = dragones[i];
  let tarjeta = document.createElement("div");
  tarjeta.classList.add("tarjeta");
  tarjeta.dataset.index = i;
    if (dragon.especial === true) {
      tarjeta.classList.add("dragonEspecial");
    } else {
      tarjeta.classList.add("dragonNormal");
    }
  tarjeta.innerHTML = `
    <h4>${dragon.nombre}</h4>
    <p>Tipo: ${dragon.tipo}</p>
    <p>Nivel: ${dragon.nivel}</p>
    <p>Vida: ${dragon.vida}</p>
    <p>Fuerza: ${dragon.fuerza}</p>
    <p>Mapa: ${dragon.mapa}</p>
    `;
    containerDragon.appendChild(tarjeta);
  };
 }
function guardarEnLocalStorage(e){
  let tarjeta = e.target.closest(".tarjeta");
  if (tarjeta) {
    let indice = tarjeta.dataset.index;  // índice del dragón clickeado
    let dragon = dragones[indice];  
  localStorage.setItem("dragonardo", JSON.stringify(dragon));
  console.log(dragon)
 }
}

containerDragon.addEventListener('click', guardarEnLocalStorage);