import { Application } from 'https://unpkg.com/@splinetool/runtime/build/runtime.js';

const SCENE_URL = 'https://prod.spline.design/tiUCnULhuI-Fare1/scene.splinecode';

const canvas = document.getElementById('spline-canvas');
const spline = new Application(canvas);

const splineDebug = document.createElement('div');
splineDebug.style.cssText = `
  position: fixed;
  left: 12px;
  bottom: 12px;
  z-index: 9999;
  padding: 8px 10px;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.7);
  color: #fff;
  font: 12px/1.3 system-ui, sans-serif;
  pointer-events: none;
`;
splineDebug.textContent = 'Spline debug: waiting...';
document.body.appendChild(splineDebug);

function safeSetVar(name, value) {
  if (spline && typeof spline.setVariable === 'function') {
    spline.setVariable(name, value);
    console.log(`${name} ->`, value);
    splineDebug.textContent = `${name} -> ${value}`;
    return value;
  } else {
    console.warn('spline.setVariable not available yet for', name);
    splineDebug.textContent = `spline.setVariable not available yet for ${name}`;
    return false;
  }
}

function applyStartupState() {
  safeSetVar('rx-run', true);
  safeSetVar('rx-inside', true);
  safeSetVar('rx-run-nonvisible', false);
  safeSetVar('rx-inside-nonvisible', false);
}

window.__setSplineVar = safeSetVar;
window.__triggerRxInside = (value = true) => safeSetVar('rx-inside', value);
window.__forceRxVisible = () => { applyStartupState(); return true; };
window.__sceneUrl = SCENE_URL;
window.__splineDebug = splineDebug;

spline.load(SCENE_URL).then(() => {
  console.log('geladen');

  setTimeout(() => {
    applyStartupState();
  }, 300);

  const buttons = {
    red: document.querySelector('.btn--red'),
    green: document.querySelector('.btn--green'),
    blue: document.querySelector('.btn--blue'),
    rxInsideTest: document.querySelector('.btn--rxinside-test'),
  };

  let lastActiveColor = 'color-basestate';

  function getColorState() {
    const r = buttons.red.classList.contains('is-active');
    const g = buttons.green.classList.contains('is-active');
    const b = buttons.blue.classList.contains('is-active');

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
      if (lastActiveColor !== 'color-basestate') {
        safeSetVar(lastActiveColor, false);
      } else {
        safeSetVar('color-basestate', false);
      }

      if (newColor !== 'color-basestate') {
        safeSetVar(newColor, true);
      } else {
        safeSetVar('color-basestate', true);
      }

      lastActiveColor = newColor;
      console.log('Color combo:', newColor);

      if (newColor === 'color-magenta') {
        safeSetVar('rx-inside', true);
      } else {
        safeSetVar('rx-inside', false);
      }
    }
  }

  function toggleButton(btn) {
    btn.classList.toggle('is-active');
    btn.setAttribute('aria-pressed', String(btn.classList.contains('is-active')));
    updateColor();
  }

  [buttons.red, buttons.green, buttons.blue].forEach(btn => {
    if (btn) btn.addEventListener('click', () => toggleButton(btn));
  });

  if (buttons.rxInsideTest) {
    buttons.rxInsideTest.addEventListener('pointerdown', () => {
      buttons.rxInsideTest.classList.add('is-active');
      buttons.rxInsideTest.setAttribute('aria-pressed', 'true');
      safeSetVar('rx-inside', true);
    });

    const releaseRxInsideTest = () => {
      buttons.rxInsideTest.classList.remove('is-active');
      buttons.rxInsideTest.setAttribute('aria-pressed', 'false');
      safeSetVar('rx-inside', false);
    };

    buttons.rxInsideTest.addEventListener('pointerup', releaseRxInsideTest);
    buttons.rxInsideTest.addEventListener('pointerleave', releaseRxInsideTest);
    buttons.rxInsideTest.addEventListener('pointercancel', releaseRxInsideTest);
  }
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

  if (window._rxMouseTimer) clearTimeout(window._rxMouseTimer);
  window._rxMouseTimer = setTimeout(() => {
    safeSetVar('rx-run', true);
    safeSetVar('rx-inside-nonvisible', false);
    safeSetVar('rx-run-nonvisible', false);
  }, 200);
});