import './style.css';
import { initQuiz } from './quiz.js';
import { initNewLifeWheel } from './newLifeWheel.js';

document.addEventListener('DOMContentLoaded', () => {
  // Initialize New Wheel
  initNewLifeWheel();

  // Initialize Quiz
  initQuiz();

  // Handle Login Modal
  const loginLinks = document.querySelectorAll('a[href="#login"]');
  const loginModal = document.getElementById('login-modal');
  const closeLoginBtn = document.getElementById('close-login');
  const loginForm = document.getElementById('login-form');
  const loginError = document.getElementById('login-error');
  const adminControls = document.getElementById('admin-wheel-controls');
  
  if (loginLinks.length > 0 && loginModal) {
    loginLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        loginModal.classList.remove('hidden');
      });
    });

    closeLoginBtn.addEventListener('click', () => {
      loginModal.classList.add('hidden');
    });

    // Close on backdrop click
    loginModal.addEventListener('click', (e) => {
      if (e.target === loginModal) {
        loginModal.classList.add('hidden');
      }
    });

    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const user = document.getElementById('login-username').value;
      const pass = document.getElementById('login-password').value;
      
      if (user === 'admin' && pass === '12345678') {
        loginModal.classList.add('hidden');
        if (adminControls) {
          adminControls.classList.remove('hidden');
          adminControls.classList.add('flex');
        }
      } else {
        loginError.classList.remove('hidden');
      }
    });
  }

  // Handle navigation active state for mobile
  const activeSectorDisplay = document.getElementById('active-sector-info');
  if (activeSectorDisplay) {
      activeSectorDisplay.style.display = 'none'; // hide old wheel extra UI since new wheel doesn't use it
  }

  // Also hide old wheel buttons
  const oldSpinBtn = document.getElementById('spin-wheel-btn');
  const oldToggleAmbient = document.getElementById('toggle-ambient-btn');
  if (oldSpinBtn) oldSpinBtn.style.display = 'none';
  if (oldToggleAmbient) oldToggleAmbient.style.display = 'none';

  console.log('دار الرؤى للتدريب - تم تحميل واجهة الموقع بنجاح');
});
