connect2Server()
let formRegistro = document.getElementById('formRegistro');
let mensajeRegistro = document.getElementById('mensaje2');
let ingresarRegistro = document.getElementById('botonIngresar2');

let enviandoRegistro = false;

ingresarRegistro.addEventListener("click", (event) => {
    event.preventDefault();
    if (enviandoRegistro) return;

    let correo = document.getElementById("usuario2").value;
    let contrasena= document.getElementById("contraseña2").value;
    let nombre = document.getElementById("nombre").value;

    enviandoRegistro = true;
    ingresarRegistro.disabled = true;
    mensajeRegistro.textContent = "";

    postEvent("registrarusuario", { nombre, correo, contrasena }, (registro) => {
        enviandoRegistro = false;
        ingresarRegistro.disabled = false;

        mensajeRegistro.textContent = registro.mensaje;

        if (registro.exito === true) {
            localStorage.setItem("usuario", JSON.stringify(registro.usuario));
            //direccionamiento directo hacia la pantalla de Jugar, sin pasar por inicio de sesion
            window.location.href = "../menu/jugar.html";
        }
    });
  });