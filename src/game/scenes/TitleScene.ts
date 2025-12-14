import Phaser from 'phaser';
import { GAME_CONFIG } from '../config';

export class TitleScene extends Phaser.Scene {
  private isMobile: boolean = false;
  
  constructor() {
    super({ key: 'TitleScene' });
  }

  create() {
    const { width, height } = this.cameras.main;
    this.isMobile = this.registry.get('isMobile') || false;
    
    this.cameras.main.setBackgroundColor(GAME_CONFIG.colors.bg);
    
    // Animated chase preview
    this.createChaseAnimation(width);
    
    // Title
    const titleSize = this.isMobile ? '28px' : '42px';
    const title = this.add.text(width / 2, height * 0.15, 'VAX NINJA', {
      fontFamily: '"Press Start 2P"',
      fontSize: titleSize,
      color: '#39FF14',
    });
    title.setOrigin(0.5);
    title.setShadow(0, 0, '#39FF14', 10, true, true);
    
    // Subtitle
    this.add.text(width / 2, height * 0.22, 'THE ANTI-VAXXER SIMULATOR', {
      fontFamily: 'VT323',
      fontSize: this.isMobile ? '16px' : '20px',
      color: '#9A8AB0',
    }).setOrigin(0.5);
    
    // Instructions
    this.add.text(width / 2, height * 0.35, 
      'Run from the doctor!\nCollect all diseases!\n\nEach disease = permanent debuff!', {
      fontFamily: 'VT323',
      fontSize: this.isMobile ? '14px' : '18px',
      color: '#FF6B9D',
      align: 'center',
    }).setOrigin(0.5);
    
    // Disease list
    const diseases = GAME_CONFIG.levels.map(l => `${l.emoji} ${l.name}`);
    const diseaseText = this.isMobile 
      ? diseases.slice(0, 3).join('  ') + '\n' + diseases.slice(3).join('  ')
      : diseases.join('  ');
    
    this.add.text(width / 2, height * 0.5, diseaseText, {
      fontFamily: 'VT323',
      fontSize: this.isMobile ? '12px' : '16px',
      color: '#9A8AB0',
      align: 'center',
    }).setOrigin(0.5);
    
    // Start button
    const startBtn = this.add.text(width / 2, height * 0.65, this.isMobile ? 'TAP TO START' : 'CLICK OR PRESS SPACE', {
      fontFamily: '"Press Start 2P"',
      fontSize: this.isMobile ? '14px' : '18px',
      color: '#1a0a2e',
      backgroundColor: '#39FF14',
      padding: { x: 20, y: 12 },
    });
    startBtn.setOrigin(0.5);
    startBtn.setInteractive({ useHandCursor: true });
    
    this.tweens.add({
      targets: startBtn,
      scale: 1.05,
      duration: 500,
      yoyo: true,
      repeat: -1,
    });
    
    startBtn.on('pointerdown', () => this.startGame());
    this.input.on('pointerdown', () => this.startGame());
    this.input.keyboard?.on('keydown-SPACE', () => this.startGame());
    
    // Controls hint
    const controlsText = this.isMobile 
      ? '🕹️ Use joystick to move'
      : '⌨️ WASD or Arrow Keys to move';
    
    this.add.text(width / 2, height * 0.78, controlsText, {
      fontFamily: 'VT323',
      fontSize: this.isMobile ? '14px' : '16px',
      color: '#9A8AB0',
    }).setOrigin(0.5);
    
    // Disclaimer
    this.add.text(width / 2, height - 50, '⚠️ SATIRE: Vaccines save lives!', {
      fontFamily: 'VT323',
      fontSize: '14px',
      color: '#FFE66D',
    }).setOrigin(0.5);
    
    this.add.text(width / 2, height - 28, 'Get vaccinated!', {
      fontFamily: 'VT323',
      fontSize: '14px',
      color: '#FFE66D',
    }).setOrigin(0.5);
  }

  private createChaseAnimation(width: number) {
    const y = 50;
    
    // Smiley
    const smiley = this.add.circle(width / 2 - 30, y, 12, 0xFFE135);
    smiley.setStrokeStyle(2, 0xCC9900);
    this.add.circle(width / 2 - 34, y - 3, 2, 0x000000);
    this.add.circle(width / 2 - 26, y - 3, 2, 0x000000);
    
    // Doctor
    const doctor = this.add.circle(width / 2 + 30, y, 12, 0xFFFFFF);
    doctor.setStrokeStyle(2, 0x00D4FF);
    
    const cross = this.add.graphics();
    cross.fillStyle(0xFF0000);
    cross.fillRect(width / 2 + 28, y - 4, 4, 8);
    cross.fillRect(width / 2 + 26, y - 2, 8, 4);
    
    this.tweens.add({
      targets: smiley,
      x: smiley.x - 20,
      duration: 500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  private startGame() {
    this.cameras.main.fade(200, 0, 0, 0);
    this.time.delayedCall(200, () => {
      this.scene.start('GameScene', {
        gameState: {
          currentLevel: 0,
          activeDebuffs: [],
        },
      });
    });
  }
}
