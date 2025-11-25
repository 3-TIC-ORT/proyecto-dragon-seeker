import fs from "fs"

const ruta = "./progreso.json"

export function leer() {
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

export function buscar(lista, user, dragon) {
    return lista.find(x => x.user === user && x.dragon === dragon)
}

function asegurar(lista, user, dragon) {
    let reg = buscar(lista, user, dragon)
    
    if (!reg) {
        reg = {
            user,
            dragon,
            habilitado: (dragon === 3),
            nivel: 1,
            exp: 0, 
            vida: 100,
            fuerza: 10,
            ataques: [
                {nombre: "Arañazo", nivel: 1},
                {nombre: "Llamarada", nivel: 5},
                {nombre: "Terremoto", nivel: 13}
            ],
            desbloqueados: []
        }
        lista.push(reg)
    }
    return reg
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
        aumentarestadisticas(iddragon, {vida: 10, fuerza: 5}, idusuario, lista)
        desbloquearataques(iddragon, reg.nivel, idusuario, lista)
    }

    guardar(lista)
    return {
        exito: true,
        mensaje:
          subidas > 0
            ? `Subiste ${subidas} nivel(es)!`
            : `Experiencia sumada ${cantidad}xp`,
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
    reg.fuerza += incremento.fuerza || 0

    if (!lista0) guardar(lista)
    return { exito: true, mensaje: `+${incremento.vida} vida, +${incremento.fuerza} fuerza.` }
}

export function habilitardragon(user, dragon) {
    const lista = leer()
    const reg = asegurar(lista, user, dragon)
     
    reg.habilitado = true

    guardar(lista)
    return {
        exito: true,
        mensaje: "dragon adoptado!",
        progreso: reg
    }
}

export function actualizarVida(idusuario, iddragon, vidaNueva) {
    const lista = leer()
    const reg = asegurar(lista, iddragon, idusuario)
    reg.vida = vidaNueva
    guardar(lista)
    return {
        exito: true,
        mensaje: "vida actualizada",
        progreso: reg
    }
}