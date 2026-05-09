connect2Server();
let formulario = document.getElementById("formLogin");
let mensaje = document.getElementById("mensaje");
let botoningresar = document.getElementById("botonIngresar");

botoningresar.addEventListener("click", (event) => {
  event.preventDefault();
  let correo = document.getElementById("usuario").value;
  let contrasena = document.getElementById("contraseña").value;

  postEvent("iniciarsesion", { correo, contrasena }, (idUsuario) => {
    if (idUsuario.exito === false) {
      console.log(idUsuario.mensaje);
      let container = document.createElement("p");
      container.innerText = idUsuario.mensaje;
      mensaje.appendChild(container);
    } else if (idUsuario.exito === true) {
      console.log(idUsuario.mensaje);
      let container = document.createElement("p");
      container.innerText = idUsuario.mensaje;
      mensaje.appendChild(container);
      localStorage.setItem("usuario", JSON.stringify(idUsuario.usuario));
      console.log(idUsuario.usuario);
      //direccionamiento hacia el juego
      window.location.href =
        "http://127.0.0.1:5501/FRONTEND-PEDRO/Phaser/RPG%20prueba/RPG%201/index.html";
    }
  });
});
