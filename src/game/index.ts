import Phaser from 'phaser';
import { GAME_CONFIG } from './config';
import { BootScene } from './scenes/BootScene';
import { TitleScene } from './scenes/TitleScene';
import { GameScene } from './scenes/GameScene';
import { GameOverScene } from './scenes/GameOverScene';
import { SettingsScene } from './scenes/SettingsScene';

export function createGame(parent: HTMLElement): Phaser.Game {
  const isMobile = window.innerWidth < 600 || 'ontouchstart' in window;
  
  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: GAME_CONFIG.width,
    height: GAME_CONFIG.height,
    parent,
    backgroundColor: `#${GAME_CONFIG.colors.bg.toString(16).padStart(6, '0')}`,
    scene: [BootScene, TitleScene, SettingsScene, GameScene, GameOverScene],
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
      width: GAME_CONFIG.width,
      height: GAME_CONFIG.height,
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
  game.registry.set('isMobile', isMobile);
  
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
