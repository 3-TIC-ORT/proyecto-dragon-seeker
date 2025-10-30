import fs from "fs"

const ruta = "./dragones.json"

function leerdragones () {
    const texto = fs.readFileSync(ruta, "utf-8 ")
    return JSON.parse(texto)
}

export function determinartipodragon(idzona, dificultad) {
    const data = leerdragones()
    const dragon = data.dragones.find(d => d.mapa === idzona)
    if (!dragon) {
        return {exito: false, mensaje: "No se encontro ningun dragon en esta zona."}
    }
    return {exito: true, tipo: dragon.tipo, nombre: dragon.nombre}
}
export function enviardatosdragon(iddragon, idusuario) {
    const data = leerdragones()
    const dragon = data.dragones.find(d => d.id === iddragon)
    if (!dragon) {
        return {exito: false, mensaje: "No se econtro el dragon pedido."}
    }
    return {exito: true, dragon}
}

export function iniciarbatalledragon(idusuario, iddragon, ubicacion) {
    const data = leerdragones()
    const dragon = data.dragones.find(d => d.id === iddragon)
    if (!dragon) {
        return {exito: false, mensaje: "No se encontro el dragon para la batalla."}
    }
    const batalla = {
        idusuario,
        ubicacion,
        dragon: {
            nombre: dragon.nombre,
            tipo: dragon.tipo,
            vida: dragon.vida,
            fuerza: dragon.fuerza,
            ataques: dragon.ataques
        }
    }
    return {exito: true, mensaje: "Batalla bien iniciada", batalla}
}

export function obtenerlistadragones() {
    const data = leerdragones()
    return { exito: true, dragones: data.dragones }
}
    