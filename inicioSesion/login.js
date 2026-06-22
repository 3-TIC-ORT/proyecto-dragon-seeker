connect2Server();
let formulario = document.getElementById("formLogin");
let mensaje = document.getElementById("mensaje");
let botoningresar = document.getElementById("botonIngresar");

let enviandoLogin = false;

botoningresar.addEventListener("click", (event) => {
  event.preventDefault();
  if (enviandoLogin) return;

  let nombre = document.getElementById("usuario").value;
  let contrasena = document.getElementById("contraseña").value;

  enviandoLogin = true;
  botoningresar.disabled = true;
  mensaje.textContent = "";

  postEvent("iniciarsesion", { nombre, contrasena }, (idUsuario) => {
    enviandoLogin = false;
    botoningresar.disabled = false;

    mensaje.textContent = idUsuario.mensaje;

    if (idUsuario.exito === true) {
      localStorage.setItem("usuario", JSON.stringify(idUsuario.usuario));
      //direccionamiento hacia la pantalla de Jugar (elegir/crear partida)
      window.location.href = "../menu/jugar.html";
    }
  });
});
