export function initNewLifeWheel() {

/* ============================================================
   إعدادات عامة للعجلة
   ============================================================ */
const SETTINGS = {
  center: { x: 400, y: 400 },
  innerRadius: 60,
  outerRadius: 380,
  numRings: 5,
  gapWidth: 14,
  showLabels: true,
  labelOffset: 56,
  iconOffset: 20,
  iconSize: 26,
  gridStrokeColor: "#2c3e50",
  emptyGridStrokeOpacity: 0,
  filledGridStrokeOpacity: 0.18
};

/* بيانات كل محور - كل محور ليه أيقونة افتراضية تقدر تغيّرها */
let axesState = [
  { label: "الجانب الصحي", color: "#489674", percent: 92, direction: "dark-to-light", icon: "custom", customIconUrl: "/icons/wheel_of_life/health.png" },
  { label: "الجانب الاجتماعي", color: "#963056", percent: 55, direction: "dark-to-light", icon: "custom", customIconUrl: "/icons/wheel_of_life/social.png" },
  { label: "الجانب العائلي", color: "#BC7B4A", percent: 95, direction: "dark-to-light", icon: "custom", customIconUrl: "/icons/wheel_of_life/family.png" },
  { label: "الجانب الترفيهي", color: "#B8AA44", percent: 50, direction: "dark-to-light", icon: "custom", customIconUrl: "/icons/wheel_of_life/leisure.png" },
  { label: "الجانب المالي", color: "#27797E", percent: 90, direction: "dark-to-light", icon: "custom", customIconUrl: "/icons/wheel_of_life/financial.png" },
  { label: "الجانب المهني", color: "#21487B", percent: 54, direction: "dark-to-light", icon: "custom", customIconUrl: "/icons/wheel_of_life/career.png" },
  { label: "الجانب الشخصي", color: "#5C3E9B", percent: 95, direction: "dark-to-light", icon: "custom", customIconUrl: "/icons/wheel_of_life/personal.png" },
  { label: "الجانب الروحي", color: "#5B6ECC", percent: 52, direction: "dark-to-light", icon: "custom", customIconUrl: "/icons/wheel_of_life/spiritual.png" }
];

/* حالة الدوران والصورة في المنتصف */
let rotationAngle = 0;      // بالدرجات - قيمة معروضة محصورة 0-360
let autoSpinOn = false;
let autoSpinSpeed = 20;     // درجة/ثانية
let spinDirection = "cw";   // cw = يمين (مع عقارب الساعة) / ccw = شمال (عكسها)
let centerImageDataUrl = null;
let autoSpinTimer = null;
let isSpinning = false;     // true أثناء تشغيل أنيميشن السبين العشوائي
let audioCtx = null;

/* ============================================================
   مكتبة أيقونات بسيطة مرسومة بـ SVG (كل أيقونة عبارة عن أشكال بسيطة تتلون بلون المحور)
   ============================================================ */
const ICONS = {
  heart: (c) => [
    { tag: "path", attrs: { d: "M12 21c-.3 0-.6-.1-.8-.3C7.4 17.8 3 13.9 3 9.8 3 7 5.2 4.8 8 4.8c1.5 0 3 .7 4 1.9 1-1.2 2.5-1.9 4-1.9 2.8 0 5 2.2 5 5 0 4.1-4.4 8-8.2 10.9-.2.2-.5.3-.8.3z", fill: c } }
  ],
  work: (c) => [
    { tag: "rect", attrs: { x: 3, y: 8, width: 18, height: 11, rx: 2, fill: c } },
    { tag: "path", attrs: { d: "M9 8V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2h-2V6h-2v2H9z", fill: c } },
    { tag: "rect", attrs: { x: 3, y: 12, width: 18, height: 2, fill: "var(--wheel-center-bg)" } }
  ],
  money: (c) => [
    { tag: "ellipse", attrs: { cx: 12, cy: 17.3, rx: 8, ry: 2.6, fill: c } },
    { tag: "ellipse", attrs: { cx: 12, cy: 13, rx: 8, ry: 2.6, fill: c } },
    { tag: "ellipse", attrs: { cx: 12, cy: 8.7, rx: 8, ry: 2.6, fill: c } }
  ],
  social: (c) => [
    { tag: "circle", attrs: { cx: 8.5, cy: 8, r: 3.2, fill: c } },
    { tag: "path", attrs: { d: "M2.5 20c0-3.9 2.7-6.6 6-6.6s6 2.7 6 6.6z", fill: c } },
    { tag: "circle", attrs: { cx: 17, cy: 9, r: 2.4, fill: c, opacity: 0.8 } },
    { tag: "path", attrs: { d: "M14.8 20c.2-3 2.1-5 4.7-5s4.5 2 4.7 5z", fill: c, opacity: 0.8 } }
  ],
  family: (c) => [
    { tag: "circle", attrs: { cx: 7, cy: 7, r: 2.6, fill: c } },
    { tag: "circle", attrs: { cx: 17, cy: 7, r: 2.6, fill: c } },
    { tag: "circle", attrs: { cx: 12, cy: 11, r: 2.1, fill: c, opacity: 0.85 } },
    { tag: "path", attrs: { d: "M2 20c0-3.4 2.3-5.8 5-5.8s5 2.4 5 5.8z", fill: c } },
    { tag: "path", attrs: { d: "M12 20c0-3.4 2.3-5.8 5-5.8s5 2.4 5 5.8z", fill: c } }
  ],
  fun: (c) => [
    { tag: "path", attrs: { d: "M6 8h12a4 4 0 0 1 4 4.6l-.7 4A3 3 0 0 1 15.9 19l-1.6-2.4a2 2 0 0 0-1.7-.9h-1.2a2 2 0 0 0-1.7.9L8.1 19a3 3 0 0 1-5.4-1.4l-.7-4A4 4 0 0 1 6 8z", fill: c } },
    { tag: "circle", attrs: { cx: 16.5, cy: 11, r: 1, fill: "var(--wheel-center-bg)" } },
    { tag: "circle", attrs: { cx: 18.5, cy: 13, r: 1, fill: "var(--wheel-center-bg)" } },
    { tag: "rect", attrs: { x: 6.2, y: 10.3, width: 3.6, height: 1.3, rx: 0.6, fill: "var(--wheel-center-bg)" } },
    { tag: "rect", attrs: { x: 7.3, y: 9.2, width: 1.3, height: 3.6, rx: 0.6, fill: "var(--wheel-center-bg)" } }
  ],
  growth: (c) => [
    { tag: "path", attrs: { d: "M12 21V11", stroke: c, "stroke-width": 2, "stroke-linecap": "round", fill: "none" } },
    { tag: "path", attrs: { d: "M12 12C12 7.5 8.7 5 4.5 5 4.5 9.5 7.8 12 12 12z", fill: c } },
    { tag: "path", attrs: { d: "M12 14c0-4 3-6.3 6.8-6.3 0 4-3 6.3-6.8 6.3z", fill: c } }
  ],
  spiritual: (c) => [
    { tag: "path", attrs: { d: "M14.5 3.5a7.8 7.8 0 1 0 6 12.7A9 9 0 0 1 14.5 3.5z", fill: c } },
    { tag: "path", attrs: { d: "M19 3.2l.6 1.6 1.6.6-1.6.6-.6 1.6-.6-1.6-1.6-.6 1.6-.6.6-1.6z", fill: c } }
  ]
};
const ICON_LABELS = {
  none: "بدون أيقونة",
  heart: "صحة (قلب)",
  work: "عمل (حقيبة)",
  money: "مال (عملات)",
  social: "اجتماعي (أشخاص)",
  family: "عائلة (منزل)",
  fun: "ترفيه (تحكم)",
  growth: "تطور ذاتي (نمو)",
  spiritual: "روحانيات (هلال)",
  custom: "صورة مخصصة"
};

/* ============================================================
   كود الرسم والتحكم
   ============================================================ */
const svgNS = "http://www.w3.org/2000/svg";
const svg = document.getElementById("wheelSvg");
const controlsEl = document.getElementById("controls");
const wheelWrap = document.getElementById("wheel-wrap");
const spinResultEl = document.getElementById("spinResult");

function polarToCartesian(cx, cy, r, angleDeg) {
  const rad = angleDeg * Math.PI / 180;
  return { x: cx + r * Math.sin(rad), y: cy - r * Math.cos(rad) };
}

function gapOffsetDeg(r, gapPx) {
  const half = gapPx / 2;
  if (r <= half) return 89.9;
  return Math.asin(half / r) * 180 / Math.PI;
}

function ringSectorPath(cx, cy, rInner, rOuter, sectorStartDeg, sectorEndDeg, gapWidth) {
  const aInStart  = sectorStartDeg + gapOffsetDeg(rInner, gapWidth);
  const aOutStart = sectorStartDeg + gapOffsetDeg(rOuter, gapWidth);
  const aOutEnd   = sectorEndDeg   - gapOffsetDeg(rOuter, gapWidth);
  const aInEnd    = sectorEndDeg   - gapOffsetDeg(rInner, gapWidth);

  const p1 = polarToCartesian(cx, cy, rInner, aInStart);
  const p2 = polarToCartesian(cx, cy, rOuter, aOutStart);
  const p3 = polarToCartesian(cx, cy, rOuter, aOutEnd);
  const p4 = polarToCartesian(cx, cy, rInner, aInEnd);

  const largeArcOuter = (aOutEnd - aOutStart) > 180 ? 1 : 0;
  const largeArcInner = (aInEnd - aInStart) > 180 ? 1 : 0;

  return [
    `M ${p1.x} ${p1.y}`,
    `L ${p2.x} ${p2.y}`,
    `A ${rOuter} ${rOuter} 0 ${largeArcOuter} 1 ${p3.x} ${p3.y}`,
    `L ${p4.x} ${p4.y}`,
    `A ${rInner} ${rInner} 0 ${largeArcInner} 0 ${p1.x} ${p1.y}`,
    "Z"
  ].join(" ");
}

function hexToRgb(hex) {
  hex = hex.replace("#", "");
  if (hex.length === 3) hex = hex.split("").map(c => c + c).join("");
  const num = parseInt(hex, 16);
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}

function lerpColor(hexA, hexB, t) {
  const a = hexToRgb(hexA), b = hexToRgb(hexB);
  const r = Math.round(a.r + (b.r - a.r) * t);
  const g = Math.round(a.g + (b.g - a.g) * t);
  const bl = Math.round(a.b + (b.b - a.b) * t);
  return `rgb(${r}, ${g}, ${bl})`;
}

// يفتح/يغمّق اللون وبيرجع hex سليم (مهم عشان مايتحسبش غلط تاني)
function mixHex(hexA, hexB, t) {
  const a = hexToRgb(hexA), b = hexToRgb(hexB);
  const r = Math.round(a.r + (b.r - a.r) * t);
  const g = Math.round(a.g + (b.g - a.g) * t);
  const bl = Math.round(a.b + (b.b - a.b) * t);
  const toHex = (v) => v.toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(bl)}`;
}
function lighten(hex, amt) { return mixHex(hex, "#ffffff", amt); }
function darken(hex, amt)  { return mixHex(hex, "#000000", amt); }

function getGradientEnds(axis) {
  const lightShade = lighten(axis.color, 0.55);
  const darkShade  = darken(axis.color, 0.35);
  if (axis.direction === "light-to-dark") {
    return { start: lightShade, end: darkShade };
  }
  return { start: darkShade, end: lightShade }; // الافتراضي: من الغامق للفاتح
}

// بيقرأ لون الخطوط/الحدود من متغيرات CSS عشان يتأقلم مع الوضع الداكن
function getGridColor() {
  const val = getComputedStyle(document.documentElement).getPropertyValue("--grid-color").trim();
  return val || SETTINGS.gridStrokeColor;
}

// بيحدد هل احنا في الوضع الداكن ولا لأ (بياخد في الاعتبار اختيار صريح من المستخدم لو موجود)
function isDarkMode() {
  const explicit = document.documentElement.getAttribute("data-theme");
  if (explicit === "dark") return true;
  if (explicit === "light") return false;
  return !!(window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches);
}

// لون النص/الأيقونة الخاص بكل محور: مشتق من لون المحور نفسه عشان يفضل متناسق
function getAxisAccentColor(axis, amt) {
  return isDarkMode() ? lighten(axis.color, amt) : darken(axis.color, amt);
}

function drawWheel() {
  const { center, innerRadius, outerRadius, numRings, gapWidth, showLabels, labelOffset, iconOffset, iconSize, emptyGridStrokeOpacity, filledGridStrokeOpacity } = SETTINGS;
  const gridStrokeColor = getGridColor();
  const cx = center.x, cy = center.y;
  const n = axesState.length;
  const sectorAngle = 360 / n;
  const ringThickness = (outerRadius - innerRadius) / numRings;

  svg.innerHTML = "";

  // مجموعة قابلة للدوران: فيها كل الأشكال الملونة والحلقات والدائرة الوسطى
  const rotatableGroup = document.createElementNS(svgNS, "g");
  rotatableGroup.setAttribute("transform", `rotate(${rotationAngle} ${cx} ${cy})`);

  const centerCircle = document.createElementNS(svgNS, "circle");
  centerCircle.setAttribute("cx", cx);
  centerCircle.setAttribute("cy", cy);
  centerCircle.setAttribute("r", innerRadius);
  centerCircle.setAttribute("class", "center-circle");
  centerCircle.setAttribute("stroke", gridStrokeColor);
  centerCircle.setAttribute("stroke-opacity", filledGridStrokeOpacity);
  rotatableGroup.appendChild(centerCircle);

  axesState.forEach((axis, i) => {
    const sectorStartDeg = i * sectorAngle;
    const sectorEndDeg = (i + 1) * sectorAngle;
    const { start: colorStart, end: colorEnd } = getGradientEnds(axis);
    const value = Math.max(0, Math.min(numRings, (axis.percent / 100) * numRings));

    for (let k = 0; k < numRings; k++) {
      const rInner = innerRadius + k * ringThickness;
      const rOuter = innerRadius + (k + 1) * ringThickness;
      const fillFraction = Math.max(0, Math.min(1, value - k));
      const t = numRings > 1 ? k / (numRings - 1) : 0;
      const shade = lerpColor(colorStart, colorEnd, t);

      if (fillFraction > 0) {
        const rMid = rInner + fillFraction * (rOuter - rInner);
        const dColored = ringSectorPath(cx, cy, rInner, rMid, sectorStartDeg, sectorEndDeg, gapWidth);
        const pathColored = document.createElementNS(svgNS, "path");
        pathColored.setAttribute("d", dColored);
        pathColored.setAttribute("class", "fill-cell");
        pathColored.setAttribute("fill", shade);
        pathColored.setAttribute("stroke", gridStrokeColor);
        pathColored.setAttribute("stroke-opacity", filledGridStrokeOpacity);
        rotatableGroup.appendChild(pathColored);
      }

      if (fillFraction < 1) {
        const rStart = rInner + fillFraction * (rOuter - rInner);
        const dEmpty = ringSectorPath(cx, cy, rStart, rOuter, sectorStartDeg, sectorEndDeg, gapWidth);
        const pathEmpty = document.createElementNS(svgNS, "path");
        pathEmpty.setAttribute("d", dEmpty);
        pathEmpty.setAttribute("class", "grid-cell");
        pathEmpty.setAttribute("stroke", gridStrokeColor);
        pathEmpty.setAttribute("stroke-opacity", emptyGridStrokeOpacity);
        rotatableGroup.appendChild(pathEmpty);
      }
    }
  });

  svg.appendChild(rotatableGroup);

  // صورة المنتصف - ثابتة ومش بتلف مع العجلة (زي شعار وسط بوصلة)
  if (centerImageDataUrl) {
    const clipId = "centerClip";
    let defs = svg.querySelector("defs");
    if (!defs) {
      defs = document.createElementNS(svgNS, "defs");
      svg.insertBefore(defs, svg.firstChild);
    }
    const clipPath = document.createElementNS(svgNS, "clipPath");
    clipPath.setAttribute("id", clipId);
    const clipCircle = document.createElementNS(svgNS, "circle");
    clipCircle.setAttribute("cx", cx);
    clipCircle.setAttribute("cy", cy);
    clipCircle.setAttribute("r", innerRadius - 2);
    clipPath.appendChild(clipCircle);
    defs.appendChild(clipPath);

    const img = document.createElementNS(svgNS, "image");
    img.setAttributeNS("http://www.w3.org/1999/xlink", "href", centerImageDataUrl);
    img.setAttribute("href", centerImageDataUrl);
    img.setAttribute("x", cx - innerRadius);
    img.setAttribute("y", cy - innerRadius);
    img.setAttribute("width", innerRadius * 2);
    img.setAttribute("height", innerRadius * 2);
    img.setAttribute("preserveAspectRatio", "xMidYMid slice");
    img.setAttribute("clip-path", `url(#${clipId})`);
    svg.appendChild(img);
  }

  // أسماء المحاور - بتتحرك حوالين العجلة مع الدوران بس بتفضل مكتوبة سليمة (مش بتتلف هي نفسها)
  if (showLabels) {
    axesState.forEach((axis, i) => {
      const mid = i * sectorAngle + sectorAngle / 2 + rotationAngle;
      const pos = polarToCartesian(cx, cy, outerRadius + labelOffset, mid);
      const text = document.createElementNS(svgNS, "text");
      text.setAttribute("x", pos.x);
      text.setAttribute("y", pos.y);
      text.setAttribute("class", "axis-label");
      text.setAttribute("fill", getAxisAccentColor(axis, 0.38));
      text.textContent = axis.label || "";
      svg.appendChild(text);
    });
  }

  // أيقونة كل محور - بتتموضع بين الحلقة الملونة واسم المحور، وبتتحرك مع الدوران زي النص
  axesState.forEach((axis, i) => {
    if (!axis.icon || axis.icon === "none") return;
    const mid = i * sectorAngle + sectorAngle / 2 + rotationAngle;
    const pos = polarToCartesian(cx, cy, outerRadius + iconOffset, mid);

    if (axis.icon === "custom") {
      if (!axis.customIconUrl) return;
      const img = document.createElementNS(svgNS, "image");
      img.setAttributeNS("http://www.w3.org/1999/xlink", "href", axis.customIconUrl);
      img.setAttribute("href", axis.customIconUrl);
      img.setAttribute("x", pos.x - iconSize / 2);
      img.setAttribute("y", pos.y - iconSize / 2);
      img.setAttribute("width", iconSize);
      img.setAttribute("height", iconSize);
      img.setAttribute("preserveAspectRatio", "xMidYMid meet");
      svg.appendChild(img);
      return;
    }

    const shapeSet = ICONS[axis.icon];
    if (!shapeSet) return;
    const color = getAxisAccentColor(axis, 0.15);
    const g = document.createElementNS(svgNS, "g");
    g.setAttribute("transform", `translate(${pos.x - iconSize / 2} ${pos.y - iconSize / 2}) scale(${iconSize / 24})`);
    shapeSet(color).forEach(shape => {
      const el = document.createElementNS(svgNS, shape.tag);
      Object.entries(shape.attrs).forEach(([k, v]) => el.setAttribute(k, v));
      g.appendChild(el);
    });
    svg.appendChild(g);
  });

  // مؤشر ثابت فوق العجلة بيحدد نقطة "الفوز" وقت السبين العشوائي
  const pointerTip = polarToCartesian(cx, cy, outerRadius + 6, 0);
  const pointerLeft = polarToCartesian(cx, cy, outerRadius + 26, -8);
  const pointerRight = polarToCartesian(cx, cy, outerRadius + 26, 8);
  const pointerMark = document.createElementNS(svgNS, "polygon");
  pointerMark.setAttribute("points", `${pointerTip.x},${pointerTip.y} ${pointerLeft.x},${pointerLeft.y} ${pointerRight.x},${pointerRight.y}`);
  pointerMark.setAttribute("fill", gridStrokeColor);
  pointerMark.setAttribute("class", "pointer-mark");
  svg.appendChild(pointerMark);

  // دائرة شفافة فوق منتصف العجلة (وفوق صورة المنتصف لو موجودة) عشان تلتقط الضغط وتشغّل السبين العشوائي
  const centerHit = document.createElementNS(svgNS, "circle");
  centerHit.setAttribute("cx", cx);
  centerHit.setAttribute("cy", cy);
  centerHit.setAttribute("r", innerRadius);
  centerHit.setAttribute("fill", "transparent");
  centerHit.setAttribute("class", "center-hit");
  centerHit.addEventListener("click", (e) => {
    e.stopPropagation();
    spinWheelRandom();
  });
  svg.appendChild(centerHit);
}

