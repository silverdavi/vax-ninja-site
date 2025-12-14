import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { Doctor } from '../entities/Doctor';
import { Maze } from '../entities/Maze';
import { GAME_CONFIG, MAZES, loadSettings } from '../config';
import { musicManager } from '../audio/MusicManager';
import { getRandomTaunt } from '../data/doctorTaunts';

export interface GameState {
  currentLevel: number;
  activeDebuffs: string[];
}

export class GameScene extends Phaser.Scene {
  private player!: Player;
  private doctor!: Doctor;
  private maze!: Maze;
  
  private collectibles: Phaser.GameObjects.Arc[] = [];
  private oxygenTanks: Phaser.GameObjects.Arc[] = [];
  
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: { W: Phaser.Input.Keyboard.Key; A: Phaser.Input.Keyboard.Key; S: Phaser.Input.Keyboard.Key; D: Phaser.Input.Keyboard.Key };
  private inputDirection: 'up' | 'down' | 'left' | 'right' | 'none' = 'none';
  
  // Joystick
  private joystickBase?: Phaser.GameObjects.Arc;
  private joystickThumb?: Phaser.GameObjects.Arc;
  private isMobile: boolean = false;
  
  // Game state
  private gameState!: GameState;
  private collected: number = 0;
  private totalToCollect: number = 0;
  private isGameOver: boolean = false;
  
  // Debuff state
  private oxygenLevel: number = 100;
  private speedMultiplier: number = 1;
  private needsOxygen: boolean = false; // Only true AFTER beating COVID
  private hasBlur: boolean = false; // Measles blur effect
  private blurSpots: Phaser.GameObjects.Arc[] = []; // Visual obstruction spots
  private hasLimp: boolean = false; // Polio limp effect
  
  // UI
  private scoreText!: Phaser.GameObjects.Text;
  private oxygenText?: Phaser.GameObjects.Text;
  private lowO2Overlay?: Phaser.GameObjects.Rectangle;
  
  // Speech bubbles
  private speechBubbles: Phaser.GameObjects.Container[] = [];
  private lastTauntTime: number = 0;
  
  constructor() {
    super({ key: 'GameScene' });
  }

  init(data: { gameState?: GameState }) {
    this.gameState = data.gameState || { currentLevel: 0, activeDebuffs: [] };
    this.collected = 0;
    this.isGameOver = false;
    this.oxygenLevel = 100;
    this.speedMultiplier = 1;
    this.collectibles = [];
    this.oxygenTanks = [];
    this.inputDirection = 'none';
    this.speechBubbles = [];
    this.lastTauntTime = 0;
    
    // O2 is only needed if you ALREADY HAVE COVID (beat level 1)
    // NOT during level 1 itself
    this.needsOxygen = this.gameState.activeDebuffs.includes('covid');
    
    // Measles blur - only AFTER beating measles level
    this.hasBlur = this.gameState.activeDebuffs.includes('measles');
    this.blurSpots = [];
    
    // Polio limp - periodic slowdowns instead of constant speed reduction
    this.hasLimp = this.gameState.activeDebuffs.includes('polio');
    
    // No more constant speed reduction for polio - it's now a limp effect
    
    this.isMobile = this.registry.get('isMobile') || false;
  }

