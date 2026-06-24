import { startServer, subscribePOSTEvent, subscribeGETEvent } from "soquetic";
import { registrarusuario, iniciarsesion } from "./autorizacion.js";
import {
  guardarpersonalizacion,
  cargarpersonalizacion,
  validaropcionesdesbloqueadas,
} from "./customizacion.js";
import { enviarnotificacion, obtenernotificaciones } from "./notificaciones.js";
import {
  sumarexperiencia,
  verificarsubidanivel,
  desbloquearataques,
  aumentarestadisticas,
  habilitardragon,
  actualizarVida,
  curarDragones,
  curarDragon,
} from "./progresousuario.js";
import {
  elegirataqueenemigo,
  aplicarbbeneficiosdebilidades,
  obtenerataquesdisponibles,
} from "./batalla_ataques.js";
import {
  determinartipodragon,
  enviardatosdragon,
  iniciarbatalledragon,
  obtenerlistadragones,
  obtenerBossMapa,
  verificarAccesoZonaBoss,
} from "./dragones.js";
import { objeto, obtenerdatosobjeto } from "./items.js";
//lo puse yo (doble)
import {
  guardarEstadoUsuario,
  obtenerEstadoUsuario,
  obtenerUltimoEstadoUsuario,
} from "./estadoJuego.js";
import { crearPartida, listarPartidas } from "./partidas.js";
import {
  obtenerCuraciones,
  consumirCuracion,
  renovarCuraciones,
} from "./curaciones.js";

subscribePOSTEvent("registrarusuario", (data) => {
  const { nombre, correo, contrasena } = data;
  return registrarusuario(nombre, correo, contrasena);
});

subscribePOSTEvent("iniciarsesion", (data) => {
  const { nombre, contrasena } = data;
  return iniciarsesion(nombre, contrasena);
});

subscribePOSTEvent("guardarpersonalizacion", (data) => {
  const { idusuario, ropa, accesorios, colorpiel, colorojos, colorpelo } = data;
  return guardarpersonalizacion(
    idusuario,
    ropa,
    accesorios,
    colorpiel,
    colorojos,
    colorpelo,
  );
});

subscribeGETEvent("cargarpersonalizacion", (query) => {
  const { idusuario } = query;
  return cargarpersonalizacion(idusuario);
});

subscribeGETEvent("validaropcionesdesbloqueadas", (query) => {
  const { idusuario, tipoopcion, idopcion } = query;
  return validaropcionesdesbloqueadas(idusuario, tipoopcion, idopcion);
});

subscribePOSTEvent("enviarnotificacion", (data) => {
  const { idusuario, mensaje } = data;
  return enviarnotificacion(idusuario, mensaje);
});

subscribeGETEvent("obtenernotificaciones", (query) => {
  const { idusuario } = query;
  return obtenernotificaciones(idusuario);
});

subscribePOSTEvent("sumarexperiencia", (data) => {
  const { iddragon, cantidad, idpartida } = data;
  return sumarexperiencia(Number(iddragon), cantidad, Number(idpartida));
});

subscribeGETEvent("verificarsubidanivel", (query) => {
  const { iddragon, idpartida } = query;
  return verificarsubidanivel(Number(iddragon), Number(idpartida));
});

subscribePOSTEvent("desbloquearataques", (data) => {
  const { iddragon, nivel, idpartida } = data;
  return desbloquearataques(Number(iddragon), nivel, Number(idpartida));
});

subscribePOSTEvent("aumentarestadisticas", (data) => {
  const { iddragon, incremento, idpartida } = data;
  return aumentarestadisticas(Number(iddragon), incremento, Number(idpartida));
});

subscribePOSTEvent("crearPartida", (data) => {
  const { idusuario, nombre } = data;
  return crearPartida(idusuario, nombre);
});

subscribePOSTEvent("listarPartidas", (data) => {
  const { idusuario } = data;
  return listarPartidas(idusuario);
});

subscribeGETEvent("elegirataqueenemigonormal", (query) => {
  return elegirataqueenemigo({
    tipo: query.tipo,
    nivel: Number(query.nivel),
    esBoss: false,
  });
});

subscribeGETEvent("elegirataqueboss", (query) => {
  const bossEstado = {
    soplido: Number(query.soplido || 0),
    daga: Number(query.daga || 0),
  };
  return elegirataqueenemigo({
    esBoss: true,
    bossId: Number(query.bossId),
    bossEstado,
  });
});

subscribePOSTEvent("modificadorportipo", (data) => {
  const mod = aplicarbbeneficiosdebilidades(
    data.tipoataque,
    data.tipodefensor,
    Number(data.base),
  );
  return { exito: true, modificador: mod };
});