/* ====== لوحة تحكم كل محور ====== */
function buildControls() {
  controlsEl.innerHTML = "";
  const iconOptionsHtml = Object.keys(ICON_LABELS)
    .map(key => `<option value="${key}">${ICON_LABELS[key]}</option>`)
    .join("");

  axesState.forEach((axis, i) => {
    const card = document.createElement("div");
    card.className = "axis-card";
    card.innerHTML = `
      <h3>محور ${i + 1}</h3>
      <label>
        اسم المحور
        <input type="text" data-idx="${i}" data-field="label" value="${axis.label}">
      </label>
      <label>
        لون المحور
        <input type="color" data-idx="${i}" data-field="color" value="${axis.color}">
      </label>
      <label>
        اتجاه تدرج اللون
        <select data-idx="${i}" data-field="direction">
          <option value="dark-to-light" ${axis.direction === "dark-to-light" ? "selected" : ""}>من الغامق (جوه) للفاتح (برة)</option>
          <option value="light-to-dark" ${axis.direction === "light-to-dark" ? "selected" : ""}>من الفاتح (جوه) للغامق (برة)</option>
        </select>
      </label>
      <label>
        أيقونة المحور
        <select data-idx="${i}" data-field="icon">${iconOptionsHtml}</select>
      </label>
      <label id="icon-upload-row-${i}" style="${axis.icon === "custom" ? "" : "display:none;"}">
        ارفع صورة الأيقونة
        <input type="file" accept="image/*" data-idx="${i}" data-field="customIconUrl">
      </label>
      <label>
        النسبة المئوية
        <div class="percent-row">
          <input type="range" min="0" max="100" step="1" data-idx="${i}" data-field="percent" value="${axis.percent}">
          <span class="percent-val" id="percent-val-${i}">${axis.percent}%</span>
        </div>
      </label>
    `;
    controlsEl.appendChild(card);

    // مزامنة قيمة السيليكت الخاص بالأيقونة مع حالة المحور الحالية
    const iconSelect = card.querySelector('select[data-field="icon"]');
    iconSelect.value = axis.icon || "none";
  });

  controlsEl.querySelectorAll("input:not([type=file]), select").forEach(el => {
    el.addEventListener("input", (e) => {
      const idx = parseInt(e.target.dataset.idx, 10);
      const field = e.target.dataset.field;
      let value = e.target.value;
      if (field === "percent") {
        value = parseFloat(value);
        document.getElementById(`percent-val-${idx}`).textContent = value + "%";
      }
      axesState[idx][field] = value;

      if (field === "icon") {
        const row = document.getElementById(`icon-upload-row-${idx}`);
        if (row) row.style.display = value === "custom" ? "" : "none";
      }
      drawWheel();
    });
  });
}

