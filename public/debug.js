/**
 * Debug script to help identify issues with the login and register buttons
 */

document.addEventListener('DOMContentLoaded', () => {
  // Check login and register buttons
  const loginButton = document.getElementById('loginButton');
  const registerButton = document.getElementById('registerButton');
  
  if (loginButton) {
    loginButton.addEventListener('click', () => {
      if (window.authModal) {
        window.authModal.show('login');
      }
    });
  }
  
  if (registerButton) {
    registerButton.addEventListener('click', () => {
      if (window.authModal) {
        window.authModal.show('register');
      }
    });
  }
});