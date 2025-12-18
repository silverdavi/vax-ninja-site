import Phaser from 'phaser';

/**
 * About Scene - The story behind the game
 */
export class AboutScene extends Phaser.Scene {
  private isMobile: boolean = false;
  
  constructor() {
    super({ key: 'AboutScene' });
  }
  
  create() {
    const { width, height } = this.cameras.main;
    this.isMobile = this.registry.get('isMobile') || false;
    
    this.cameras.main.setBackgroundColor(0x1a0a2e);
    
    const fontSize = this.isMobile ? '12px' : '14px';
    const titleSize = this.isMobile ? '14px' : '18px';
    const contentWidth = width - 60;
    
    // Title
    this.add.text(width / 2, 25, '📖 ABOUT THIS GAME', {
      fontFamily: '"Press Start 2P"',
      fontSize: titleSize,
      color: '#FFE66D',
    }).setOrigin(0.5);
    
    // The story
    const story = `Daniel, 7 years old, became vaccine-aversive.

He started developing arguments that vaccines are "dangerous" - classic misinformation talking points.

So we had a talk about how vaccines have saved MILLIONS of lives. How smallpox killed countless people until vaccines ERADICATED it. How polio paralyzed children until Jonas Salk's vaccine nearly eliminated it.

Then Daniel asked: "Can we make a game about it?"

And so VAX NINJA was born! 🎮

The idea is simple but powerful: Run from the doctor, "successfully" catch diseases... and then SUFFER the consequences. Each disease gives you a permanent debuff that makes the game harder.

Meanwhile, the doctor spews actual anti-vax nonsense - showing how ridiculous these arguments sound.

The revival quiz teaches REAL vaccine science - so you learn while you play!

In an age of misinformation - where a worm-brained RFK spreads dangerous lies about vaccines - we need to arm our kids with FACTS.

Vaccines save lives. Get vaccinated! 💉`;

    this.add.text(width / 2, 60, story, {
      fontFamily: 'VT323',
      fontSize,
      color: '#E8E8E8',
      wordWrap: { width: contentWidth },
      align: 'center',
      lineSpacing: 4,
    }).setOrigin(0.5, 0);
    
    // Credits
    this.add.text(width / 2, height - 70, 'Made with ❤️ by David & Daniel Silver', {
      fontFamily: 'VT323',
      fontSize: '14px',
      color: '#FF6B9D',
    }).setOrigin(0.5);
    
    this.add.text(width / 2, height - 50, '🔬 Science > Misinformation 🔬', {
      fontFamily: 'VT323',
      fontSize: '12px',
      color: '#39FF14',
    }).setOrigin(0.5);
    
    // Back button
    const backBtn = this.add.text(width / 2, height - 25, '← BACK', {
      fontFamily: '"Press Start 2P"',
      fontSize: '10px',
      color: '#9A8AB0',
      backgroundColor: '#3d2b5e',
      padding: { x: 12, y: 6 },
    }).setOrigin(0.5);
    backBtn.setInteractive({ useHandCursor: true });
    backBtn.on('pointerover', () => backBtn.setStyle({ color: '#FF6B9D' }));
    backBtn.on('pointerout', () => backBtn.setStyle({ color: '#9A8AB0' }));
    backBtn.on('pointerdown', () => this.scene.start('TitleScene'));
    
    this.input.keyboard?.on('keydown-ESC', () => this.scene.start('TitleScene'));
  }
}
