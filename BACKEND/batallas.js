import fs from "fs"
import { subscribeGETEvent, subscribePOSTEvent, realTimeEvent, startServer } from "soquetic";

const rutausuarios = "./usuarios.json"

function leerusuarios() {
    const texto = fs.readFileSync(rutausuarios)
    return JSON.parse(texto)
}
function guardarusuarios() {
    const texto = JSON.stringify(usuarios,null,2)
    fs.writeFileSync(rutausuarios, texto) 
}

export function procesarataque(idbatalla, idjugador, ataque, objetivo) {
    const usuarios = leerusuarios()
    let i = 0
    let jugador = undefined

    while( i < usuarios.length) {
        if (usuarios[i].id === idjugador) {
            jugador = usuarios[i]
        }
        i = i + 1 
    }
    if (jugador === undefined) {
        return{exito: false, mensaje: "Usuario no encontrado"}
    }
    return {exito: true, mensaje: "Ataque realizado", VIDARESTANTE: objetivo.vida}
}

export function aplicarbbeneficiosdebilidades(tipoataque, tipodefensor, modificador) {
    const relaciones = {
        tierra: {efectivo: "electrico", debil: ["agua", "hielo"] },
        fuego: {efectivo: "hielo", debil: ["agua"] },
        hielo: {efectivo: "tierra", debil: ["fuego"] },
        electrico: {efectivo: "electrico", debil: ["tierra"] },
        agua: {efectivo: "electrico", debil: ["electrico"] }
    }
    let multiplicador = 1
    const rel = relaciones[tipoataque]

    if (rel) {
        if (rel.efectivo === tipodefensor) {
            multiplicador === 1.5
    }
    let j = 0
    while (j < rel.debil.length) {
        if (rel.debil[j] === tipodefensor) {
            multiplicador = 0.75
        }
        j = j + 1
        }
    }
    return modificador * multiplicador
}

export function elegirataqueenemigo(idbatalla, iddragon, nivel) {

}
export function actualizarestadodragones(idbatalla, estado) {

}
export function determinarresultadobatalla(idbatalla, idusuario) {
    
}
