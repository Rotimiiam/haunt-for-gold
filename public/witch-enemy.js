// Witch Enemy - Special enemy that pops in and chases players
// Witch enemy script loaded

/**
 * WitchEnemy class - Special boss-like enemy
 */
class WitchEnemy {
  constructor(mapWidth, mapHeight) {
    this.mapWidth = mapWidth;
    this.mapHeight = mapHeight;
    
    this.active = false;
    this.x = 0;
    this.y = 0;
    this.speed = 0.08; // Slower, more menacing chase
    this.targetPlayer = null;
    
    // Appearance timing
    this.minAppearanceInterval = 10000; // 10 seconds minimum
    this.maxAppearanceInterval = 20000; // 20 seconds maximum
    this.appearanceDuration = 15000; // Stays for 15 seconds
    this.nextAppearanceTime = Date.now() + this.getRandomInterval();
    this.disappearTime = 0;
    
    // Visual properties
    this.size = 48; // Larger than regular enemies
    this.color = '#8B008B'; // Dark magenta
    this.glowColor = '#FF00FF';
    
    // Animation
    this.animationFrame = 0;
    this.animationSpeed = 0.1;
    
  }

  /**
   * Get random interval for next appearance
   */
  getRandomInterval() {
    return this.minAppearanceInterval + 
           Math.random() * (this.maxAppearanceInterval - this.minAppearanceInterval);
  }

  /**
   * Check if witch should appear
   */
  shouldAppear() {
    return !this.active && Date.now() >= this.nextAppearanceTime;
  }

  /**
   * Make witch appear
   */
  appear(players) {
    if (this.active) return false;
    
    // Spawn at random edge of map
    const edge = Math.floor(Math.random() * 4);
    switch (edge) {
      case 0: // Top
        this.x = Math.random() * this.mapWidth;
        this.y = 0;
        break;
      case 1: // Right
        this.x = this.mapWidth;
        this.y = Math.random() * this.mapHeight;
        break;
      case 2: // Bottom
        this.x = Math.random() * this.mapWidth;
        this.y = this.mapHeight;
        break;
      case 3: // Left
        this.x = 0;
        this.y = Math.random() * this.mapHeight;
        break;
    }
    
    this.active = true;
    this.disappearTime = Date.now() + this.appearanceDuration;
    this.findClosestPlayer(players);
    
    // Play cackle sound
    if (window.soundManager) {
      window.soundManager.playWitchCackle();
    }
    
    // Trigger vibration for all controllers
    if (window.controllerIntegration && window.controllerIntegration.vibrationManager) {
      const controllers = window.controllerIntegration.controllerManager.getAvailableControllers();
      controllers.forEach(controller => {
        // Strong vibration pattern for witch appearance
        window.controllerIntegration.vibrationManager.vibrateCustom(controller.index, {
          duration: 500,
          weakMagnitude: 0.8,
          strongMagnitude: 0.6
        });
      });
    }
    
    return true;
  }

  /**
   * Make witch disappear
   */
  disappear() {
    if (!this.active) return false;
    
    this.active = false;
    this.targetPlayer = null;
    this.nextAppearanceTime = Date.now() + this.getRandomInterval();
    return true;
  }

  /**
   * Find closest player to chase
   */
  findClosestPlayer(players) {
    if (!players || players.length === 0) {
      this.targetPlayer = null;
      return;
    }
    
    let closestPlayer = null;
    let closestDistance = Infinity;
    
    players.forEach(player => {
      const dx = player.x - this.x;
      const dy = player.y - this.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < closestDistance) {
        closestDistance = distance;
        closestPlayer = player;
      }
    });
    
