connect2Server()
let formRegistro = document.getElementById('formRegistro');
let mensajeRegistro = document.getElementById('mensaje2');
let ingresarRegistro = document.getElementById('botonIngresar2');

ingresarRegistro.addEventListener("click", (event) => {
    event.preventDefault();
    let correo = document.getElementById("usuario2").value;
    let contrasena= document.getElementById("contraseña2").value;
    let nombre = document.getElementById("nombre").value;

    postEvent("registrarusuario", { nombre, correo, contrasena }, (registro) => {
        if (registro.exito === false) {
            console.log(registro.mensaje);
            let container = document.createElement('p');
            container.innerText = registro.mensaje;
            mensajeRegistro.appendChild(container);
        } else if (registro.exito === true) {
            console.log(registro.mensaje);
            let container = document.createElement('p');
            container.innerText = registro.mensaje;
            mensajeRegistro.appendChild(container);
        }
    });
  });