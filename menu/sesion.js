// Cierre de sesion compartido por las pantallas de menu que tienen el icono
// "salir" (menu / jugar / partida). Requiere ../logros/overlay.js cargado antes.

// Borra los datos de la sesion en localStorage y vuelve a la pantalla de inicio.
function cerrarSesion() {
  for (const clave of [
    "usuario",
    "partida",
    "dragon_enemigo",
    "vidaFinalRival",
    "dragonardo",
    "origenInventario",
    "resultado",
  ]) {
    localStorage.removeItem(clave);
  }
  window.location.href = "splash.html";
}

// Icono "salir": si hay sesion activa pide confirmacion antes de cerrarla;
// si no hay sesion (ej. menu principal, previo al login) vuelve directo al inicio.
const iconoSalir = document.getElementById("iconoSalir");
if (iconoSalir) {
  iconoSalir.addEventListener("click", () => {
    if (!localStorage.getItem("usuario")) {
      window.location.href = "splash.html";
      return;
    }
    mostrarOverlayConfirmar({
      titulo: "¿Cerrar sesión?",
      detalle:
        "Los cambios de la partida en curso quedan guardados.\n¿Querés cerrar sesión?",
      textoConfirmar: "CERRAR SESIÓN",
      textoCancelar: "CANCELAR",
      onConfirmar: cerrarSesion,
    });
  });
}
