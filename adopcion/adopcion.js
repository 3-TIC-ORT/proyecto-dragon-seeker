let secuencia = [];        // Secuencia generada por el juego
let secuenciaUsuario = []; // Secuencia ingresada por el usuario
let intento = 1;           // Tiene 2 intentos

const botones = document.querySelectorAll(".btn");

// Genera una secuencia de longitud N
function generarSecuencia(n = 4) {
    secuencia = [];
    for (let i = 0; i < n; i++) {
        const num = Math.floor(Math.random() * 8) + 1; // 1 a 8
        secuencia.push(num);
    }
}

// Muestra la secuencia iluminando los botones
function mostrarSecuencia() {
    let delay = 0;

    secuencia.forEach((num, i) => {
        const btn = botones[num - 1];

        setTimeout(() => {
            btn.classList.add("iluminar");
            setTimeout(() => btn.classList.remove("iluminar"), 500);
        }, delay);

        delay += 800; 
    });
}

// Empieza el juego
function iniciarJuego() {
    generarSecuencia(); // 4 elementos random
    secuenciaUsuario = [];
    intento = 1;

    setTimeout(mostrarSecuencia, 500);
}

// Compara lo que puso el usuario
function verificar() {
    if (secuenciaUsuario.length !== secuencia.length) return;

    const correcta = secuencia.every((n, i) => n === secuenciaUsuario[i]);

    if (correcta) {
        console.log("¡Secuencia correcta! Pasás.");
        alert("¡Secuencia correcta! Lo adoptaste!")
        // ACÁ VA LO QUE PASA SI GANA
        return;
    }

    // Si falló
    if (intento === 1) {
        intento++;
        secuenciaUsuario = [];
        alert("Fallaste, te queda un intento.");
        setTimeout(mostrarSecuencia, 500);
    } else {
        alert("Fallaste otra vez. Volvés al mapa.");
        window.location.href = "mapa.html"; // CAMBIÁ ESTO
    }
}

// Click del jugador
botones.forEach(btn => {
    btn.addEventListener("click", () => {
        const valor = Number(btn.textContent);
        secuenciaUsuario.push(valor);

        if (secuenciaUsuario.length === secuencia.length) {
            verificar();
        }
    });
});

// Arranca automáticamente
iniciarJuego();