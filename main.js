import { Application } from 'https://unpkg.com/@splinetool/runtime/build/runtime.js';

const SCENE_URL = 'https://prod.spline.design/tiUCnULhuI-Fare1/scene.splinecode';
const canvas = document.getElementById('spline-canvas');
const spline = new Application(canvas);

// ─── State ───────────────────────────────────────────────────────────────────
let rxInsideActive = false;   // ist rx-inside gerade an?
let rxRunActive    = false;   // läuft rx-run gerade?
let rxRunTimer     = null;    // 5s Sperre
let lastColor      = 'color-basestate';

// ─── Hilfsfunktion ───────────────────────────────────────────────────────────
function setVar(name, value) {
  if (typeof spline.setVariable === 'function') {
    spline.setVariable(name, value);
    console.log(`${name} → ${value}`);
  }
}

// ─── rx-inside starten ───────────────────────────────────────────────────────
function startRxInside() {
  if (rxRunActive) return; // Sperre: rx-run läuft noch

  // Sauber resetten damit Spline-Timeline von vorne startet
  setVar('rx-inside-pause-pfad', false);
  setVar('rx-inside', false);
  setVar('rx-inside-reset', true);

  setTimeout(() => {
    setVar('rx-inside-reset', false);
    setVar('rx-inside', true);
    rxInsideActive = true;
  }, 20);
}

// ─── rx-inside stoppen ───────────────────────────────────────────────────────
function stopRxInside() {
  setVar('rx-inside-pause-pfad', true);
  setVar('rx-inside', false);
  rxInsideActive = false;
}

// ─── rx-run starten ──────────────────────────────────────────────────────────
function startRxRun() {
  if (rxRunActive) return; // läuft bereits

  // inside pausieren statt auf false zu setzen, damit die Timeline nicht rückwärts läuft.
  setVar('rx-inside-pause-pfad', true);
  setVar('rx-inside', true);
  rxInsideActive = false;
  setVar('rx-run', true);
  rxRunActive = true;

  // Nach 7s rx-run beenden
  rxRunTimer = setTimeout(() => {
    setVar('rx-run', false);
    rxRunActive = false;
    rxRunTimer  = null;

    // Falls Magenta noch aktiv: rx-inside neu starten
    if (lastColor === 'color-magenta') {
      setVar('rx-inside-pause-pfad', false);
      startRxInside();
    }
  }, 7000);
}

// ─── Farb-Logik ──────────────────────────────────────────────────────────────
function getColorState() {
  const r = document.querySelector('.btn--red')?.classList.contains('is-active');
  const g = document.querySelector('.btn--green')?.classList.contains('is-active');
  const b = document.querySelector('.btn--blue')?.classList.contains('is-active');

  if (r && g && b) return 'color-white';
  if (r && g)      return 'color-yellow';
  if (g && b)      return 'color-cyan';
  if (r && b)      return 'color-magenta';
  if (r)           return 'color-red';
  if (g)           return 'color-green';
  if (b)           return 'color-blue';
  return 'color-basestate';
}

function updateColor() {
  const newColor = getColorState();
  if (newColor === lastColor) return;

  // Alten Farbboolean ausschalten
  setVar(lastColor, false);

  // Neuen einschalten
  setVar(newColor, true);

  lastColor = newColor;

  if (newColor === 'color-magenta') {
    startRxInside();
  } else {
    // Magenta weg → alles stoppen (außer laufendes rx-run darf zu Ende)
    if (!rxRunActive) {
      stopRxInside();
    }
  }
}

function toggleButton(btn) {
  btn.classList.toggle('is-active');
  btn.setAttribute('aria-pressed', String(btn.classList.contains('is-active')));
  updateColor();
}

// ─── Spline laden ────────────────────────────────────────────────────────────
spline.load(SCENE_URL).then(() => {
  console.log('Spline geladen');

  // Buttons verdrahten
  ['btn--red', 'btn--green', 'btn--blue'].forEach(cls => {
    document.querySelector(`.${cls}`)?.addEventListener('click', e => {
      toggleButton(e.currentTarget);
    });
  });

  // Debug button: log internal state
  const debugBtn = document.querySelector('.btn--fn-debug-state');
  if (debugBtn) {
    debugBtn.addEventListener('click', (ev) => {
      ev.stopPropagation();
      const state = {
        rxInsideActive,
        rxRunActive,
        rxRunTimer: rxRunTimer !== null,
        lastColor,
        colorState: getColorState(),
      };
      console.log('DEBUG STATE', state);
      alert('DEBUG STATE:\n' + JSON.stringify(state, null, 2));
    });
  }

  // Klick im Viewport → rx-run starten (nur wenn rx-inside aktiv)
  document.addEventListener('click', (e) => {
    // Klicks auf Buttons ignorieren
    if (e.target.closest('.btn')) return;
    if (rxInsideActive) {
      startRxRun();
    }
  });
});

// ─── Cursor Glow ─────────────────────────────────────────────────────────────
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

document.addEventListener('mousemove', e => {
  glow.style.left = e.clientX + 'px';
  glow.style.top  = e.clientY + 'px';
});