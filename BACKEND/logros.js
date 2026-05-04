import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const logrosPath = path.join(__dirname, "logros.json")

function leer12() {
    const texto = fs.readFileSync(logrosPath, "utf-8")
    return JSON.parse(texto)
}

function escribir12(datos) {
    fs.writeFileSync(logros, JSON.stringify(datos,null,2))
}

export function registrardragoncapturado(idusuario, iddragon, fecha) {
    const nuevologro = leer12()
    const nuevo = {
        idusuario,
        iddragon,
        fecha,
    }

    nuevologro.push(nuevo)
    escribir12(nuevologro)

    return {exito: true, mensaje: "Dragon registrado de manera exitosa"}
}
export function guardarestadisticasdragon(idusuario, iddragon) {
    const lista = leer12()

    const logro = logros.find(
        logro => logro.idusuario === idusuario && logro.iddragon ===  iddragon
    )

    if (!logro) {
        return { exito: false, mensaje: "No se encontro el dragon"}
    }   
    return {exito: true, mensaje: "Dragon encontrado correctamente"}
}

