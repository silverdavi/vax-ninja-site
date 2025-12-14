import Phaser from 'phaser';
import { GAME_CONFIG } from '../config';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    // Create loading bar
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    const progressBox = this.add.graphics();
    const progressBar = this.add.graphics();
    
    progressBox.fillStyle(GAME_CONFIG.colors.bgElevated, 0.8);
    progressBox.fillRect(width / 2 - 160, height / 2 - 25, 320, 50);
    
    const loadingText = this.add.text(width / 2, height / 2 - 50, 'LOADING...', {
      fontFamily: '"Press Start 2P"',
      fontSize: '16px',
      color: '#FF6B9D',
    });
    loadingText.setOrigin(0.5, 0.5);
    
    // Progress bar events
    this.load.on('progress', (value: number) => {
      progressBar.clear();
      progressBar.fillStyle(GAME_CONFIG.colors.accent, 1);
      progressBar.fillRect(width / 2 - 150, height / 2 - 15, 300 * value, 30);
    });
    
    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
    });
    
    // We're generating graphics programmatically, so just a tiny delay
    this.load.image('placeholder', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==');
  }

  create() {
    this.scene.start('TitleScene');
  }
}
