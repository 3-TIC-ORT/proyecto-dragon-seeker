const ATAQUES_POR_TIPO = {
    normal: [
        {nombre: "Arañazo", dano: 10, nivel: 1},
        {nombre: "Patada", dano: 10, nivel: 1},
        {nombre: "Puñetazo", dano: 10, nivel: 1}
    ],
    tierra: [
        {nombre: "Coletazo", dano: 5, nivel: 1},
        {nombre: "Bola de barro", dano: 10, nivel: 5},
        {nombre: "Terremoto", dano: 10, nivel: 13}
    ],
    fuego: [
        {nombre: "Llamarada", dano: 10, nivel: 1},
        {nombre: "Bola de fuego", dano: 15, nivel: 5},
        {nombre: "Puño de fuego", dano: 20, nivel: 13}
    ],
    electrico: [
        {nombre: "Chispa", dano: 8, nivel: 1},
        {nombre: "Tormenta electrica", dano: 13, nivel: 5},
        {nombre: "Onda trueno", dano: 18, nivel: 13}
    ],
    hielo: [
        {nombre: "Ventisca", dano: 10, nivel: 1},
        {nombre: "Nevada", dano: 15, nivel: 5},
        {nombre: "Puño hielo", dano: 20, nivel: 13}
    ],
    agua: [
        {nombre: "burbuja", dano: 8, nivel: 1},
        {nombre: "Salpicadura", dano: 15, nivel: 5},
        {nombre: "Tsunami", dano: 18, nivel: 13}
    ]
}
const ATAQUES_BOSS = {
    1: [
        {nombre: "Coletazo", dano: 15},
        {nombre: "Gas verde", dano: 20},
        {nombre: "Fuego", dano: 25},
        {nombre: "Aletazo", dano: 15}
    ],
    2: [
        {nombre: "Coletazo", dano: 20},
        {nombre: "Pelotazo de carbon prendido", dano: 30},
        {nombre: "Llamarada", dano: 35},
        {nombre: "Rugido caliente", dano: 25}
    ],
    3: [
        {nombre: "Soplido helado", dano: 0, efecto: "pasar_turno"},
        {nombre: "Daga de hielo", dano: 30},
        {nombre: "Bola de nieve", dano: 35},
        {nombre: "Bola de nieve + Daga", dano: 50, requiere: "desbloqueo_combo"}
    ]
}

export function obtenerataquesdisponibles(tipo, nivel) {
    const lista = ATAQUES_POR_TIPO[tipo] || []
    const disponibles = []
    let i = 0
    while (i < lista.length) {
        if (nivel >= lista[i].nivel) {
            disponibles.push({nombre: lista[i].nombre, dano: lista[i].dano})
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
        lista = [{nombre: "Golpe", dano: 5}]
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