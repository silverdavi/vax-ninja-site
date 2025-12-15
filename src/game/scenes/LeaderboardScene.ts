import Phaser from 'phaser';
import { GAME_CONFIG } from '../config';
import { getTopScores } from '../services/LeaderboardService';

export class LeaderboardScene extends Phaser.Scene {
  private isMobile: boolean = false;
  
  constructor() {
    super({ key: 'LeaderboardScene' });
  }

  create() {
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
    try {
      const scores = await getTopScores(10);
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
      
      // Column headers
      const headerY = 70;
      const fontSize = this.isMobile ? '10px' : '12px';
      
      this.add.text(50, headerY, '#', { fontFamily: '"Press Start 2P"', fontSize, color: '#9A8AB0' });
      this.add.text(80, headerY, 'NAME', { fontFamily: '"Press Start 2P"', fontSize, color: '#9A8AB0' });
      this.add.text(width - 200, headerY, 'LVL', { fontFamily: '"Press Start 2P"', fontSize, color: '#9A8AB0' });
      this.add.text(width - 130, headerY, 'DISEASES', { fontFamily: '"Press Start 2P"', fontSize, color: '#9A8AB0' });
      
      // Score entries
      const rowHeight = this.isMobile ? 35 : 40;
      scores.forEach((entry, index) => {
        const y = 100 + index * rowHeight;
        const color = index === 0 ? '#FFE66D' : index === 1 ? '#C0C0C0' : index === 2 ? '#CD7F32' : '#E8E8E8';
        
        // Rank
        const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}`;
        this.add.text(50, y, medal, { fontFamily: 'VT323', fontSize: '16px', color });
        
        // Name (truncate if too long)
        const displayName = entry.name.length > 12 ? entry.name.slice(0, 10) + '..' : entry.name;
        this.add.text(80, y, displayName, { fontFamily: 'VT323', fontSize: '16px', color });
        
        // Level
        this.add.text(width - 200, y, `${entry.level}`, { fontFamily: 'VT323', fontSize: '16px', color });
        
        // Diseases as emojis
        const emojis = this.getDebuffEmojis(entry.debuffs);
        this.add.text(width - 130, y, emojis, { fontSize: '14px' });
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
