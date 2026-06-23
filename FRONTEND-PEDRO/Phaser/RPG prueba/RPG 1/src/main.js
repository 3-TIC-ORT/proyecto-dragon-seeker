import { Boot } from "./scenes/Boot.js";
import { Game } from "./scenes/Game.js";
import { Casa } from "./scenes/Casa.js";
import { zonaBoss } from "./scenes/zonaBoss.js";
import { GameOver } from "./scenes/GameOver.js";
import { Preloader } from "./scenes/Preloader.js";

const config = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  scene: [Boot, Preloader, Game, Casa, zonaBoss, GameOver],
  render: {
    antialias: false,
    pixelArt: true,
    roundPixels: true,
  },
  physics: {
    default: "arcade",
    arcade: {
      debug: false,
    },
  },
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
};
new Phaser.Game(config);
