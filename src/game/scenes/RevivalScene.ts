import Phaser from 'phaser';
import { getRandomFact, VaccineFact } from '../data/vaccineFacts';
import { GameState } from './GameScene';

/**
 * Revival Scene - Quiz to get another chance!
 * Answer a vaccine science question correctly to revive.
 * Only available once per level.
 */
export class RevivalScene extends Phaser.Scene {
  private gameState!: GameState;
  private collected!: number;
  private totalTime!: number;
  private currentFact!: VaccineFact;
  private isMobile: boolean = false;
  private answered: boolean = false;
  
  constructor() {
    super({ key: 'RevivalScene' });
  }
  
  init(data: { gameState: GameState; collected: number; totalTime: number }) {
    this.gameState = data.gameState;
    this.collected = data.collected;
    this.totalTime = data.totalTime;
    this.answered = false;
    this.currentFact = getRandomFact();
  }
  
  create() {
    const { width, height } = this.cameras.main;
    this.isMobile = this.registry.get('isMobile') || false;
    
    this.cameras.main.setBackgroundColor(0x1a0a2e);
    
    // Title
    this.add.text(width / 2, 30, '💉 SECOND CHANCE! 💉', {
      fontFamily: '"Press Start 2P"',
      fontSize: this.isMobile ? '12px' : '16px',
      color: '#FFE66D',
    }).setOrigin(0.5);
    
    this.add.text(width / 2, 55, 'Answer correctly to revive!', {
      fontFamily: 'VT323',
      fontSize: '16px',
      color: '#9A8AB0',
    }).setOrigin(0.5);
    
    // Question
    const questionText = this.add.text(width / 2, 100, this.currentFact.question, {
      fontFamily: 'VT323',
      fontSize: this.isMobile ? '18px' : '22px',
      color: '#E8E8E8',
      wordWrap: { width: width - 60 },
      align: 'center',
    }).setOrigin(0.5, 0);
    
    // Answer buttons
    const buttonStartY = questionText.y + questionText.height + 30;
    const buttonHeight = this.isMobile ? 50 : 60;
    const buttonSpacing = 10;
    
    this.currentFact.choices.forEach((choice, index) => {
      const y = buttonStartY + index * (buttonHeight + buttonSpacing);
      
      const btn = this.add.text(width / 2, y, `${index + 1}. ${choice}`, {
        fontFamily: 'VT323',
        fontSize: this.isMobile ? '16px' : '18px',
        color: '#E8E8E8',
        backgroundColor: '#3d2b5e',
        padding: { x: 15, y: 12 },
        wordWrap: { width: width - 80 },
      }).setOrigin(0.5, 0);
      
      btn.setInteractive({ useHandCursor: true });
      
      btn.on('pointerover', () => {
        if (!this.answered) btn.setStyle({ backgroundColor: '#5d4b7e' });
      });
      
      btn.on('pointerout', () => {
        if (!this.answered) btn.setStyle({ backgroundColor: '#3d2b5e' });
      });
      
      btn.on('pointerdown', () => this.selectAnswer(index, btn));
      
      // Keyboard shortcuts
      this.input.keyboard?.on(`keydown-${index + 1}`, () => this.selectAnswer(index, btn));
    });
    
    // Skip button
    const skipBtn = this.add.text(width / 2, height - 40, 'SKIP (Accept Death)', {
      fontFamily: '"Press Start 2P"',
      fontSize: '10px',
      color: '#9A8AB0',
    }).setOrigin(0.5);
    skipBtn.setInteractive({ useHandCursor: true });
    skipBtn.on('pointerover', () => skipBtn.setStyle({ color: '#FF6B9D' }));
    skipBtn.on('pointerout', () => skipBtn.setStyle({ color: '#9A8AB0' }));
    skipBtn.on('pointerdown', () => this.goToGameOver());
    
    // Timer (10 seconds to answer)
    const timerText = this.add.text(width - 20, 20, '10', {
      fontFamily: '"Press Start 2P"',
      fontSize: '20px',
      color: '#FF6B9D',
    }).setOrigin(1, 0);
    
    let timeLeft = 10;
    this.time.addEvent({
      delay: 1000,
      repeat: 9,
      callback: () => {
        timeLeft--;
        timerText.setText(`${timeLeft}`);
        if (timeLeft <= 3) timerText.setColor('#FF4444');
        if (timeLeft === 0 && !this.answered) {
          this.answered = true; // Prevent further input
          this.showResult(false, null);
        }
      },
    });
  }
  
  private selectAnswer(index: number, btn: Phaser.GameObjects.Text) {
    if (this.answered) return;
    this.answered = true;
    
    const correct = index === this.currentFact.correctIndex;
    
    // Visual feedback
    if (correct) {
      btn.setStyle({ backgroundColor: '#39FF14', color: '#000000' });
    } else {
      btn.setStyle({ backgroundColor: '#FF4444', color: '#FFFFFF' });
    }
    
    this.showResult(correct, index);
  }
  
  private showResult(correct: boolean, _selectedIndex: number | null) {
    const { width, height } = this.cameras.main;
    
    // Show fact
    this.add.text(width / 2, height - 120, `📚 ${this.currentFact.fact}`, {
      fontFamily: 'VT323',
      fontSize: '14px',
      color: '#9A8AB0',
      wordWrap: { width: width - 40 },
      align: 'center',
    }).setOrigin(0.5);
    
    if (correct) {
      // REVIVED!
      this.add.text(width / 2, height / 2 + 80, '✅ CORRECT! YOU LIVE!', {
        fontFamily: '"Press Start 2P"',
        fontSize: this.isMobile ? '14px' : '18px',
        color: '#39FF14',
      }).setOrigin(0.5);
      
      // Mark revival used for this level
      if (!this.gameState.revivalsUsed) {
        this.gameState.revivalsUsed = [];
      }
      this.gameState.revivalsUsed.push(this.gameState.currentLevel);
      
      this.time.delayedCall(2000, () => {
        // Restart the level fresh (but with revival used up)
        this.scene.start('GameScene', {
          gameState: this.gameState,
          revived: true,
        });
      });
      
    } else {
      // DEAD
      const correctAnswer = this.currentFact.choices[this.currentFact.correctIndex];
      this.add.text(width / 2, height / 2 + 60, '❌ WRONG!', {
        fontFamily: '"Press Start 2P"',
        fontSize: this.isMobile ? '14px' : '18px',
        color: '#FF4444',
      }).setOrigin(0.5);
      
      this.add.text(width / 2, height / 2 + 90, `Correct: ${correctAnswer}`, {
        fontFamily: 'VT323',
        fontSize: '16px',
        color: '#FFE66D',
      }).setOrigin(0.5);
      
      this.time.delayedCall(3000, () => this.goToGameOver());
    }
  }
  
  private goToGameOver() {
    console.log('[DEBUG] RevivalScene: Going to GameOverScene (wrong answer or timeout)');
    this.scene.start('GameOverScene', {
      won: false,
      gameState: this.gameState,
      message: 'The doctor caught you!',
      collected: this.collected,
      totalTime: this.totalTime,
    });
  }
}
