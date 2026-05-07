import { Application } from 'https://unpkg.com/@splinetool/runtime@1.9.82/build/runtime.js';

const canvas = document.getElementById('spline-canvas');
const spline = new Application(canvas);

spline.load('https://prod.spline.design/tiUCnULhuI-Fare1/scene.splinecode').then(() => {
  console.log('geladen');

  const buttons = {
    red: document.querySelector('.btn--red'),
    green: document.querySelector('.btn--green'),
    blue: document.querySelector('.btn--blue'),
  };

  let lastActiveColor = 'color-basestate';

  function safeSetVar(name, value) {
    if (spline && typeof spline.setVariable === 'function') {
      spline.setVariable(name, value);
      console.log(`${name} ->`, value);
    } else {
      console.error('spline.setVariable not available');
    }
  }

  function getColorState() {
    const r = buttons.red.classList.contains('is-active');
    const g = buttons.green.classList.contains('is-active');
    const b = buttons.blue.classList.contains('is-active');

    // Build color from binary state (RGB)
    if (r && g && b) return 'color-white';
    if (r && g) return 'color-yellow';
    if (g && b) return 'color-cyan';
    if (r && b) return 'color-magenta';
    if (r) return 'color-red';
    if (g) return 'color-green';
    if (b) return 'color-blue';
    return 'color-basestate';
  }

  function updateColor() {
    const newColor = getColorState();

    if (newColor !== lastActiveColor) {
      // Turn off old color
      if (lastActiveColor !== 'color-basestate') {
        safeSetVar(lastActiveColor, false);
      } else {
        safeSetVar('color-basestate', false);
      }

      // Turn on new color
      if (newColor !== 'color-basestate') {
        safeSetVar(newColor, true);
      } else {
        safeSetVar('color-basestate', true);
      }

      lastActiveColor = newColor;
      console.log('Color combo:', newColor);
    }
  }

  function toggleButton(btn) {
    btn.classList.toggle('is-active');
    btn.setAttribute('aria-pressed', String(btn.classList.contains('is-active')));
    updateColor();
  }

  // Attach listeners
  Object.values(buttons).forEach(btn => {
    if (btn) btn.addEventListener('click', () => toggleButton(btn));
  });
});

// Cursor Glow
const glow = document.createElement('div');
glow.style.cssText = `
  position: fixed;
  width: 300px;
  height: 300px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(232,255,71,0.04) 0%, transparent 70%);
  pointer-events: none;
  transform: translate(-50%, -50%);
  z-index: 10;
`;
document.body.appendChild(glow);
document.addEventListener('mousemove', (e) => {
  glow.style.left = e.clientX + 'px';
  glow.style.top = e.clientY + 'px';
});