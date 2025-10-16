import fs from "fs"

const rutausuarios = "./BACKEND/usuarios.json"

function leerusuarios() {
    const texto = fs.readFileSync(rutausuarios)
    return JSON.parse(texto) 
}

function guardarusuarios(usuarios) {
    const texto = JSON.stringify(usuarios, null, 2)
    fs. writeFileSync(rutausuarios, texto)
}

let sesiones = []

export function registrarusuario(nombre, correo, contrasena) {
    const usuarios = leerusuarios()

    let existe = false 
    let i = 0
    while (i < usuarios.length) {
        if (usuarios[i].correo === correo) {
            existe = true 
        }
        i = i + 1
    }

    if (existe) {
        return { exito: false, mensaje: "El correo ya esta registrado"}
    }

    const nuevo = {
        id: usuarios.length + 1,
        nombre: nombre,
        correo: correo,
        contrasena: contrasena
    }

    usuarios.push(nuevo)
    guardarusuarios(usuarios)

    return { exito: true, mensaje: "Usuario registrado con exito", usuario: nuevo }
}

export function iniciarsesion(correo, contrasena) {
    const usuarios = leerusuarios()

    let usuario = null
    let i = 0
    while (i < usuarios.length) {
        if (usuarios[i].correo === correo && usuarios[i].contrasena === contrasena) {
            usuario = usuarios[i]
        }
    i = i + 1
        }


if (usuario === null) {
    return { exito: false, mensaje: "Correo o contraseña incorrectos"}
}

return { exito: true, mensaje: "Sesion iniciada", usuario: usuario }
}
