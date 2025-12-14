import Phaser from 'phaser';
import { GAME_CONFIG } from '../config';

export class TitleScene extends Phaser.Scene {
  constructor() {
    super({ key: 'TitleScene' });
  }

  create() {
    const { width, height } = this.cameras.main;
    this.cameras.main.setBackgroundColor(GAME_CONFIG.colors.bg);
    
    // Animated chase preview
    this.createChaseAnimation(width);
    
    // Title
    const title = this.add.text(width / 2, 100, 'VAX NINJA', {
      fontFamily: '"Press Start 2P"',
      fontSize: '28px',
      color: '#39FF14',
    });
    title.setOrigin(0.5);
    title.setShadow(0, 0, '#39FF14', 10, true, true);
    
    // Subtitle
    this.add.text(width / 2, 140, 'THE ANTI-VAXXER SIMULATOR', {
      fontFamily: 'VT323',
      fontSize: '18px',
      color: '#9A8AB0',
    }).setOrigin(0.5);
    
    // Instructions
    this.add.text(width / 2, 200, 
      'Run from the doctor!\nCollect all diseases!\n\nEach disease gives you a\nPERMANENT debuff!', {
      fontFamily: 'VT323',
      fontSize: '16px',
      color: '#FF6B9D',
      align: 'center',
    }).setOrigin(0.5);
    
    // Disease list (compact)
    const diseases = GAME_CONFIG.levels.slice(0, 3).map(l => `${l.emoji} ${l.name}`).join('  ');
    const diseases2 = GAME_CONFIG.levels.slice(3).map(l => `${l.emoji} ${l.name}`).join('  ');
    
    this.add.text(width / 2, 290, diseases, {
      fontFamily: 'VT323',
      fontSize: '14px',
      color: '#9A8AB0',
    }).setOrigin(0.5);
    
    this.add.text(width / 2, 310, diseases2, {
      fontFamily: 'VT323',
      fontSize: '14px',
      color: '#9A8AB0',
    }).setOrigin(0.5);
    
    // Start button - large and tap-friendly
    const startBtn = this.add.text(width / 2, 400, 'TAP TO START', {
      fontFamily: '"Press Start 2P"',
      fontSize: '18px',
      color: '#1a0a2e',
      backgroundColor: '#39FF14',
      padding: { x: 20, y: 15 },
    });
    startBtn.setOrigin(0.5);
    startBtn.setInteractive({ useHandCursor: true });
    
    // Pulse animation
    this.tweens.add({
      targets: startBtn,
      scale: 1.05,
      duration: 500,
      yoyo: true,
      repeat: -1,
    });
    
    startBtn.on('pointerdown', () => this.startGame());
    
    // Also tap anywhere to start
    this.input.on('pointerdown', () => this.startGame());
    this.input.keyboard?.on('keydown-SPACE', () => this.startGame());
    
    // Controls hint
    this.add.text(width / 2, 480, '🕹️ Use joystick or arrow keys', {
      fontFamily: 'VT323',
      fontSize: '16px',
      color: '#9A8AB0',
    }).setOrigin(0.5);
    
    // Disclaimer
    this.add.text(width / 2, height - 60, '⚠️ SATIRE: Vaccines save lives!', {
      fontFamily: 'VT323',
      fontSize: '14px',
      color: '#FFE66D',
    }).setOrigin(0.5);
    
    this.add.text(width / 2, height - 35, 'Get vaccinated!', {
      fontFamily: 'VT323',
      fontSize: '14px',
      color: '#FFE66D',
    }).setOrigin(0.5);
  }

  private createChaseAnimation(width: number) {
    const y = 50;
    
    // Smiley (player)
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
    
    // Chase animation
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
