// Menu principal: navega a las pantallas de login / registro existentes.
document.getElementById("btnIniciarSesion").addEventListener("click", () => {
  window.location.href = "../inicioSesion/inicioSesion.html";
});

document.getElementById("btnRegistrarse").addEventListener("click", () => {
  window.location.href = "../inicioSesion/registro.html";
});

// Icono "salir": vuelve al splash.
document.getElementById("iconoSalir").addEventListener("click", () => {
  window.location.href = "splash.html";
});
