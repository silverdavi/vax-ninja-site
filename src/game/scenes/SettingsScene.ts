import Phaser from 'phaser';
import { GAME_CONFIG, loadSettings, saveSettings, GameSettings } from '../config';
import { musicManager } from '../audio/MusicManager';

export class SettingsScene extends Phaser.Scene {
  private settings!: GameSettings;
  private difficultyText!: Phaser.GameObjects.Text;
  private volumeText!: Phaser.GameObjects.Text;
  
  constructor() {
    super({ key: 'SettingsScene' });
  }

  create() {
    const { width, height } = this.cameras.main;
    this.cameras.main.setBackgroundColor(GAME_CONFIG.colors.bg);
    
    this.settings = loadSettings();
    
    // Title
    this.add.text(width / 2, 50, 'SETTINGS', {
      fontFamily: '"Press Start 2P"',
      fontSize: '24px',
      color: '#FF6B9D',
    }).setOrigin(0.5);
    
    // === Difficulty ===
    this.add.text(width / 2, 140, 'DIFFICULTY', {
      fontFamily: '"Press Start 2P"',
      fontSize: '12px',
      color: '#E8E8E8',
    }).setOrigin(0.5);
    
    this.add.text(width / 2, 165, '(Doctor Speed)', {
      fontFamily: 'VT323',
      fontSize: '14px',
      color: '#9A8AB0',
    }).setOrigin(0.5);
    
    // Difficulty buttons (5 options in 2 rows)
    const diffY1 = 200;
    const diffY2 = 235;
    const spacing = 80;
    
    this.createButton(width / 2 - spacing, diffY1, 'NOOB', () => this.setDifficulty('noob'));
    this.createButton(width / 2, diffY1, 'EASY', () => this.setDifficulty('easy'));
    this.createButton(width / 2 + spacing, diffY1, 'NORMAL', () => this.setDifficulty('normal'));
    
    this.createButton(width / 2 - spacing / 2, diffY2, 'HARD', () => this.setDifficulty('hard'));
    this.createButton(width / 2 + spacing / 2, diffY2, 'MASTER', () => this.setDifficulty('master'));
    
    this.difficultyText = this.add.text(width / 2, 275, this.getDifficultyLabel(), {
      fontFamily: 'VT323',
      fontSize: '16px',
      color: '#39FF14',
    }).setOrigin(0.5);
    
    // === Volume ===
    this.add.text(width / 2, 320, 'MUSIC VOLUME', {
      fontFamily: '"Press Start 2P"',
      fontSize: '12px',
      color: '#E8E8E8',
    }).setOrigin(0.5);
    
    // Volume slider (simple buttons)
    const volY = 370;
    this.createButton(width / 2 - 80, volY, '−', () => this.adjustVolume(-0.05));
    this.createButton(width / 2 + 80, volY, '+', () => this.adjustVolume(0.05));
    
    this.volumeText = this.add.text(width / 2, volY, this.getVolumeLabel(), {
      fontFamily: '"Press Start 2P"',
      fontSize: '14px',
      color: '#00D4FF',
    }).setOrigin(0.5);
    
    // Mute button
    const muteBtn = this.add.text(width / 2, 420, this.settings.musicVolume === 0 ? '🔇 MUTED' : '🔊 MUTE', {
      fontFamily: '"Press Start 2P"',
      fontSize: '10px',
      color: '#9A8AB0',
      backgroundColor: '#3d2b5e',
      padding: { x: 10, y: 8 },
    }).setOrigin(0.5);
    muteBtn.setInteractive({ useHandCursor: true });
    muteBtn.on('pointerdown', () => {
      if (this.settings.musicVolume > 0) {
        this.settings.musicVolume = 0;
      } else {
        this.settings.musicVolume = 0.15;
      }
      saveSettings(this.settings);
      musicManager.setVolume(this.settings.musicVolume);
      this.volumeText.setText(this.getVolumeLabel());
      muteBtn.setText(this.settings.musicVolume === 0 ? '🔇 MUTED' : '🔊 MUTE');
    });
    
    // Back button
    const backBtn = this.add.text(width / 2, height - 80, '← BACK', {
      fontFamily: '"Press Start 2P"',
      fontSize: '14px',
      color: '#E8E8E8',
      backgroundColor: '#3d2b5e',
      padding: { x: 20, y: 12 },
    }).setOrigin(0.5);
    backBtn.setInteractive({ useHandCursor: true });
    backBtn.on('pointerover', () => backBtn.setStyle({ color: '#39FF14' }));
    backBtn.on('pointerout', () => backBtn.setStyle({ color: '#E8E8E8' }));
    backBtn.on('pointerdown', () => {
      this.scene.start('TitleScene');
    });
    
    // ESC to go back
    this.input.keyboard?.on('keydown-ESC', () => {
      this.scene.start('TitleScene');
    });
  }
  
  private createButton(x: number, y: number, label: string, callback: () => void): Phaser.GameObjects.Text {
    const btn = this.add.text(x, y, label, {
      fontFamily: '"Press Start 2P"',
      fontSize: '10px',
      color: '#E8E8E8',
      backgroundColor: '#3d2b5e',
      padding: { x: 8, y: 6 },
    }).setOrigin(0.5);
    btn.setInteractive({ useHandCursor: true });
    btn.on('pointerover', () => btn.setStyle({ color: '#FF6B9D' }));
    btn.on('pointerout', () => btn.setStyle({ color: '#E8E8E8' }));
    btn.on('pointerdown', callback);
    return btn;
  }
  
  private setDifficulty(diff: GameSettings['difficulty']) {
    this.settings.difficulty = diff;
    saveSettings(this.settings);
    this.difficultyText.setText(this.getDifficultyLabel());
  }
  
  private adjustVolume(delta: number) {
    this.settings.musicVolume = Math.max(0, Math.min(1, this.settings.musicVolume + delta));
    saveSettings(this.settings);
    musicManager.setVolume(this.settings.musicVolume);
    this.volumeText.setText(this.getVolumeLabel());
  }
  
  private getDifficultyLabel(): string {
    switch (this.settings.difficulty) {
      case 'noob': return '👶 NOOB (Doctor -30%, Score ×0.5)';
      case 'easy': return '😊 EASY (Doctor -15%, Score ×0.75)';
      case 'hard': return '😤 HARD (Doctor +15%, Score ×1.25)';
      case 'master': return '💀 MASTER (Doctor +30%, Score ×1.5)';
      default: return '😐 NORMAL (Score ×1.0)';
    }
  }
  
  private getVolumeLabel(): string {
    const pct = Math.round(this.settings.musicVolume * 100);
    return `${pct}%`;
  }
}
