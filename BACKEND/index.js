  import { startServer, subscribePOSTEvent } from "soquetic"
  import { registrarusuario, iniciarsesion, cerrarsesion } from "./BACKEND/autorizacion.js"
  import {
    guardarpersonalizacion, 
    cargarpersonalizacion, 
    validaropcionesdesbloqueadas, 
    agregaropciondesbloqueada 
  } from "./BACKEND/customizacion.js"
  

  subscribePOSTEvent("registrarusuario", data => {
    const { nombre, correo, contrasena } = data
    return registrarusuario(nombre, correo, contrasena)
  })

  subscribePOSTEvent("iniciarsesion", data => {
    const { correo, contrasena } = data
    return iniciarsesion(correo, contrasena)
  })

  subscribePOSTEvent("cerrarsesion", data => {
    const { idusuario } = data
    return cerrarsesion(idusuario)
  })

  subscribePOSTEvent("guardarpersonalizacion", data => {
    const { idusuario, ropa, accesorios, colorpiel, colorpelo, colorojos } = data
    return guardarpersonalizacion(idusuario, ropa, accesorios, colorpiel, colorpelo, colorojos)
  })
  
  subscribePOSTEvent("cargarpersonalizacion", data => {
    const { idusuario } = data
    return cargarpersonalizacion(idusuario)
  })
  
  subscribePOSTEvent("validaropcionesdesbloqueadas", data => {
    const { idusuario, tipoopcion, idopcion } = data
    return validaropcionesdesbloqueadas(idusuario, tipoopcion, idopcion)
  })
  
  subscribePOSTEvent("agregaropciondesbloqueada", data => {
    const { idusuario, tipoopcion, idopcion } = data
    return agregaropciondesbloqueada(idusuario, tipoopcion, idopcion)
  })

  startServer(3000, true)
