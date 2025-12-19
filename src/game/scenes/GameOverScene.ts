import Phaser from 'phaser';
import { GAME_CONFIG, loadSettings } from '../config';
import { submitScore, getStoredPlayerName, setStoredPlayerName, getTopScores } from '../services/LeaderboardService';

interface GameState {
  currentLevel: number;
  activeDebuffs: string[];
  totalCollected: number; // Total collectibles eaten across all levels
  revivalsUsed: number[]; // Levels where revival was already used
}

export class GameOverScene extends Phaser.Scene {
  private won: boolean = false;
  private gameState!: GameState;
  private message: string = '';
  private isMobile: boolean = false;
  private totalTime: number = 0;
  private scoreSubmitted: boolean = false;
  private finalScore: number = 0;
  private difficulty: string = 'normal';
  
  constructor() {
    super({ key: 'GameOverScene' });
  }

  init(data: { won: boolean; gameState: GameState; message: string; totalTime?: number; collected?: number }) {
    this.won = data.won;
    this.gameState = data.gameState;
    this.gameState.totalCollected = this.gameState.totalCollected || 0;
    // Add current level's collected to total
    if (data.collected) {
      this.gameState.totalCollected += data.collected;
    }
    this.message = data.message;
    this.totalTime = data.totalTime || 0;
    this.scoreSubmitted = false;
    
    // Calculate final score with difficulty modifier
    const settings = loadSettings();
    this.difficulty = settings.difficulty;
    let modifier = 1.0;
    if (settings.difficulty === 'hard') modifier = 1.25;
    else if (settings.difficulty === 'easy') modifier = 0.75;
    
    this.finalScore = Math.floor(this.gameState.totalCollected * modifier);
  }

