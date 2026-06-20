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
      //direccionamiento hacia la pantalla de Jugar (elegir/crear partida)
      window.location.href = "../menu/jugar.html";
    }
  });
});