// رفع صورة مخصصة كأيقونة لمحور معيّن (مُوكل على الحاوية عشان يفضل شغال بعد إعادة بناء اللوحة)
controlsEl.addEventListener("change", (e) => {
  const el = e.target;
  if (el.tagName === "INPUT" && el.type === "file" && el.dataset.field === "customIconUrl") {
    const idx = parseInt(el.dataset.idx, 10);
    const file = el.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      axesState[idx].customIconUrl = reader.result;
      drawWheel();
    };
    reader.readAsDataURL(file);
  }
});

/* ====== إعدادات عامة: الدوران + اتجاهه + الصورة ====== */
const rotationSlider = document.getElementById("rotationSlider");
const rotationVal = document.getElementById("rotationVal");
const autoSpinToggle = document.getElementById("autoSpinToggle");
const spinDirectionSelect = document.getElementById("spinDirectionSelect");
const centerImageInput = document.getElementById("centerImageInput");
const removeImageBtn = document.getElementById("removeImageBtn");

spinDirectionSelect.value = spinDirection;

function setRotation(angle) {
  rotationAngle = ((angle % 360) + 360) % 360;
  rotationSlider.value = Math.round(rotationAngle);
  rotationVal.textContent = Math.round(rotationAngle) + "°";
  drawWheel();
}

