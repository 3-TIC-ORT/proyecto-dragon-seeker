import { startServer, subscribePOSTEvent, subscribeGETEvent } from "soquetic"
import { registrarusuario, iniciarsesion } from "./autorizacion.js"
import { guardarpersonalizacion, cargarpersonalizacion, validaropcionesdesbloqueadas } from "./customizacion.js"
import { enviarnotificacion, obtenernotificaciones } from "./notificaciones.js"
import { sumarexperiencia, verificarsubidanivel, desbloquearataques, aumentarestadisticas } from "./progresousuario.js"

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

subscribePOSTEvent("enviarnotificacion", data => {
  const { idusuario, mensaje } = data
  return enviarnotificacion(idusuario, mensaje)
})

subscribeGETEvent("obtenernotificaciones", data => {
  const { idusuario } = data
  return obtenernotificaciones(idusuario)
})

subscribePOSTEvent("sumarexperiencia", data => {
  const { iddragon, cantidad, idusuario } = data
  return sumarexperiencia(iddragon, cantidad, idusuario)
})

subscribeGETEvent("verificarsubidanivel", query => {
  const { iddragon, idusuario } = query
  return verificarsubidanivel(iddragon, idusuario)
})

subscribePOSTEvent("desbloquearataques", data => {
  const { iddragon, nivel, idusuario } = data
  return desbloquearataques(iddragon, nivel, idusuario)
})

subscribePOSTEvent("aumentarestadisticas", data => {
  const { iddragon, incremento, idusuario } = data
  return aumentarestadisticas(iddragon, incremento, idusuario)
})

console.log("Servidor iniciado")
startServer()
