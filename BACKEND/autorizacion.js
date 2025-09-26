import fs from "fs"

const rutausuarios = "./BACKEND/usuarios.json"

function leerUsuarios() {
  if (!fs.existsSync(rutausuarios)) {
    return []
  }
  const data = fs.readFileSync(rutausuarios, "utf-8")
  return JSON.parse(data)
}

function guardarUsuarios(usuarios) {
  fs.writeFileSync(rutausuarios, JSON.stringify(usuarios, null, 2))
}

let usuarios = []
let sesiones = []

export function registrarusuario(nombre, correo, contrasena) {
    usuarios = leerUsuarios()

    if (usarios.find(u => u.correo === correo)) {
        return {exito: false, mensaje: "El correo ya esta registrado"}
    }

    let nuevousuario = {
        id: usuarios.length + 1,
        nombre,
        correo,
        cotrasena
    }

    usuarios.push(nuevousaurio)
    guardarUsuarios(usuarios)

    return {exito: true, mensaje : "Usuario registrado con exito", usuario:nuevousuario}
}

export function iniciarsesion(nombre, contrasena) {
    usuarios = leerUsuarios()

    const usuario = usarios.find(u => u.correo === correo && u.contrasena === contrasena)

    if (!usuario) {
        return {exito: false, mensaje: "Correo o contraseña incorrectos"}
    }

    sesiones.add(usuario.id)
    guardarUsuarios(usuarios)

    return {exito: true, mensaje: "Sesion iniciada", usuario}
}

export function cerrarsesion(idusuario) {
    usuarios = leerUsuarios()

    if (!sesiones.has(idusuario)) {
        return {exito: false, mensaje: "El usuario no tenia sesion activa"}
    }

    sesiones.delete(idusaurio)
    guardarUsuarios(usuarios)

    return {exito: true, mensaje: "Sesion cerrada"}
}
