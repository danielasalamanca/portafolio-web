// === Nuevo inicio (index2.html) ===
// Usa alIniciar() de script.js: las letras caen cuando termina la intro.
alIniciar(() => {
  const hero = document.querySelector('.hero');
  if (!hero) return;
  hero.classList.add('entrar');

  // Al pasar el cursor, cada letra toma un color de la paleta y vuelve al azul.
  // Se activa recién cuando la letra terminó de caer.
  hero.querySelectorAll('.letra').forEach(letra => {
    let lista = false;
    letra.addEventListener('animationend', () => { lista = true; }, { once: true });
    letra.addEventListener('mouseenter', () => {
      if (lista) colorearLetra(letra);
    });
  });

  iniciarDani(hero);
  iniciarEstela(hero);
});

// === Estela de íconos ===
// Inspirada en dejiajetomobi.com: al mover el cursor (o el dedo) van quedando
// círculos de color con íconos de diseño, que aparecen con un pop y se van solos.
// Íconos: Phosphor Icons (MIT), ver img/iconos/LICENSE.txt
function iniciarEstela(hero) {
  const capa = hero.querySelector('.estela');
  if (!capa || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const ICONOS = [
    'pen-nib', 'palette', 'bezier-curve', 'text-aa', 'paint-brush', 'eyedropper',
    'book-open', 'ruler', 'swatches', 'crop', 'shapes', 'pencil-simple',
    'paint-bucket', 'magic-wand', 'highlighter', 'compass-tool', 'drop', 'camera',
    'scissors', 'selection-all', 'sparkle', 'heart', 'star', 'smiley',
  ];
  // [fondo, ícono]: colores de la paleta del sitio con un tono más intenso para el ícono.
  // El celeste es distinto al azul de las letras para que los círculos se distingan.
  const COLORES = [
    ['#f9da74', '#8a5a00'],
    ['#9ad8f5', '#0b5fb3'],
    ['#de97c9', '#a3196f'],
    ['#b9e3a3', '#2f7d1e'],
    ['#efd6fb', '#7b2fc9'],
    ['#fd7591', '#8f0c2c'],
  ];
  const MAXIMO = 140;         // círculos en pantalla a la vez
  const VIDA_MS = 900;        // cuánto queda cada círculo antes de irse

  // Los íconos se insertan como SVG en línea (fill="currentColor") para teñirlos
  let svgs = [];
  Promise.all(ICONOS.map(n =>
    fetch(`img/iconos/${n}.svg`).then(r => r.ok ? r.text() : '')
  )).then(lista => { svgs = lista.filter(Boolean); });

  let i = 0, ultimoX = null, ultimoY = null;

  function soltarCirculo(x, y, tam) {
    if (!svgs.length) return;
    const circulo = document.createElement('span');
    circulo.className = 'estela-circulo';
    const [fondo, tinta] = COLORES[i % COLORES.length];
    circulo.style.cssText =
      `--tam:${tam}px; left:${x}px; top:${y}px; background:${fondo}; color:${tinta};`;
    circulo.innerHTML = svgs[i % svgs.length];
    circulo.firstElementChild.classList.add('estela-icono');
    capa.appendChild(circulo);
    i++;

    // Nace pequeño bajo el cursor y crece hasta su tamaño
    const giro = (Math.random() - 0.5) * 30;
    circulo.animate(
      [{ transform: `scale(0.3) rotate(${giro - 20}deg)` }, { transform: `scale(1) rotate(${giro}deg)` }],
      { duration: 650, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'forwards' }
    );
    circulo.animate(
      [{ transform: `scale(1) rotate(${giro}deg)` }, { transform: `scale(0) rotate(${giro + 30}deg)` }],
      { duration: 300, delay: VIDA_MS, easing: 'ease-in', fill: 'forwards' }
    ).finished.then(() => circulo.remove());

    while (capa.childElementCount > MAXIMO) capa.firstElementChild.remove();
  }

  addEventListener('pointermove', e => {
    const r = capa.getBoundingClientRect();
    const x = e.clientX - r.left, y = e.clientY - r.top;
    const tam = innerWidth < 700 ? 40 : 56;
    if (ultimoX === null) { ultimoX = x; ultimoY = y; }
    // Un círculo cada cierta distancia, superpuestos como una cadena
    const paso = tam * 0.6;
    let d = Math.hypot(x - ultimoX, y - ultimoY);
    while (d >= paso) {
      ultimoX += (x - ultimoX) * (paso / d);
      ultimoY += (y - ultimoY) * (paso / d);
      soltarCirculo(ultimoX, ultimoY, tam);
      d = Math.hypot(x - ultimoX, y - ultimoY);
    }
  }, { passive: true });

  // Al salir de la ventana se corta la cadena, para no unir puntos lejanos
  document.addEventListener('pointerleave', () => { ultimoX = ultimoY = null; });
  addEventListener('blur', () => { ultimoX = ultimoY = null; });
}

function colorearLetra(letra) {
  letra.style.backgroundColor = colores[Math.floor(Math.random() * colores.length)];
  clearTimeout(letra._timer);
  letra._timer = setTimeout(() => { letra.style.backgroundColor = ''; }, 900);
}

// === Dani interactiva ===
// Inspirada en sebg.ch: la mirada sigue el cursor, se puede agarrar y soltar
// (vuelve a su lugar con un resorte), cambia de pose y al llegar da la bienvenida.
function iniciarDani(hero) {
  const dani    = hero.querySelector('.dani');
  const mover   = dani.querySelector('.dani-mover');
  const figura  = dani.querySelector('.dani-figura');
  const burbuja = dani.querySelector('.dani-burbuja');
  const letras  = [...hero.querySelectorAll('.letra')];
  const POSES   = ['normal', 'saluda', 'sorpresa', 'celebra', 'duerme'];

  // ── Poses (SVG en línea para poder mover los ojos) ───────────────────
  Promise.all(POSES.map(p =>
    fetch(`img/inicio2/dani-${p}.svg`).then(r => {
      if (!r.ok) throw new Error(r.status);
      return r.text();
    })
  )).then(svgs => {
    figura.innerHTML = svgs.join('');
    ojos = [...figura.querySelectorAll('.ojo')];
  }).catch(() => { /* queda la imagen de respaldo */ });

  let ojos = [];
  let poseTimer;
  function pose(nombre, duracion) {
    figura.dataset.pose = nombre;
    clearTimeout(poseTimer);
    if (duracion) poseTimer = setTimeout(() => { figura.dataset.pose = 'normal'; }, duracion);
  }

  // ── Saludo al llegar (después de que sube) ───────────────────────────
  // Es el único texto: la burbuja se va sola o apenas la tocan
  setTimeout(() => {
    pose('saluda', 2200);
    burbuja.textContent = 'Bienvenido/a';
    burbuja.classList.add('visible');
    setTimeout(() => burbuja.classList.remove('visible'), 3000);
  }, 1500);

  // ── Mirada y parpadeo ────────────────────────────────────────────────
  // Centro de los ojos dentro del lienzo de 1350 × 1350
  const OJOS_X = 673 / 1350, OJOS_Y = 566 / 1350, MIRADA = 18;
  let cursorX = innerWidth / 2, cursorY = innerHeight / 2, parpado = 1;

  addEventListener('pointermove', e => { cursorX = e.clientX; cursorY = e.clientY; }, { passive: true });

  (function parpadear() {
    setTimeout(() => {
      parpado = 0.1;
      setTimeout(() => { parpado = 1; parpadear(); }, 130);
    }, 2500 + Math.random() * 3500);
  })();

  // ── Sueño ────────────────────────────────────────────────────────────
  // Si nadie interactúa por un rato, se queda dormida; cualquier
  // movimiento la despierta con un pequeño sobresalto.
  const DORMIR_MS = 5000;
  let ultimaActividad = performance.now(), dormida = false;

  function actividad() {
    ultimaActividad = performance.now();
    if (!dormida) return;
    dormida = false;
    dani.classList.remove('dormida');
    pose('sorpresa', 700);
  }
  ['pointermove', 'pointerdown', 'keydown', 'wheel', 'touchstart'].forEach(tipo =>
    addEventListener(tipo, actividad, { passive: true })
  );

  function dormir() {
    dormida = true;
    dani.classList.add('dormida');
    pose('duerme');
  }

  // ── Arrastre con resorte ─────────────────────────────────────────────
  let x = 0, y = 0, vx = 0, vy = 0, giro = 0;
  let arrastrando = false, movido = 0, inicioX = 0, inicioY = 0, ultimoX = 0, ultimoY = 0;
  let encima = false;

  figura.addEventListener('pointerdown', e => {
    e.preventDefault();
    figura.setPointerCapture(e.pointerId);
    arrastrando = true;
    movido = 0;
    inicioX = e.clientX - x;
    inicioY = e.clientY - y;
    ultimoX = e.clientX;
    ultimoY = e.clientY;
    dani.classList.add('arrastrando');
    burbuja.classList.remove('visible');
  });

  figura.addEventListener('pointermove', e => {
    if (!arrastrando) return;
    const dx = e.clientX - ultimoX, dy = e.clientY - ultimoY;
    movido += Math.abs(dx) + Math.abs(dy);
    // Al empezar a moverla, se sorprende
    if (movido > 6 && figura.dataset.pose !== 'sorpresa') pose('sorpresa');
    vx = dx; vy = dy;
    x = e.clientX - inicioX;
    y = e.clientY - inicioY;
    ultimoX = e.clientX;
    ultimoY = e.clientY;
    empujarLetras(e.clientX, e.clientY);
  });

  function soltar() {
    if (!arrastrando) return;
    arrastrando = false;
    dani.classList.remove('arrastrando');
    if (movido > 6) {
      pose('celebra', 1400);
    } else {
      // Clic: salta y celebra
      vy = -14;
      pose('celebra', 900);
    }
  }
  figura.addEventListener('pointerup', soltar);
  figura.addEventListener('pointercancel', soltar);

  // Al pasar el cursor, saluda
  figura.addEventListener('pointerenter', e => {
    if (e.pointerType !== 'mouse' || arrastrando) return;
    encima = true;
    if (figura.dataset.pose === 'normal') pose('saluda');
  });
  figura.addEventListener('pointerleave', () => {
    encima = false;
    if (!arrastrando && figura.dataset.pose === 'saluda') pose('normal');
  });

  // Mientras la arrastran, las letras que toca saltan y cambian de color
  function empujarLetras(px, py) {
    for (const letra of letras) {
      const r = letra.getBoundingClientRect();
      if (px > r.left && px < r.right && py > r.top && py < r.bottom && !letra.classList.contains('empujada')) {
        colorearLetra(letra);
        letra.classList.add('empujada');
        setTimeout(() => letra.classList.remove('empujada'), 500);
      }
    }
  }

  // ── Bucle de animación ───────────────────────────────────────────────
  const RESORTE = 0.08, FRENO = 0.82;
  (function cuadro(t) {
    if (!arrastrando) {
      vx = (vx - x * RESORTE) * FRENO;
      vy = (vy - y * RESORTE) * FRENO;
      x += vx;
      y += vy;
      if (Math.abs(x) < 0.05 && Math.abs(vx) < 0.05) x = vx = 0;
      if (Math.abs(y) < 0.05 && Math.abs(vy) < 0.05) y = vy = 0;
    }

    // También se duerme si el cursor quedó quieto encima de ella (saludando)
    const pose_ = figura.dataset.pose;
    if (!dormida && !arrastrando && (pose_ === 'normal' || pose_ === 'saluda') &&
        performance.now() - ultimaActividad > DORMIR_MS) dormir();

    const r = figura.getBoundingClientRect();
    const cx = r.left + r.width * OJOS_X, cy = r.top + r.height * OJOS_Y;

    // Se inclina con la velocidad y, un poco, hacia el cursor; al saludar se mece.
    // Dormida, cabecea hacia un lado y respira despacio.
    let giroMeta, respira = 0;
    if (dormida) {
      giroMeta = 5 + Math.sin(t / 1400) * 1.5;
      respira = Math.sin(t / 700) * 0.012;
    } else {
      giroMeta = Math.max(-25, Math.min(25, vx * 1.6));
      giroMeta += Math.max(-4, Math.min(4, (cursorX - cx) / innerWidth * 8));
      if (encima && !arrastrando) giroMeta += Math.sin(t / 140) * 3;
    }
    giro += (giroMeta - giro) * (dormida ? 0.03 : 0.2);
    const estirar = Math.max(-0.08, Math.min(0.08, Math.abs(vy) * 0.004)) + respira;
    mover.style.transform =
      `translate(${x}px, ${y}px) rotate(${giro}deg) scale(${1 - estirar}, ${1 + estirar})`;
    // La burbuja sigue a Dani, pero sin salirse de la pantalla
    burbuja.style.transform = `translate(${x}px, ${y}px)`;
    const b = burbuja.getBoundingClientRect();
    const margen = 12;
    const ajuste = b.left < margen ? margen - b.left
                 : b.right > innerWidth - margen ? innerWidth - margen - b.right : 0;
    if (ajuste) burbuja.style.transform = `translate(${x + ajuste}px, ${y}px)`;
    burbuja.style.setProperty('--flecha', `${-ajuste}px`);

    // Pupilas hacia el cursor
    const dx = cursorX - cx, dy = cursorY - cy;
    const d = Math.hypot(dx, dy) || 1;
    const alcance = Math.min(1, d / 300) * MIRADA;
    const ox = dx / d * alcance, oy = dy / d * alcance;
    for (const ojo of ojos) ojo.style.transform = `translate(${ox}px, ${oy}px) scaleY(${parpado})`;

    requestAnimationFrame(cuadro);
  })(0);
}
