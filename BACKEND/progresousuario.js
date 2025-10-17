import fs from "fs"

const ruta = "./BACKEND/progreso.json"

function leer() {
    if (fs.writeFileSync(ruta,"[]"))
    return JSON.parse(fs.readFileSync(ruta) || "[]")
}

function guardar(datos) {
    fs.writeFileSync(ruta, JSON.stringify(datos,null,2))
}

function buscar(lista, user, dragon) {
    return lista.find(x => x.user === user && x.dragon === dragon)
}

function asegurar(lista, user, dragon) {
    let aaa =  buscar(lista, user, dragon)
    if (!aaa) {
        reg = {
            user,
            dragon,
            nivel: 1,
            exp: 0, 
            vida: 100,
            daño: 10,
            ataques: [
                {nombre: "arañazo", nivel: 1},
                {nombre: "Llamarada", nivel: 5},
                {nombre: "Terremoto", nivel: 13}
            ]
        }
    }
}

export function sumarexperiencia(iddragon, cantidad, idusuario) {

}
export function verificarsubidanivel(iddragon, idusuario) {

}
export function desbloquearataques(iddragon, nivel) {

}
export function aumentarestadisticas(iddragon, incremento) {
    
}