rotationSlider.addEventListener("input", (e) => {
  if (isSpinning) return;
  setRotation(parseFloat(e.target.value));
});

spinDirectionSelect.addEventListener("change", (e) => {
  spinDirection = e.target.value;
});

autoSpinToggle.addEventListener("change", (e) => {
  if (isSpinning) {
    e.target.checked = false;
    return;
  }
  autoSpinOn = e.target.checked;
  if (autoSpinOn) {
    let last = performance.now();
    const step = (now) => {
      if (!autoSpinOn) return;
      const dt = (now - last) / 1000;
      last = now;
      const dirMultiplier = spinDirection === "cw" ? 1 : -1;
      setRotation(rotationAngle + dirMultiplier * autoSpinSpeed * dt);
      autoSpinTimer = requestAnimationFrame(step);
    };
    autoSpinTimer = requestAnimationFrame(step);
  } else if (autoSpinTimer) {
    cancelAnimationFrame(autoSpinTimer);
  }
});

centerImageInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    centerImageDataUrl = reader.result;
    drawWheel();
  };
  reader.readAsDataURL(file);
});

removeImageBtn.addEventListener("click", () => {
  centerImageDataUrl = null;
  centerImageInput.value = "";
  drawWheel();
});

/* ============================================================
   الصوت أثناء اللف - مُصنَّع بالكامل بالـ Web Audio API (من غير ملفات خارجية)
   ============================================================ */
