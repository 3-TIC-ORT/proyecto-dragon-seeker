# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Dragon Seekers is a browser-based RPG built as a school project ("3-TIC-ORT / proyecto-dragon-seeker"). The user logs in, walks around a Phaser tilemap world, encounters dragons, fights them in a separate battle screen, and can adopt defeated dragons via a Simon-says mini-game. The codebase is split between a Node `BACKEND/` (Soquetic socket server) and several independent frontend folders that the browser navigates between via `window.location.href`.

All user-facing strings, function names, file names, and JSON keys are in Spanish — preserve that convention. Don't rename things to English.

## Running the project

There is no build step and no `npm` script that runs the app. Two processes are needed:

1. **Backend (Soquetic server):** from `BACKEND/`, run `node index.js`. It prints `Servidor iniciado` on success. The server uses `soquetic` (a thin socket.io wrapper) and persists everything to JSON files alongside the source (`usuarios.json`, `progreso.json`, `dragones.json`, `estadoJuego.json`, etc.) — there is no database.
2. **Frontend:** the HTML pages are served by a static server (Live Server / VS Code's "Go Live" on port 5501 — see the hard-coded redirect in `inicioSesion/login.js`). Open `inicioSesion/inicioSesion.html` to start the flow.

The browser talks to the backend via the **SoqueTIC client** (`<script src="https://cdn.jsdelivr.net/gh/JZylber/SoqueTIC-Client@v1.4.2/soquetic-client.js">`) loaded from CDN in each HTML file. That client exposes the globals used throughout the frontend: `connect2Server()`, `postEvent(event, data, cb)`, `getEvent(event, cb)`. There are no `import` statements for these — they come from the CDN script tag.

There is no test suite and no linter. `npm test` is a placeholder that exits 1.

## Architecture

### Backend: event-driven RPC over Soquetic

`BACKEND/index.js` is the only entrypoint. It wires every gameplay action to a Soquetic event name via `subscribePOSTEvent` / `subscribeGETEvent`. The handler unpacks `data` / `query` and forwards to a domain module. Every domain module returns `{ exito: true/false, mensaje, ...payload }` — keep this shape when adding new endpoints; the frontend checks `exito` everywhere.

Domain modules (each owns its own JSON file via `fs.readFileSync` / `fs.writeFileSync`):

- `autorizacion.js` — registration/login against `usuarios.json`. On register, automatically calls `habilitardragon(nuevoId, 4)` so every new user starts with Chimuelo (dragon id 4).
- `progresousuario.js` — per-user, per-dragon progress in `progreso.json`: levels, exp, vida, fuerza, unlocked attacks, `habilitado` flag. `asegurar(lista, user, dragon)` lazily creates a progress row if missing. `sumarexperiencia` cascades level-ups and stat increases in a single call.
- `dragones.js` — reads the static catalogue `dragones.json`, then in `obtenerlistadragones(idusuario)` merges per-user state from `progreso.json` (this is the "hydrate dragons with user progress" pattern used by inventory / map).
- `batalla_ataques.js` — attack tables (`ATAQUES_POR_TIPO`, `ATAQUES_BOSS`) and type effectiveness modifiers used during fights.
- `estadoJuego.js` — persisted world state per `(user, mapa)` pair (player position, defeated enemies, etc.). Keyed by both id and map number; saving overwrites the existing row for that pair.
- `customizacion.js`, `notificaciones.js`, `items.js`, `logros.js`, `zonas.js` — character customization, in-game notifications, items, achievements, zones.

When adding a new feature, the pattern is: add a function to the relevant domain module, register it in `BACKEND/index.js`, and call it from the frontend via `postEvent` / `getEvent`.

### Frontend: multiple sibling apps, navigation by URL

Each folder is a self-contained mini-app with its own HTML/CSS/JS — the user moves between them with `window.location.href`. State is passed across navigations via `localStorage` (notably `usuario`, `dragon_enemigo`, `vidaFinalRival`, `dragonardo`). Every page that needs server data calls `connect2Server()` at the top, then `postEvent`/`getEvent`.

- `inicioSesion/` — login & registration. On successful login redirects to the Phaser game at `http://127.0.0.1:5501/FRONTEND-PEDRO/Phaser/RPG%20prueba/RPG%201/index.html` (hard-coded).
- `FRONTEND-PEDRO/Phaser/RPG prueba/RPG 1/` — the main Phaser 3 game world. `src/main.js` configures Phaser with scenes `[Boot, Preloader, Game, Casa, GameOver]`. `Game.js` loads the Tiled map (`assets/mapa1.json`) plus dragon spritesheets pulled from `../../../../../../BACKEND/img/*.png` (the relative path crosses out of the Phaser folder into the backend — keep this in mind when moving files). Dragons that appear on the map come from `obtenerdragones` filtered by `mapa === 1`. The game restores prior position via `obtenerEstadoJuego` and saves via `guardarEstadoJuego`.
- `FRONTEND-PEDRO/Tiled/` — source `.tmx`/`.tmj`/`.tsx` Tiled project files used to author the maps that are exported as JSON into the Phaser `assets/` folder. The Phaser scene only loads the exported JSON, not the Tiled source.
- `FRONTEND-PEDRO/Phaser/Primer juego/` — older standalone Phaser experiment; not part of the live flow.
- `pelea/` — turn-based battle UI. `peleadesplegada.html` is the battle screen, `pelea.js` drives the menu, `ataques.js` resolves attacks.
- `adopcion/` — post-victory Simon-says mini-game. `adopcion.js` derives sequence length from `vidaFinalRival` stored in localStorage; success calls `adoptarDragon` on the backend.
- `inventario/` — list of the user's dragons. `main.js` calls `obtenerdragonesUsuario` and renders cards (`dragonNormal` / `dragonEspecial` / `dragonBloqueado`).
- `BACKEND/img/` — dragon spritesheets are stored here, not in any frontend `assets/` folder. The Phaser scene loads them via a deep relative path; other pages load them via the static server. If you move backend files, you'll break these references.

### Data conventions

- `usuarios.json`: flat list `{ id, nombre, correo, contrasena }`. IDs are `usuarios.length + 1` at insert time.
- `progreso.json`: flat list keyed by `(user, dragon)`. `habilitado: true` means the user owns the dragon.
- `dragones.json`: static catalogue; per-user overrides live in `progreso.json` and get merged in `obtenerlistadragones`.
- `estadoJuego.json`: list of `{ user, mapa, ... }` rows; one row per (user, map).
- IDs flowing from the browser arrive as strings — backend handlers cast with `Number(...)` before comparing. Match this when adding new endpoints.

### Gotchas

- The "Front MAP" entry at the repo root is a 2-byte text file, not a directory. Ignore it.
- File and folder names contain spaces (`FRONTEND-PEDRO/Phaser/RPG prueba/RPG 1`, `Front MAP`) — quote paths in shell commands.
- The login redirect URL and several asset paths are hard-coded to `127.0.0.1:5501` and to specific relative depths. Changing the directory layout will silently break navigation and sprite loading.
- The repo has a `node_modules/` checked in implicitly via the dependencies in `package.json` (`soquetic`, `fs`, `install`). Only `soquetic` is actually used; `fs` is a built-in (the npm `fs` package is a known-typo-squat placeholder) and `install` is unused.
