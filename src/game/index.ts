import Phaser from 'phaser';
import { GAME_CONFIG } from './config';
import { BootScene } from './scenes/BootScene';
import { TitleScene } from './scenes/TitleScene';
import { GameScene } from './scenes/GameScene';
import { GameOverScene } from './scenes/GameOverScene';

export function createGame(parent: HTMLElement): Phaser.Game {
  // Detect if mobile
  const isMobile = window.innerWidth < 768 || 'ontouchstart' in window;
  
  // Calculate responsive size
  const maxWidth = Math.min(window.innerWidth, 800);
  const maxHeight = window.innerHeight;
  
  // For mobile: leave room for joystick
  const gameHeight = isMobile ? maxHeight - 140 : maxHeight;
  
  // Maintain aspect ratio
  const aspectRatio = GAME_CONFIG.width / GAME_CONFIG.height;
  let width = maxWidth;
  let height = width / aspectRatio;
  
  if (height > gameHeight) {
    height = gameHeight;
    width = height * aspectRatio;
  }
  
  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: Math.floor(width),
    height: Math.floor(height),
    parent,
    backgroundColor: `#${GAME_CONFIG.colors.bg.toString(16).padStart(6, '0')}`,
    scene: [BootScene, TitleScene, GameScene, GameOverScene],
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { x: 0, y: 0 },
        debug: false,
      },
    },
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    render: {
      antialias: false,
      pixelArt: true,
    },
    input: {
      keyboard: true,
      touch: true,
    },
  };

  const game = new Phaser.Game(config);
  
  // Store mobile flag in registry for scenes to access
  game.registry.set('isMobile', isMobile);
  
  // Auto-focus the canvas
  game.events.on('ready', () => {
    const canvas = parent.querySelector('canvas');
    if (canvas) {
      canvas.setAttribute('tabindex', '0');
      canvas.focus();
    }
  });
  
  return game;
}

export { GAME_CONFIG };
