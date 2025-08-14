let BotonPelea = document.getElementById("pelear");
let BotonAdopcion = document.getElementById("adoptar");
let MenuAtaques = document.getElementById("menudeataques");
function desplegarMenu(){
    MenuAtaques.style.transform = "translateX(0%)";
    BotonPelea.style.transform = "translateX(-200%)";
}
BotonPelea.addEventListener("click", desplegarMenu);