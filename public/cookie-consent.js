/**
 * Cookie Consent Manager for Haunt For Gold
 * Displays a spooky-themed cookie consent popup
 */

class CookieConsent {
  constructor() {
    this.consentKey = 'haunt_cookie_consent';
    this.init();
  }

  init() {
    // Check if consent already given
    if (this.hasConsent()) {
      // Cookie consent already given
      return;
    }

    // Show popup after a short delay
    setTimeout(() => this.showPopup(), 500);
  }

  hasConsent() {
    return localStorage.getItem(this.consentKey) === 'accepted';
  }

  saveConsent() {
    localStorage.setItem(this.consentKey, 'accepted');
  }

  showPopup() {
    // Create overlay
    const overlay = document.createElement('div');
    overlay.id = 'cookieConsentOverlay';
    overlay.innerHTML = `
      <div class="cookie-popup haunted-panel">
        <div class="cookie-icon">🍪👻</div>
        <h3 class="cookie-title">Spooky Cookies!</h3>
        <p class="cookie-text">
          We use cookies to remember your player name and enhance your haunted gaming experience. 
          No personal data is collected - just enough magic to keep the ghosts happy!
        </p>
        <div class="cookie-buttons">
          <button id="acceptCookies" class="spooky-btn cookie-accept">
            🎃 Accept & Play
          </button>
          <a href="privacy-policy.html" class="cookie-link">
            📜 Privacy Policy
          </a>
        </div>
      </div>
    `;

    // Add styles
    const styles = document.createElement('style');
    styles.textContent = `
      #cookieConsentOverlay {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        z-index: 10000;
        padding: 20px;
        animation: slideUp 0.5s ease-out;
      }

      @keyframes slideUp {
        from {
          transform: translateY(100%);
          opacity: 0;
        }
        to {
          transform: translateY(0);
          opacity: 1;
        }
      }

      .cookie-popup {
        max-width: 500px;
        margin: 0 auto;
        background: linear-gradient(180deg, var(--haunted-purple, #1a0a2e) 0%, var(--spooky-black, #0d0d0d) 100%);
        border: 2px solid var(--ghost-green, #00ff41);
        border-radius: 12px;
        padding: 24px;
        box-shadow: 
          0 0 30px rgba(0, 255, 65, 0.3),
          0 -10px 40px rgba(0, 0, 0, 0.5);
        text-align: center;
      }

      .cookie-icon {
        font-size: 2.5rem;
        margin-bottom: 10px;
        animation: float 3s ease-in-out infinite;
      }

      @keyframes float {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-10px); }
      }

      .cookie-title {
        font-family: 'Creepster', cursive;
        color: var(--ghost-green, #00ff41);
        font-size: 1.5rem;
        margin: 0 0 12px 0;
        text-shadow: 0 0 10px var(--ghost-green, #00ff41);
      }

      .cookie-text {
        color: var(--bone-white, #e8e8e8);
        font-size: 0.95rem;
        line-height: 1.5;
        margin: 0 0 20px 0;
      }

      .cookie-buttons {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
      }

      .cookie-accept {
        padding: 12px 28px !important;
        font-size: 1.1rem !important;
        width: 100%;
        max-width: 250px;
      }

      .cookie-link {
        color: var(--ghost-green, #00ff41);
        font-size: 0.85rem;
        text-decoration: none;
        opacity: 0.8;
        transition: opacity 0.3s;
      }

      .cookie-link:hover {
        opacity: 1;
        text-decoration: underline;
      }

      @media (max-width: 600px) {
        #cookieConsentOverlay {
          padding: 10px;
        }
        
        .cookie-popup {
          padding: 16px;
        }
        
        .cookie-title {
          font-size: 1.3rem;
        }
        
        .cookie-text {
          font-size: 0.85rem;
        }
      }
    `;

    document.head.appendChild(styles);
    document.body.appendChild(overlay);

    // Handle accept button
    document.getElementById('acceptCookies').addEventListener('click', () => {
      this.acceptCookies(overlay, styles);
    });
  }

  acceptCookies(overlay, styles) {
    // Save consent
    this.saveConsent();

    // Animate out
    overlay.style.animation = 'slideDown 0.3s ease-in forwards';
    
    // Add slideDown animation
    const slideDown = document.createElement('style');
    slideDown.textContent = `
      @keyframes slideDown {
        from {
          transform: translateY(0);
          opacity: 1;
        }
        to {
          transform: translateY(100%);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(slideDown);

    // Remove after animation
    setTimeout(() => {
      overlay.remove();
      styles.remove();
      slideDown.remove();
    }, 300);

    console.log('Cookie consent accepted');
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.cookieConsent = new CookieConsent();
});
