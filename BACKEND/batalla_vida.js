import fs from "fs"
const ruta = "./vida_batalla.json"

function leerarchivo() {
    if(!fs.existsSync(ruta)) {
        fs.writeFileSync(ruta, JSON.stringify({batallas: []}, null, 2))
    }
    const texto = fs.readFileSync(ruta, "utf-8")
    return JSON.parse(texto)
}

function guardararchivo(data) {
    const texto = JSON.stringify(data, null, 2)
    fs.writeFileSync(ruta, texto    )
}
export function registrarbatalla(idusuario, iddragon, vidadragon, vidaenemigo, ubicacion) {
    const data = leerarchivo()
    const nuevabatalla = {
        idbatalla: data.batallas.length + 1,
        usuario: idusuario,
        dragon: {id: iddragon, vida: vidadragon},
        enemigo: {vida: vidaenemigo}, 
        ubicacion: ubicacion,
        estado: "en curso"

    }

    data.batallas.push(nuevabatalla)
    guardararchivo(data)
    return {exito: true, idbatalla: nuevabatalla.idbatalla, batalla: nuevabatalla}
}

export function actualizarvida(idbatalla, vidadragon, vidaenemigo) {
    const data = leerarchivo()
    const batalla = data.batallas.find(b => b.idbatalla === idbatalla)
    if (!batalla) return {exito: false, mensaje: "Batalla no encontrada"}
    
    batalla.dragon.vida = vidadragon
    batalla.enemigo.vida = vidaenemigo

    if (vidadragon <= 0 || vidaenemigo <= 0) {
        batalla.estado = "Finalizada"
    }
    guardararchivo(data)
    return {exito: true, mensaje: "Vida actualizada", batalla}
}
export function obtenervidaactual(idbatalla) {
    const data = leerarchivo()
    const batalla = data.batallas.find(b => idbatalla === idbatalla)
}

export function obtenerhistorialbatalla() {
    const data = leerarchivo()
    return {exito: true, batallas: data.batallas}
}
