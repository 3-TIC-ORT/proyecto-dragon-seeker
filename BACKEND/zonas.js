import fs from "fs"

const rutazonas = "./zonas.json"

function leerzonas() {
    const texto = fs.readFileSync(rutazonas, "utf-8")
    return JSON.parse(texto)
}

export function enviardatoszona(idusuario, idzona) {
    const zonas = leerzonas()
    const zona = zonas.find(z => z.id === idzona)
    if (!zona) {
        return {exito: false, mensaje:"Zona no encontrada"}
    }
    return {exito: true, zona: zona}
}
export function cargarmapa(idusuario, idzona, coordenadasiniciales) {
    const zonas = leerzonas()
    const zona = zonas.find(z => z.id === idzona)
    if (!zona) {
        return {exito: false, mensaje: "Mapa no encontrado"}
    }
    const mapa = {
        idusuario,
        idzona,
        nombre: zona.nombre,
        coordenadas: coordenadasiniciales
    }
    return {exito: true, mensaje: "Mapa cargado correctamente", mapa }
}
export function determinarapariciondragones(idzona, nivelusuario) {
    const zonas = leerzonas()
    const zona = zonas.find(z => z.id === idzona)
    if (!zona) {
        return {exito: false, mensaje: "No se encontro la zona"}
    }
    const dragones = zona.dragones || []
    const posibles = dragones.filter(d => nivelusuario >= d.nivelMin && nivelusuario <= d.nivelMax)
    if (posibles.length === 0) {
        return {exito: false, mensaje: "No se encontraron dragones disponibles", dragones: posibles}
    }
    return { exito: true, dragones: posibles }
}
export function controlarcondicionesentrada(idusuario, idzona, requisitos) {
    const zonas = leerzonas()
    const zona = zonas.find(z => z.id === idzona)
    if (!zona) {
        return {exito: false, mensaje: "Zona no encontrada"}
    }
    let cumple = true 
    let i = 0
    while (i < requisitos.length) {
        const req = requisitos[i]
        if (!req.cumplido) {
            cumple = false
        }
        i = i + 1
    }
    if (cumple) {
        return {exito: true, mensaje: "El usuario cumple los requisitos para entrar"}
    } else {
        return {exito: false, mensaje: "No se cumplen los requisitos para entrar"}
    }
}