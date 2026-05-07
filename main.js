// SPLINE URL
const splineUrl =
  'https://prod.spline.design/tiUCnULhuI-Fare1/scene.splinecode';

const mount = document.querySelector('#spline-mount');

const viewer = document.createElement('spline-viewer');

viewer.setAttribute('url', splineUrl);
viewer.setAttribute('background', 'transparent');

viewer.style.width = '100%';
viewer.style.height = '100%';

mount.appendChild(viewer);

function setSplineVar(name, value) {
  if (typeof viewer.setVariable === 'function') {
    viewer.setVariable(name, value);
  }
}

// Set up button click handlers immediately
const btnRed = document.querySelector('.btn--red');
const btnGreen = document.querySelector('.btn--green');
const btnBlue = document.querySelector('.btn--blue');

btnRed.addEventListener('click', () => {
  console.log('RED clicked');
  const state = btnRed.classList.toggle('is-active');
  console.log('RED is-active:', state);
  btnRed.setAttribute('aria-pressed', state);
  setSplineVar('color-red', state);
});

btnGreen.addEventListener('click', () => {
  console.log('GREEN clicked');
  const state = btnGreen.classList.toggle('is-active');
  console.log('GREEN is-active:', state);
  btnGreen.setAttribute('aria-pressed', state);
  setSplineVar('color-green', state);
  setSplineVar('color-red', state);
});

btnBlue.addEventListener('click', () => {
  console.log('BLUE clicked');
  const state = btnBlue.classList.toggle('is-active');
  console.log('BLUE is-active:', state);
  btnBlue.setAttribute('aria-pressed', state);
  setSplineVar('color-blue', state);
});

viewer.addEventListener('load', () => {
  console.log('Viewer loaded');
});

// ── Cursor-Glow-Effekt (optional) ──
const glow = document.createElement('div');
glow.style.cssText = `
  position: fixed;
  width: 300px;
  height: 300px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(232,255,71,0.04) 0%, transparent 70%);
  pointer-events: none;
  transform: translate(-50%, -50%);
  transition: opacity 0.3s;
  z-index: 10;
`;
document.body.appendChild(glow);

document.addEventListener('mousemove', (e) => {
  glow.style.left = e.clientX + 'px';
  glow.style.top  = e.clientY + 'px';
});
