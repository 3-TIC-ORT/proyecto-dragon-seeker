import { startServer, subscribePOSTEvent, subscribeGETEvent } from "soquetic"
import { registrarusuario, iniciarsesion } from "./autorizacion.js"
import { guardarpersonalizacion, cargarpersonalizacion, validaropcionesdesbloqueadas } from "./customizacion.js"

subscribePOSTEvent("registrarusuario", data => {
  const { nombre, correo, contrasena } = data
  return registrarusuario(nombre, correo, contrasena)
})

subscribePOSTEvent("iniciarsesion", data => {
  const { correo, contrasena } = data
  return iniciarsesion(correo, contrasena)
})

subscribePOSTEvent("guardarpersonalizacion", data => {
  const { idusuario, ropa, accesorios, colorpiel, colorojos, colorpelo } = data
  return guardarpersonalizacion(idusuario, ropa, accesorios, colorpiel, colorojos, colorpelo)
})

subscribeGETEvent("cargarpersonalizacion", query => {
  const { idusuario } = query
  return cargarpersonalizacion(idusuario)
})

subscribeGETEvent("validaropcionesdesbloqueadas", query => {
  const { idusuario, tipoopcion, idopcion } = query
  return validaropcionesdesbloqueadas(idusuario, tipoopcion, idopcion)
})

console.log("Servidor iniciado")
startServer(3000, true)
