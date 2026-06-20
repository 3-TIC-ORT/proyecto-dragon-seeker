export const MAPA_SCENES = {
  1: "Game",
  2: "Casa",
  3: "zonaBoss",
};

// El progreso/estado se keyean por PARTIDA (la activa se elige en menu/partida.html).
export function getPartidaId() {
  const id = Number(localStorage.getItem("partida"));
  return Number.isInteger(id) && id > 0 ? id : null;
}

export function guardarEstado(mapa, player, dragonesSpawneados = []) {
  const idpartida = getPartidaId();
  if (!idpartida) return;

  postEvent(
    "guardarEstadoJuego",
    {
      idpartida,
      estado: {
        mapa,
        x: Math.round(player.x),
        y: Math.round(player.y),
        dragonesSpawneados,
      },
    },
    () => {},
  );
}

export function obtenerEstadoMapa(mapa, callback) {
  const idpartida = getPartidaId();

  postEvent("obtenerEstadoJuego", { idpartida, mapa }, (res) => {
    callback(res.estado);
  });
}

// Pide el último estado guardado SIN filtrar por mapa,
// para que el Preloader sepa a dónde mandar al jugador.
export function obtenerUltimoEstado(callback) {
  const idpartida = getPartidaId();

  postEvent("obtenerEstadoJuego", { idpartida }, (res) => {
    callback(res.estado);
  });
}
