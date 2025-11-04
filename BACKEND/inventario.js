import fs from "fs"

const rutainventario = "./inventario.json"

function leerarchivo() {
    const texto = fs.readFileSync(rutainventario, "utf-8")
    return JSON.parse(texto)
}
function escribirarchivo(data) {
    const texto = JSON.stringify(data, null, 2)
    fs.writeFileSync(rutainventario, texto)
}
export function guardarobjeto(idusuario, objeto, cantidad) {
    const inventario = leerarchivo()
    const clave = String(idusuario)
    if (!inventario[clave]) {
        inventario[clave] = []
    }
    let encontrado = false
    let i = 0
    while (i < inventario[clave].length) {
        if (inventario[clave][i].nombre === objeto) {
            inventario[clave][i].cantidad += cantidad
            encontrado = true
        }
        i = i + 1
    }
    if (!encontrado) {
        inventario[clave].push({nombre: objeto, cantidad: cantidad})
    }
    escribirarchivo(inventario)
    return {exito: true, mensaje: "Objeto guardado correctamente"}
}
export function actualizarinventario(idusuario, cambios) {
    const inventario = leerarchivo()
    const clave = String(idusuario)

    if (!inventario[clave]) {
        return {exito: false, mensaje: "Inventario no encontrado"}
    }
    let i = 0
    while (i < cambios.length) {
        const c = cambios[i]
        let j = 0
        let existe = false
        while (j < inventario[clave].length) {
            if (inventario[clave][j].nombre === c.nombre) {
                inventario[clave][j].cantidad = c.cantidad
                existe = true
            }
            j = j + 1
        }
        if (!existe) {
            inventario[clave].push(c)
        }
        i = i + 1   
    }
    escribirarchivo(inventario)
    return {exito: true, mensaje: "Inventario actualizado correctamente"}
}
export function aplicarefectoobjeto(idusuario, objeto, objetivo) {
    const efectos = {
        "pocion": {vida: +20},
        "caramelo": {exp: +50},
        "cura total": {vida: "max"}
    }
    const efecto = efectos[objeto]
    if (!efecto) {
        return {exito: false, mensaje: "El objeto no tiene efecto"}
    }
    return {exito: true, mensaje: "Efecto aplicado correctamente", efecto: efecto}
}