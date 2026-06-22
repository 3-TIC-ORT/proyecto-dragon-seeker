let BotonPelea = document.getElementById("pelear");
let BotonAdopcion = document.getElementById("adoptar");
let MenuAtaques = document.getElementById("menudeataques");
let MenuPrincipal = document.getElementById("menuPrincipal");
let BotonHuir = document.getElementById("botonHuir");
let VolverAtaques = document.getElementById("volverAtaques");
let ModalHuir = document.getElementById("modalHuir");
let ModalVolver = document.getElementById("modalVolver");
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

// DRAGON y HUIR (la parte que guarda la vida y navega) las maneja ataques.js,
// que es donde vive el estado de la pelea (dragon activo, vida, idpartida).

// HUIR -> abrir modal de confirmacion
BotonHuir.addEventListener("click", () => {
  ModalHuir.hidden = false;
});
ModalVolver.addEventListener("click", () => {
  ModalHuir.hidden = true;
});

export function desbloquearBoton() {
  BotonAdopcion.classList.remove("adoptarBloqueado");
  BotonAdopcion.classList.add("adoptarAbilitado");
}
export function bloquearboton() {
  BotonAdopcion.classList.remove("adoptarAbilitado");
  BotonAdopcion.classList.add("adoptarBloqueado");
}
