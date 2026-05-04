import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rutaitems = path.join(__dirname, "items.json")

function leeritems() {
    const texto = fs.readFileSync(rutaitems, "utf-8")
    return JSON.parse(texto)
}
function escribiritems(datos) {
    const texto = JSON.stringify(datos,null,2)
    fs.writeFileSync(rutaitems,texto)
}

export function objeto(nombre, tipo, efectos, rareza) {
    const items = leeritems()
    const nuevo = {
        id: items.length + 1,
        nombre: nombre,
        tipo: tipo,
        efectos: efectos,
        rareza: rareza
    }
    items.push(nuevo)
    escribiritems(items)

    return {exito: true, mensaje: "Objeto creado correctamente", objeto: nuevo}
}
export function obtenerdatosobjeto(idobjeto) {
    const items = leeritems()
    const item = items.find(i => i.id === idobjeto)

    if (!item) {
        return {exito: false, mensaje: "Objeto no encontrado"}
    }
    return {exito: true, objeto: item}
}