subscribeGETEvent("ataquesdisponibles", (query) => {
  const lista = obtenerataquesdisponibles(query.tipo, Number(query.nivel));
  return { exito: true, ataques: lista };
});

subscribeGETEvent("obtenerTipodragon", (query) => {
  const { idzona, dificultad } = query;
  return determinartipodragon(Number(idzona), dificultad);
});

subscribeGETEvent("obtenerdragon", (query) => {
  const { iddragon, idusuario } = query;
  return enviardatosdragon(Number(iddragon), Number(idusuario));
});

subscribePOSTEvent("iniciarbatalla", (data) => {
  const { idusuario, iddragon, ubicacion } = data;
  return iniciarbatalledragon(Number(idusuario), Number(iddragon), ubicacion);
});

subscribeGETEvent("obtenerdragones", () => {
  return obtenerlistadragones();
});

subscribePOSTEvent("obtenerdragonesUsuario", (data) => {
  const { idpartida } = data;
  const partida = Number(idpartida);
  const res = obtenerlistadragones(partida);
  // Adjuntamos el cupo de curaciones rapidas para que el inventario lo muestre.
  const estado = obtenerCuraciones(partida);
  return {
    ...res,
    curacionesRestantes: estado.restantes,
    curacionesMax: estado.max,
  };
});

subscribePOSTEvent("obtenerdragonesMapa", (data) => {
  const { idpartida } = data;
  return obtenerlistadragones(Number(idpartida), true);
});

subscribePOSTEvent("crearobjeto", (data) => {
  const { nombre, tipo, efectos, rareza } = data;
  return objeto(nombre, tipo, efectos, rareza);
});

subscribeGETEvent("obtenerobjeto", (query) => {
  const { idobjeto } = query;
  return obtenerdatosobjeto(Number(idobjeto));
});

subscribePOSTEvent("adoptarDragon", (data) => {
  const { partida, dragon, estado } = data;
  return habilitardragon(Number(partida), Number(dragon), estado);
});

subscribePOSTEvent("actualizarVida", (data) => {
  const { idpartida, iddragon, vida } = data;
  return actualizarVida(Number(idpartida), Number(iddragon), vida);
});

subscribePOSTEvent("curarDragones", (data) => {
  const { idpartida } = data;
  const partida = Number(idpartida);
  const res = curarDragones(partida);
  // Curar en la casita renueva el cupo de curaciones rapidas del inventario.
  renovarCuraciones(partida);
  return res;
});

// PROVISORIO (revertir cuando este el medico posta): curar un dragon puntual
// desde el boton "Curar" del inventario. Limitado: gasta una curacion rapida del
// cupo de la partida; al llegar a 0 hay que renovar curando en la casita.
subscribePOSTEvent("curarDragon", (data) => {
  const { idpartida, iddragon } = data;
  const partida = Number(idpartida);

  // Sin cupo -> no se cura (hay que ir a la casita a renovar).
  const estado = obtenerCuraciones(partida);
  if (estado.restantes <= 0) {
    return {
      exito: false,
      mensaje:
        "Te quedaste sin curaciones rápidas. Curá en la casita para renovarlas.",
      curacionesRestantes: 0,
      curacionesMax: estado.max,
    };
  }

  // Curamos primero; solo si la curacion fue valida gastamos una del cupo (asi un
  // dragon invalido no consume cupo).
  const res = curarDragon(partida, Number(iddragon));
  if (!res.exito) {
    return {
      ...res,
      curacionesRestantes: estado.restantes,
      curacionesMax: estado.max,
    };
  }

  const consumo = consumirCuracion(partida);
  return {
    ...res,
    curacionesRestantes: consumo.restantes,
    curacionesMax: consumo.max,
  };
});

subscribePOSTEvent("guardarEstadoJuego", (data) => {
  const { idpartida, estado } = data;
  return guardarEstadoUsuario(Number(idpartida), estado);
});

subscribePOSTEvent("obtenerEstadoJuego", (data) => {
  const { idpartida, mapa } = data;

  const estado =
    mapa !== undefined
      ? obtenerEstadoUsuario(Number(idpartida), Number(mapa))
      : obtenerUltimoEstadoUsuario(Number(idpartida));

  return { exito: true, estado };
});

subscribePOSTEvent("obtenerBossMapa", (query) => {
  const { mapa } = query;
  return obtenerBossMapa(Number(mapa));
});

subscribePOSTEvent("verificarAccesoZonaBoss", (data) => {
  const { idpartida } = data;
  return verificarAccesoZonaBoss(Number(idpartida));
});

console.log("Servidor iniciado");
startServer();