function ensureAudio() {
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  if (!audioCtx) audioCtx = new AC();
  if (audioCtx.state === "suspended") audioCtx.resume();
  return audioCtx;
}

// تكة قصيرة كل ما المؤشر يعدي على حد بين محورين
function playTickSound() {
  const ctx = ensureAudio();
  if (!ctx) return;
  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "square";
  osc.frequency.setValueAtTime(720, t);
  gain.gain.setValueAtTime(0.12, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(t);
  osc.stop(t + 0.07);
}

// نغمة صغيرة لما العجلة توقف على النتيجة
function playWinSound() {
  const ctx = ensureAudio();
  if (!ctx) return;
  const t = ctx.currentTime;
  [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
    const start = t + i * 0.09;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, start);
    gain.gain.setValueAtTime(0.001, start);
    gain.gain.exponentialRampToValueAtTime(0.22, start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, start + 0.35);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(start);
    osc.stop(start + 0.36);
  });
}

/* ============================================================
   السبين العشوائي: بتضغط على منتصف العجلة فتلف بسرعة، تصدر تكات صوتية،
   وتقف تدريجيًا على محور عشوائي حسب اتجاه الدوران المختار
   ============================================================ */
function spinWheelRandom() {
  if (isSpinning) return;
  const n = axesState.length;
  if (n === 0) return;

  isSpinning = true;
  wheelWrap.classList.add("spinning");
  rotationSlider.disabled = true;
  spinDirectionSelect.disabled = true;
  if (autoSpinOn) {
    autoSpinOn = false;
    autoSpinToggle.checked = false;
    if (autoSpinTimer) cancelAnimationFrame(autoSpinTimer);
  }
  spinResultEl.textContent = "جاري اللف...";
  ensureAudio();

  const sectorAngle = 360 / n;
  const winnerIndex = Math.floor(Math.random() * n);
  const winnerAxis = axesState[winnerIndex];

  // نقطة هبوط عشوائية جوه قطاع الفايز (بعيد شوية عن حواف الفجوة)
  const margin = sectorAngle * 0.18;
  const landingOffset = margin + Math.random() * (sectorAngle - margin * 2);
  const landingAngleInWheel = winnerIndex * sectorAngle + landingOffset;

  // الدوران المطلوب عشان النقطة دي توصل تحت المؤشر الثابت (زاوية صفر)
  const requiredMod = ((-landingAngleInWheel) % 360 + 360) % 360;
  const dirMultiplier = spinDirection === "cw" ? 1 : -1;
  const extraTurns = 6 + Math.floor(Math.random() * 3); // 6-8 لفات كاملة إضافية

  const startRotation = rotationAngle;
  const forwardDelta = ((requiredMod - startRotation) % 360 + 360) % 360;
  const totalDelta = dirMultiplier === 1
    ? forwardDelta + extraTurns * 360
    : (forwardDelta - 360) - extraTurns * 360;

  const duration = 4200 + Math.random() * 900; // مللي ثانية
  const startTime = performance.now();
  let lastCrossing = 0;

  function frame(now) {
    const elapsed = now - startTime;
    const progress = Math.min(1, elapsed / duration);
    const eased = 1 - Math.pow(1 - progress, 3); // إبطاء تدريجي واقعي (ease-out)
    const currentAngle = startRotation + totalDelta * eased;
    setRotation(currentAngle);

    // تكة صوتية كل ما نعدي على حد بين محورين
    const traveled = Math.abs(totalDelta * eased);
    const crossings = Math.floor(traveled / sectorAngle);
    if (crossings > lastCrossing) {
      playTickSound();
      lastCrossing = crossings;
    }

    if (progress < 1) {
      requestAnimationFrame(frame);
    } else {
      isSpinning = false;
      wheelWrap.classList.remove("spinning");
      rotationSlider.disabled = false;
      spinDirectionSelect.disabled = false;
      spinResultEl.textContent = `${winnerAxis.label} (${winnerAxis.percent}%)`;
      playWinSound();
    }
  }
  requestAnimationFrame(frame);
}

