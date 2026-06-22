// Overlay reutilizable para MALAS noticias (perder pelea, no adoptar, etc.).
// Para los logros/exitos se usa la pantalla dedicada logros/resultado.html;
// para los fracasos va este cartel superpuesto, sin cambiar de pagina.
// Se carga como script clasico y expone window.mostrarOverlayFracaso(opciones).
//   opciones = { titulo, detalle, destino?, textoBoton? }
//   - destino: si se pasa, el boton navega ahi; si no, solo cierra el overlay.
(function () {
  // Inyecta los estilos una sola vez (autocontenido, no depende del CSS de la pagina).
  if (!document.getElementById("overlayFracasoEstilos")) {
    const style = document.createElement("style");
    style.id = "overlayFracasoEstilos";
    style.textContent = `
      .overlayFracaso {
        position: fixed; inset: 0; z-index: 1000;
        display: flex; align-items: center; justify-content: center;
        background: rgba(0, 0, 0, 0.65);
        font-family: var(--fuente, "Pixelify Sans", sans-serif);
      }
      .overlayFracaso-caja {
        background: linear-gradient(180deg, #3a1414, #1f1f1f);
        border: 3px solid #ff6b6b;
        border-radius: 16px;
        padding: clamp(1.2rem, 4vw, 2.2rem);
        max-width: min(90vw, 420px);
        text-align: center;
        color: #ffffff;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
      }
      .overlayFracaso-titulo {
        margin: 0 0 0.6rem;
        color: #ff6b6b;
        font-weight: 700;
        font-size: clamp(1.4rem, 5vw, 2rem);
      }
      .overlayFracaso-detalle {
        margin: 0 0 1.2rem;
        font-size: clamp(1rem, 3.4vw, 1.3rem);
        white-space: pre-line;
      }
      .overlayFracaso-boton {
        font-family: inherit;
        font-weight: 700;
        font-size: clamp(1rem, 3.4vw, 1.3rem);
        padding: 0.5em 1.6em;
        border: none;
        border-radius: 12px;
        background: #ff6b6b;
        color: #1a1a1a;
        cursor: pointer;
        transition: filter 0.12s ease;
      }
      .overlayFracaso-boton:hover { filter: brightness(1.08); }
      /* Variante con dos botones (confirmar / cancelar) */
      .overlayConfirmar-botones {
        display: flex;
        gap: 0.8rem;
        justify-content: center;
        flex-wrap: wrap;
      }
      .overlayConfirmar-cancelar {
        background: #cfcfcf;
        color: #1a1a1a;
      }
    `;
    document.head.appendChild(style);
  }

  window.mostrarOverlayFracaso = function (opciones) {
    const {
      titulo = "",
      detalle = "",
      destino = null,
      textoBoton = "CONTINUAR",
    } = opciones || {};

    const overlay = document.createElement("div");
    overlay.className = "overlayFracaso";
    overlay.innerHTML = `
      <div class="overlayFracaso-caja">
        <h2 class="overlayFracaso-titulo"></h2>
        <p class="overlayFracaso-detalle"></p>
        <button type="button" class="overlayFracaso-boton"></button>
      </div>`;

    // textContent: el contenido no se interpreta como HTML.
    overlay.querySelector(".overlayFracaso-titulo").textContent = titulo;
    overlay.querySelector(".overlayFracaso-detalle").textContent = detalle;
    const boton = overlay.querySelector(".overlayFracaso-boton");
    boton.textContent = textoBoton;
    boton.addEventListener("click", () => {
      if (destino) window.location.href = destino;
      else overlay.remove();
    });

    document.body.appendChild(overlay);
  };

  // Overlay de CONFIRMACION (dos botones). Para acciones que conviene confirmar,
  // como cerrar sesion. Reusa la caja del overlay de fracaso.
  //   opciones = { titulo, detalle, textoConfirmar?, textoCancelar?,
  //                onConfirmar?, onCancelar? }
  window.mostrarOverlayConfirmar = function (opciones) {
    const {
      titulo = "",
      detalle = "",
      textoConfirmar = "CONFIRMAR",
      textoCancelar = "CANCELAR",
      onConfirmar = null,
      onCancelar = null,
    } = opciones || {};

    const overlay = document.createElement("div");
    overlay.className = "overlayFracaso overlayConfirmar";
    overlay.innerHTML = `
      <div class="overlayFracaso-caja">
        <h2 class="overlayFracaso-titulo"></h2>
        <p class="overlayFracaso-detalle"></p>
        <div class="overlayConfirmar-botones">
          <button type="button" class="overlayFracaso-boton overlayConfirmar-cancelar"></button>
          <button type="button" class="overlayFracaso-boton overlayConfirmar-aceptar"></button>
        </div>
      </div>`;

    // textContent: el contenido no se interpreta como HTML.
    overlay.querySelector(".overlayFracaso-titulo").textContent = titulo;
    overlay.querySelector(".overlayFracaso-detalle").textContent = detalle;
    const botonCancelar = overlay.querySelector(".overlayConfirmar-cancelar");
    const botonAceptar = overlay.querySelector(".overlayConfirmar-aceptar");
    botonCancelar.textContent = textoCancelar;
    botonAceptar.textContent = textoConfirmar;

    botonCancelar.addEventListener("click", () => {
      overlay.remove();
      if (onCancelar) onCancelar();
    });
    botonAceptar.addEventListener("click", () => {
      overlay.remove();
      if (onConfirmar) onConfirmar();
    });

    document.body.appendChild(overlay);
  };
})();
