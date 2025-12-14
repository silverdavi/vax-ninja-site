import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { Doctor } from '../entities/Doctor';
import { Maze } from '../entities/Maze';
import { GAME_CONFIG, MAZES } from '../config';

export interface GameState {
  currentLevel: number;
  activeDebuffs: string[];
}

/**
 * Main game scene with Pacman-style grid movement
 */
export class GameScene extends Phaser.Scene {
  // Entities
  private player!: Player;
  private doctor!: Doctor;
  private maze!: Maze;
  
  // Collectibles
  private collectibles: Phaser.GameObjects.Arc[] = [];
  private oxygenTanks: Phaser.GameObjects.Arc[] = [];
  
  // Input
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: { W: Phaser.Input.Keyboard.Key; A: Phaser.Input.Keyboard.Key; S: Phaser.Input.Keyboard.Key; D: Phaser.Input.Keyboard.Key };
  private inputDirection: 'up' | 'down' | 'left' | 'right' | 'none' = 'none';
  
  // Mobile joystick
  private joystickBase?: Phaser.GameObjects.Arc;
  private joystickThumb?: Phaser.GameObjects.Arc;
  private joystickActive: boolean = false;
  private isMobile: boolean = false;
  
  // Game state
  private gameState!: GameState;
  private collected: number = 0;
  private totalToCollect: number = 0;
  private isGameOver: boolean = false;
  
  // Debuff state
  private oxygenLevel: number = 100;
  private speedMultiplier: number = 1;
  
  // UI
  private scoreText!: Phaser.GameObjects.Text;
  private oxygenText?: Phaser.GameObjects.Text;
  
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
    
    // Apply cumulative debuffs
    for (const debuff of this.gameState.activeDebuffs) {
      if (debuff === 'polio') this.speedMultiplier *= 0.7;
    }
    
