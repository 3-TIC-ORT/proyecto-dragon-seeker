import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rutanotificaciones = path.join(__dirname, "notificaciones.json")

function leerarchivo(){
    if (!fs.existsSync(rutanotificaciones)) {
        fs.writeFileSync(rutanotificaciones, "{}", "utf-8")
    }
    const texto = fs.readFileSync(rutanotificaciones, "utf-8")
    return JSON.parse(texto)
}

function escribirarchivo(datos) {
    const texto = JSON.stringify(datos,null,2)
    fs.writeFileSync(rutanotificaciones,texto)
}

export function enviarnotificacion(idusuario, mensaje, tipo) {
    const notificaciones = leerarchivo()

    if (!notificaciones[idusuario]) {
        notificaciones[idusuario] = []
    }

    notificaciones[idusuario].push({ mensaje, tipo, fecha: new Date().toISOString() })

    escribirarchivo(notificaciones)
    return {exito: true, mensaje: "Notificacion enviada"}
}

export function obtenernotificaciones(idusuario, filtro) {
    const notificaciones = leerarchivo()
    const lista = notificaciones[idusuario] || []
    if (filtro) lista = lista.filter(n => n.tipo === filtro)
    return {exito: true, notificaciones: lista}
}