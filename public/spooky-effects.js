/**
 * Haunt For Gold - Spooky Visual Effects
 * Particle systems and canvas effects for Halloween theme
 */

class SpookyEffects {
  constructor() {
    this.fogCanvas = null;
    this.fogCtx = null;
    this.particles = [];
    this.maxParticles = 30;
    this.isRunning = false;
    this.animationId = null;
    
    // Check for reduced motion preference
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /**
   * Initialize the fog overlay effect
   */
  init() {
    if (this.reducedMotion) {
      return;
    }

    this.createFogCanvas();
    this.createParticles();
    this.addFloatingDecorations();
    this.addVignetteOverlay();
    this.start();
  }

  /**
   * Create the fog canvas overlay
   */
  createFogCanvas() {
    this.fogCanvas = document.createElement('canvas');
    this.fogCanvas.id = 'fogCanvas';
    this.fogCanvas.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      pointer-events: none;
      z-index: 1;
      opacity: 0.4;
      overflow: hidden;
    `;
    document.body.appendChild(this.fogCanvas);
    this.fogCtx = this.fogCanvas.getContext('2d');
    this.resizeCanvas();
    
    window.addEventListener('resize', () => this.resizeCanvas());
  }

  /**
   * Resize canvas to match window
   */
  resizeCanvas() {
    if (this.fogCanvas) {
      this.fogCanvas.width = window.innerWidth;
      this.fogCanvas.height = window.innerHeight;
    }
  }

  /**
   * Create fog particles
   */
  createParticles() {
    this.particles = [];
    for (let i = 0; i < this.maxParticles; i++) {
      this.particles.push(this.createParticle());
    }
  }

  /**
   * Create a single fog particle
   */
  createParticle() {
    return {
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: Math.random() * 150 + 80,
      speedX: (Math.random() - 0.5) * 0.5,
      speedY: (Math.random() - 0.5) * 0.3,
      opacity: Math.random() * 0.15 + 0.05
    };
  }

  /**
   * Update particle positions
   */
  updateParticles() {
    this.particles.forEach(p => {
      p.x += p.speedX;
      p.y += p.speedY;

      // Wrap around edges
      if (p.x < -p.size) p.x = window.innerWidth + p.size;
      if (p.x > window.innerWidth + p.size) p.x = -p.size;
      if (p.y < -p.size) p.y = window.innerHeight + p.size;
      if (p.y > window.innerHeight + p.size) p.y = -p.size;

      // Subtle opacity variation
      p.opacity += (Math.random() - 0.5) * 0.01;
      p.opacity = Math.max(0.03, Math.min(0.2, p.opacity));
    });
  }

  /**
   * Render fog particles
   */
  renderParticles() {
    if (!this.fogCtx) return;
    
    this.fogCtx.clearRect(0, 0, this.fogCanvas.width, this.fogCanvas.height);

    this.particles.forEach(p => {
      const gradient = this.fogCtx.createRadialGradient(
        p.x, p.y, 0,
        p.x, p.y, p.size
      );
      gradient.addColorStop(0, `rgba(200, 200, 220, ${p.opacity})`);
      gradient.addColorStop(0.5, `rgba(150, 150, 180, ${p.opacity * 0.5})`);
      gradient.addColorStop(1, 'rgba(100, 100, 130, 0)');

      this.fogCtx.fillStyle = gradient;
      this.fogCtx.beginPath();
      this.fogCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.fogCtx.fill();
    });
  }

  /**
   * Add floating Halloween decorations
   */
  addFloatingDecorations() {
    const container = document.createElement('div');
    container.id = 'spooky-decorations';
    container.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 0;
      overflow: hidden;
    `;

    // Add flying bats
    const bats = ['🦇', '🦇', '🦇'];
    bats.forEach((emoji, index) => {
      const bat = document.createElement('span');
      bat.textContent = emoji;
      bat.style.cssText = `
        position: absolute;
        font-size: ${1.2 + Math.random() * 0.5}rem;
        opacity: ${0.4 + Math.random() * 0.3};
        top: ${5 + index * 12}%;
        left: -50px;
        animation: batFly ${15 + Math.random() * 10}s linear infinite;
        animation-delay: ${index * 3}s;
      `;
      container.appendChild(bat);
    });

    document.body.appendChild(container);
    
    // Add spooky trees background
    this.addSpookyTrees();
  }

  /**
   * Add spooky tree silhouettes to the background
   */
  addSpookyTrees() {
    const treesContainer = document.createElement('div');
    treesContainer.id = 'spooky-trees';
    treesContainer.style.cssText = `
      position: fixed;
      bottom: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      pointer-events: none;
      z-index: 0;
      overflow: hidden;
    `;

    // Create SVG trees
    const treeSVG = `
      <svg viewBox="0 0 1920 400" preserveAspectRatio="xMidYMax slice" style="position: absolute; bottom: 0; left: 0; width: 100%; height: 40%; opacity: 0.3;">
        <!-- Left dead tree -->
        <g fill="#0a0a0a">
          <path d="M50 400 L60 300 L40 300 L50 400 M60 300 L80 250 M60 300 L40 250 M55 320 L30 280 M55 340 L75 300"/>
          <path d="M150 400 L165 280 L135 280 L150 400 M165 280 L200 220 M165 280 L130 230 M155 320 L180 270 M155 350 L120 310"/>
          <path d="M280 400 L295 250 L265 250 L280 400 M295 250 L340 180 M295 250 L250 190 M285 300 L320 240 M285 340 L240 290"/>
        </g>
        <!-- Right dead trees -->
        <g fill="#0a0a0a">
          <path d="M1870 400 L1860 300 L1880 300 L1870 400 M1860 300 L1840 250 M1860 300 L1880 250 M1865 320 L1890 280"/>
          <path d="M1750 400 L1735 280 L1765 280 L1750 400 M1735 280 L1700 220 M1735 280 L1770 230 M1745 320 L1710 270"/>
          <path d="M1620 400 L1605 250 L1635 250 L1620 400 M1605 250 L1560 180 M1605 250 L1650 190 M1615 300 L1580 240"/>
        </g>
        <!-- Ground fog/grass -->
        <ellipse cx="100" cy="400" rx="120" ry="20" fill="#0d0d0d" opacity="0.5"/>
        <ellipse cx="400" cy="400" rx="150" ry="25" fill="#0d0d0d" opacity="0.4"/>
        <ellipse cx="1500" cy="400" rx="140" ry="22" fill="#0d0d0d" opacity="0.5"/>
        <ellipse cx="1800" cy="400" rx="130" ry="20" fill="#0d0d0d" opacity="0.4"/>
      </svg>
    `;

    // Graveyard elements
    const graveyardSVG = `
      <svg viewBox="0 0 1920 200" preserveAspectRatio="xMidYMax slice" style="position: absolute; bottom: 0; left: 0; width: 100%; height: 20%; opacity: 0.25;">
        <!-- Tombstones -->
        <g fill="#1a1a1a">
          <!-- Left side tombstones -->
          <rect x="80" y="120" width="30" height="50" rx="3"/>
          <ellipse cx="95" cy="120" rx="15" ry="20"/>
          
          <rect x="180" y="130" width="25" height="40" rx="2"/>
          <ellipse cx="192" cy="130" rx="12" ry="15"/>
          
          <rect x="320" y="125" width="35" height="55" rx="4"/>
          <ellipse cx="337" cy="125" rx="17" ry="22"/>
          
          <!-- Right side tombstones -->
          <rect x="1550" y="120" width="30" height="50" rx="3"/>
          <ellipse cx="1565" cy="120" rx="15" ry="20"/>
          
          <rect x="1680" y="130" width="25" height="40" rx="2"/>
          <ellipse cx="1692" cy="130" rx="12" ry="15"/>
          
          <rect x="1800" y="125" width="35" height="55" rx="4"/>
          <ellipse cx="1817" cy="125" rx="17" ry="22"/>
        </g>
        <!-- Crosses -->
        <g fill="#1a1a1a">
          <rect x="450" y="100" width="8" height="70"/>
          <rect x="435" y="115" width="38" height="8"/>
          
          <rect x="1420" y="105" width="8" height="65"/>
          <rect x="1407" y="118" width="34" height="8"/>
        </g>
      </svg>
    `;

    treesContainer.innerHTML = treeSVG + graveyardSVG;
    document.body.appendChild(treesContainer);
  }

  /**
   * Add vignette overlay
   */
  addVignetteOverlay() {
    const vignette = document.createElement('div');
    vignette.className = 'vignette';
    vignette.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      pointer-events: none;
      z-index: 2;
      background: radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.5) 100%);
      overflow: hidden;
    `;
    document.body.appendChild(vignette);
  }

  /**
   * Start the animation loop
   */
  start() {
    if (this.isRunning || this.reducedMotion) return;
    this.isRunning = true;
    this.animate();
  }

  /**
   * Animation loop
   */
  animate() {
    if (!this.isRunning) return;
    
    this.updateParticles();
    this.renderParticles();
    
    this.animationId = requestAnimationFrame(() => this.animate());
  }

  /**
   * Stop the animation
   */
  stop() {
    this.isRunning = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }

  /**
   * Create a coin collect particle burst
   * @param {number} x - X position
   * @param {number} y - Y position
   */
  coinBurst(x, y) {
    if (this.reducedMotion) return;
    
    const burst = document.createElement('div');
    burst.innerHTML = '✨💀✨';
    burst.style.cssText = `
      position: fixed;
      left: ${x}px;
      top: ${y}px;
      font-size: 1.5rem;
      pointer-events: none;
      z-index: 1000;
      animation: coinBurst 0.5s ease-out forwards;
    `;
    document.body.appendChild(burst);
    setTimeout(() => burst.remove(), 500);
  }

  /**
   * Show floating score text
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {number} score - Score value
   */
  showScorePopup(x, y, score) {
    if (this.reducedMotion) return;
    
    const popup = document.createElement('div');
    popup.className = 'score-pop';
    popup.textContent = `+${score}`;
    popup.style.cssText = `
      position: fixed;
      left: ${x}px;
      top: ${y}px;
      font-family: 'Creepster', cursive;
      font-size: 1.5rem;
      color: #ffd700;
      text-shadow: 0 0 10px #ffd700;
      pointer-events: none;
      z-index: 1000;
    `;
    document.body.appendChild(popup);
    setTimeout(() => popup.remove(), 800);
  }

  /**
   * Trigger screen shake effect
   */
  screenShake() {
    if (this.reducedMotion) return;
    
    document.body.classList.add('shake');
    setTimeout(() => document.body.classList.remove('shake'), 500);
  }

  /**
   * Show ghost notification
   * @param {string} message - Notification message
   * @param {string} type - Notification type (success, warning, danger)
   */
  showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `ghost-notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  /**
   * Cleanup all effects
   */
  destroy() {
    this.stop();
    
    const elements = [
      document.getElementById('fogCanvas'),
      document.getElementById('spooky-decorations'),
      document.querySelector('.vignette')
    ];
    
    elements.forEach(el => el?.remove());
  }
}

// Global instance
window.spookyEffects = new SpookyEffects();

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Add spooky theme class to body
  document.body.classList.add('spooky-theme');
  
  // Initialize effects
  window.spookyEffects.init();
});
