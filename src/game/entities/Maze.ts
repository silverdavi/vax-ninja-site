import Phaser from 'phaser';

/**
 * Maze - Grid-based maze with Pacman-style movement support
 */
export class Maze {
  private scene: Phaser.Scene;
  private walls: Phaser.GameObjects.Rectangle[] = [];
  
  public tileSize: number;
  public offsetX: number = 0;
  public offsetY: number = 0;
  public grid: number[][] = [];
  public cols: number = 0;
  public rows: number = 0;
  
  public playerStartTile = { x: 1, y: 1 };
  public doctorStartTile = { x: 23, y: 17 };
  
  constructor(scene: Phaser.Scene, tileSize: number = 24) {
    this.scene = scene;
    this.tileSize = tileSize;
  }
  
  /**
   * Build maze from 2D array
   * 0 = path, 1 = wall, 2 = player start, 3 = doctor start
   */
  build(grid: number[][], wallColor: number = 0x2d1b4e, areaHeight: number): void {
    this.grid = grid;
    this.rows = grid.length;
    this.cols = grid[0].length;
    
    const { width } = this.scene.cameras.main;
    
    // Calculate tile size to fit both width and height
    const topPadding = 50; // Stats area
    const bottomPadding = 10;
    const sidePadding = 10;
    const availableHeight = areaHeight - topPadding - bottomPadding;
    const availableWidth = width - (sidePadding * 2);
    
    // Find tile size that fits both dimensions
    const tileSizeForHeight = Math.floor(availableHeight / this.rows);
    const tileSizeForWidth = Math.floor(availableWidth / this.cols);
    this.tileSize = Math.min(tileSizeForHeight, tileSizeForWidth);
    
    // Center the maze
    const mazeWidth = this.cols * this.tileSize;
    const mazeHeight = this.rows * this.tileSize;
    this.offsetX = (width - mazeWidth) / 2;
    this.offsetY = topPadding + (availableHeight - mazeHeight) / 2;
    
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        const x = this.offsetX + col * this.tileSize + this.tileSize / 2;
        const y = this.offsetY + row * this.tileSize + this.tileSize / 2;
        const cell = grid[row][col];
        
        if (cell === 1) {
          const wall = this.scene.add.rectangle(
            x, y,
            this.tileSize - 1,
            this.tileSize - 1,
            wallColor
          );
          wall.setStrokeStyle(1, 0x3d2b5e);
          this.walls.push(wall);
        } else if (cell === 2) {
          this.playerStartTile = { x: col, y: row };
        } else if (cell === 3) {
          this.doctorStartTile = { x: col, y: row };
        }
      }
    }
  }
  
  /**
   * Check if a tile is walkable
   */
  isWalkable(tileX: number, tileY: number): boolean {
    if (tileX < 0 || tileX >= this.cols || tileY < 0 || tileY >= this.rows) {
      return false;
    }
    return this.grid[tileY][tileX] !== 1;
  }
  
  /**
   * Get tile from pixel coordinates
   */
  getTileFromPixel(px: number, py: number): { x: number; y: number } {
    return {
      x: Math.floor((px - this.offsetX) / this.tileSize),
      y: Math.floor((py - this.offsetY) / this.tileSize),
    };
  }
  
  /**
   * Get pixel center from tile coordinates
   */
  getPixelFromTile(tileX: number, tileY: number): { x: number; y: number } {
    return {
      x: this.offsetX + tileX * this.tileSize + this.tileSize / 2,
      y: this.offsetY + tileY * this.tileSize + this.tileSize / 2,
    };
  }
  
  /**
   * Get all walkable tiles (for placing collectibles)
   */
  getWalkableTiles(): { x: number; y: number }[] {
    const tiles: { x: number; y: number }[] = [];
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        if (this.grid[row][col] === 0) {
          tiles.push({ x: col, y: row });
        }
      }
    }
    return tiles;
  }
  
  /**
   * Get neighboring walkable tiles
   */
  getNeighbors(tileX: number, tileY: number): { x: number; y: number; dir: string }[] {
    const neighbors: { x: number; y: number; dir: string }[] = [];
    
    if (this.isWalkable(tileX, tileY - 1)) neighbors.push({ x: tileX, y: tileY - 1, dir: 'up' });
    if (this.isWalkable(tileX, tileY + 1)) neighbors.push({ x: tileX, y: tileY + 1, dir: 'down' });
    if (this.isWalkable(tileX - 1, tileY)) neighbors.push({ x: tileX - 1, y: tileY, dir: 'left' });
    if (this.isWalkable(tileX + 1, tileY)) neighbors.push({ x: tileX + 1, y: tileY, dir: 'right' });
    
    return neighbors;
  }
  
  /**
   * Simple pathfinding - returns next tile towards target
   * Uses BFS for shortest path
   */
  findNextTileTowards(fromX: number, fromY: number, toX: number, toY: number): { x: number; y: number; dir: string } | null {
    if (fromX === toX && fromY === toY) return null;
    
    // BFS
    const queue: { x: number; y: number; path: { x: number; y: number; dir: string }[] }[] = [];
    const visited = new Set<string>();
    
    queue.push({ x: fromX, y: fromY, path: [] });
    visited.add(`${fromX},${fromY}`);
    
    while (queue.length > 0) {
      const current = queue.shift()!;
      
      // Check neighbors
      const neighbors = this.getNeighbors(current.x, current.y);
      for (const neighbor of neighbors) {
        const key = `${neighbor.x},${neighbor.y}`;
        if (visited.has(key)) continue;
        
        visited.add(key);
        const newPath = [...current.path, { x: neighbor.x, y: neighbor.y, dir: neighbor.dir }];
        
        // Found target?
        if (neighbor.x === toX && neighbor.y === toY) {
          return newPath[0] || null;
        }
        
        queue.push({ x: neighbor.x, y: neighbor.y, path: newPath });
      }
    }
    
    // No path found - return a random valid move
    const neighbors = this.getNeighbors(fromX, fromY);
    if (neighbors.length > 0) {
      return neighbors[Math.floor(Math.random() * neighbors.length)];
    }
    
    return null;
  }
  
  /**
   * Get random walkable positions (for placing collectibles)
   */
  getRandomPositions(count: number): { tileX: number; tileY: number; x: number; y: number }[] {
    const walkable = this.getWalkableTiles();
    Phaser.Utils.Array.Shuffle(walkable);
    
    return walkable.slice(0, Math.min(count, walkable.length)).map(tile => ({
      tileX: tile.x,
      tileY: tile.y,
      ...this.getPixelFromTile(tile.x, tile.y),
    }));
  }
  
  get mazeBottom(): number {
    return this.offsetY + this.rows * this.tileSize;
  }
  
  destroy(): void {
    this.walls.forEach(w => w.destroy());
    this.walls = [];
  }
}