    this.targetPlayer = closestPlayer;
  }

  /**
   * Update witch position and behavior
   */
  update(players) {
    const now = Date.now();
    
    // Check if should appear
    if (this.shouldAppear()) {
      this.appear(players);
    }
    
    // Check if should disappear
    if (this.active && now >= this.disappearTime) {
      this.disappear();
      return;
    }
    
    // Update if active
    if (this.active) {
      // Update animation
      this.animationFrame += this.animationSpeed;
      
      // Find closest player periodically
      if (Math.floor(this.animationFrame) % 30 === 0) {
        this.findClosestPlayer(players);
      }
      
      // Chase target player
      if (this.targetPlayer) {
        const dx = this.targetPlayer.x - this.x;
        const dy = this.targetPlayer.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0.1) {
          // Move towards player
          this.x += (dx / distance) * this.speed;
          this.y += (dy / distance) * this.speed;
          
          // Keep within bounds
          this.x = Math.max(0, Math.min(this.mapWidth, this.x));
          this.y = Math.max(0, Math.min(this.mapHeight, this.y));
        }
      }
    }
  }

  /**
   * Check collision with player
   */
  checkCollision(player) {
    if (!this.active) return false;
    
    const dx = player.x - this.x;
    const dy = player.y - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Collision radius (witch is larger)
    return distance < 1.0;
  }

  /**
   * Catch player (called when collision detected)
   */
  catchPlayer(player) {
    if (!this.active) return;
    
    // Witch caught the player - disappear after catching
    this.disappear();
  }

  /**
   * Handle collision with player
   */
  onCollision(player, controllerIndex = null) {
    if (!this.active) return;
    
    // Trigger strong vibration
    if (controllerIndex !== null && window.controllerIntegration) {
      window.controllerIntegration.vibrationManager.vibrateCustom(controllerIndex, {
        duration: 400,
        weakMagnitude: 1.0,
        strongMagnitude: 0.9
      });
    }
    
    // Play explosion sound
    if (window.soundManager) {
      window.soundManager.playExplosion();
    }
  }

  /**
   * Get witch state for rendering
   */
  getState() {
    return {
      active: this.active,
      x: this.x,
      y: this.y,
      size: this.size,
      color: this.color,
      glowColor: this.glowColor,
      animationFrame: this.animationFrame,
      targetPlayerId: this.targetPlayer ? this.targetPlayer.id : null,
      timeUntilDisappear: this.active ? Math.max(0, this.disappearTime - Date.now()) : 0,
      timeUntilAppear: !this.active ? Math.max(0, this.nextAppearanceTime - Date.now()) : 0
    };
  }

  /**
   * Render witch (for canvas rendering)
   */
  render(ctx, tileSize) {
    if (!this.active) return;
    
    const pixelX = this.x * tileSize;
    const pixelY = this.y * tileSize;
    const size = this.size;
    
    // Save context
    ctx.save();
    
    // Glow effect
    ctx.shadowColor = this.glowColor;
    ctx.shadowBlur = 20 + Math.sin(this.animationFrame) * 5;
    
    // Draw witch body (simplified)
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(pixelX, pixelY, size / 2, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw witch hat
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.moveTo(pixelX - size / 2, pixelY - size / 4);
    ctx.lineTo(pixelX, pixelY - size);
    ctx.lineTo(pixelX + size / 2, pixelY - size / 4);
    ctx.closePath();
    ctx.fill();
    
    // Hat brim
    ctx.fillRect(pixelX - size / 1.5, pixelY - size / 4, size * 1.3, size / 8);
    
    // Eyes (glowing)
    ctx.fillStyle = '#FF0000';
    ctx.shadowColor = '#FF0000';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(pixelX - size / 6, pixelY - size / 8, size / 12, 0, Math.PI * 2);
    ctx.arc(pixelX + size / 6, pixelY - size / 8, size / 12, 0, Math.PI * 2);
    ctx.fill();
    
    // Restore context
    ctx.restore();
    
    // Draw warning indicator above witch
    ctx.save();
    ctx.fillStyle = '#FF0000';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('⚠️', pixelX, pixelY - size);
    ctx.restore();
  }

  /**
   * Reset witch
   */
  reset() {
    this.active = false;
    this.targetPlayer = null;
    this.nextAppearanceTime = Date.now() + this.getRandomInterval();
  }

  /**
   * Get debug info
   */
  getDebugInfo() {
    return {
      active: this.active,
      position: { x: this.x, y: this.y },
      targetPlayer: this.targetPlayer ? this.targetPlayer.id : null,
      timeUntilDisappear: this.active ? Math.round((this.disappearTime - Date.now()) / 1000) : 0,
      timeUntilAppear: !this.active ? Math.round((this.nextAppearanceTime - Date.now()) / 1000) : 0
    };
  }
}

// Export for use in other modules
if (typeof window !== 'undefined') {
  window.WitchEnemy = WitchEnemy;
}

// Witch enemy loaded