  create() {
    const { width, height } = this.cameras.main;
    this.cameras.main.setBackgroundColor(GAME_CONFIG.colors.bg);
    
    // Initialize and start music
    musicManager.init();
    const settings = loadSettings();
    musicManager.setVolume(settings.musicVolume);
    musicManager.start();
    
    const level = GAME_CONFIG.levels[this.gameState.currentLevel];
    const mazeData = MAZES[level.id as keyof typeof MAZES] || MAZES.covid;
    
    const gameAreaHeight = this.isMobile ? height - 100 : height - 40;
    
    // Build maze
    this.maze = new Maze(this, 24);
    this.maze.build(mazeData, GAME_CONFIG.colors.wall, gameAreaHeight);
    
    // Create player
    const playerPixel = this.maze.getPixelFromTile(this.maze.playerStartTile.x, this.maze.playerStartTile.y);
    this.player = new Player(this, playerPixel.x, playerPixel.y, this.maze.tileSize);
    this.player.setGridPosition(
      this.maze.playerStartTile.x,
      this.maze.playerStartTile.y,
      this.maze.tileSize,
      this.maze.offsetX,
      this.maze.offsetY
    );
    this.player.speed = GAME_CONFIG.player.speed * this.speedMultiplier;
    
    if (this.gameState.activeDebuffs.includes('whooping')) {
      this.player.cantStopMoving = true;
    }
    
    // Create doctor with difficulty-adjusted speed
    const doctorPixel = this.maze.getPixelFromTile(this.maze.doctorStartTile.x, this.maze.doctorStartTile.y);
    this.doctor = new Doctor(this, doctorPixel.x, doctorPixel.y);
    this.doctor.setGridPosition(
      this.maze.doctorStartTile.x,
      this.maze.doctorStartTile.y,
      this.maze.tileSize,
      this.maze.offsetX,
      this.maze.offsetY
    );
    
    // Apply difficulty setting
    let doctorSpeedMod = 1.0;
    if (settings.difficulty === 'easy') doctorSpeedMod = 0.9;
    else if (settings.difficulty === 'hard') doctorSpeedMod = 1.1;
    this.doctor.speed = GAME_CONFIG.doctor.speed * doctorSpeedMod;
    
    // Place collectibles
    this.placeCollectibles(level);
    
    // Setup input
    this.setupKeyboard();
    
    // Joystick (mobile)
    if (this.isMobile) {
      this.createJoystick(width, height);
    }
    
    // UI
    this.createUI(level, width);
    
    // Low O2 overlay (pink/red screen) - always create, only show when O2 low
    // Use a graphics object for better visibility
    this.lowO2Overlay = this.add.rectangle(0, 0, width * 3, height * 3, 0xff4466);
    this.lowO2Overlay.setOrigin(0, 0);
    this.lowO2Overlay.setDepth(200);
    this.lowO2Overlay.setScrollFactor(0);
    this.lowO2Overlay.setAlpha(0);
    this.lowO2Overlay.setBlendMode(Phaser.BlendModes.MULTIPLY);
    
    // Measles blur effect - red spots that float and obstruct vision
    if (this.hasBlur) {
      this.createBlurSpots(width, height);
    }
    
    // Debuff timers
    this.setupDebuffTimers(level);
  }
  
  /**
   * Create floating red spots for measles blur effect
   */
  private createBlurSpots(width: number, height: number) {
    const numSpots = 12; // Number of floating spots
    
    for (let i = 0; i < numSpots; i++) {
      const size = 30 + Math.random() * 60; // Random size 30-90
      const x = Math.random() * width;
      const y = Math.random() * height;
      
      const spot = this.add.circle(x, y, size, 0xff4444, 0.15);
      spot.setDepth(180);
      spot.setScrollFactor(0);
      spot.setBlendMode(Phaser.BlendModes.MULTIPLY);
      
      // Store velocity for animation
      spot.setData('vx', (Math.random() - 0.5) * 0.5);
      spot.setData('vy', (Math.random() - 0.5) * 0.5);
      spot.setData('baseAlpha', 0.1 + Math.random() * 0.15);
      
      this.blurSpots.push(spot);
    }
  }

  private setupKeyboard() {
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = {
      W: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      A: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      S: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      D: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    };
    
    this.input.keyboard?.on('keydown-ESC', () => {
      musicManager.stop();
      this.scene.start('TitleScene');
    });
    
    // M to toggle music
    this.input.keyboard?.on('keydown-M', () => {
      musicManager.toggleMute();
    });
  }

