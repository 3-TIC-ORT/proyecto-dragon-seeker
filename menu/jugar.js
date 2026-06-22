// Pantalla post-login. El boton JUGAR lleva a elegir/crear partida.
document.getElementById("btnJugar").addEventListener("click", () => {
  window.location.href = "partida.html";
});

// El icono "salir" (cerrar sesion) lo maneja sesion.js (compartido).
