/**
 * Debug script to help identify issues with the login and register buttons
 */
console.log('Debug script loaded');

document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM fully loaded');
  
  // Check if auth-related objects exist
  console.log('authModal exists:', !!window.authModal);
  console.log('loginPrompt exists:', !!window.loginPrompt);
  console.log('authManager exists:', !!window.authManager);
  
  // Check login and register buttons
  const loginButton = document.getElementById('loginButton');
  const registerButton = document.getElementById('registerButton');
  
  console.log('Login button found:', !!loginButton);
  console.log('Register button found:', !!registerButton);
  
  if (loginButton) {
    console.log('Adding debug click handler to login button');
    loginButton.addEventListener('click', () => {
      console.log('Login button clicked');
      if (window.authModal) {
        console.log('Attempting to show auth modal with login tab');
        window.authModal.show('login');
      } else {
        console.error('authModal not found on window object');
      }
    });
  }
  
  if (registerButton) {
    console.log('Adding debug click handler to register button');
    registerButton.addEventListener('click', () => {
      console.log('Register button clicked');
      if (window.authModal) {
        console.log('Attempting to show auth modal with register tab');
        window.authModal.show('register');
      } else {
        console.error('authModal not found on window object');
      }
    });
  }
});