let BotonPelea = document.getElementById("pelear");
let BotonAdopcion = document.getElementById("adoptar");
let MenuAtaques = document.getElementById("menudeataques");
let MenuPrincipal = document.getElementById("menuPrincipal");
let BotonDragon = document.getElementById("botonDragon");
let BotonHuir = document.getElementById("botonHuir");
let VolverAtaques = document.getElementById("volverAtaques");
let ModalHuir = document.getElementById("modalHuir");
let ModalVolver = document.getElementById("modalVolver");
let ModalConfirmar = document.getElementById("modalConfirmar");
let nombreAccion = document.getElementById("nombreAccion");

// Nombre del dragon del usuario en la pregunta "¿Que hara X?"
let dragonardo = JSON.parse(localStorage.getItem("dragonardo"));
if (dragonardo && nombreAccion) {
  nombreAccion.innerText = dragonardo.nombre;
}

// LUCHAR -> mostrar submenu de ataques
function desplegarMenu() {
  MenuPrincipal.classList.add("oculto");
  MenuAtaques.classList.add("visible");
}
// Volver del submenu de ataques al menu principal
function volverAlMenu() {
  MenuAtaques.classList.remove("visible");
  MenuPrincipal.classList.remove("oculto");
}

BotonPelea.addEventListener("click", desplegarMenu);
VolverAtaques.addEventListener("click", volverAlMenu);

// DRAGON -> ir al inventario a elegir otro dragon (volviendo despues a la pelea)
BotonDragon.addEventListener("click", () => {
  localStorage.setItem("origenInventario", "pelea");
  window.location.href = "../inventario/inventario.html";
});

// HUIR -> abrir modal de confirmacion
BotonHuir.addEventListener("click", () => {
  ModalHuir.hidden = false;
});
ModalVolver.addEventListener("click", () => {
  ModalHuir.hidden = true;
});
ModalConfirmar.addEventListener("click", () => {
  window.location.href =
    "http://127.0.0.1:5501/FRONTEND-PEDRO/Phaser/RPG%20prueba/RPG%201/index.html";
});

export function desbloquearBoton() {
  BotonAdopcion.classList.remove("adoptarBloqueado");
  BotonAdopcion.classList.add("adoptarAbilitado");
}
export function bloquearboton() {
  BotonAdopcion.classList.remove("adoptarAbilitado");
  BotonAdopcion.classList.add("adoptarBloqueado");
}
