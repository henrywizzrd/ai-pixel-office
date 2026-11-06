import Phaser from 'phaser';
import { OfficeScene } from './scenes/OfficeScene.js';
import { initHud } from './ui/hud.js';

initHud();

const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  backgroundColor: '#141221',
  pixelArt: true,
  roundPixels: true,
  scale: {
    mode: Phaser.Scale.RESIZE,
    width: window.innerWidth,
    height: window.innerHeight,
  },
  input: { activePointers: 3 },
  scene: [OfficeScene],
});

// Tiện debug trong console trình duyệt
window.game = game;
