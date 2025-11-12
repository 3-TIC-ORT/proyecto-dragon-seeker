import fs from "fs"

const ruta = "./dragones.json"
const rutaprogreso = "./progreso.json"

function leerdragones () {
    const texto = fs.readFileSync(ruta, "utf-8")
    return JSON.parse(texto)
}

function leerprogreso() {
    const texto = fs.readFileSync(rutaprogreso, "utf-8")
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
        return {exito: false, mensaje: "No se encontro el dragon pedido."}
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
    const base = leerdragones()
    const progreso = leerprogreso()

    const dragonesactualizados = base.dragonesy.map( d => {
        const prog = progreso.find(p => p.dragon === d.id)

        if (!prog) return d

        return{
            ...d,
            nivel: prog.nivel,
            exp: prog.exp,
            vida: prog.vida,
            daño: prog.daño,
            ataques: prog.ataques,
            desbloqueados: prog.desbloqueados
        }
    })
    // Modificar los dragones base en base al progreso LABURAR
    return { exito: true, dragones: dragonesactualizados}
}
    