    this.isMobile = this.registry.get('isMobile') || false;
  }

  create() {
    const { width, height } = this.cameras.main;
    this.cameras.main.setBackgroundColor(GAME_CONFIG.colors.bg);
    
    const level = GAME_CONFIG.levels[this.gameState.currentLevel];
    const mazeData = MAZES[level.id as keyof typeof MAZES] || MAZES.covid;
    
    // Calculate game area height (leave room for joystick on mobile)
    const gameAreaHeight = this.isMobile ? height - 100 : height - 40;
    
    // 1. Build maze
    this.maze = new Maze(this, 24);
    this.maze.build(mazeData, GAME_CONFIG.colors.wall, gameAreaHeight);
    
    // 2. Create player
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
    
    // 3. Create doctor
    const doctorPixel = this.maze.getPixelFromTile(this.maze.doctorStartTile.x, this.maze.doctorStartTile.y);
    this.doctor = new Doctor(this, doctorPixel.x, doctorPixel.y);
    this.doctor.setGridPosition(
      this.maze.doctorStartTile.x,
      this.maze.doctorStartTile.y,
      this.maze.tileSize,
      this.maze.offsetX,
      this.maze.offsetY
    );
    this.doctor.speed = GAME_CONFIG.doctor.speed;
    
    // 4. Place collectibles
    this.placeCollectibles(level);
    
    // 5. Setup input
    this.setupKeyboard();
    
    // 6. Create joystick (mobile only)
    if (this.isMobile) {
      this.createJoystick(width, height);
    }
    
    // 7. Create UI
    this.createUI(level, width);
    
    // 8. Setup debuff timers
    this.setupDebuffTimers(level);
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
      this.scene.start('TitleScene');
    });
  }

  private createJoystick(width: number, height: number) {
    const joystickY = height - 50;
    
    // Joystick background
    this.add.rectangle(width / 2, joystickY, width, 100, 0x1a0a2e, 0.9).setDepth(50);
    
    // Base
    this.joystickBase = this.add.circle(width / 2, joystickY, 40, 0x3d2b5e);
    this.joystickBase.setStrokeStyle(2, 0x9A8AB0);
    this.joystickBase.setDepth(51);
    
    // Thumb
    this.joystickThumb = this.add.circle(width / 2, joystickY, 20, 0xFF6B9D);
    this.joystickThumb.setStrokeStyle(2, 0xffffff);
    this.joystickThumb.setDepth(52);
    
    // Direction indicators
    const arrowStyle = { fontSize: '16px', color: '#9A8AB0' };
    this.add.text(width / 2, joystickY - 55, '▲', arrowStyle).setOrigin(0.5).setDepth(51);
    this.add.text(width / 2, joystickY + 55, '▼', arrowStyle).setOrigin(0.5).setDepth(51);
    this.add.text(width / 2 - 55, joystickY, '◀', arrowStyle).setOrigin(0.5).setDepth(51);
    this.add.text(width / 2 + 55, joystickY, '▶', arrowStyle).setOrigin(0.5).setDepth(51);
    
    // Touch events
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (pointer.y > height - 100) {
        this.joystickActive = true;
        this.updateJoystick(pointer, width, joystickY);
      }
    });
    
    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (this.joystickActive) {
        this.updateJoystick(pointer, width, joystickY);
      }
    });
    
    this.input.on('pointerup', () => {
      this.joystickActive = false;
      if (this.joystickThumb && this.joystickBase) {
        this.joystickThumb.x = this.joystickBase.x;
        this.joystickThumb.y = this.joystickBase.y;
      }
      if (!this.player.cantStopMoving) {
        this.inputDirection = 'none';
      }
    });
  }

  private updateJoystick(pointer: Phaser.Input.Pointer, width: number, joystickY: number) {
    if (!this.joystickThumb || !this.joystickBase) return;
    
    const centerX = width / 2;
    const dx = pointer.x - centerX;
    const dy = pointer.y - joystickY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const maxDist = 35;
    
    if (dist > 0) {
      const clampedDist = Math.min(dist, maxDist);
      this.joystickThumb.x = centerX + (dx / dist) * clampedDist;
      this.joystickThumb.y = joystickY + (dy / dist) * clampedDist;
      
      if (dist > 10) {
        if (Math.abs(dx) > Math.abs(dy)) {
          this.inputDirection = dx > 0 ? 'right' : 'left';
        } else {
          this.inputDirection = dy > 0 ? 'down' : 'up';
        }
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
    
    // Oxygen tanks
    const needsOxygen = level.id === 'covid' || this.gameState.activeDebuffs.includes('covid');
    if (needsOxygen) {
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
    
    // Level title
    this.add.text(width / 2, 8, `Level ${this.gameState.currentLevel + 1}: ${level.emoji} ${level.name}`, {
      fontFamily: '"Press Start 2P"',
      fontSize: fontSize,
      color: '#FF6B9D',
    }).setOrigin(0.5, 0).setDepth(100);
    
    // Score
    this.scoreText = this.add.text(10, 8, `${this.collected}/${this.totalToCollect}`, {
      fontFamily: '"Press Start 2P"',
      fontSize: fontSize,
      color: '#39FF14',
    }).setDepth(100);
    
    // Oxygen display
    const needsOxygen = level.id === 'covid' || this.gameState.activeDebuffs.includes('covid');
    if (needsOxygen) {
      this.oxygenText = this.add.text(10, 28, `O₂: 100%`, {
        fontFamily: 'VT323',
        fontSize: '14px',
        color: '#00D4FF',
      }).setDepth(100);
    }
    
    // Debuff indicators
    if (this.gameState.activeDebuffs.length > 0) {
      const debuffs = this.gameState.activeDebuffs.map(id => {
        const l = GAME_CONFIG.levels.find(x => x.id === id);
        return l ? l.emoji : '';
      }).join('');
      this.add.text(width - 10, 8, debuffs, {
        fontSize: '14px',
      }).setOrigin(1, 0).setDepth(100);
    }
    
    // Controls hint (desktop only)
    if (!this.isMobile) {
      this.add.text(width - 10, 28, 'WASD / Arrows | ESC: Menu', {
        fontFamily: 'VT323',
        fontSize: '12px',
        color: '#9A8AB0',
      }).setOrigin(1, 0).setDepth(100);
    }
  }

  private setupDebuffTimers(level: typeof GAME_CONFIG.levels[0]) {
    const needsOxygen = level.id === 'covid' || this.gameState.activeDebuffs.includes('covid');
    if (needsOxygen) {
      this.time.addEvent({
        delay: 200,
        loop: true,
        callback: () => {
          if (this.isGameOver) return;
          this.oxygenLevel -= 1;
          if (this.oxygenText) {
            this.oxygenText.setText(`O₂: ${Math.max(0, Math.round(this.oxygenLevel))}%`);
            this.oxygenText.setColor(this.oxygenLevel > 30 ? '#00D4FF' : '#FF4444');
          }
          if (this.oxygenLevel <= 0) {
            this.endGame(false, 'Ran out of oxygen!');
          }
        },
      });
    }
    
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
  }

  update(_time: number, delta: number) {
    if (this.isGameOver) return;
    
    this.readKeyboardInput();
    this.updatePlayerMovement();
    this.player.update(delta);
    this.updateDoctorAI();
    this.doctor.update(delta);
    this.checkCollisions();
    this.updateEmotion();
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
    
    let nextTileX = this.player.tileX;
    let nextTileY = this.player.tileY;
    
    switch (dir) {
      case 'up': nextTileY--; break;
      case 'down': nextTileY++; break;
      case 'left': nextTileX--; break;
      case 'right': nextTileX++; break;
    }
    
    if (this.maze.isWalkable(nextTileX, nextTileY)) {
      this.player.direction = dir;
      this.player.setTarget(nextTileX, nextTileY, this.maze.tileSize, this.maze.offsetX, this.maze.offsetY);
      this.player.tileX = nextTileX;
      this.player.tileY = nextTileY;
    } else if (this.player.cantStopMoving) {
      const perpDirs: ('up' | 'down' | 'left' | 'right')[] = 
        (dir === 'up' || dir === 'down') ? ['left', 'right'] : ['up', 'down'];
      
      for (const perpDir of perpDirs) {
        let px = this.player.tileX;
        let py = this.player.tileY;
        if (perpDir === 'up') py--;
        else if (perpDir === 'down') py++;
        else if (perpDir === 'left') px--;
        else if (perpDir === 'right') px++;
        
        if (this.maze.isWalkable(px, py)) {
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
      this.doctor.setTarget(nextTile.x, nextTile.y, this.maze.tileSize, this.maze.offsetX, this.maze.offsetY);
      this.doctor.tileX = nextTile.x;
      this.doctor.tileY = nextTile.y;
    }
  }

  private checkCollisions() {
    // Collectibles
    for (let i = this.collectibles.length - 1; i >= 0; i--) {
      const c = this.collectibles[i];
      if (c.getData('tileX') === this.player.tileX && c.getData('tileY') === this.player.tileY) {
        this.collected++;
        this.scoreText.setText(`${this.collected}/${this.totalToCollect}`);
        
        this.tweens.add({
          targets: c,
          scale: 0,
          alpha: 0,
          duration: 100,
          onComplete: () => c.destroy(),
        });
        this.collectibles.splice(i, 1);
        
        if (this.collected >= this.totalToCollect) {
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
      this.endGame(false, "You've been vaccinated!");
    }
  }

  private updateEmotion() {
    const dx = Math.abs(this.player.tileX - this.doctor.tileX);
    const dy = Math.abs(this.player.tileY - this.doctor.tileY);
    const tileDist = dx + dy;
    
    if (tileDist <= 3) {
      this.player.setEmotion('panicked');
    } else if (this.gameState.activeDebuffs.length > 2) {
      this.player.setEmotion('sick');
    } else if (this.gameState.activeDebuffs.length > 0) {
      this.player.setEmotion('worried');
    } else {
      this.player.setEmotion('happy');
    }
  }

  private endGame(won: boolean, message: string) {
    if (this.isGameOver) return;
    this.isGameOver = true;
    
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
}
