/**
 * Halloween Decorations
 * Adds spooky SVG decorations around the game
 */

class HalloweenDecorations {
  constructor() {
    this.decorations = [
      { src: 'assets/ghost-outline-svgrepo-com.svg', position: 'top-left' },
      { src: 'assets/halloween-witch-hat-outline-svgrepo-com.svg', position: 'top-right' },
      { src: 'assets/spider-and-web-outlined-halloween-animal-svgrepo-com.svg', position: 'bottom-left' },
      { src: 'assets/halloween-bones-cross-outline-svgrepo-com.svg', position: 'bottom-right' },
      { src: 'assets/scarecrow-halloween-outline-svgrepo-com.svg', position: 'left-center' },
      { src: 'assets/mummy-halloween-typical-character-bandaged-outline-svgrepo-com.svg', position: 'right-center' }
    ];
    
    this.init();
  }

  init() {
    this.createDecorationContainer();
    this.addDecorations();
    this.addFloatingElements();
  }

  createDecorationContainer() {
    const container = document.createElement('div');
    container.id = 'halloween-decorations';
    container.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      pointer-events: none;
      z-index: 0;
      overflow: hidden;
    `;
    document.body.insertBefore(container, document.body.firstChild);
    this.container = container;
  }

  addDecorations() {
    const positions = {
      'top-left': { top: '10%', left: '5%' },
      'top-right': { top: '8%', right: '5%' },
      'bottom-left': { bottom: '15%', left: '3%' },
      'bottom-right': { bottom: '10%', right: '3%' },
      'left-center': { top: '45%', left: '2%' },
      'right-center': { top: '50%', right: '2%' }
    };

    this.decorations.forEach((deco, index) => {
      const img = document.createElement('img');
      img.src = deco.src;
      img.alt = '';
      img.className = 'halloween-deco';
      
      const pos = positions[deco.position] || {};
      img.style.cssText = `
        position: absolute;
        width: 60px;
        height: 60px;
        opacity: 0.15;
        filter: brightness(0) invert(1) sepia(1) saturate(5) hue-rotate(70deg);
        animation: floatDeco ${4 + index * 0.5}s ease-in-out infinite;
        animation-delay: ${index * 0.3}s;
        ${pos.top ? `top: ${pos.top};` : ''}
        ${pos.bottom ? `bottom: ${pos.bottom};` : ''}
        ${pos.left ? `left: ${pos.left};` : ''}
        ${pos.right ? `right: ${pos.right};` : ''}
      `;
      
      this.container.appendChild(img);
    });

    // Add animation keyframes
    if (!document.getElementById('halloween-deco-styles')) {
      const style = document.createElement('style');
      style.id = 'halloween-deco-styles';
      style.textContent = `
        @keyframes floatDeco {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          25% { transform: translateY(-10px) rotate(3deg); }
          50% { transform: translateY(-5px) rotate(-2deg); }
          75% { transform: translateY(-15px) rotate(2deg); }
        }
        
        @keyframes witchFly {
          0% { transform: translateX(-100px) translateY(0); }
          50% { transform: translateX(calc(100vw + 100px)) translateY(-30px); }
          50.01% { transform: translateX(calc(100vw + 100px)) translateY(0) scaleX(-1); }
          100% { transform: translateX(-100px) translateY(-20px) scaleX(-1); }
        }
        
        @media (prefers-reduced-motion: reduce) {
          .halloween-deco {
            animation: none !important;
          }
        }
      `;
      document.head.appendChild(style);
    }
  }

  addFloatingElements() {
    // Add a flying witch that crosses the screen occasionally
    const witch = document.createElement('img');
    witch.src = 'assets/witch-typical-halloween-character-svgrepo-com.svg';
    witch.alt = '';
    witch.style.cssText = `
      position: absolute;
      width: 80px;
      height: 80px;
      top: 20%;
      left: -100px;
      opacity: 0.2;
      filter: brightness(0) invert(1) sepia(1) saturate(3) hue-rotate(250deg);
      animation: witchFly 30s linear infinite;
    `;
    this.container.appendChild(witch);

    // Add corner spider web
    this.addSpiderWeb();
  }

  addSpiderWeb() {
    // Top-left corner spider web
    const webContainer = document.createElement('div');
    webContainer.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 150px;
      height: 150px;
      overflow: hidden;
      pointer-events: none;
    `;

    const web = document.createElement('img');
    web.src = 'assets/spider-and-web-outlined-halloween-animal-svgrepo-com.svg';
    web.alt = '';
    web.style.cssText = `
      width: 200px;
      height: 200px;
      position: absolute;
      top: -50px;
      left: -50px;
      opacity: 0.1;
      filter: brightness(0) invert(1);
      transform: rotate(-45deg);
    `;
    
    webContainer.appendChild(web);
    this.container.appendChild(webContainer);

    // Top-right corner
    const webContainer2 = webContainer.cloneNode(true);
    webContainer2.style.left = 'auto';
    webContainer2.style.right = '0';
    webContainer2.firstChild.style.left = 'auto';
    webContainer2.firstChild.style.right = '-50px';
    webContainer2.firstChild.style.transform = 'rotate(45deg) scaleX(-1)';
    this.container.appendChild(webContainer2);
  }
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
  window.halloweenDecorations = new HalloweenDecorations();
});

// Halloween decorations loaded
