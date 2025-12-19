import Phaser from 'phaser';
import { GAME_CONFIG } from '../config';
import { musicManager } from '../audio/MusicManager';
import { submitScore, getStoredPlayerName, setStoredPlayerName, getTopScores } from '../services/LeaderboardService';

export class TitleScene extends Phaser.Scene {
  private isMobile: boolean = false;
  
  constructor() {
    super({ key: 'TitleScene' });
  }

  create() {
    const { width, height } = this.cameras.main;
    this.isMobile = this.registry.get('isMobile') || false;
    
    this.cameras.main.setBackgroundColor(GAME_CONFIG.colors.bg);
    
    // Check for unsaved backup from crash
    this.checkBackupRecovery();
    
    // Initialize music on first interaction
    this.input.once('pointerdown', () => {
      musicManager.init();
    });
    
    // Chase animation
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
    
    // Disease list - 3 per row grid
    const diseases = GAME_CONFIG.levels;
    const rows = [];
    for (let i = 0; i < diseases.length; i += 3) {
      rows.push(diseases.slice(i, i + 3));
    }
    
    const gridStartY = height * 0.46;
    const rowHeight = this.isMobile ? 20 : 24;
    const colWidth = this.isMobile ? 100 : 130;
    
    rows.forEach((row, rowIdx) => {
      const rowY = gridStartY + rowIdx * rowHeight;
      const startX = width / 2 - (row.length - 1) * colWidth / 2;
      
      row.forEach((disease, colIdx) => {
        const x = startX + colIdx * colWidth;
        this.add.text(x, rowY, `${disease.emoji} ${disease.name}`, {
          fontFamily: 'VT323',
          fontSize: this.isMobile ? '11px' : '14px',
          color: `#${disease.color.toString(16).padStart(6, '0')}`,
        }).setOrigin(0.5);
      });
    });
    
    // Start button
    const startBtn = this.add.text(width / 2, height * 0.66, this.isMobile ? 'TAP TO START' : 'START GAME', {
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
    this.input.keyboard?.on('keydown-SPACE', () => this.startGame());
    
    // Settings and Leaderboard buttons
    const settingsBtn = this.add.text(width / 2 - 90, height * 0.75, '⚙️ SETTINGS', {
      fontFamily: '"Press Start 2P"',
      fontSize: '12px',
      color: '#9A8AB0',
      backgroundColor: '#3d2b5e',
      padding: { x: 8, y: 6 },
    }).setOrigin(0.5);
    settingsBtn.setInteractive({ useHandCursor: true });
    settingsBtn.on('pointerover', () => settingsBtn.setStyle({ color: '#FF6B9D' }));
    settingsBtn.on('pointerout', () => settingsBtn.setStyle({ color: '#9A8AB0' }));
    settingsBtn.on('pointerdown', () => this.scene.start('SettingsScene'));
    
    const leaderboardBtn = this.add.text(width / 2 + 90, height * 0.75, '🏆 SCORES', {
      fontFamily: '"Press Start 2P"',
      fontSize: '12px',
      color: '#FFE66D',
      backgroundColor: '#3d2b5e',
      padding: { x: 8, y: 6 },
    }).setOrigin(0.5);
    leaderboardBtn.setInteractive({ useHandCursor: true });
    leaderboardBtn.on('pointerover', () => leaderboardBtn.setStyle({ color: '#FFFFFF' }));
    leaderboardBtn.on('pointerout', () => leaderboardBtn.setStyle({ color: '#FFE66D' }));
    leaderboardBtn.on('pointerdown', () => {
      console.log('Opening leaderboard...');
      this.scene.start('LeaderboardScene');
    });
    
    // About button (below settings/scores)
    const aboutBtn = this.add.text(width / 2, height * 0.82, '📖 ABOUT', {
      fontFamily: '"Press Start 2P"',
      fontSize: '10px',
      color: '#9A8AB0',
    }).setOrigin(0.5);
    aboutBtn.setInteractive({ useHandCursor: true });
    aboutBtn.on('pointerover', () => aboutBtn.setStyle({ color: '#FF6B9D' }));
    aboutBtn.on('pointerout', () => aboutBtn.setStyle({ color: '#9A8AB0' }));
    aboutBtn.on('pointerdown', () => this.scene.start('AboutScene'));
    
    // Controls hint
    const controlsText = this.isMobile 
      ? '🕹️ Joystick to move'
      : '⌨️ WASD / Arrows';
    
    this.add.text(width / 2, height * 0.88, controlsText, {
      fontFamily: 'VT323',
      fontSize: this.isMobile ? '12px' : '14px',
      color: '#9A8AB0',
    }).setOrigin(0.5);
    
    // Disclaimer
    this.add.text(width / 2, height - 25, '⚠️ SATIRE: Vaccines save lives! Get vaccinated! 💉', {
      fontFamily: 'VT323',
      fontSize: '12px',
      color: '#FFE66D',
    }).setOrigin(0.5);
    
    // Version / build time
    const buildDate = new Date(__BUILD_TIME__);
    const versionStr = `v${buildDate.toLocaleDateString()} ${buildDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    this.add.text(width / 2, height - 8, versionStr, {
      fontFamily: 'VT323',
      fontSize: '10px',
      color: '#6A5A7A',
    }).setOrigin(0.5);
  }

  private createChaseAnimation(width: number) {
    const y = 50;
    
    const smiley = this.add.circle(width / 2 - 30, y, 12, 0xFFE135);
    smiley.setStrokeStyle(2, 0xCC9900);
    this.add.circle(width / 2 - 34, y - 3, 2, 0x000000);
    this.add.circle(width / 2 - 26, y - 3, 2, 0x000000);
    
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
    musicManager.init();
    this.cameras.main.fade(200, 0, 0, 0);
    this.time.delayedCall(200, () => {
      this.scene.start('GameScene', {
        gameState: {
          currentLevel: 0,
          activeDebuffs: [],
          totalCollected: 0,
          revivalsUsed: [],
          round: 1,
        },
      });
    });
  }
  
  /**
   * Check for unsaved backup from crash and offer to submit score
   */
  private async checkBackupRecovery() {
    try {
      const backupStr = localStorage.getItem('vaxninja_backup');
      if (!backupStr) return;
      
      const backup = JSON.parse(backupStr);
      const ageMinutes = (Date.now() - backup.timestamp) / 60000;
      
      // Only recover if backup is recent (< 30 minutes) and has a meaningful score
      if (ageMinutes > 30 || backup.totalScore < 5) {
        localStorage.removeItem('vaxninja_backup');
        return;
      }
      
      // Check if it would be a top 10 score
      const topScores = await getTopScores(10);
      const lowestTop10 = topScores.length >= 10 ? topScores[9].score : 0;
      
      if (topScores.length < 10 || backup.totalScore > lowestTop10) {
        // Offer to save the crashed game's score
        const storedName = getStoredPlayerName();
        const playerName = prompt(
          `🔄 RECOVERED SCORE!\n\nYour previous game crashed with score: ${backup.totalScore}\n(Round ${backup.round}, Level ${backup.level})\n\nThis is a TOP 10 score! Enter your name to save it:`,
          storedName || 'Player'
        );
        
        if (playerName && playerName.trim()) {
          setStoredPlayerName(playerName.trim());
          await submitScore({
            name: playerName.trim(),
            score: backup.totalScore,
            level: backup.level,
            time: 0, // Unknown on crash recovery
            debuffs: backup.debuffs || [],
            round: backup.round,
          });
          console.log('✅ Recovered score saved!');
        }
      }
      
      // Clear backup after handling
      localStorage.removeItem('vaxninja_backup');
    } catch (e) {
      console.warn('Failed to check backup recovery:', e);
      localStorage.removeItem('vaxninja_backup');
    }
  }
}
