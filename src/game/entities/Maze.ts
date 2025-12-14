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
   * Check if a tile is walkable (with wraparound support)
   */
  isWalkable(tileX: number, tileY: number): boolean {
    // Handle wraparound - if going off edge, check if opposite side is walkable
    if (tileX < 0) tileX = this.cols - 1;
    if (tileX >= this.cols) tileX = 0;
    if (tileY < 0) tileY = this.rows - 1;
    if (tileY >= this.rows) tileY = 0;
    
    return this.grid[tileY][tileX] !== 1;
  }
  
  /**
   * Check if a tile is walkable (NO wraparound - raw check)
   */
  isWalkableRaw(tileX: number, tileY: number): boolean {
    if (tileX < 0 || tileX >= this.cols || tileY < 0 || tileY >= this.rows) {
      return false;
    }
    return this.grid[tileY][tileX] !== 1;
  }
  
  /**
   * Wrap tile coordinates (for teleportation at edges)
   */
  wrapTile(tileX: number, tileY: number): { x: number; y: number } {
    let x = tileX;
    let y = tileY;
    
    if (x < 0) x = this.cols - 1;
    if (x >= this.cols) x = 0;
    if (y < 0) y = this.rows - 1;
    if (y >= this.rows) y = 0;
    
    return { x, y };
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
   * Get neighboring walkable tiles (with wraparound support)
   */
  getNeighbors(tileX: number, tileY: number, allowWrap: boolean = true): { x: number; y: number; dir: string; isWrap: boolean }[] {
    const neighbors: { x: number; y: number; dir: string; isWrap: boolean }[] = [];
    
    const dirs = [
      { dx: 0, dy: -1, dir: 'up' },
      { dx: 0, dy: 1, dir: 'down' },
      { dx: -1, dy: 0, dir: 'left' },
      { dx: 1, dy: 0, dir: 'right' },
    ];
    
    for (const d of dirs) {
      const rawX = tileX + d.dx;
      const rawY = tileY + d.dy;
      const goingOffEdge = rawX < 0 || rawX >= this.cols || rawY < 0 || rawY >= this.rows;
      
      if (goingOffEdge) {
        // Only add wraparound neighbors if allowed
        if (allowWrap) {
          let destX = rawX;
          let destY = rawY;
          if (rawX < 0) destX = this.cols - 1;
          if (rawX >= this.cols) destX = 0;
          if (rawY < 0) destY = this.rows - 1;
          if (rawY >= this.rows) destY = 0;
          
          if (this.isWalkableRaw(destX, destY)) {
            neighbors.push({ x: destX, y: destY, dir: d.dir, isWrap: true });
          }
        }
        // If !allowWrap, skip wraparound neighbors entirely
      } else {
        // Normal within-bounds check
        if (this.isWalkableRaw(rawX, rawY)) {
          neighbors.push({ x: rawX, y: rawY, dir: d.dir, isWrap: false });
        }
      }
    }
    
    return neighbors;
  }
  
  /**
   * Simple pathfinding - returns next tile towards target
   * Uses BFS for shortest path
   * @param allowWrap - if false, doctor won't use wraparound tunnels (player advantage!)
   */
  findNextTileTowards(fromX: number, fromY: number, toX: number, toY: number, allowWrap: boolean = false): { x: number; y: number; dir: string; isWrap: boolean } | null {
    if (fromX === toX && fromY === toY) return null;
    
    // BFS - doctor doesn't know about tunnels by default!
    const queue: { x: number; y: number; path: { x: number; y: number; dir: string; isWrap: boolean }[] }[] = [];
    const visited = new Set<string>();
    
    queue.push({ x: fromX, y: fromY, path: [] });
    visited.add(`${fromX},${fromY}`);
    
    while (queue.length > 0) {
      const current = queue.shift()!;
      
      // Check neighbors - doctor can't use wraparound!
      const neighbors = this.getNeighbors(current.x, current.y, allowWrap);
      for (const neighbor of neighbors) {
        const key = `${neighbor.x},${neighbor.y}`;
        if (visited.has(key)) continue;
        
        visited.add(key);
        const newPath = [...current.path, { x: neighbor.x, y: neighbor.y, dir: neighbor.dir, isWrap: neighbor.isWrap }];
        
        // Found target?
        if (neighbor.x === toX && neighbor.y === toY) {
          return newPath[0] || null;
        }
        
        queue.push({ x: neighbor.x, y: neighbor.y, path: newPath });
      }
    }
    
    // No path found - return a random valid move (still no wraparound)
    const neighbors = this.getNeighbors(fromX, fromY, allowWrap);
    if (neighbors.length > 0) {
      const n = neighbors[Math.floor(Math.random() * neighbors.length)];
      return { x: n.x, y: n.y, dir: n.dir, isWrap: n.isWrap };
    }
    
    return null;
  }
  
  /**
   * Get random walkable positions that are REACHABLE from player start
   * Uses BFS to find only connected tiles (no isolated areas)
   */
  getRandomPositions(count: number): { tileX: number; tileY: number; x: number; y: number }[] {
    // BFS from player start to find all reachable tiles
    const reachable: { x: number; y: number }[] = [];
    const visited = new Set<string>();
    const queue: { x: number; y: number }[] = [{ x: this.playerStartTile.x, y: this.playerStartTile.y }];
    visited.add(`${this.playerStartTile.x},${this.playerStartTile.y}`);
    
    while (queue.length > 0) {
      const current = queue.shift()!;
      reachable.push(current);
      
      // Check 4 directions (no wraparound for collectible placement)
      const dirs = [
        { dx: 0, dy: -1 },
        { dx: 0, dy: 1 },
        { dx: -1, dy: 0 },
        { dx: 1, dy: 0 },
      ];
      
      for (const d of dirs) {
        const nx = current.x + d.dx;
        const ny = current.y + d.dy;
        const key = `${nx},${ny}`;
        
        if (!visited.has(key) && this.isWalkableRaw(nx, ny)) {
          visited.add(key);
          queue.push({ x: nx, y: ny });
        }
      }
    }
    
    // Exclude player and doctor start positions
    const filtered = reachable.filter(t => 
      !(t.x === this.playerStartTile.x && t.y === this.playerStartTile.y) &&
      !(t.x === this.doctorStartTile.x && t.y === this.doctorStartTile.y)
    );
    
    Phaser.Utils.Array.Shuffle(filtered);
    
    return filtered.slice(0, Math.min(count, filtered.length)).map(tile => ({
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
