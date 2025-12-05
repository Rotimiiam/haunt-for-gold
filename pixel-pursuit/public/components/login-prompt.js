/**
 * Login Prompt Component
 * Shows a modal asking users to login/register or continue as guest when trying to join a game
 * Styled to match the Cadence of Hyrule aesthetic
 */

const loginPrompt = (() => {
  // Create modal elements
  const modal = document.createElement('div');
  modal.className = 'auth-modal login-prompt-modal';
  modal.style.display = 'none';
  
  const modalContent = document.createElement('div');
  modalContent.className = 'auth-modal-content cadence-style-modal';
  
  const closeBtn = document.createElement('span');
  closeBtn.className = 'auth-close-btn';
  closeBtn.innerHTML = '&times;';
  closeBtn.onclick = () => hide();
  
  const header = document.createElement('h2');
  header.textContent = 'JOIN GAME';
  header.className = 'cadence-header';
  
  const message = document.createElement('p');
  message.textContent = 'Sign in to track your progress and compete on the leaderboard, or continue as a guest.';
  
  const buttonContainer = document.createElement('div');
  buttonContainer.className = 'auth-button-container';
  
  const accountBtn = document.createElement('button');
  accountBtn.className = 'auth-btn cadence-btn';
  accountBtn.textContent = 'LOGIN / REGISTER';
  accountBtn.onclick = () => {
    hide();
    // Show the auth modal with tabs for login/register
    if (window.authModal && typeof window.authModal.show === 'function') {
      window.authModal.show('login');
    } else {
      console.error('Auth modal not found');
      // Fallback to showing the login dialog directly
      const loginDialog = document.getElementById('loginDialog');
      if (loginDialog) {
        loginDialog.style.display = 'flex';
      }
    }
  };
  
  const guestBtn = document.createElement('button');
  guestBtn.className = 'auth-btn cadence-btn guest';
  guestBtn.textContent = 'CONTINUE AS GUEST';
  guestBtn.onclick = async () => {
    try {
      hide();
      await authManager.loginAsGuest();
      if (window.onAuthSuccess) {
        window.onAuthSuccess();
      }
      // Call the callback function to start the game
      if (loginPrompt.onContinue) {
        loginPrompt.onContinue();
      }
    } catch (error) {
      console.error('Guest login failed:', error);
    }
  };
  
  // Assemble modal
  buttonContainer.appendChild(accountBtn);
  buttonContainer.appendChild(guestBtn);
  
  modalContent.appendChild(closeBtn);
  modalContent.appendChild(header);
  modalContent.appendChild(message);
  modalContent.appendChild(buttonContainer);
  
  modal.appendChild(modalContent);
  
  // Add modal to document when DOM is loaded
  document.addEventListener('DOMContentLoaded', () => {
    document.body.appendChild(modal);
    
    // Add the Cadence of Hyrule style CSS
    const style = document.createElement('style');
    style.textContent = `
      .cadence-style-modal {
        background-color: #222;
        border: 3px solid #444;
        box-shadow: 0 0 20px rgba(0, 0, 0, 0.7);
      }
      
      .cadence-header {
        color: #fff;
        text-align: center;
        font-size: 1.8rem;
        margin-bottom: 20px;
        letter-spacing: 2px;
        text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
      }
      
      .auth-btn.cadence-btn {
        background: #333;
        border: 2px solid #666;
        color: white;
        padding: 12px;
        font-size: 1.1rem;
        font-weight: 600;
        margin: 8px 0;
        width: 100%;
        letter-spacing: 1px;
        position: relative;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
      }
      
      .auth-btn.cadence-btn:hover {
        background: #444;
        transform: translateY(-2px);
      }
      
      .auth-btn.cadence-btn.guest {
        background: #555;
        border-color: #777;
      }
      
      .auth-btn.cadence-btn:before,
      .auth-btn.cadence-btn:after {
        content: '';
        position: absolute;
        width: 6px;
        height: 6px;
        background: #ffd700;
        border-radius: 50%;
        top: 50%;
        transform: translateY(-50%);
      }
      
      .auth-btn.cadence-btn:before {
        left: 10px;
      }
      
      .auth-btn.cadence-btn:after {
        right: 10px;
      }
    `;
    document.head.appendChild(style);
  });
  
  // Public methods
  function show(callback) {
    modal.style.display = 'flex';
    loginPrompt.onContinue = callback;
  }
  
  function hide() {
    modal.style.display = 'none';
  }
  
  // Close modal when clicking outside of it
  window.addEventListener('click', (event) => {
    if (event.target === modal) {
      hide();
    }
  });
  
  return {
    show,
    hide,
    onContinue: null
  };
})();