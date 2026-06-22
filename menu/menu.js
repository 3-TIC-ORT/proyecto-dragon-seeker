// Menu principal: navega a las pantallas de login / registro existentes.
document.getElementById("btnIniciarSesion").addEventListener("click", () => {
  window.location.href = "../inicioSesion/inicioSesion.html";
});

document.getElementById("btnRegistrarse").addEventListener("click", () => {
  window.location.href = "../inicioSesion/registro.html";
});

// El icono "salir" lo maneja sesion.js (compartido). En el menu principal,
// como todavia no hay sesion, simplemente vuelve al splash.
