// Splash: cualquier click o tecla lleva al menu principal.
// Se usa { once: true } para no disparar la navegacion mas de una vez.
function continuar() {
  window.location.href = "menu.html";
}

document.addEventListener("click", continuar, { once: true });
document.addEventListener("keydown", continuar, { once: true });
