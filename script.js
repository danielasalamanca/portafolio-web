console.log("¡Bienvenida a mi portafolio!");

window.addEventListener('load', () => {
  document.body.classList.add('loaded');
});

const tipografias = [
  '"roc-grotesk", sans-serif',
  '"new-spirit-condensed", serif',
  '"neulis-neue", sans-serif',
];

const colores = [
  "#5ca089", "#6496f7", "#de97c9", "#b0ae54", "#f9da74",
  "#f18f38", "#efd6fb", "#fd7591", "#90b4f8", "#cddc39"
];

const tipos = [
  { clase: 'editorial', texto: 'Editorial' },
  { clase: 'branding', texto: 'Branding' },
  { clase: 'ilustracion', texto: 'Ilustración' },
  { clase: 'diseño', texto: 'Diseño' }
];

const burbujasContainer = document.querySelector('.burbujas');
const containerWidth = burbujasContainer.offsetWidth || window.innerWidth;
const containerHeight = burbujasContainer.offsetHeight || 400;

// Generar la lista de colores para las burbujas (barajado)
function shuffle(array) {
  let currentIndex = array.length, randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }
  return array;
}

const totalBurbujas = 3 * tipos.length;
let colorList = [];
while (colorList.length < totalBurbujas) {
  colorList = colorList.concat(shuffle([...colores]));
}
colorList = colorList.slice(0, totalBurbujas);

// Crear y posicionar burbujas con color barajado
let colorIndex = 0;
for (let i = 0; i < 3; i++) {
  tipos.forEach(tipo => {
    const div = document.createElement('div');
    div.className = `burbuja ${tipo.clase}`;
    div.textContent = tipo.texto;
    // Color aleatorio
    div.style.background = colorList[colorIndex++];
    // Tipografía aleatoria
    const fuente = tipografias[Math.floor(Math.random() * tipografias.length)];
    div.style.fontFamily = fuente;
    // Rotación random sutil (-12° a +12°)
    const rotation = (Math.random() - 0.5) * 24;
    div.style.transform = `rotate(${rotation.toFixed(1)}deg)`;
    // Posición aleatoria
    const left = Math.random() * (containerWidth - 200);
    const top = Math.random() * (containerHeight - 100);
    div.style.left = `${left}px`;
    div.style.top = `${top}px`;
    div.style.position = 'absolute';
    burbujasContainer.appendChild(div);
  });
}

// --- Rebote orgánico de burbujas ---
document.querySelectorAll('.burbuja').forEach(burbuja => {
  let vx = (Math.random() - 0.5) * 1.2;
  let vy = (Math.random() - 0.5) * 1.2;
  let px = parseFloat(burbuja.style.left);
  let py = parseFloat(burbuja.style.top);
  // Ángulo de deriva que rota lentamente para dar movimiento orgánico
  let driftAngle = Math.random() * Math.PI * 2;
  let lastMouse = { x: 0, y: 0 };

  function tick() {
    const w = burbuja.offsetWidth;
    const h = burbuja.offsetHeight;
    const maxX = burbujasContainer.offsetWidth - w;
    const maxY = burbujasContainer.offsetHeight - h;

    // Deriva orgánica: fuerza suave que cambia de dirección lentamente
    driftAngle += 0.007 + Math.random() * 0.003;
    vx += Math.cos(driftAngle) * 0.02;
    vy += Math.sin(driftAngle) * 0.02;

    // Fricción suave
    vx *= 0.965;
    vy *= 0.965;

    // Límite de velocidad máxima
    const speed = Math.hypot(vx, vy);
    if (speed > 6) { vx = (vx / speed) * 6; vy = (vy / speed) * 6; }

    px += vx;
    py += vy;

    // Rebote tipo spring: fuerza gradual al tocar bordes (no flip instantáneo)
    if (px < 0)      { vx += -px * 0.3;        px = Math.max(px, -4); }
    else if (px > maxX) { vx += (maxX - px) * 0.3; px = Math.min(px, maxX + 4); }
    if (py < 0)      { vy += -py * 0.3;        py = Math.max(py, -4); }
    else if (py > maxY) { vy += (maxY - py) * 0.3; py = Math.min(py, maxY + 4); }

    burbuja.style.left = px + 'px';
    burbuja.style.top = py + 'px';
    requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);

  burbuja.addEventListener('mousemove', e => {
    const rect = burbuja.getBoundingClientRect();
    const localX = e.clientX - rect.left;
    const localY = e.clientY - rect.top;
    const threshold = 45;
    const dx = e.movementX || (e.clientX - lastMouse.x);
    const dy = e.movementY || (e.clientY - lastMouse.y);
    lastMouse = { x: e.clientX, y: e.clientY };

    // Suma velocidad suavemente (aditivo, no sobreescribe)
    if (localX < threshold)              vx += -dx * 1.8;
    else if (localX > rect.width - threshold) vx +=  dx * 1.8;
    if (localY < threshold)              vy += -dy * 1.8;
    else if (localY > rect.height - threshold) vy +=  dy * 1.8;
  });
});

