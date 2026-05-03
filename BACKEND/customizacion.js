import fs from "fs"

const rutapersonalizacion = "./BACKEND/personalizacion.json"

function leerarchivo() {
  const texto = fs.readFileSync(rutapersonalizacion, "utf-8")
  return JSON.parse(texto)
}

function escribirarchivo(usuarios) {
  const texto = JSON.stringify(usuarios, null, 2)
  fs.writeFileSync(rutapersonalizacion, texto)
}

export function guardarpersonalizacion(idusuario, ropa, accesorios, colorpiel, colorojos, colorpelo) {
  const usuarios = leerarchivo()
  const clave = String(idusuario)

  if (!usuarios[clave]) {
    usuarios[clave] = {
      ropa: "default",
      accesorios: "default",
      colorpiel: "default",
      colorpelo: "default",
      colorojos: "default",
      opcionesdesbloqueadas: []
    }
  }

  usuarios[clave].ropa = ropa
  usuarios[clave].accesorios = accesorios
  usuarios[clave].colorojos = colorojos
  usuarios[clave].colorpelo = colorpelo
  usuarios[clave].colorpiel = colorpiel

  escribirarchivo(usuarios)
  return { exito: true, mensaje: "Personalizacion guardada con exito" }
}

export function cargarpersonalizacion(idusuario) {
  const usuarios = leerarchivo()
  const clave = String(idusuario)

  if (!usuarios[clave]) {
    return { exito: false, mensaje: "Usuario no encontrado" }
  }

  return { exito: true, personalizacion: usuarios[clave] }
}

export function validaropcionesdesbloqueadas(idusuario, tipoopcion, idopcion) {
  const usuarios = leerarchivo()
  const clave = String(idusuario)

  if (!usuarios[clave]) {
    return { exito: false, mensaje: "Usuario no encontrado" }
  }

  let i = 0
  let desbloqueada = false
  const claveopcion = tipoopcion + "-" + idopcion

  while (i < usuarios[clave].opcionesdesbloqueadas.length) {
    if (usuarios[clave].opcionesdesbloqueadas[i] === claveopcion) {
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
