import Phaser from 'phaser';

export type PlayerEmotion = 'happy' | 'worried' | 'sick' | 'panicked';

/**
 * Player - A smiley face with grid-based Pacman-style movement
 */
export class Player {
  private scene: Phaser.Scene;
  
  // Graphics
  public body: Phaser.GameObjects.Arc;
  private leftEye: Phaser.GameObjects.Arc;
  private rightEye: Phaser.GameObjects.Arc;
  private mouth: Phaser.GameObjects.Graphics;
  
  // Grid-based movement
  public tileX: number = 0;  // Current tile X
  public tileY: number = 0;  // Current tile Y
  public targetX: number = 0; // Target pixel X
  public targetY: number = 0; // Target pixel Y
  public isMoving: boolean = false;
  public direction: 'up' | 'down' | 'left' | 'right' | 'none' = 'none';
  public nextDirection: 'up' | 'down' | 'left' | 'right' | 'none' = 'none';
  
  // State
  private emotion: PlayerEmotion = 'happy';
  public speed: number = 180;
  public isFrozen: boolean = false;
  
  // For "can't stop moving" debuff
  public cantStopMoving: boolean = false;
  
  constructor(scene: Phaser.Scene, x: number, y: number, _tileSize: number) {
    this.scene = scene;
    
    // Initialize grid position
    this.targetX = x;
    this.targetY = y;
    
    // Create the smiley face body (yellow circle)
    this.body = scene.add.circle(x, y, 10, 0xFFE135);
    this.body.setStrokeStyle(2, 0xCC9900);
    this.body.setDepth(10);
    
    // Eyes (black dots)
    this.leftEye = scene.add.circle(x - 3, y - 2, 2, 0x000000);
    this.leftEye.setDepth(11);
    this.rightEye = scene.add.circle(x + 3, y - 2, 2, 0x000000);
    this.rightEye.setDepth(11);
    
    // Mouth (drawn with graphics)
    this.mouth = scene.add.graphics();
    this.mouth.setDepth(11);
    this.drawMouth();
  }
  
  get x(): number { return this.body.x; }
  get y(): number { return this.body.y; }
  
  /**
   * Set grid position (snaps to tile center)
   */
  setGridPosition(tileX: number, tileY: number, tileSize: number, offsetX: number, offsetY: number): void {
    this.tileX = tileX;
    this.tileY = tileY;
    const px = offsetX + tileX * tileSize + tileSize / 2;
    const py = offsetY + tileY * tileSize + tileSize / 2;
    this.targetX = px;
    this.targetY = py;
    this.body.x = px;
    this.body.y = py;
    this.syncParts();
  }
  
  /**
   * Update movement towards target
   */
  update(delta: number): void {
    if (this.isFrozen) return;
    
    const dx = this.targetX - this.body.x;
    const dy = this.targetY - this.body.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    if (dist > 1) {
      // Move towards target
      const moveSpeed = this.speed * (delta / 1000);
      const moveX = (dx / dist) * Math.min(moveSpeed, dist);
      const moveY = (dy / dist) * Math.min(moveSpeed, dist);
      this.body.x += moveX;
      this.body.y += moveY;
      this.isMoving = true;
    } else {
      // Arrived at target
      this.body.x = this.targetX;
      this.body.y = this.targetY;
      this.isMoving = false;
    }
    
    this.syncParts();
  }
  
  /**
   * Set new target tile
   */
  setTarget(tileX: number, tileY: number, tileSize: number, offsetX: number, offsetY: number): void {
    this.tileX = tileX;
    this.tileY = tileY;
    this.targetX = offsetX + tileX * tileSize + tileSize / 2;
    this.targetY = offsetY + tileY * tileSize + tileSize / 2;
  }
  
  /**
   * Teleport instantly (for wraparound)
   */
  teleportTo(tileX: number, tileY: number, tileSize: number, offsetX: number, offsetY: number): void {
    this.tileX = tileX;
    this.tileY = tileY;
    const px = offsetX + tileX * tileSize + tileSize / 2;
    const py = offsetY + tileY * tileSize + tileSize / 2;
    this.body.x = px;
    this.body.y = py;
    this.targetX = px;
    this.targetY = py;
    this.syncParts();
    this.isMoving = false;
  }
  
  /**
   * Sync eyes and mouth to body position
   */
  private syncParts(): void {
    this.leftEye.x = this.body.x - 3;
    this.leftEye.y = this.body.y - 2;
    this.rightEye.x = this.body.x + 3;
    this.rightEye.y = this.body.y - 2;
    this.drawMouth();
  }
  
  /**
   * Set the player's emotion (changes face)
   */
  setEmotion(emotion: PlayerEmotion): void {
    if (this.emotion === emotion) return;
    this.emotion = emotion;
    
    // Update body color based on emotion
    if (emotion === 'sick') {
      this.body.setFillStyle(0x90EE90); // Green = sick
    } else if (this.isFrozen) {
      this.body.setFillStyle(0x9a8ab0); // Gray = frozen
    } else {
      this.body.setFillStyle(0xFFE135); // Yellow = normal
    }
    
    this.drawMouth();
  }
  
  /**
   * Draw the mouth based on current emotion
   */
  private drawMouth(): void {
    const x = this.body.x;
    const y = this.body.y;
    
    this.mouth.clear();
    this.mouth.lineStyle(1.5, 0x000000);
    
    switch (this.emotion) {
      case 'happy':
        this.mouth.beginPath();
        this.mouth.arc(x, y + 1, 4, 0.3, Math.PI - 0.3, false);
        this.mouth.strokePath();
        break;
        
      case 'worried':
        this.mouth.beginPath();
        this.mouth.moveTo(x - 3, y + 3);
        this.mouth.lineTo(x, y + 5);
        this.mouth.lineTo(x + 3, y + 3);
        this.mouth.strokePath();
        break;
        
      case 'sick':
        this.mouth.beginPath();
        this.mouth.moveTo(x - 3, y + 3);
        this.mouth.lineTo(x + 3, y + 3);
        this.mouth.strokePath();
        this.mouth.fillStyle(0xFF6B6B);
        this.mouth.fillCircle(x, y + 6, 2);
        break;
        
      case 'panicked':
        this.mouth.fillStyle(0x000000);
        this.mouth.fillCircle(x, y + 3, 3);
        this.mouth.fillStyle(0x87CEEB);
        this.mouth.fillTriangle(x + 8, y - 5, x + 10, y, x + 6, y);
        break;
    }
  }
  
  /**
   * Freeze the player (tetanus effect)
   */
  freeze(duration: number): void {
    this.isFrozen = true;
    this.body.setFillStyle(0x9a8ab0);
    
    this.scene.time.delayedCall(duration, () => {
      this.isFrozen = false;
      this.body.setFillStyle(this.emotion === 'sick' ? 0x90EE90 : 0xFFE135);
    });
  }
  
  get radius(): number { return 10; }
  
  destroy(): void {
    this.body.destroy();
    this.leftEye.destroy();
    this.rightEye.destroy();
    this.mouth.destroy();
  }
}
