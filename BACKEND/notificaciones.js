import fs from "fs"

const rutanotificaciones = "./BACKEND/notificaciones.json"

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

    notificaciones[idusuario].push(mensaje)

    escribirarchivo(notificaciones)
    return {exito: true, mensaje: "Notificacion enviada"}
}

export function obtenernotificaciones(idusuario, filtro) {
    const notificaciones = leerarchivo()
    const lista = notificaciones[idusuario] || []
    return {exito: true, notificaciones: lista}
}