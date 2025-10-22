
let formulario = document.getElementById('formLogin');
let mensaje = document.getElementById('mensaje');
let contraseña = document.getElementById ("contraseña")
let correo = document.getElementById ("usuario")
postEvent("login", { correo, contraseña }, (idUsuario) => {
    if (idUsuario.exito === false) {
        console.log(idUsuario.mensaje);
    }
    else if (idUsuario.exito === true) {
        console.log(idUsuario.mensaje);
}});