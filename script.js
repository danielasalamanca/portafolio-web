console.log("¡Bienvenida a mi portafolio!");

window.addEventListener('load', () => {
  document.body.classList.add('loaded');
});

const colores = [
  "#5ca089", "#6496f7", "#de97c9", "#b0ae54", "#f9da74",
  "#f18f38", "#efd6fb", "#fd7591", "#90b4f8", "#cddc39"
];

const palabras = ['Editorial', 'Branding', 'Ilustración', 'Diseño'];

const fonts = [
  '"roc-grotesk", sans-serif',
  '"new-spirit-condensed", serif',
  '"neulis-neue", sans-serif',
  '"Lexend Deca", sans-serif',
  '"formiga", sans-serif',
];

const isMobile = window.matchMedia('(max-width: 580px)').matches;
const FONT_SIZE    = isMobile ? 14 : 20;
const FONT_WEIGHT  = '400';
const CIRCLE_R     = isMobile ? 16 : 26;
const GRAVITY           = 0.20;   // floaty, soft descent
const RESTITUTION_CIRCLE = 0.55;  // circles bounce lively
const RESTITUTION_PILL   = 0.20;  // pills land with a soft thud
const RESTITUTION        = 0.35;  // fallback / wall bounces
const FRICTION           = 0.25;  // fricción tangencial (0=sin fricción, 1=máxima)
const SETTLE_SPEED       = 0.4;   // velocidad total mínima para quedarse quieto
const MAX_VEL            = 6.0;   // cap post-collision velocity

// === Typewriter ===
window.addEventListener('load', () => {
  const parte1 = 'Daniela Salamanca Ríos';
  const sep    = '  ♦  ';
  const parte2 = 'Diseñadora Gráfica';
  const todo   = parte1 + sep + parte2;
  const el = document.getElementById('typewriter');
  if (!el) return;
  const s1 = document.createElement('span'); s1.className = 'tw-regular';
  const s2 = document.createElement('span'); s2.className = 'tw-regular';
  const s3 = document.createElement('span'); s3.className = 'tw-semibold';
  el.append(s1, s2, s3);
  let i = 0;
  function typeChar() {
    if (i < parte1.length)                   s1.textContent += todo[i];
    else if (i < parte1.length + sep.length) s2.textContent += todo[i];
    else                                     s3.textContent += todo[i];
    if (++i < todo.length) setTimeout(typeChar, 55);
  }
  setTimeout(typeChar, 600);
});

