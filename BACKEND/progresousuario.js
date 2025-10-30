import fs from "fs"

const ruta = "./BACKEND/progreso.json"

function leer() {
    try {
        return JSON.parse(fs.readFileSync(ruta, "utf-8") || "[]")
    } catch {
        fs.writeFileSync(ruta, "[]")
        return []
    }
}

function guardar(datos) {
    fs.writeFileSync(ruta, JSON.stringify(datos,null,2))
}

function buscar(lista, user, dragon) {
    return lista.find(x => x.user === user && x.dragon === dragon)
}

function asegurar(lista, user, dragon) {
    let aaa = buscar(lista, user, dragon)
    if (!aaa) {
        let reg = {
            user,
            dragon,
            nivel: 1,
            exp: 0, 
            vida: 100,
            daño: 10,
            ataques: [
                {nombre: "Arañazo", nivel: 1},
                {nombre: "Llamarada", nivel: 5},
                {nombre: "Terremoto", nivel: 13}
            ],
            desbloqueados: []
        }
        lista.push(reg)
        return reg
    }
    return aaa
}

function experiencianecesaria(nivel) {
    return 100 * nivel  
}

export function sumarexperiencia(iddragon, cantidad, idusuario) {
    const lista = leer()
    const reg = asegurar(lista, idusuario, iddragon)
    reg.exp += cantidad
    let subidas = 0
    while (reg.exp >= experiencianecesaria(reg.nivel)) {
        reg.exp -= experiencianecesaria(reg.nivel)
        reg.nivel++
        subidas++
        aumentarestadisticas(iddragon, {vida: 10, daño: 5}, idusuario, lista)
        desbloquearataques(iddragon, reg.nivel, idusuario, lista)
    }

    guardar(lista)
    return {
        exito: true,
        mensaje:
          subidas > 0
            ? `Subiste ${subidas} nivel(es)!`
            : "Experiencia sumada.",
        progreso: reg
    }
}

export function verificarsubidanivel(iddragon, idusuario) {
    const lista = leer()
    const reg = asegurar(lista, idusuario, iddragon)
    const falta = experiencianecesaria(reg.nivel) - reg.exp
    return {
        exito: true,
        nivel: reg.nivel,
        exp: reg.exp,
        falta: falta > 0 ? falta : 0
    }
}

export function desbloquearataques(iddragon, nivel, idusuario, lista0 = null) {
    const lista = lista0 || leer()
    const reg = asegurar(lista, idusuario, iddragon)
    const nuevos = reg.ataques 
    .filter(a => a.nivel <= nivel)
    .map(a => a.nombre)
    .filter(n => !reg.desbloqueados.includes(n))
    
    if (nuevos.length > 0)  {
        reg.desbloqueados.push(...nuevos)
        if (!lista0)  guardar(lista)
        return {exito:true, mensaje: `nuevos ataques:  ${nuevos.join(",")}`}
    }
    if (!lista0) guardar(lista)
    return  {exito:true, mensaje: "no hay ataques nuevos"}
}

export function aumentarestadisticas(iddragon, incremento, idusuario, lista0 = null) {
    const lista = lista0 || leer()
    const reg = asegurar(lista, idusuario, iddragon)
    reg.vida += incremento.vida || 0
    reg.daño += incremento.daño || 0

    if (!lista0) guardar(lista)
    return { exito: true, mensaje: `+${incremento.vida} vida, +${incremento.daño} daño.` }
}
