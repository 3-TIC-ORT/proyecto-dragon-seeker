export const MAPA_SCENES = {
  1: "Game",
  2: "Casa",
  3: "zonaBoss",
};

export function guardarEstado(mapa, player, dragonesSpawneados = []) {
  const usuarioActual = JSON.parse(localStorage.getItem("usuario"));
  if (!usuarioActual) return;

  postEvent(
    "guardarEstadoJuego",
    {
      idusuario: usuarioActual.id,
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
  const usuarioActual = JSON.parse(localStorage.getItem("usuario"));
  const idusuario = usuarioActual?.id;

  postEvent("obtenerEstadoJuego", { idusuario, mapa }, (res) => {
    callback(res.estado);
  });
}

// Pide el último estado guardado SIN filtrar por mapa,
// para que el Preloader sepa a dónde mandar al jugador.
export function obtenerUltimoEstado(callback) {
  const usuarioActual = JSON.parse(localStorage.getItem("usuario"));
  const idusuario = usuarioActual?.id;

  postEvent("obtenerEstadoJuego", { idusuario }, (res) => {
    callback(res.estado);
  });
}