// === Canvas physics (Matter.js) ===
window.addEventListener('load', () => {
  const container = document.querySelector('.burbujas');
  if (!container) return;

  const { Engine, Render, Runner, Bodies, Body, World, Events } = Matter;

  let W = container.offsetWidth  || window.innerWidth;
  let H = container.offsetHeight || window.innerHeight;

  // ── Engine ──────────────────────────────────────────────────────────────
  const engine = Engine.create();
  engine.gravity.y = 0.7;

  // ── Renderer (circles only — pills are HTML divs) ────────────────────────
  const render = Render.create({
    element: container,
    engine:  engine,
    options: {
      width:      W,
      height:     H,
      wireframes: false,
      background: 'transparent',
    },
  });
  render.canvas.style.cssText =
    'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:0;';
  container.style.overflow = 'hidden';

  // ── Pill div overlay ─────────────────────────────────────────────────────
  const pillLayer = document.createElement('div');
  pillLayer.style.cssText =
    'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:1;';
  container.appendChild(pillLayer);

  // Keep typewriter and dani-img above physics layers
  container.querySelectorAll('.typewriter, .dani-img').forEach(el => {
    el.style.zIndex = '2';
  });

  // ── Static walls ─────────────────────────────────────────────────────────
  const THICK = 60;
  let floor, wallL, wallR;

  function makeWalls() {
    [floor, wallL, wallR].filter(Boolean).forEach(b => World.remove(engine.world, b));
    floor = Bodies.rectangle(W / 2, H + THICK / 2, W + 200, THICK, {
      isStatic: true, label: 'wall', render: { visible: false },
    });
    wallL = Bodies.rectangle(-THICK / 2, H / 2, THICK, H * 3, {
      isStatic: true, label: 'wall', render: { visible: false },
    });
    wallR = Bodies.rectangle(W + THICK / 2, H / 2, THICK, H * 3, {
      isStatic: true, label: 'wall', render: { visible: false },
    });
    World.add(engine.world, [floor, wallL, wallR]);
  }
  makeWalls();

  // ── Spawning ─────────────────────────────────────────────────────────────
  const maxObjects = isMobile ? 35 : 60;
  let spawnCount = 0;
  let lastSpawn  = 0;
  const pillDivs = []; // { body, el }

  // Offscreen canvas for text measurement
  const measurer = document.createElement('canvas').getContext('2d');
  const PILL_FONT_SIZE = isMobile ? 14 : 18;

  function spawnCircle() {
    const r     = isMobile ? 14 : 20;
    const x     = r + Math.random() * Math.max(1, W - 2 * r);
    const color = colores[Math.floor(Math.random() * colores.length)];
    const body  = Bodies.circle(x, -r - 10, r, {
      restitution: 0.45,
      friction:    0.05,
      frictionAir: 0.01,
      render: { fillStyle: color, strokeStyle: 'transparent', lineWidth: 0 },
    });
    Body.setVelocity(body,        { x: (Math.random() - 0.5) * 1.5, y: 0 });
    Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.15);
    World.add(engine.world, body);
  }

  function spawnPill() {
    const word = palabras[Math.floor(Math.random() * palabras.length)];
    const font = fonts[Math.floor(Math.random() * fonts.length)];

    measurer.font = `300 ${PILL_FONT_SIZE}px ${font}`;
    const tw = measurer.measureText(word).width;
    const pw = tw + 48;
    const ph = isMobile ? 34 : 44;

    const x    = pw / 2 + Math.random() * Math.max(1, W - pw);
    const body = Bodies.rectangle(x, -ph - 10, pw, ph, {
      restitution:    0.3,
      friction:       0.08,
      frictionAir:    0.015,
      frictionStatic: 0.05,
      label:  'pill',
      render: { visible: false },
    });
    Body.setVelocity(body,        { x: (Math.random() - 0.5) * 1.5, y: 0 });
    Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.15);
    World.add(engine.world, body);

    const el = document.createElement('div');
    el.textContent = word;
    Object.assign(el.style, {
      position:        'absolute',
      top:             '0',
      left:            '0',
      background:      '#1a1a1a',
      color:           '#ffffff',
      font:            `300 ${PILL_FONT_SIZE}px ${font}`,
      borderRadius:    '999px',
      padding:         `${isMobile ? 6 : 8}px 20px`,
      pointerEvents:   'none',
      whiteSpace:      'nowrap',
      transformOrigin: 'center center',
      width:           pw + 'px',
      height:          ph + 'px',
      display:         'flex',
      alignItems:      'center',
      justifyContent:  'center',
      boxSizing:       'border-box',
    });
    pillLayer.appendChild(el);
    pillDivs.push({ body, el });
  }

  // ── Sync pill divs to physics bodies every frame ─────────────────────────
  Events.on(engine, 'afterUpdate', () => {
    for (const { body, el } of pillDivs) {
      const { x, y } = body.position;
      const angle    = body.angle;
      el.style.left      = x + 'px';
      el.style.top       = y + 'px';
      el.style.transform = `translate(-50%, -50%) rotate(${angle}rad)`;
    }
  });

  // ── Spawn on interval ────────────────────────────────────────────────────
  function trySpawn(ts) {
    if (spawnCount >= maxObjects) return;
    const interval = 200 + Math.random() * 300;
    if (ts - lastSpawn < interval) return;
    lastSpawn = ts;
    spawnCount++;
    Math.random() < 0.5 ? spawnCircle() : spawnPill();
  }

  // ── Run ──────────────────────────────────────────────────────────────────
  Runner.run(Runner.create(), engine);
  Render.run(render);

  (function tick(ts) {
    trySpawn(ts);
    requestAnimationFrame(tick);
  })(0);

  // ── Resize ───────────────────────────────────────────────────────────────
  window.addEventListener('resize', () => {
    W = container.offsetWidth  || window.innerWidth;
    H = container.offsetHeight || window.innerHeight;
    render.canvas.width  = W;
    render.canvas.height = H;
    render.options.width  = W;
    render.options.height = H;
    Render.lookAt(render, { min: { x: 0, y: 0 }, max: { x: W, y: H } });
    makeWalls();
  });
});
