import fs from 'fs'
const filePath ='./usuarios.json'

function leerarchivo() {
    try {
        const data = fs.readFileSync(filePath, 'utf8')
        return JSON.parse(data)
    } catch (error) {
        return{}
    }
}

function escribirarchivo(usuarios) {
    fs.writeFileSync(filePath, JSON.stringify(usuarios, null, 2))
}
 
export function guardarpersonalizacion(idusuario, ropa, accesorios, colorpiel, colorpelo, colorojos) {
    const usuarios = leerarchivo()

    if (!usuarios[idusuario]) {
        
        usuarios[idusuario] = {
            ropa: 'default',
            accesorios: 'default',
            colorpiel: 'default',
            colorojos: 'default',
            colorpelo: 'default',
            opcionesdesbloqueadas: []
        }
    }

    usuarios[idusuario] = {
        ...usuarios[idusuario],
        ropa,
        accesorios,
        colorpiel,
        colorojos,
        colorpelo
    }

    escribirarchivo(usuarios)
    return { success: true, message: 'Personalizacion guardada con exito'}
}

export function cargarpersonalizacion(idusuario) {
    const usuarios = leerarchivo()

    if (!usuarios[idusuario]) {
        return { success: false, message: 'Usuario no encontrado'}
    }

    return {
        success: true, 
        personalizacion: usuarios[idusuario]
    }
}

export function validaropcionesdesbloqueadas(idusuario, tipoopcion, idopcion) {
    const usuarios = leerarchivo()

    if (!usuarios[idusuario]) {
        return { success: false, message: 'Usuario no encontrado' }
    }

    if (usuario[idusuario].opcionesdesbloqueadas.includes(`${tipoopcion}-${idopcion}`)) {
        return { success: true, message: 'Opcion desbloqueada'}
    } else {
        return { success: false, message: 'Opcion no debloqueada'}
    }
}

export function agregaropcionesdesbloqueadas(idusuario, tipoopcion, idopcion) {
    const usuarios = leerarchivo()

    if (!usuarios[idusuario]) {
        return { succes: false, message: 'Usuario no encontrado'}
    }

    const opcion = `${tipoopcion}-${idopcion}` 
    if (!usuarios[idusuario].opcionesdesbloqueadas.includes(opcion)) {
        usuarios[idusuario].opcionesdesbloqueadas.push(opcion)
        escribirarchivo(usuarios)
        return { success: true, message: `Opcion ${opcion} desbloqueado con exito` }
    }

    return { success: false, message: `La opcion ${opcion} ya esta debloqueada` }
}