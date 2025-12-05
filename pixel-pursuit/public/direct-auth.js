/**
 * Direct authentication implementation that doesn't rely on the authModal
 */
document.addEventListener('DOMContentLoaded', () => {
  console.log('Direct auth script loaded');
  
  // Get reference to account button
  const accountButton = document.getElementById('accountButton');
  
  if (accountButton) {
    accountButton.addEventListener('click', () => {
      console.log('Account button clicked (direct handler)');
      showLoginDialog();
    });
  }
  
  function showLoginDialog() {
    // Get the login dialog
    const loginDialog = document.getElementById('loginDialog');
    if (loginDialog) {
      loginDialog.style.display = 'flex';
    } else {
      console.error('Login dialog not found');
    }
  }
  
  function showRegisterDialog() {
    // Get the register dialog
    const registerDialog = document.getElementById('registerDialog');
    if (registerDialog) {
      registerDialog.style.display = 'flex';
    } else {
      console.error('Register dialog not found');
    }
  }
  
  // Add event listeners to cancel buttons
  const cancelLoginBtn = document.getElementById('cancelLoginBtn');
  if (cancelLoginBtn) {
    cancelLoginBtn.addEventListener('click', () => {
      document.getElementById('loginDialog').style.display = 'none';
    });
  }
  
  const cancelRegisterBtn = document.getElementById('cancelRegisterBtn');
  if (cancelRegisterBtn) {
    cancelRegisterBtn.addEventListener('click', () => {
      document.getElementById('registerDialog').style.display = 'none';
    });
  }
  
  // Add event listeners to form submissions
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const username = document.getElementById('loginUsername').value.trim();
      const password = document.getElementById('loginPassword').value;
      
      try {
        await window.authManager.login(username, password);
        document.getElementById('loginDialog').style.display = 'none';
        
        if (window.onAuthSuccess) {
          window.onAuthSuccess();
        }
      } catch (error) {
        const loginError = document.getElementById('loginError');
        if (loginError) {
          loginError.textContent = error.message || 'Login failed';
          loginError.style.display = 'block';
        }
      }
    });
  }
  
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const username = document.getElementById('registerUsername').value.trim();
      const displayName = document.getElementById('registerDisplayName').value.trim();
      const email = document.getElementById('registerEmail').value.trim();
      const password = document.getElementById('registerPassword').value;
      
      try {
        await window.authManager.register(username, password, displayName, email || null);
        document.getElementById('registerDialog').style.display = 'none';
        
        if (window.onAuthSuccess) {
          window.onAuthSuccess();
        }
      } catch (error) {
        const registerError = document.getElementById('registerError');
        if (registerError) {
          registerError.textContent = error.message || 'Registration failed';
          registerError.style.display = 'block';
        }
      }
    });
  }
});