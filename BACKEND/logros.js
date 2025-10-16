import fs from "fs"

let logros = "./BACKEND/logros.json"

function leer12() {
    const texto = fs.readFileSync(logros)
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
    const logros = leer12()

    const logro = logros.find(
        logro => logro.idusuario === idusuario && logro.iddragon ===  iddragon
    )

    if (!logro) {
        return { exito: false, mensaje: "No se encontro el dragon"}
    }
}

alert("Dragon encontrado:", logro)
return {exito: true, mensaje: "Dragon encontrado correctamente"}
