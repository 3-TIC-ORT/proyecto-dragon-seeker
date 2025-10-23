connect2Server()
let formRegistro = document.getElementById('formRegistro');
let mensajeRegistro = document.getElementById('mensaje2');
let ingresarRegistro = document.getElementById('botonIngresar2');

ingresarRegistro.addEventListener("click", (event) => {
    event.preventDefault();
    let mailRegistro = document.getElementById("usuario2").value;
    let contrasenaRegistro = document.getElementById("contraseña2").value;
    let nombre = document.getElementById("nombre").value;

    postEvent("registrarusuario", { nombre, mailRegistro, contrasenaRegistro }, (registro) => {
        if (registro.exito === false) {
            console.log(registro.mensaje);
            let container = document.createElement('p');
            container.innerText = registro.mensaje;
            mensaje.appendChild(container);
        } else if (registro.exito === true) {
            console.log(registro.mensaje);
            let container = document.createElement('p');
            container.innerText = registro.mensaje;
            mensaje.appendChild(container);
        }
    });
  });