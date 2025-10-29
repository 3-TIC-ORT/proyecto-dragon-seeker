import fs from "fs"

const ruta = "./BACKEND/dragones.json"

function leerdragones () {
    const texto = fs.readFileSync(ruta)
    return JSON.parse(texto)
}

export function determinartipodragon(idzona, dificultad) {
    const data = leerdragones()
    const dragon = data.dragones.find(d => d.mapa === idzona)
    if (!dragon) {
        return {exito: false, mensaje: "No se encontro ningun dragon en esta zona"}
    }
    return {exito: true, tipo: dragon.tipo, nombre: dragon.nombre}
}
export function enviardatosdragon(iddragon, idusuario) {
    const
}
export function iniciarbatalledragon(idusuario, iddragon, ubicacion) {
    
}