/* ====== سحب العجلة بالماوس/باللمس عشان تلفها يدويًا ====== */
let dragging = false;
let dragStartAngle = 0;
let dragStartRotation = 0;

function getSvgCenterScreen() {
  const rect = svg.getBoundingClientRect();
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
}
function angleFromCenter(clientX, clientY) {
  const c = getSvgCenterScreen();
  return Math.atan2(clientX - c.x, -(clientY - c.y)) * 180 / Math.PI;
}

function pointerDown(clientX, clientY) {
  if (isSpinning) return;
  dragging = true;
  wheelWrap.classList.add("dragging");
  dragStartAngle = angleFromCenter(clientX, clientY);
  dragStartRotation = rotationAngle;
  if (autoSpinOn) { autoSpinToggle.checked = false; autoSpinOn = false; if (autoSpinTimer) cancelAnimationFrame(autoSpinTimer); }
}
function pointerMove(clientX, clientY) {
  if (!dragging) return;
  const currentAngle = angleFromCenter(clientX, clientY);
  setRotation(dragStartRotation + (currentAngle - dragStartAngle));
}
function pointerUp() {
  dragging = false;
  wheelWrap.classList.remove("dragging");
}

wheelWrap.addEventListener("mousedown", (e) => pointerDown(e.clientX, e.clientY));
window.addEventListener("mousemove", (e) => pointerMove(e.clientX, e.clientY));
window.addEventListener("mouseup", pointerUp);

wheelWrap.addEventListener("touchstart", (e) => {
  const t = e.touches[0];
  pointerDown(t.clientX, t.clientY);
}, { passive: true });
window.addEventListener("touchmove", (e) => {
  if (!dragging) return;
  const t = e.touches[0];
  pointerMove(t.clientX, t.clientY);
}, { passive: true });
window.addEventListener("touchend", pointerUp);

buildControls();
drawWheel();

}