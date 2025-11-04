const ATAQUES_POR_TIPO = {
    normal: [
        {nombre: "Arañazo", daño: 10, nivel: 1},
        {nombre: "Patada", daño: 10, nivel: 1},
        {nombre: "Puñetazo", daño: 10, nivel: 1}
    ],
    tierra: [
        {nombre: "Coletazo", daño: 5, nivel: 1},
        {nombre: "Bola de barro", daño: 10, nivel: 5},
        {nombre: "Terremoto", daño: 10, nivel: 13}
    ],
    fuego: [
        {nombre: "Llamarada", daño: 10, nivel: 1},
        {nombre: "Bola de fuego", daño: 15, nivel: 5},
        {nombre: "Puño de fuego", daño: 20, nivel: 13}
    ],
    electrico: [
        {nombre: "Chispa", daño: 8, nivel: 1},
        {nombre: "Tormenta electrica", daño: 13, nivel: 5},
        {nombre: "Onda trueno", daño: 18, nivel: 13}
    ],
    hielo: [
        {nombre: "Ventisca", daño: 10, nivel: 1},
        {nombre: "Nevada", daño: 15, nivel: 5},
        {nombre: "Puño hielo", daño: 20, nivel: 13}
    ],
    agua: [
        {nombre: "burbuja", daño: 8, nivel: 1},
        {nombre: "Salpicadura", daño: 15, nivel: 5},
        {nombre: "Tsunami", daño: 18, nivel: 13}
    ]
}
const ATAQUES_BOSS = {
    1: [
        {nombre: "Coletazo", daño: 15},
        {nombre: "Gas verde", daño: 20},
        {nombre: "Fuego", daño: 25},
        {nombre: "Aletazo", daño: 15}
    ],
    2: [
        {nombre: "Coletazo", daño: 20},
        {nombre: "Pelotazo de carbon prendido", daño: 30},
        {nombre: "Llamarada", daño: 35},
        {nombre: "Rugido caliente", daño: 25}
    ],
    3: [
        {nombre: "Soplido helado", daño: 0, efecto: "pasar_turno"},
        {nombre: "Daga de hielo", daño: 30},
        {nombre: "Bola de nieve", daño: 35},
        {nombre: "Bola de nieve + Daga", daño: 50, requiere: "desbloqueo_combo"}
    ]
}

export function obtenerataquesdisponibles(tipo, nivel) {
    const lista = ATAQUES_POR_TIPO[tipo] || []
    const disponibles = []
    let i = 0
    while (i < lista.length) {
        if (nivel >= lista[i].nivel) {
            disponibles.push({nombre: lista[i].nombre, daño: lista[i].daño})
        }
        i = i + 1
    }
    return disponibles
}
function construirlistaboss(bossId, bossEstado) {
    const base = ATAQUES_BOSS[bossId] || []
    const lista = []
    let i = 0
    let desbloqueo = false 
    
    if (bossId === 3 && bossEstado) {
        if ((bossEstado.soplido || 0) >= 2 && (bossEstado.daga || 0) >= 2){
            desbloqueo = true
        }
    }

    while (i < base.length) {
        const a = base[i]
        if (a.requiere === "desbloqueo_combo" && desbloqueo === false) {

        } else { 
            lista.push(a)  
        }
        i = i + 1 
    } 
    return lista
}

export function elegirataqueenemigo({tipo, nivel, esBoss, bossId, bossEstado}) {
    let lista = []

    if (esBoss === true) {
        lista = construirlistaboss(bossId, bossEstado || {})
    } else {
        lista = obtenerataquesdisponibles(tipo,nivel)
    }

    if (lista.length === 0) {
        lista = [{nombre: "Golpe", daño: 5}]
    }

    const numero = Math.floor(Math.random() * lista.length)
    const ataqueelegido = lista[numero] 

    let bossestadoactualizado = bossEstado || undefined
    if (esBoss === true && bossId === 3) {
        if (!bossestadoactualizado) bossestadoactualizado = {soplido: 0, daga: 0}

        if (ataqueelegido.nombre === "Soplido helado") {
            bossestadoactualizado.soplido = (bossestadoactualizado.soplido || 0) + 1
        }
        if (ataqueelegido.nombre === "Daga de hielo") {
            bossestadoactualizado.daga = (bossestadoactualizado.daga || 0) + 1
        }
    }
    return {
        exito: true,
        mensaje: "Ataque del enemigo elegido",
        ataque: ataqueelegido,
        bossEstado: bossestadoactualizado
    }
}

export function aplicarbbeneficiosdebilidades(tipoataque, tipodefensor, modificador) {
    const relaciones = {
        tierra: {efectivo: "electrico", debil: ["agua", "hielo"]},
        fuego: {efectivo: "hielo", debil: ["agua"]},
        hielo: {efectivo: "tierra", debil: ["fuego"]},
        electrico: { efectivo: "agua", debil: ["tierra"] },
        agua: { efectivo: "fuego", debil: ["electrico"] },
    }

    let multiplicador = 1
    const rel = relaciones[tipoataque]
    if (rel) {
        if (rel.efectivo === tipodefensor) {
            multiplicador = 1.5
        }

        let i = 0
        while (i < rel.debil.length) {
            if (rel.debil[i] === tipodefensor) {
                multiplicador = 0.75
            }
            i = i + 1
        }
    }
    return modificador * multiplicador
}