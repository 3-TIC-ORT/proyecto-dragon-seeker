import fs from "fs"

const rutausuarios = "./BACKEND/usuarios.json"

function leerarchivo() {
  const texto = fs.readFileSync(rutausuarios, "utf-8")
  return JSON.parse(texto)
}

function escribirarchivo(usuarios) {
  const texto = JSON.stringify(usuarios, null, 2)
  fs.writeFileSync(rutausuarios, texto)
}

export function guardarpersonalizacion(idusuario, ropa, accesorios, colorpiel, colorojos, colorpelo) {
  const usuarios = leerarchivo()

  if (!usuarios[idusuario]) {
    usuarios[idusuario] = {
      ropa: "default",
      accesorios: "default",
      colorpiel: "default",
      colorpelo: "default",
      colorojos: "default",
      opcionesdesbloqueadas: []
    }
  }

  usuarios[idusuario].ropa = ropa
  usuarios[idusuario].accesorios = accesorios
  usuarios[idusuario].colorojos = colorojos
  usuarios[idusuario].colorpelo = colorpelo
  usuarios[idusuario].colorpiel = colorpiel

  escribirarchivo(usuarios)

  return { exito: true, mensaje: "Personalizacion guardada con exito" }
}

export function cargarpersonalizacion(idusuario) {
  const usuarios = leerarchivo()

  if (!usuarios[idusuario]) {
    return { exito: false, mensaje: "Usuario no encontrado" }
  }

  return { exito: true, personalizacion: usuarios[idusuario] }
}

export function validaropcionesdesbloqueadas(idusuario, tipoopcion, idopcion) {
  const usuarios = leerarchivo()

  if (!usuarios[idusuario]) {
    return { exito: false, mensaje: "Usuario no encontrado" }
  }

  let i = 0
  let desbloqueada = false
  const clave = tipoopcion + "-" + idopcion

  while (i < usuarios[idusuario].opcionesdesbloqueadas.length) {
    if (usuarios[idusuario].opcionesdesbloqueadas[i] === clave) {
      desbloqueada = true
    }
    i = i + 1
  }

  if (desbloqueada) {
    return { exito: true, mensaje: "Opcion desbloqueada" }
  } else {
    return { exito: false, mensaje: "Opcion no desbloqueada" }
  }
}
