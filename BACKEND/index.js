import { startServer, subscribePOSTEvent } from "soquetic"
import { registrarusuario, iniciarsesion, cerrarsesion } from "./BACKEND/autorizacion.js"

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

startServer(3000, true)
