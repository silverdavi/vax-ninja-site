import Phaser from 'phaser';

/**
 * Doctor - Chases the player with grid-based Pacman-style movement
 */
export class Doctor {
  // Graphics
  public body: Phaser.GameObjects.Arc;
  private cross: Phaser.GameObjects.Graphics;
  private syringe: Phaser.GameObjects.Graphics;
  
  // Grid-based movement
  public tileX: number = 0;
  public tileY: number = 0;
  public targetX: number = 0;
  public targetY: number = 0;
  public isMoving: boolean = false;
  public direction: 'up' | 'down' | 'left' | 'right' | 'none' = 'none';
  
  public speed: number = 120;
  
  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.targetX = x;
    this.targetY = y;
    
    // Doctor body (white circle)
    this.body = scene.add.circle(x, y, 10, 0xFFFFFF);
    this.body.setStrokeStyle(2, 0x00D4FF);
    this.body.setDepth(10);
    
    // Red cross on body
    this.cross = scene.add.graphics();
    this.cross.setDepth(11);
    
    // Syringe
    this.syringe = scene.add.graphics();
    this.syringe.setDepth(11);
    
    this.draw();
  }
  
  get x(): number { return this.body.x; }
  get y(): number { return this.body.y; }
  
  /**
   * Set grid position
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
    this.draw();
  }
  
  /**
   * Update movement towards target
   */
  update(delta: number): void {
    const dx = this.targetX - this.body.x;
    const dy = this.targetY - this.body.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    if (dist > 1) {
      const moveSpeed = this.speed * (delta / 1000);
      const moveX = (dx / dist) * Math.min(moveSpeed, dist);
      const moveY = (dy / dist) * Math.min(moveSpeed, dist);
      this.body.x += moveX;
      this.body.y += moveY;
      this.isMoving = true;
    } else {
      this.body.x = this.targetX;
      this.body.y = this.targetY;
      this.isMoving = false;
    }
    
    this.draw();
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
    this.draw();
    this.isMoving = false;
  }
  
  /**
   * Draw the cross and syringe at current position
   */
  private draw(): void {
    const x = this.body.x;
    const y = this.body.y;
    
    // Red cross
    this.cross.clear();
    this.cross.fillStyle(0xFF0000);
    this.cross.fillRect(x - 1, y - 4, 2, 8);
    this.cross.fillRect(x - 4, y - 1, 8, 2);
    
    // Syringe - points in movement direction
    this.syringe.clear();
    let sx = x + 10;
    let sy = y;
    
    if (this.direction === 'left') sx = x - 10;
    else if (this.direction === 'up') { sx = x; sy = y - 10; }
    else if (this.direction === 'down') { sx = x; sy = y + 10; }
    
    // Syringe body
    this.syringe.fillStyle(0xE8E8E8);
    if (this.direction === 'up' || this.direction === 'down') {
      this.syringe.fillRect(x - 2, sy, 4, 12 * (this.direction === 'down' ? 1 : -1));
    } else {
      this.syringe.fillRect(sx, y - 2, 12 * (this.direction === 'left' ? -1 : 1), 4);
    }
    
    // Liquid
    this.syringe.fillStyle(0x39FF14, 0.8);
    if (this.direction === 'up' || this.direction === 'down') {
      this.syringe.fillRect(x - 1, sy + (this.direction === 'down' ? 2 : -2), 2, 6 * (this.direction === 'down' ? 1 : -1));
    } else {
      this.syringe.fillRect(sx + (this.direction === 'left' ? -2 : 2), y - 1, 6 * (this.direction === 'left' ? -1 : 1), 2);
    }
  }
  
  get radius(): number { return 10; }
  
  destroy(): void {
    this.body.destroy();
    this.cross.destroy();
    this.syringe.destroy();
  }
}
