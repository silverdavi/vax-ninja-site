import Phaser from 'phaser';
import { GAME_CONFIG } from '../config';

interface GameState {
  currentLevel: number;
  activeDebuffs: string[];
}

export class GameOverScene extends Phaser.Scene {
  private won: boolean = false;
  private gameState!: GameState;
  private message: string = '';
  
  constructor() {
    super({ key: 'GameOverScene' });
  }

  init(data: { won: boolean; gameState: GameState; message: string }) {
    this.won = data.won;
    this.gameState = data.gameState;
    this.message = data.message;
  }

  create() {
    const { width, height } = this.cameras.main;
    const level = GAME_CONFIG.levels[this.gameState.currentLevel];
    
    this.cameras.main.setBackgroundColor(GAME_CONFIG.colors.bg);
    
    if (this.won) {
      // === WIN ===
      this.add.text(width / 2, 50, level.emoji, { fontSize: '48px' }).setOrigin(0.5);
      
      this.add.text(width / 2, 110, 'DISEASE\nACQUIRED!', {
        fontFamily: '"Press Start 2P"',
        fontSize: '18px',
        color: '#39FF14',
        align: 'center',
      }).setOrigin(0.5);
      
      this.add.text(width / 2, 170, this.message, {
        fontFamily: 'VT323',
        fontSize: '18px',
        color: '#E8E8E8',
      }).setOrigin(0.5);
      
      // New debuff
      this.add.text(width / 2, 210, '⚠️ NEW DEBUFF:', {
        fontFamily: '"Press Start 2P"',
        fontSize: '8px',
        color: '#FFE66D',
      }).setOrigin(0.5);
      
      this.add.text(width / 2, 235, level.debuff, {
        fontFamily: 'VT323',
        fontSize: '20px',
        color: '#FF6B9D',
      }).setOrigin(0.5);
      
      // All debuffs
      if (this.gameState.activeDebuffs.length > 0) {
        const debuffList = this.gameState.activeDebuffs.map(id => {
          const l = GAME_CONFIG.levels.find(x => x.id === id);
          return l ? l.emoji : '';
        }).join(' ');
        
        this.add.text(width / 2, 280, 'Your diseases: ' + debuffList, {
          fontFamily: 'VT323',
          fontSize: '16px',
          color: '#9A8AB0',
        }).setOrigin(0.5);
      }
      
      // Next level or complete
      const nextLevel = this.gameState.currentLevel + 1;
      if (nextLevel < GAME_CONFIG.levels.length) {
        const next = GAME_CONFIG.levels[nextLevel];
        
        this.add.text(width / 2, 340, `Next: ${next.emoji} ${next.name}`, {
          fontFamily: 'VT323',
          fontSize: '18px',
          color: '#E8E8E8',
        }).setOrigin(0.5);
        
        const nextBtn = this.add.text(width / 2, 400, 'TAP FOR NEXT LEVEL', {
          fontFamily: '"Press Start 2P"',
          fontSize: '12px',
          color: '#1a0a2e',
          backgroundColor: '#39FF14',
          padding: { x: 15, y: 12 },
        }).setOrigin(0.5);
        nextBtn.setInteractive({ useHandCursor: true });
        
        this.tweens.add({ targets: nextBtn, scale: 1.05, duration: 400, yoyo: true, repeat: -1 });
        
        const goNext = () => {
          this.scene.start('GameScene', {
            gameState: {
              currentLevel: nextLevel,
              activeDebuffs: this.gameState.activeDebuffs,
            },
          });
        };
        
        nextBtn.on('pointerdown', goNext);
        this.input.on('pointerdown', goNext);
        this.input.keyboard?.on('keydown-SPACE', goNext);
        
      } else {
        this.add.text(width / 2, 350, '🎉 ALL DISEASES\nCOLLECTED! 🎉', {
          fontFamily: '"Press Start 2P"',
          fontSize: '12px',
          color: '#FF6B9D',
          align: 'center',
        }).setOrigin(0.5);
        
        this.add.text(width / 2, 420, "You're a walking biohazard!", {
          fontFamily: 'VT323',
          fontSize: '18px',
          color: '#FFE66D',
        }).setOrigin(0.5);
        
        // Menu button
        const menuBtn = this.add.text(width / 2, 500, 'MAIN MENU', {
          fontFamily: '"Press Start 2P"',
          fontSize: '12px',
          color: '#9A8AB0',
        }).setOrigin(0.5);
        menuBtn.setInteractive({ useHandCursor: true });
        menuBtn.on('pointerdown', () => this.scene.start('TitleScene'));
      }
      
    } else {
      // === LOSE ===
      this.add.text(width / 2, 60, '💉', { fontSize: '48px' }).setOrigin(0.5);
      
      this.add.text(width / 2, 120, 'VACCINATED!', {
        fontFamily: '"Press Start 2P"',
        fontSize: '18px',
        color: '#00D4FF',
      }).setOrigin(0.5);
      
      this.add.text(width / 2, 170, this.message, {
        fontFamily: 'VT323',
        fontSize: '18px',
        color: '#E8E8E8',
      }).setOrigin(0.5);
      
      this.add.text(width / 2, 220, `Level ${this.gameState.currentLevel + 1}: ${level.name}`, {
        fontFamily: 'VT323',
        fontSize: '16px',
        color: '#9A8AB0',
      }).setOrigin(0.5);
      
      // Satire
      this.add.text(width / 2, 280, 'You are now protected from\npreventable diseases.\nHow terrible! 😭', {
        fontFamily: 'VT323',
        fontSize: '16px',
        color: '#FFE66D',
        align: 'center',
      }).setOrigin(0.5);
      
      // Retry button
      const retryBtn = this.add.text(width / 2, 380, 'TAP TO TRY AGAIN', {
        fontFamily: '"Press Start 2P"',
        fontSize: '12px',
        color: '#1a0a2e',
        backgroundColor: '#FF6B9D',
        padding: { x: 15, y: 12 },
      }).setOrigin(0.5);
      retryBtn.setInteractive({ useHandCursor: true });
      
      this.tweens.add({ targets: retryBtn, scale: 1.05, duration: 400, yoyo: true, repeat: -1 });
      
      const retry = () => {
        const prevDebuffs = this.gameState.activeDebuffs.filter(id => id !== level.id);
        this.scene.start('GameScene', {
          gameState: {
            currentLevel: this.gameState.currentLevel,
            activeDebuffs: prevDebuffs,
          },
        });
      };
      
      retryBtn.on('pointerdown', retry);
      this.input.on('pointerdown', retry);
      this.input.keyboard?.on('keydown-SPACE', retry);
    }
    
    // Menu at bottom
    this.add.text(width / 2, height - 30, 'M = Menu', {
      fontFamily: 'VT323',
      fontSize: '14px',
      color: '#9A8AB0',
    }).setOrigin(0.5);
    
    this.input.keyboard?.on('keydown-M', () => this.scene.start('TitleScene'));
  }
}
