import Phaser from 'phaser';
import { GAME_CONFIG } from './config';
import { BootScene } from './scenes/BootScene';
import { TitleScene } from './scenes/TitleScene';
import { GameScene } from './scenes/GameScene';
import { GameOverScene } from './scenes/GameOverScene';

export function createGame(parent: HTMLElement): Phaser.Game {
  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: GAME_CONFIG.width,
    height: GAME_CONFIG.height,
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
    },
  };

  const game = new Phaser.Game(config);
  
  // Auto-focus the canvas when it's created
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