  private createJoystick(width: number, height: number) {
    const joystickY = height - 50;
    
    this.add.rectangle(width / 2, joystickY, width, 100, 0x1a0a2e, 0.9).setDepth(50);
    
    this.joystickBase = this.add.circle(width / 2, joystickY, 40, 0x3d2b5e);
    this.joystickBase.setStrokeStyle(2, 0x9A8AB0);
    this.joystickBase.setDepth(51);
    
    this.joystickThumb = this.add.circle(width / 2, joystickY, 20, 0xFF6B9D);
    this.joystickThumb.setStrokeStyle(2, 0xffffff);
    this.joystickThumb.setDepth(52);
    
    // Touch events - FREE MOVING (no center required)
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (pointer.y > height - 100) {
        this.updateJoystickFree(pointer, width, joystickY);
      }
    });
    
    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (pointer.isDown && pointer.y > height - 150) {
        this.updateJoystickFree(pointer, width, joystickY);
      }
    });
    
    this.input.on('pointerup', () => {
      if (this.joystickThumb && this.joystickBase) {
        this.joystickThumb.x = this.joystickBase.x;
        this.joystickThumb.y = this.joystickBase.y;
      }
      if (!this.player.cantStopMoving) {
        this.inputDirection = 'none';
      }
    });
  }

  // FREE joystick - direction changes immediately based on position
  private updateJoystickFree(pointer: Phaser.Input.Pointer, width: number, joystickY: number) {
    if (!this.joystickThumb || !this.joystickBase) return;
    
    const centerX = width / 2;
    const dx = pointer.x - centerX;
    const dy = pointer.y - joystickY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const maxDist = 35;
    
    // Move thumb
    const clampedDist = Math.min(dist, maxDist);
    if (dist > 0) {
      this.joystickThumb.x = centerX + (dx / dist) * clampedDist;
      this.joystickThumb.y = joystickY + (dy / dist) * clampedDist;
    }
    
    // Set direction based on angle - FREE moving, no deadzone required
    if (dist > 8) {
      if (Math.abs(dx) > Math.abs(dy)) {
        this.inputDirection = dx > 0 ? 'right' : 'left';
      } else {
        this.inputDirection = dy > 0 ? 'down' : 'up';
      }
    }
  }

  private placeCollectibles(level: typeof GAME_CONFIG.levels[0]) {
    const positions = this.maze.getRandomPositions(level.collectibleCount + 10);
    
    for (let i = 0; i < level.collectibleCount && i < positions.length; i++) {
      const pos = positions[i];
      const dot = this.add.circle(pos.x, pos.y, 5, level.color);
      dot.setStrokeStyle(1, 0xffffff);
      dot.setDepth(5);
      dot.setData('tileX', pos.tileX);
      dot.setData('tileY', pos.tileY);
      
      this.tweens.add({
        targets: dot,
        scale: 1.3,
        duration: 400,
        yoyo: true,
        repeat: -1,
      });
      
      this.collectibles.push(dot);
    }
    
    this.totalToCollect = this.collectibles.length;
    
    // Oxygen tanks - only if we ALREADY have COVID
    if (this.needsOxygen) {
      for (let i = level.collectibleCount; i < level.collectibleCount + 5 && i < positions.length; i++) {
        const pos = positions[i];
        const tank = this.add.circle(pos.x, pos.y, 7, 0x00D4FF);
        tank.setStrokeStyle(2, 0xffffff);
        tank.setDepth(5);
        tank.setData('tileX', pos.tileX);
        tank.setData('tileY', pos.tileY);
        
        const label = this.add.text(pos.x, pos.y, 'O₂', {
          fontSize: '8px',
          color: '#000',
        }).setOrigin(0.5).setDepth(6);
        tank.setData('label', label);
        
        this.oxygenTanks.push(tank);
      }
    }
  }

  private createUI(level: typeof GAME_CONFIG.levels[0], width: number) {
    const fontSize = this.isMobile ? '10px' : '14px';
    
    this.add.text(width / 2, 8, `Level ${this.gameState.currentLevel + 1}: ${level.emoji} ${level.name}`, {
      fontFamily: '"Press Start 2P"',
      fontSize: fontSize,
      color: '#FF6B9D',
    }).setOrigin(0.5, 0).setDepth(100);
    
    this.scoreText = this.add.text(10, 8, `${this.collected}/${this.totalToCollect}`, {
      fontFamily: '"Press Start 2P"',
      fontSize: fontSize,
      color: '#39FF14',
    }).setDepth(100);
    
    // Oxygen (only if needed)
    if (this.needsOxygen) {
      this.oxygenText = this.add.text(10, 28, `O₂: 100%`, {
        fontFamily: 'VT323',
        fontSize: '14px',
        color: '#00D4FF',
      }).setDepth(100);
    }
    
    // Debuff icons
    if (this.gameState.activeDebuffs.length > 0) {
      const debuffs = this.gameState.activeDebuffs.map(id => {
        const l = GAME_CONFIG.levels.find(x => x.id === id);
        return l ? l.emoji : '';
      }).join('');
      this.add.text(width - 10, 8, debuffs, { fontSize: '14px' }).setOrigin(1, 0).setDepth(100);
    }
    
    if (!this.isMobile) {
      this.add.text(width - 10, 28, 'M: Mute | ESC: Menu', {
        fontFamily: 'VT323',
        fontSize: '12px',
        color: '#9A8AB0',
      }).setOrigin(1, 0).setDepth(100);
    }
  }

  private setupDebuffTimers(level: typeof GAME_CONFIG.levels[0]) {
    // Oxygen drain - ONLY if we already have COVID
    if (this.needsOxygen) {
      this.time.addEvent({
        delay: 200,
        loop: true,
        callback: () => {
          if (this.isGameOver) return;
          this.oxygenLevel -= 1;
          
          if (this.oxygenText) {
            this.oxygenText.setText(`O₂: ${Math.max(0, Math.round(this.oxygenLevel))}%`);
            this.oxygenText.setColor(this.oxygenLevel > 20 ? '#00D4FF' : '#FF4444');
          }
          
          // Pink/red overlay when O2 < 20%
          if (this.lowO2Overlay) {
            if (this.oxygenLevel < 20) {
              // Intensity increases as O2 drops: 0 at 20%, 0.6 at 0%
              const baseIntensity = ((20 - this.oxygenLevel) / 20) * 0.6;
              // Add pulsing effect
              const pulse = Math.sin(Date.now() / 200) * 0.1;
              this.lowO2Overlay.setAlpha(Math.max(0, baseIntensity + pulse));
              musicManager.setMood('danger');
            } else {
              this.lowO2Overlay.setAlpha(0);
            }
          }
          
          if (this.oxygenLevel <= 0) {
            this.endGame(false, 'Ran out of oxygen!');
          }
        },
      });
    }
    
    // Tetanus freeze
    const hasTetanus = level.id === 'tetanus' || this.gameState.activeDebuffs.includes('tetanus');
    if (hasTetanus) {
      this.time.addEvent({
        delay: 1500,
        loop: true,
        callback: () => {
          if (this.isGameOver || this.player.isFrozen) return;
          if (Math.random() < 0.12) {
            this.player.freeze(1200);
          }
        },
      });
    }
    
    // Polio limp - periodic slowdowns (every 2-4 seconds, slow for 0.5s)
    if (this.hasLimp) {
      const triggerLimp = () => {
        if (this.isGameOver) return;
        
        // Start limping - slow down and gray tint
        this.player.speed = GAME_CONFIG.player.speed * 0.4;
        this.player.body.setFillStyle(0x9a8ab0);
        
        // End limp after 400ms
        this.time.delayedCall(400, () => {
          this.player.speed = GAME_CONFIG.player.speed * this.speedMultiplier;
          if (!this.player.isFrozen) {
            this.player.body.setFillStyle(0xFFE135);
          }
        });
        
        // Schedule next limp (random 2-4 seconds)
        this.time.delayedCall(2000 + Math.random() * 2000, triggerLimp);
      };
      
      // Start first limp after 1-2 seconds
      this.time.delayedCall(1000 + Math.random() * 1000, triggerLimp);
    }
  }

  update(time: number, delta: number) {
    if (this.isGameOver) return;
    
    this.readKeyboardInput();
    this.updatePlayerMovement();
    this.player.update(delta);
    this.updateDoctorAI();
    this.doctor.update(delta);
    this.checkCollisions();
    this.updateMusicMood();
    this.updateSpeechBubbles(time, delta);
    this.updateBlurSpots(time);
  }
  
  /**
   * Update floating blur spots (measles effect)
   */
  private updateBlurSpots(time: number) {
    if (!this.hasBlur || this.blurSpots.length === 0) return;
    
    const { width, height } = this.cameras.main;
    
    for (const spot of this.blurSpots) {
      // Move spot
      spot.x += spot.getData('vx');
      spot.y += spot.getData('vy');
      
      // Wrap around screen
      if (spot.x < -50) spot.x = width + 50;
      if (spot.x > width + 50) spot.x = -50;
      if (spot.y < -50) spot.y = height + 50;
      if (spot.y > height + 50) spot.y = -50;
      
      // Pulsing alpha
      const baseAlpha = spot.getData('baseAlpha');
      const pulse = Math.sin(time / 500 + spot.x) * 0.05;
      spot.setAlpha(baseAlpha + pulse);
    }
  }

  private readKeyboardInput() {
    if (this.player.isFrozen) return;
    
    let newDir: 'up' | 'down' | 'left' | 'right' | 'none' = 'none';
    
    if (this.cursors.up.isDown || this.wasd.W.isDown) newDir = 'up';
    else if (this.cursors.down.isDown || this.wasd.S.isDown) newDir = 'down';
    else if (this.cursors.left.isDown || this.wasd.A.isDown) newDir = 'left';
    else if (this.cursors.right.isDown || this.wasd.D.isDown) newDir = 'right';
    
    if (newDir !== 'none') {
      this.inputDirection = newDir;
    }
  }

  private updatePlayerMovement() {
    if (this.player.isFrozen || this.player.isMoving) return;
    
    let dir = this.inputDirection;
    
    if (this.player.cantStopMoving && dir === 'none') {
      dir = this.player.direction;
    }
    
    if (dir === 'none') return;
    
    const currentTileX = this.player.tileX;
    const currentTileY = this.player.tileY;
    
    // Calculate raw next tile (before any wrapping)
    let rawNextX = currentTileX;
    let rawNextY = currentTileY;
    
    switch (dir) {
      case 'up': rawNextY--; break;
      case 'down': rawNextY++; break;
      case 'left': rawNextX--; break;
      case 'right': rawNextX++; break;
    }
    
    // Check if going off edge (potential wraparound)
    const goingOffLeft = rawNextX < 0;
    const goingOffRight = rawNextX >= this.maze.cols;
    const goingOffTop = rawNextY < 0;
    const goingOffBottom = rawNextY >= this.maze.rows;
    const goingOffEdge = goingOffLeft || goingOffRight || goingOffTop || goingOffBottom;
    
    if (goingOffEdge) {
      // Calculate destination on opposite side
      let destX = rawNextX;
      let destY = rawNextY;
      
      if (goingOffLeft) destX = this.maze.cols - 1;
      if (goingOffRight) destX = 0;
      if (goingOffTop) destY = this.maze.rows - 1;
      if (goingOffBottom) destY = 0;
      
      // Only teleport if destination is walkable
      if (this.maze.isWalkableRaw(destX, destY)) {
        this.player.direction = dir;
        // INSTANT teleport - set position directly
        this.player.tileX = destX;
        this.player.tileY = destY;
        const px = this.maze.offsetX + destX * this.maze.tileSize + this.maze.tileSize / 2;
        const py = this.maze.offsetY + destY * this.maze.tileSize + this.maze.tileSize / 2;
        this.player.body.x = px;
        this.player.body.y = py;
        this.player.targetX = px;
        this.player.targetY = py;
        this.player.isMoving = false;
        this.player.syncPartsPublic();
      }
      // If not walkable, do nothing (player stays)
    } else {
      // Normal movement within maze bounds
      if (this.maze.isWalkableRaw(rawNextX, rawNextY)) {
        this.player.direction = dir;
        this.player.setTarget(rawNextX, rawNextY, this.maze.tileSize, this.maze.offsetX, this.maze.offsetY);
        this.player.tileX = rawNextX;
        this.player.tileY = rawNextY;
      } else if (this.player.cantStopMoving) {
        // Try perpendicular directions
        const perpDirs: ('up' | 'down' | 'left' | 'right')[] = 
          (dir === 'up' || dir === 'down') ? ['left', 'right'] : ['up', 'down'];
        
        for (const perpDir of perpDirs) {
          let px = currentTileX;
          let py = currentTileY;
          if (perpDir === 'up') py--;
          else if (perpDir === 'down') py++;
          else if (perpDir === 'left') px--;
          else if (perpDir === 'right') px++;
          
          if (px >= 0 && px < this.maze.cols && py >= 0 && py < this.maze.rows) {
            if (this.maze.isWalkableRaw(px, py)) {
              this.player.direction = perpDir;
              this.inputDirection = perpDir;
              this.player.setTarget(px, py, this.maze.tileSize, this.maze.offsetX, this.maze.offsetY);
              this.player.tileX = px;
              this.player.tileY = py;
              break;
            }
          }
        }
      }
    }
  }

  private updateDoctorAI() {
    if (this.doctor.isMoving) return;
    
    const nextTile = this.maze.findNextTileTowards(
      this.doctor.tileX,
      this.doctor.tileY,
      this.player.tileX,
      this.player.tileY
    );
    
    if (nextTile) {
      this.doctor.direction = nextTile.dir as 'up' | 'down' | 'left' | 'right';
      
      if (nextTile.isWrap) {
        // Instant teleport for wraparound
        this.doctor.tileX = nextTile.x;
        this.doctor.tileY = nextTile.y;
        const px = this.maze.offsetX + nextTile.x * this.maze.tileSize + this.maze.tileSize / 2;
        const py = this.maze.offsetY + nextTile.y * this.maze.tileSize + this.maze.tileSize / 2;
        this.doctor.body.x = px;
        this.doctor.body.y = py;
        this.doctor.targetX = px;
        this.doctor.targetY = py;
        this.doctor.isMoving = false;
      } else {
        // Normal movement
        this.doctor.setTarget(nextTile.x, nextTile.y, this.maze.tileSize, this.maze.offsetX, this.maze.offsetY);
        this.doctor.tileX = nextTile.x;
        this.doctor.tileY = nextTile.y;
      }
    }
  }

  private checkCollisions() {
    // Collectibles
    for (let i = this.collectibles.length - 1; i >= 0; i--) {
      const c = this.collectibles[i];
      if (c.getData('tileX') === this.player.tileX && c.getData('tileY') === this.player.tileY) {
        this.collected++;
        this.scoreText.setText(`${this.collected}/${this.totalToCollect}`);
        musicManager.playEffect('collect');
        
        this.tweens.add({
          targets: c,
          scale: 0,
          alpha: 0,
          duration: 100,
          onComplete: () => c.destroy(),
        });
        this.collectibles.splice(i, 1);
        
        if (this.collected >= this.totalToCollect) {
          musicManager.playEffect('win');
          this.endGame(true, `Caught ${GAME_CONFIG.levels[this.gameState.currentLevel].name}!`);
          return;
        }
      }
    }
    
    // Oxygen tanks
    for (let i = this.oxygenTanks.length - 1; i >= 0; i--) {
      const tank = this.oxygenTanks[i];
      if (tank.getData('tileX') === this.player.tileX && tank.getData('tileY') === this.player.tileY) {
        this.oxygenLevel = Math.min(100, this.oxygenLevel + 40);
        musicManager.playEffect('collect');
        const label = tank.getData('label') as Phaser.GameObjects.Text;
        if (label) label.destroy();
        tank.destroy();
        this.oxygenTanks.splice(i, 1);
      }
    }
    
    // Doctor collision
    const dx = Math.abs(this.player.tileX - this.doctor.tileX);
    const dy = Math.abs(this.player.tileY - this.doctor.tileY);
    const pdx = this.player.x - this.doctor.x;
    const pdy = this.player.y - this.doctor.y;
    const pixelDist = Math.sqrt(pdx * pdx + pdy * pdy);
    
    if ((dx === 0 && dy === 0) || pixelDist < 18) {
      musicManager.playEffect('lose');
      this.endGame(false, "You've been vaccinated!");
    }
  }

  private updateMusicMood() {
    const dx = Math.abs(this.player.tileX - this.doctor.tileX);
    const dy = Math.abs(this.player.tileY - this.doctor.tileY);
    const tileDist = dx + dy;
    
    if (tileDist <= 3) {
      this.player.setEmotion('panicked');
      musicManager.setMood('danger');
    } else if (tileDist <= 6) {
      this.player.setEmotion('worried');
      musicManager.setMood('tense');
    } else if (this.gameState.activeDebuffs.length > 2) {
      this.player.setEmotion('sick');
      musicManager.setMood('normal');
    } else if (this.gameState.activeDebuffs.length > 0) {
      this.player.setEmotion('worried');
      musicManager.setMood('normal');
    } else {
      this.player.setEmotion('happy');
      musicManager.setMood('normal');
    }
  }

  private endGame(won: boolean, message: string) {
    if (this.isGameOver) return;
    this.isGameOver = true;
    musicManager.stop();
    
    const currentLevelId = GAME_CONFIG.levels[this.gameState.currentLevel].id;
    if (won && !this.gameState.activeDebuffs.includes(currentLevelId)) {
      this.gameState.activeDebuffs.push(currentLevelId);
    }
    
    this.cameras.main.flash(300, won ? 57 : 255, won ? 255 : 68, won ? 20 : 68);
    
    this.time.delayedCall(600, () => {
      this.scene.start('GameOverScene', {
        won,
        gameState: this.gameState,
        message,
        collected: this.collected,
        total: this.totalToCollect,
      });
    });
  }
  
  /**
   * Spawn and update speech bubbles from doctor
   */
  private updateSpeechBubbles(time: number, delta: number) {
    // Spawn new taunt every 2-4 seconds
    if (time - this.lastTauntTime > 2000 + Math.random() * 2000) {
      this.spawnTaunt();
      this.lastTauntTime = time;
    }
    
    // Update existing bubbles - float towards player then fall
    const { height } = this.cameras.main;
    
    for (let i = this.speechBubbles.length - 1; i >= 0; i--) {
      const bubble = this.speechBubbles[i];
      const age = bubble.getData('age') + delta;
      bubble.setData('age', age);
      
      // Move towards player initially, then fall
      const targetX = this.player.x;
      const dx = targetX - bubble.x;
      
      // Horizontal drift towards player
      bubble.x += Math.sign(dx) * Math.min(Math.abs(dx) * 0.02, 1);
      
      // Float up initially, then fall after 1 second
      if (age < 1000) {
        bubble.y -= 0.5; // Float up
      } else {
        bubble.y += (age - 1000) * 0.002; // Accelerate down
      }
      
      // Fade out as it falls
      const alpha = Math.max(0, 1 - (age / 4000));
      bubble.setAlpha(alpha);
      
      // Remove if off screen or too old
      if (bubble.y > height + 50 || age > 5000) {
        bubble.destroy();
        this.speechBubbles.splice(i, 1);
      }
    }
  }
  
  /**
   * Spawn a taunt bubble from the doctor
   */
  private spawnTaunt() {
    const taunt = getRandomTaunt();
    
    // Create bubble container
    const container = this.add.container(this.doctor.x, this.doctor.y - 20);
    container.setDepth(150);
    container.setData('age', 0);
    
    // Background bubble
    const textObj = this.add.text(0, 0, taunt, {
      fontFamily: 'VT323',
      fontSize: this.isMobile ? '10px' : '12px',
      color: '#1a0a2e',
      backgroundColor: '#ffffff',
      padding: { x: 6, y: 4 },
    }).setOrigin(0.5);
    
    // Add slight rotation for variety
    container.setRotation((Math.random() - 0.5) * 0.2);
    
    container.add(textObj);
    this.speechBubbles.push(container);
    
    // Limit max bubbles on screen
    if (this.speechBubbles.length > 5) {
      const oldest = this.speechBubbles.shift();
      if (oldest) oldest.destroy();
    }
  }
}
