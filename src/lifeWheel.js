// Data-driven Wheel of Life renderer.
// Each sector keeps its designed angular slot (startAngle/endAngle, matching the
// Figma layout) but its radius (how far the colored wedge reaches) is computed
// live from `score`, so re-running renderLifeWheel with new scores redraws the
// wheel without touching markup.

const ORIGIN_X = 408.46;
const ORIGIN_Y = 424.19;
const INNER_R = 96;
const MAX_R = 360;
const LABEL_R = MAX_R + 46;
const MAX_SCORE = 100;

function polarToXY(r, angleDeg) {
  const a = (angleDeg * Math.PI) / 180;
  return [r * Math.cos(a), r * Math.sin(a)];
}

function polarRad(r, angleRad) {
  return [r * Math.cos(angleRad), r * Math.sin(angleRad)];
}

function fmt([x, y]) {
  return `${x.toFixed(2)} ${y.toFixed(2)}`;
}

function annularSectorPath(innerR, outerR, startAngle, endAngle) {
  const [x1, y1] = polarToXY(outerR, startAngle);
  const [x2, y2] = polarToXY(outerR, endAngle);
  const [x3, y3] = polarToXY(innerR, endAngle);
  const [x4, y4] = polarToXY(innerR, startAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${outerR} ${outerR} 0 ${largeArc} 1 ${x2.toFixed(2)} ${y2.toFixed(2)} L ${x3.toFixed(2)} ${y3.toFixed(2)} A ${innerR} ${innerR} 0 ${largeArc} 0 ${x4.toFixed(2)} ${y4.toFixed(2)} Z`;
}

// Annular sector whose two OUTER corners are filleted with a quarter-circle of
// radius `cornerR`, giving the soft "capsule tip" look of the original design.
// Inner corners stay sharp (they sit near the compass and are barely visible).
function roundedWedgePath(innerR, outerR, startAngleDeg, endAngleDeg, cornerR) {
  const start = (startAngleDeg * Math.PI) / 180;
  const end = (endAngleDeg * Math.PI) / 180;
  const span = end - start;

  const maxByThickness = (outerR - innerR) / 2;
  const maxByArc = Math.abs(outerR * span) / 2 - 1;
  const rc = Math.max(0, Math.min(cornerR, maxByThickness, maxByArc));

  if (rc < 1 || outerR <= innerR + 1) {
    return annularSectorPath(innerR, outerR, startAngleDeg, endAngleDeg);
  }

  const d = Math.asin(rc / (outerR - rc));
  const pInnerStart = polarRad(innerR, start);
  const pInnerEnd = polarRad(innerR, end);
  const pLineStart = polarRad((outerR - rc) * Math.cos(d), start);
  const pArcStart = polarRad(outerR, start + d);
  const pArcEnd = polarRad(outerR, end - d);
  const pLineEnd = polarRad((outerR - rc) * Math.cos(d), end);
  const largeArc = end - d - (start + d) > Math.PI ? 1 : 0;

  return [
    `M ${fmt(pInnerStart)}`,
    `L ${fmt(pLineStart)}`,
    `A ${rc.toFixed(2)} ${rc.toFixed(2)} 0 0 1 ${fmt(pArcStart)}`,
    `A ${outerR} ${outerR} 0 ${largeArc} 1 ${fmt(pArcEnd)}`,
    `A ${rc.toFixed(2)} ${rc.toFixed(2)} 0 0 1 ${fmt(pLineEnd)}`,
    `L ${fmt(pInnerEnd)}`,
    `A ${innerR} ${innerR} 0 ${largeArc} 0 ${fmt(pInnerStart)}`,
    'Z',
  ].join(' ');
}

function mix(hex, target, amount) {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = (num >> 16) & 255, g = (num >> 8) & 255, b = num & 255;
  const t = parseInt(target.replace('#', ''), 16);
  const tr = (t >> 16) & 255, tg = (t >> 8) & 255, tb = t & 255;
  const m = (c, tc) => Math.round(c + (tc - c) * amount);
  return `rgb(${m(r, tr)}, ${m(g, tg)}, ${m(b, tb)})`;
}

const lighten = (hex, amount) => mix(hex, '#ffffff', amount);
const darken = (hex, amount) => mix(hex, '#000000', amount);

function starPath(outerR, innerR) {
  const points = [];
  for (let i = 0; i < 16; i++) {
    const angle = i * 22.5 - 90;
    const r = i % 2 === 0 ? outerR : innerR;
    points.push(polarToXY(r, angle));
  }
  return 'M ' + points.map(([x, y]) => `${x.toFixed(2)} ${y.toFixed(2)}`).join(' L ') + ' Z';
}

function buildCompass() {
  const ticks = [];
  for (let i = 0; i < 16; i++) {
    const angle = i * 22.5 - 90;
    const len = i % 2 === 0 ? 8 : 4;
    const [x1, y1] = polarToXY(INNER_R - 12, angle);
    const [x2, y2] = polarToXY(INNER_R - 12 - len, angle);
    ticks.push(`<line x1="${x1.toFixed(2)}" y1="${y1.toFixed(2)}" x2="${x2.toFixed(2)}" y2="${y2.toFixed(2)}" stroke="#C8A84B" stroke-opacity="0.55" stroke-width="1.4" />`);
  }
  return `
    <circle cx="0" cy="0" r="${INNER_R - 2}" fill="#ffffff" filter="url(#compass-shadow)" />
    <circle cx="0" cy="0" r="${INNER_R - 2}" fill="none" stroke="#E3D9C6" stroke-width="1.5" />
    <circle cx="0" cy="0" r="${INNER_R - 10}" fill="none" stroke="#E3D9C6" stroke-width="1" stroke-dasharray="2 3" />
    ${ticks.join('')}
    <path d="${starPath(INNER_R - 22, 18)}" fill="url(#compass-gold)" stroke="#8A6E2F" stroke-width="0.75" />
    <path d="${starPath(INNER_R - 22, 18)}" fill="url(#compass-shine)" opacity="0.55" />
    <circle cx="0" cy="0" r="6" fill="#8A6E2F" />
  `;
}

function buildIndicator() {
  return `
    <g id="wheel-indicator" filter="url(#pointer-shadow)">
      <polygon points="0,-108 -9,-90 9,-90" fill="url(#compass-gold)" stroke="#8A6E2F" stroke-width="1.2" />
      <circle cx="0" cy="-92" r="2.5" fill="#ffffff" />
    </g>
  `;
}

let audioCtx = null;
function playTick() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!audioCtx && AudioContext) audioCtx = new AudioContext();
    if (audioCtx && audioCtx.state === 'running') {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(560, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(200, audioCtx.currentTime + 0.025);
      gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.025);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.025);
    }
  } catch (e) {}
}

/**
 * @param {SVGSVGElement} svg
 * @param {Array<{id:string,label:string,color:string,score:number,icon:string,startAngle:number,endAngle:number}>} data
 * @param {{onActivate?: (id: string) => void, onSpinEnd?: (sector: object) => void}} [opts]
 */
export function renderLifeWheel(svg, data, opts = {}) {
  // Ensure SVG has expanded viewBox and visible overflow so labels are never clipped while spinning
  svg.setAttribute('viewBox', '-85 -70 980 980');
  svg.style.overflow = 'visible';

  const getLabel = opts.label || ((s) => s.label ?? s.title ?? s.id);
  const cornerR = opts.cornerRadius ?? 26;
  const gapDeg = opts.gapAngle ?? 5.5;
  const halfGap = gapDeg / 2;

  let defs = '';
  const wedges = data.map(s => {
    const valueR = INNER_R + (MAX_R - INNER_R) * Math.max(0, Math.min(100, s.score)) / MAX_SCORE;
    const bisector = (s.startAngle + s.endAngle) / 2;
    const [baseX, baseY] = polarToXY(LABEL_R, bisector);
    const gappedStart = s.startAngle + halfGap;
    const gappedEnd = s.endAngle - halfGap;

    const [gx1, gy1] = polarToXY(INNER_R, bisector);
    const [gx2, gy2] = polarToXY(valueR, bisector);
    defs += `
      <linearGradient id="grad-${s.id}" gradientUnits="userSpaceOnUse" x1="${gx1.toFixed(2)}" y1="${gy1.toFixed(2)}" x2="${gx2.toFixed(2)}" y2="${gy2.toFixed(2)}">
        <stop offset="0%" stop-color="${darken(s.color, 0.22)}" />
        <stop offset="55%" stop-color="${s.color}" />
        <stop offset="100%" stop-color="${lighten(s.color, 0.5)}" />
      </linearGradient>
    `;

    return `
      <g data-sector="${s.id}" class="wheel-sector" style="cursor:pointer">
        <path class="wheel-value" d="${roundedWedgePath(INNER_R, valueR, gappedStart, gappedEnd, cornerR)}"
              fill="url(#grad-${s.id})" stroke="#ffffff" stroke-width="2" stroke-linejoin="round"
              filter="url(#wedge-shadow)" />
        <g class="wheel-label-wrapper" data-base-x="${baseX.toFixed(2)}" data-base-y="${baseY.toFixed(2)}">
          <image href="${s.icon}" x="${(baseX - 14).toFixed(2)}" y="${(baseY - 34).toFixed(2)}" width="28" height="28" />
          <text x="${baseX.toFixed(2)}" y="${(baseY + 14).toFixed(2)}" text-anchor="middle" font-size="20" font-weight="700"
                fill="${s.color}" font-family="'El Messiri','Cairo',sans-serif">${getLabel(s)}</text>
        </g>
      </g>`;
  }).join('');

  svg.innerHTML = `
    <defs>
      ${defs}
      <radialGradient id="compass-shine" cx="35%" cy="25%" r="70%">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.9" />
        <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
      </radialGradient>
      <linearGradient id="compass-gold" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#E6D3A0" />
        <stop offset="55%" stop-color="#C8A84B" />
        <stop offset="100%" stop-color="#9C7E33" />
      </linearGradient>
      <filter id="compass-shadow" x="-50%" y="-50%" width="200%" height="200%">
        <feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#000000" flood-opacity="0.18" />
      </filter>
      <filter id="wedge-shadow" x="-60%" y="-60%" width="220%" height="220%">
        <feDropShadow dx="0" dy="3" stdDeviation="2.5" flood-color="#1E2A4A" flood-opacity="0.25" />
      </filter>
      <filter id="pointer-shadow" x="-50%" y="-50%" width="200%" height="200%">
        <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#000000" flood-opacity="0.3" />
      </filter>
    </defs>
    <g transform="translate(${ORIGIN_X}, ${ORIGIN_Y})">
      <g id="wheel-rotor" transform="rotate(0)">
        <g id="wheel-wedges">${wedges}</g>
        <g id="wheel-compass" style="cursor: pointer;" title="انقر لتدوير العجلة ↻">
          ${buildCompass()}
        </g>
      </g>
      ${buildIndicator()}
    </g>
  `;

  const wheelRotor = svg.querySelector('#wheel-rotor');
  const compass = svg.querySelector('#wheel-compass');
  // Cache DOM element references and base coordinates once to avoid 16 DOM queries per frame
  const cachedLabels = Array.from(svg.querySelectorAll('.wheel-label-wrapper')).map(el => ({
    el,
    bx: el.getAttribute('data-base-x'),
    by: el.getAttribute('data-base-y'),
  }));

  let currentAngle = 0;
  let isSpinning = false;
  // Ambient auto-rotation defaults to OFF — the wheel only moves when the user
  // explicitly spins it (click) or turns ambient motion on via the toggle button.
  let isAmbientPaused = true;
  let isHoverPaused = false;
  let isVisible = true;
  let lastSectorId = 'personal';
  let rafId = null;
  let lastTime = performance.now();

  function updateRotation(angle) {
    currentAngle = ((angle % 360) + 360) % 360;
    if (wheelRotor) {
      wheelRotor.setAttribute('transform', `rotate(${currentAngle.toFixed(3)})`);
    }
    const invAngleStr = (-currentAngle).toFixed(3);
    for (let i = 0; i < cachedLabels.length; i++) {
      const item = cachedLabels[i];
      item.el.setAttribute('transform', `rotate(${invAngleStr} ${item.bx} ${item.by})`);
    }
  }

  function getSectorAtTop(angle = currentAngle) {
    let bestSector = data[0];
    let minDiff = 360;
    data.forEach(s => {
      const bisector = (s.startAngle + s.endAngle) / 2;
      const current = ((bisector + angle) % 360 + 360) % 360;
      let diff = Math.abs(current - 270);
      if (diff > 180) diff = 360 - diff;
      if (diff < minDiff) {
        minDiff = diff;
        bestSector = s;
      }
    });
    return bestSector;
  }

  // Smooth ambient rotation loop (~7.2 degrees/second = 50 seconds per full revolution)
  function loop(now) {
    if (!isVisible && !isSpinning) {
      rafId = null;
      return;
    }
    // Cap dt at 0.1s to prevent jumps after tab switching or backgrounding
    const dt = Math.min((now - lastTime) / 1000, 0.1);
    lastTime = now;
    if (!isSpinning && !isAmbientPaused && !isHoverPaused) {
      const nextAngle = currentAngle + 7.2 * dt;
      updateRotation(nextAngle);
    }
    rafId = requestAnimationFrame(loop);
  }

  // Viewport culling: Pause RAF loop completely when the wheel is off-screen (0% CPU/GPU load)
  let observer = null;
  if ('IntersectionObserver' in window) {
    observer = new IntersectionObserver((entries) => {
      const entry = entries[0];
      isVisible = Boolean(entry && entry.isIntersecting);
      if (isVisible) {
        lastTime = performance.now();
        if (!rafId && !isSpinning && !isAmbientPaused && !isHoverPaused) {
          rafId = requestAnimationFrame(loop);
        }
      } else {
        if (rafId && !isSpinning) {
          cancelAnimationFrame(rafId);
          rafId = null;
        }
      }
    }, { threshold: 0.05 });
    observer.observe(svg);
  } else if (!isAmbientPaused) {
    rafId = requestAnimationFrame(loop);
  }

  // Pause ambient on mouse hover
  svg.addEventListener('mouseenter', () => {
    if (!isSpinning) isHoverPaused = true;
  });
  svg.addEventListener('mouseleave', () => {
    isHoverPaused = false;
    if (!rafId && isVisible && !isAmbientPaused && !isSpinning) {
      lastTime = performance.now();
      rafId = requestAnimationFrame(loop);
    }
  });

  // Sector click & hover activation
  svg.querySelectorAll('.wheel-sector').forEach(g => {
    const id = g.dataset.sector;
    g.addEventListener('click', () => {
      if (isSpinning) return;
      if (opts.onActivate) opts.onActivate(id);
    });
    g.addEventListener('mouseenter', () => {
      if (isSpinning) return;
      if (opts.onActivate) opts.onActivate(id);
    });
  });

  // Ease-out quartic function for smooth physical deceleration
  function easeOutQuart(t) {
    return 1 - Math.pow(1 - t, 4);
  }

  // Interactive spin function
  function spin(onFinish) {
    if (isSpinning) return;
    isSpinning = true;

    // Wake up audio context if allowed
    try {
      if (!audioCtx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) audioCtx = new AudioContext();
      }
      if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
    } catch (e) {}

    // Choose random sector
    const pool = data.filter(s => s.id !== lastSectorId);
    const target = pool[Math.floor(Math.random() * pool.length)] || data[0];
    lastSectorId = target.id;

    // Target bisector to land precisely at 270° (top)
    const bisector = (target.startAngle + target.endAngle) / 2;
    const targetNorm = ((270 - bisector) % 360 + 360) % 360;
    const currentNorm = ((currentAngle % 360) + 360) % 360;
    let diff = targetNorm - currentNorm;
    if (diff <= 0) diff += 360;

    const fullSpins = (5 + Math.floor(Math.random() * 2)) * 360;
    const totalDelta = fullSpins + diff;
    const startAngle = currentAngle;
    const duration = 3800; // 3.8 seconds of exhilarating spin
    const startTime = performance.now();

    let lastTopId = null;

    function spinStep(now) {
      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / duration);
      const eased = easeOutQuart(t);
      const angle = startAngle + totalDelta * eased;
      updateRotation(angle);

      // Audible click when passing sectors
      const topSec = getSectorAtTop(angle);
      if (topSec && topSec.id !== lastTopId) {
        lastTopId = topSec.id;
        playTick();
      }

      if (t < 1) {
        requestAnimationFrame(spinStep);
      } else {
        updateRotation(startAngle + totalDelta);
        isSpinning = false;

        // Visual celebration on winning wedge
        svg.querySelectorAll('.wheel-sector').forEach(g => {
          g.classList.toggle('is-winner', g.dataset.sector === target.id);
        });

        if (opts.onActivate) opts.onActivate(target.id);
        if (opts.onSpinEnd) opts.onSpinEnd(target);
        if (onFinish) onFinish(target);

        // Resume ambient rotation after a 3.5-second celebration pause
        setTimeout(() => {
          svg.querySelectorAll('.wheel-sector').forEach(g => {
            g.classList.remove('is-winner');
          });
          isHoverPaused = false;
        }, 3500);
      }
    }

    requestAnimationFrame(spinStep);
  }

  // Click on center compass to spin
  if (compass) {
    compass.addEventListener('click', (e) => {
      e.stopPropagation();
      spin();
    });
  }

  return {
    spin,
    toggleAmbient: () => {
      isAmbientPaused = !isAmbientPaused;
      if (!isAmbientPaused && !rafId && isVisible && !isSpinning && !isHoverPaused) {
        lastTime = performance.now();
        rafId = requestAnimationFrame(loop);
      }
      return !isAmbientPaused;
    },
    isAmbientRunning: () => !isAmbientPaused,
    setActiveSector: (id) => setActiveSector(svg, id),
    destroy: () => {
      if (rafId) cancelAnimationFrame(rafId);
      if (observer) observer.disconnect();
    }
  };
}

export function setActiveSector(svg, id) {
  svg.querySelectorAll('.wheel-sector').forEach(g => {
    g.classList.toggle('is-active', g.dataset.sector === id);
  });
}
