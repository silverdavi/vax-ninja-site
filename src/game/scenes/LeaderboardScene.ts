import Phaser from 'phaser';
import { GAME_CONFIG } from '../config';
import { getTopScores } from '../services/LeaderboardService';

export class LeaderboardScene extends Phaser.Scene {
  private isMobile: boolean = false;
  
  constructor() {
    super({ key: 'LeaderboardScene' });
  }

  create() {
    console.log('LeaderboardScene: create() called');
    const { width, height } = this.cameras.main;
    this.isMobile = this.registry.get('isMobile') || false;
    
    this.cameras.main.setBackgroundColor(GAME_CONFIG.colors.bg);
    
    // Title
    this.add.text(width / 2, 30, '🏆 GLOBAL LEADERBOARD', {
      fontFamily: '"Press Start 2P"',
      fontSize: this.isMobile ? '14px' : '18px',
      color: '#FFE66D',
    }).setOrigin(0.5);
    
    // Loading text
    const loadingText = this.add.text(width / 2, height / 2, 'Loading...', {
      fontFamily: 'VT323',
      fontSize: '20px',
      color: '#9A8AB0',
    }).setOrigin(0.5);
    
    // Fetch and display scores
    this.loadScores(loadingText, width, height);
    
    // Back button
    const backBtn = this.add.text(width / 2, height - 40, '← BACK', {
      fontFamily: '"Press Start 2P"',
      fontSize: '12px',
      color: '#E8E8E8',
      backgroundColor: '#3d2b5e',
      padding: { x: 15, y: 10 },
    }).setOrigin(0.5);
    backBtn.setInteractive({ useHandCursor: true });
    backBtn.on('pointerover', () => backBtn.setStyle({ color: '#FF6B9D' }));
    backBtn.on('pointerout', () => backBtn.setStyle({ color: '#E8E8E8' }));
    backBtn.on('pointerdown', () => this.scene.start('TitleScene'));
    
    this.input.keyboard?.on('keydown-ESC', () => this.scene.start('TitleScene'));
  }
  
  private async loadScores(loadingText: Phaser.GameObjects.Text, width: number, height: number) {
    console.log('LeaderboardScene: loadScores() called');
    try {
      const scores = await getTopScores(10);
      console.log('LeaderboardScene: Got scores:', scores);
      loadingText.destroy();
      
      if (scores.length === 0) {
        this.add.text(width / 2, height / 2 - 20, 'No scores yet!', {
          fontFamily: 'VT323',
          fontSize: '20px',
          color: '#9A8AB0',
        }).setOrigin(0.5);
        
        this.add.text(width / 2, height / 2 + 10, 'Be the first to play!', {
          fontFamily: 'VT323',
          fontSize: '16px',
          color: '#FF6B9D',
        }).setOrigin(0.5);
        return;
      }
      
      // Column layout - responsive
      const headerY = 65;
      const headerSize = this.isMobile ? '8px' : '10px';
      const dataSize = this.isMobile ? '14px' : '16px';
      
      // Column positions (proportional)
      const cols = {
        rank: 20,
        name: 50,
        score: this.isMobile ? width * 0.35 : width * 0.30,
        level: this.isMobile ? width * 0.50 : width * 0.45,
        diseases: this.isMobile ? width * 0.62 : width * 0.55,
        date: this.isMobile ? width * 0.82 : width * 0.75,
      };
      
      // Headers
      this.add.text(cols.rank, headerY, '#', { fontFamily: '"Press Start 2P"', fontSize: headerSize, color: '#9A8AB0' });
      this.add.text(cols.name, headerY, 'NAME', { fontFamily: '"Press Start 2P"', fontSize: headerSize, color: '#9A8AB0' });
      this.add.text(cols.score, headerY, 'SCORE', { fontFamily: '"Press Start 2P"', fontSize: headerSize, color: '#9A8AB0' });
      this.add.text(cols.level, headerY, 'LVL', { fontFamily: '"Press Start 2P"', fontSize: headerSize, color: '#9A8AB0' });
      this.add.text(cols.diseases, headerY, '🦠', { fontSize: '14px' });
      this.add.text(cols.date, headerY, 'DATE', { fontFamily: '"Press Start 2P"', fontSize: headerSize, color: '#9A8AB0' });
      
      // Divider line
      const line = this.add.graphics();
      line.lineStyle(1, 0x9A8AB0, 0.5);
      line.lineBetween(15, headerY + 18, width - 15, headerY + 18);
      
      // Score entries
      const rowHeight = this.isMobile ? 32 : 38;
      const startY = headerY + 28;
      
      scores.forEach((entry, index) => {
        const y = startY + index * rowHeight;
        const color = index === 0 ? '#FFE66D' : index === 1 ? '#C0C0C0' : index === 2 ? '#CD7F32' : '#E8E8E8';
        
        // Rank with medal
        const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}`;
        this.add.text(cols.rank, y, medal, { fontFamily: 'VT323', fontSize: dataSize, color });
        
        // Name (truncate)
        const maxNameLen = this.isMobile ? 6 : 8;
        const displayName = entry.name.length > maxNameLen ? entry.name.slice(0, maxNameLen - 1) + '..' : entry.name;
        this.add.text(cols.name, y, displayName, { fontFamily: 'VT323', fontSize: dataSize, color });
        
        // Score
        this.add.text(cols.score, y, `${entry.score}`, { fontFamily: 'VT323', fontSize: dataSize, color: '#39FF14' });
        
        // Level
        this.add.text(cols.level, y, `${entry.level}`, { fontFamily: 'VT323', fontSize: dataSize, color });
        
        // Diseases as emojis (compact)
        const emojis = this.getDebuffEmojis(entry.debuffs);
        this.add.text(cols.diseases, y, emojis || '-', { fontSize: this.isMobile ? '10px' : '12px' });
        
        // Date
        const dateStr = entry.timestamp 
          ? new Date(entry.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          : '-';
        this.add.text(cols.date, y, dateStr, { fontFamily: 'VT323', fontSize: this.isMobile ? '12px' : '14px', color: '#9A8AB0' });
      });
      
    } catch (error) {
      loadingText.setText('Error loading scores');
      loadingText.setStyle({ color: '#FF4444' });
    }
  }
  
  private getDebuffEmojis(debuffs: string[]): string {
    return debuffs.map(id => {
      const level = GAME_CONFIG.levels.find(l => l.id === id);
      return level ? level.emoji : '';
    }).join('');
  }
}
