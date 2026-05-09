import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ruta = path.join(__dirname, "dragones.json")
const rutaprogreso = path.join(__dirname, "progreso.json")

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
    // Los dragones enemigos siempre comienzan con vida máxima
    const batalla = {
        idusuario,
        ubicacion,
        dragon: {
            nombre: dragon.nombre,
            tipo: dragon.tipo,
            vida: dragon.vida,  // Vida máxima del dragón base
            vidaMaxima: dragon.vida,  // Guardar vida máxima para referencia
            fuerza: dragon.fuerza,
            ataques: dragon.ataques
        }
    }
    return {exito: true, mensaje: "Batalla bien iniciada", batalla}
}

export function obtenerlistadragones() {
    const base = leerdragones()
    const progreso = leerprogreso()

    if (!base || !base.dragones) {
        return {exito: false, mensaje: "No se pudo leer la base de dragones"}
    }
    const dragoensactualizados = base.dragones.map(d => {
        const prog = progreso.find(p => p.dragon === d.id)

        if (!prog) return {
        ...d,
        habilitado: false
    }
        return {
            ...d,
            habilitado: prog.habilitado ?? false,
            nivel: prog.nivel ?? d.nivel,
            exp: prog.exp ?? 0,
            vida: prog.vida ?? d.vida,
            fuerza: prog.fuerza ?? d.fuerza,
            desbloqueados: prog.desbloqueados ?? [],

            ataques: (d.ataques || []).map(atBase => {
             let progAtaq = prog.ataques.find(a => a.nombre === atBase.nombre);
                return {
                    nombre: atBase.nombre,
                    nivel: atBase.nivel,
                    dano: atBase.dano,
                    desbloqueado: prog.desbloqueados?.includes(atBase.nombre) ?? false
                };
            })
        }
    })
    return {exito: true, dragones: dragoensactualizados}
}
    