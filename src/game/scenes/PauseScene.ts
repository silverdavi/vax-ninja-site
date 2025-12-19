import Phaser from 'phaser';
import { loadSettings, SCORE_MULTIPLIERS } from '../config';
import { submitScore, getStoredPlayerName, setStoredPlayerName, getTopScores } from '../services/LeaderboardService';

interface GameState {
  currentLevel: number;
  activeDebuffs: string[];
  totalCollected: number;
  revivalsUsed: number[];
  round: number;
}

/**
 * Pause Scene - Overlay when ESC is pressed
 */
export class PauseScene extends Phaser.Scene {
  private parentSceneKey: string = 'GameScene';
  private gameState?: GameState;
  private currentCollected: number = 0;
  
  constructor() {
    super({ key: 'PauseScene' });
  }
  
  init(data: { parentScene: string; gameState?: GameState; collected?: number }) {
    this.parentSceneKey = data.parentScene || 'GameScene';
    this.gameState = data.gameState;
    this.currentCollected = data.collected || 0;
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
  
  private async exitToMenu() {
    // Check if score qualifies for leaderboard before exiting!
    if (this.gameState) {
      const settings = loadSettings();
      const modifier = SCORE_MULTIPLIERS[settings.difficulty] || 1.0;
      const totalScore = Math.floor((this.gameState.totalCollected + this.currentCollected) * modifier);
      
      if (totalScore > 0) {
        try {
          const topScores = await getTopScores(10);
          const lowestTop10 = topScores.length >= 10 ? topScores[9].score : 0;
          
          if (topScores.length < 10 || totalScore > lowestTop10) {
            // Top 10! Prompt for name
            const storedName = getStoredPlayerName();
            const playerName = prompt(`🏆 TOP 10! Score: ${totalScore}\nEnter your name:`, storedName || 'Player');
            
            if (playerName && playerName.trim()) {
              setStoredPlayerName(playerName.trim());
              await submitScore({
                name: playerName.trim(),
                score: totalScore,
                level: this.gameState.currentLevel + 1,
                time: 0, // Unknown time on early exit
                debuffs: [...this.gameState.activeDebuffs],
                round: this.gameState.round || 1,
              });
              console.log('✅ Score saved before exit!');
            }
          }
        } catch (err) {
          console.error('Failed to check/save score on exit:', err);
        }
      }
    }
    
    this.scene.stop(this.parentSceneKey);
    this.scene.start('TitleScene');
  }
}
