connect2Server();

let dragones = [];
let usuario = JSON.parse(localStorage.getItem("usuario"));
if (!usuario) {
  alert("No hay usuario registrado, logueate");
  //window.location.href = '..inicioSesion/inicioSesion.html';
}

const containerDragon = document.getElementById("dragonContainer");

getEvent("obtenerDragones", (data) => {
  dragones = data.dragones;
  mostrarDragones();
});

function mostrarDragones() {
  containerDragon.innerHTML = "";

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
  }
}

function guardarEnLocalStorage(e) {
  let tarjeta = e.target.closest(".tarjeta");
  if (tarjeta) {
    let indice = tarjeta.dataset.index;
    let dragon = dragones[indice];
    localStorage.setItem("dragonardo", JSON.stringify(dragon));
    console.log(dragon);
  }
}

containerDragon.addEventListener("click", guardarEnLocalStorage);
