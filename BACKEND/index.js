import { startServer, subscribePOSTEvent, subscribeGETEvent } from "soquetic"
import { registrarusuario, iniciarsesion } from "./autorizacion.js"
import { guardarpersonalizacion, cargarpersonalizacion, validaropcionesdesbloqueadas } from "./customizacion.js"
import { enviarnotificacion, obtenernotificaciones } from "./notificaciones.js"
import { sumarexperiencia, verificarsubidanivel, desbloquearataques, aumentarestadisticas } from "./progresousuario.js"
import { elegirataqueenemigo, aplicarbbeneficiosdebilidades, obtenerataquesdisponibles } from "./batalla_ataques.js"
import { determinartipodragon, enviardatosdragon, iniciarbatalledragon, obtenerlistadragones } from "./dragones.js"
import { objeto, obtenerdatosobjeto } from "./items.js"
//lo puse yo (doble)


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

subscribeGETEvent("obtenernotificaciones", query => {
  const { idusuario } = query
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

subscribeGETEvent("elegirataqueenemigonormal", query => {
  return elegirataqueenemigo({ tipo: query.tipo, nivel: Number(query.nivel), esBoss: false })
})

subscribeGETEvent("elegirataqueboss", query => {
  const bossEstado = { soplido: Number(query.soplido || 0), daga: Number(query.daga || 0) }
  return elegirataqueenemigo({ esBoss: true, bossId: Number(query.bossId), bossEstado })
})

subscribePOSTEvent("modificadorportipo", data => {
  const mod = aplicarbbeneficiosdebilidades(data.tipoataque, data.tipodefensor, Number(data.base))
  return { exito: true, modificador: mod }
})

subscribeGETEvent("ataquesdisponibles", query => {
  const lista = obtenerataquesdisponibles(query.tipo, Number(query.nivel))
  return { exito: true, ataques: lista }
})

subscribeGETEvent("obtenerTipodragon", query => {
  const { idzona, dificultad } = query
  return determinartipodragon(Number(idzona), dificultad)
})

subscribeGETEvent("obtenerdragon", query => {
  const { iddragon, idusuario } = query
  return enviardatosdragon(Number(iddragon), Number(idusuario))
})

subscribePOSTEvent("iniciarbatalla", data => {
  const { idusuario, iddragon, ubicacion } = data
  return iniciarbatalledragon(Number(idusuario), Number(iddragon), ubicacion)
})

subscribeGETEvent("obtenerdragones", () => {
  return obtenerlistadragones()
})

subscribePOSTEvent("crearobjeto", data => {
  const { nombre, tipo, efectos, rareza } = data
  return objeto(nombre, tipo, efectos, rareza)
})

subscribeGETEvent("obtenerobjeto", query => {
  const { idobjeto } = query
  return obtenerdatosobjeto(Number(idobjeto))
})

console.log("Servidor iniciado")
startServer()