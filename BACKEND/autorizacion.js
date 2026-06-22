import fs from "fs";

const rutausuarios = "./usuarios.json";

function leerusuarios() {
  const texto = fs.readFileSync(rutausuarios, "utf-8");
  return JSON.parse(texto);
}

function guardarusuarios(usuarios) {
  const texto = JSON.stringify(usuarios, null, 2);
  fs.writeFileSync(rutausuarios, texto);
}

export function registrarusuario(nombre, correo, contrasena) {
  const usuarios = leerusuarios();

  let existe = false;
  let i = 0;
  while (i < usuarios.length) {
    if (usuarios[i].correo === correo) {
      existe = true;
    }
    i = i + 1;
  }

  if (existe) {
    return { exito: false, mensaje: "El correo ya esta registrado" };
  }

  const nuevo = {
    id: usuarios.length + 1,
    nombre: nombre,
    correo: correo,
    contrasena: contrasena,
  };

  usuarios.push(nuevo);
  guardarusuarios(usuarios);

  // El dragon inicial ya no se da al registrarse: ahora pertenece a la PARTIDA.
  // Se habilita al crear una partida nueva (ver crearPartida en partidas.js).

  return {
    exito: true,
    mensaje: "Usuario registrado con exito",
    usuario: nuevo,
  };
}

export function iniciarsesion(nombre, contrasena) {
  const usuarios = leerusuarios();

  let usuario = null;
  let i = 0;
  while (i < usuarios.length) {
    if (
      usuarios[i].nombre === nombre &&
      usuarios[i].contrasena === contrasena
    ) {
      usuario = usuarios[i];
    }
    i = i + 1;
  }

  if (usuario === null) {
    return { exito: false, mensaje: "Usuario o contraseña incorrectos" };
  }

  return { exito: true, mensaje: "Sesion iniciada", usuario: usuario };
}