  create() {
    console.log('[DEBUG] GameOverScene: create() called, won =', this.won);
    const { width, height } = this.cameras.main;
    const level = GAME_CONFIG.levels[this.gameState.currentLevel];
    this.isMobile = this.registry.get('isMobile') || false;
    
    this.cameras.main.setBackgroundColor(GAME_CONFIG.colors.bg);
    
    const titleSize = this.isMobile ? '16px' : '22px';
    const textSize = this.isMobile ? '14px' : '18px';
    
    // Always show score
    const diffLabel = this.difficulty === 'hard' ? ' (+25%)' : this.difficulty === 'easy' ? ' (-25%)' : '';
    this.add.text(width / 2, height * 0.95, `SCORE: ${this.finalScore}${diffLabel}`, {
      fontFamily: '"Press Start 2P"',
      fontSize: '10px',
      color: '#FFE66D',
    }).setOrigin(0.5);
    
    // Check if this is a top 10 score - ONLY on death or final victory
    // Don't prompt after each level win (that's annoying!)
    const isLastLevel = this.gameState.currentLevel >= GAME_CONFIG.levels.length - 1;
    const shouldCheckScore = !this.won || isLastLevel; // Death OR final level complete
    
    if (shouldCheckScore) {
      this.time.delayedCall(1500, () => {
        if (this.scene.isActive('GameOverScene')) {
          this.checkAndSubmitScore();
        }
      });
    }
    
    if (this.won) {
      // === WIN ===
      this.add.text(width / 2, height * 0.1, level.emoji, { fontSize: '48px' }).setOrigin(0.5);
      
      this.add.text(width / 2, height * 0.22, 'DISEASE\nACQUIRED!', {
        fontFamily: '"Press Start 2P"',
        fontSize: titleSize,
        color: '#39FF14',
        align: 'center',
      }).setOrigin(0.5);
      
      this.add.text(width / 2, height * 0.35, this.message, {
        fontFamily: 'VT323',
        fontSize: textSize,
        color: '#E8E8E8',
      }).setOrigin(0.5);
      
      // New debuff
      this.add.text(width / 2, height * 0.42, '⚠️ NEW DEBUFF: ' + level.debuff, {
        fontFamily: 'VT323',
        fontSize: textSize,
        color: '#FFE66D',
      }).setOrigin(0.5);
      
      // All debuffs
      if (this.gameState.activeDebuffs.length > 0) {
        const debuffList = this.gameState.activeDebuffs.map(id => {
          const l = GAME_CONFIG.levels.find(x => x.id === id);
          return l ? l.emoji : '';
        }).join(' ');
        
        this.add.text(width / 2, height * 0.5, 'Your diseases: ' + debuffList, {
          fontFamily: 'VT323',
          fontSize: '16px',
          color: '#9A8AB0',
        }).setOrigin(0.5);
      }
      
      // Next level or complete
      const nextLevel = this.gameState.currentLevel + 1;
      if (nextLevel < GAME_CONFIG.levels.length) {
        const next = GAME_CONFIG.levels[nextLevel];
        
        this.add.text(width / 2, height * 0.6, `Next: ${next.emoji} ${next.name}`, {
          fontFamily: 'VT323',
          fontSize: textSize,
          color: '#E8E8E8',
        }).setOrigin(0.5);
        
        const nextBtn = this.add.text(width / 2, height * 0.72, this.isMobile ? 'TAP FOR NEXT' : 'SPACE FOR NEXT', {
          fontFamily: '"Press Start 2P"',
          fontSize: this.isMobile ? '12px' : '14px',
          color: '#1a0a2e',
          backgroundColor: '#39FF14',
          padding: { x: 15, y: 10 },
        }).setOrigin(0.5);
        nextBtn.setInteractive({ useHandCursor: true });
        
        this.tweens.add({ targets: nextBtn, scale: 1.05, duration: 400, yoyo: true, repeat: -1 });
        
        const goNext = () => {
          this.scene.start('GameScene', {
            gameState: {
              currentLevel: nextLevel,
              activeDebuffs: this.gameState.activeDebuffs,
              totalCollected: this.gameState.totalCollected,
              revivalsUsed: this.gameState.revivalsUsed || [],
            },
          });
        };
        
        nextBtn.on('pointerdown', goNext);
        this.input.on('pointerdown', goNext);
        this.input.keyboard?.on('keydown-SPACE', goNext);
        
      } else {
        // === GAME COMPLETE - SUBMIT TO LEADERBOARD ===
        this.add.text(width / 2, height * 0.55, '🎉 ALL DISEASES COLLECTED! 🎉', {
          fontFamily: '"Press Start 2P"',
          fontSize: this.isMobile ? '10px' : '14px',
          color: '#FF6B9D',
        }).setOrigin(0.5);
        
        this.add.text(width / 2, height * 0.63, "You're a walking biohazard!", {
          fontFamily: 'VT323',
          fontSize: textSize,
          color: '#FFE66D',
        }).setOrigin(0.5);
        
        const menuBtn = this.add.text(width / 2, height * 0.80, 'VIEW LEADERBOARD', {
          fontFamily: '"Press Start 2P"',
          fontSize: '12px',
          color: '#FFE66D',
          backgroundColor: '#3d2b5e',
          padding: { x: 12, y: 8 },
        }).setOrigin(0.5);
        menuBtn.setInteractive({ useHandCursor: true });
        menuBtn.on('pointerdown', () => this.scene.start('LeaderboardScene'));
        
        this.add.text(width / 2, height * 0.95, 'Press M for menu', {
          fontFamily: 'VT323',
          fontSize: '12px',
          color: '#9A8AB0',
        }).setOrigin(0.5);
      }
      
    } else {
      // === LOSE ===
      this.add.text(width / 2, height * 0.12, '💉', { fontSize: '48px' }).setOrigin(0.5);
      
      this.add.text(width / 2, height * 0.25, 'VACCINATED!', {
        fontFamily: '"Press Start 2P"',
        fontSize: titleSize,
        color: '#00D4FF',
      }).setOrigin(0.5);
      
      this.add.text(width / 2, height * 0.35, this.message, {
        fontFamily: 'VT323',
        fontSize: textSize,
        color: '#E8E8E8',
      }).setOrigin(0.5);
      
      this.add.text(width / 2, height * 0.42, `Level ${this.gameState.currentLevel + 1}: ${level.name}`, {
        fontFamily: 'VT323',
        fontSize: '16px',
        color: '#9A8AB0',
      }).setOrigin(0.5);
      
      this.add.text(width / 2, height * 0.55, 'You are now protected from\npreventable diseases.\nHow terrible! 😭', {
        fontFamily: 'VT323',
        fontSize: '16px',
        color: '#FFE66D',
        align: 'center',
      }).setOrigin(0.5);
      
      // Check if revival was used - if so, no retry (TRUE game over)
      const revivalUsedForLevel = this.gameState.revivalsUsed?.includes(this.gameState.currentLevel);
      
      if (revivalUsedForLevel) {
        // TRUE GAME OVER - no more chances
        this.add.text(width / 2, height * 0.72, '💀 GAME OVER 💀', {
          fontFamily: '"Press Start 2P"',
          fontSize: this.isMobile ? '14px' : '16px',
          color: '#FF4444',
        }).setOrigin(0.5);
        
        const menuBtn = this.add.text(width / 2, height * 0.82, 'BACK TO MENU', {
          fontFamily: '"Press Start 2P"',
          fontSize: this.isMobile ? '10px' : '12px',
          color: '#1a0a2e',
          backgroundColor: '#9A8AB0',
          padding: { x: 15, y: 10 },
        }).setOrigin(0.5);
        menuBtn.setInteractive({ useHandCursor: true });
        menuBtn.on('pointerdown', () => this.scene.start('TitleScene'));
        this.input.keyboard?.on('keydown-SPACE', () => this.scene.start('TitleScene'));
      } else {
        // First death on this level - allow retry
        const retryBtn = this.add.text(width / 2, height * 0.72, this.isMobile ? 'TAP TO RETRY' : 'SPACE TO RETRY', {
          fontFamily: '"Press Start 2P"',
          fontSize: this.isMobile ? '12px' : '14px',
          color: '#1a0a2e',
          backgroundColor: '#FF6B9D',
          padding: { x: 15, y: 10 },
        }).setOrigin(0.5);
        retryBtn.setInteractive({ useHandCursor: true });
        
        this.tweens.add({ targets: retryBtn, scale: 1.05, duration: 400, yoyo: true, repeat: -1 });
        
        const retry = () => {
          const prevDebuffs = this.gameState.activeDebuffs.filter(id => id !== level.id);
          this.scene.start('GameScene', {
            gameState: {
              currentLevel: this.gameState.currentLevel,
              activeDebuffs: prevDebuffs,
              totalCollected: this.gameState.totalCollected,
              revivalsUsed: this.gameState.revivalsUsed || [],
            },
          });
        };
        
        retryBtn.on('pointerdown', retry);
        this.input.on('pointerdown', retry);
        this.input.keyboard?.on('keydown-SPACE', retry);
      }
    }
    
    // Menu hint
    this.add.text(width / 2, height - 25, 'M = Menu', {
      fontFamily: 'VT323',
      fontSize: '14px',
      color: '#9A8AB0',
    }).setOrigin(0.5);
    
    this.input.keyboard?.on('keydown-M', () => this.scene.start('TitleScene'));
  }
  
