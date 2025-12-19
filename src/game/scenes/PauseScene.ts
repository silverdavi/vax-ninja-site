import Phaser from 'phaser';

/**
 * Pause Scene - Overlay when ESC is pressed
 */
export class PauseScene extends Phaser.Scene {
  private parentSceneKey: string = 'GameScene';
  
  constructor() {
    super({ key: 'PauseScene' });
  }
  
  init(data: { parentScene: string }) {
    this.parentSceneKey = data.parentScene || 'GameScene';
  }
  
  create() {
    const { width, height } = this.cameras.main;
    
    // Semi-transparent overlay
    const overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.7);
    overlay.setOrigin(0, 0);
    
    // Pause text
    this.add.text(width / 2, height * 0.3, '⏸️ PAUSED', {
      fontFamily: '"Press Start 2P"',
      fontSize: '24px',
      color: '#FFE66D',
    }).setOrigin(0.5);
    
    // Resume button
    const resumeBtn = this.add.text(width / 2, height * 0.5, '▶️ RESUME (ESC)', {
      fontFamily: '"Press Start 2P"',
      fontSize: '14px',
      color: '#39FF14',
      backgroundColor: '#3d2b5e',
      padding: { x: 20, y: 12 },
    }).setOrigin(0.5);
    resumeBtn.setInteractive({ useHandCursor: true });
    resumeBtn.on('pointerover', () => resumeBtn.setStyle({ color: '#FFFFFF' }));
    resumeBtn.on('pointerout', () => resumeBtn.setStyle({ color: '#39FF14' }));
    resumeBtn.on('pointerdown', () => this.resume());
    
    // Exit button
    const exitBtn = this.add.text(width / 2, height * 0.65, '✖️ EXIT TO MENU', {
      fontFamily: '"Press Start 2P"',
      fontSize: '12px',
      color: '#FF6B9D',
      backgroundColor: '#3d2b5e',
      padding: { x: 20, y: 10 },
    }).setOrigin(0.5);
    exitBtn.setInteractive({ useHandCursor: true });
    exitBtn.on('pointerover', () => exitBtn.setStyle({ color: '#FFFFFF' }));
    exitBtn.on('pointerout', () => exitBtn.setStyle({ color: '#FF6B9D' }));
    exitBtn.on('pointerdown', () => this.exitToMenu());
    
    // Hint
    this.add.text(width / 2, height * 0.85, 'Press ESC to resume', {
      fontFamily: 'VT323',
      fontSize: '16px',
      color: '#9A8AB0',
    }).setOrigin(0.5);
    
    // ESC to resume
    this.input.keyboard?.on('keydown-ESC', () => this.resume());
  }
  
  private resume() {
    this.scene.resume(this.parentSceneKey);
    this.scene.stop();
  }
  
  private exitToMenu() {
    this.scene.stop(this.parentSceneKey);
    this.scene.start('TitleScene');
  }
}
