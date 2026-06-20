// Pantalla post-login. El boton JUGAR lleva a elegir/crear partida.
document.getElementById("btnJugar").addEventListener("click", () => {
  window.location.href = "partida.html";
});

// Icono "salir": cierra la sesion (vuelve al menu principal).
document.getElementById("iconoSalir").addEventListener("click", () => {
  window.location.href = "menu.html";
});