  private async checkAndSubmitScore() {
    // Guard: only run if we're still on GameOverScene and haven't submitted
    if (this.scoreSubmitted) return;
    if (!this.scene.isActive('GameOverScene')) return;
    
    const { width, height } = this.cameras.main;
    
    // Check if we qualify for top 10
    try {
      const topScores = await getTopScores(10);
      
      // Double-check we're still on GameOverScene after async call
      if (!this.scene.isActive('GameOverScene')) return;
      if (this.scoreSubmitted) return;
      
      const lowestTop10 = topScores.length < 10 ? 0 : Math.min(...topScores.map(s => s.score));
      
      console.log('Top 10 check:', { finalScore: this.finalScore, lowestTop10, topCount: topScores.length });
      
      // If we qualify for top 10 (or there are less than 10 scores)
      if (this.finalScore > lowestTop10 || topScores.length < 10) {
        this.scoreSubmitted = true;
        
        // Prompt for name
        let playerName = getStoredPlayerName();
        
        const promptText = topScores.length < 10 
          ? `🏆 TOP 10! Enter your name:` 
          : `🏆 NEW HIGH SCORE! Enter your name:`;
        
        playerName = window.prompt(promptText, playerName || 'Anonymous') || 'Anonymous';
        setStoredPlayerName(playerName);
        
        // Submit score (only if still on this scene)
        if (this.scene.isActive('GameOverScene')) {
          await submitScore({
            name: playerName,
            score: this.finalScore,
            level: this.gameState.currentLevel + 1,
            time: this.totalTime,
            debuffs: [...this.gameState.activeDebuffs],
          });
          
          this.add.text(width / 2, height * 0.88, `🏆 "${playerName}" added to leaderboard!`, {
            fontFamily: 'VT323',
            fontSize: '14px',
            color: '#39FF14',
          }).setOrigin(0.5);
        }
      }
    } catch (e) {
      console.warn('Could not check leaderboard:', e);
    }
  }
}
