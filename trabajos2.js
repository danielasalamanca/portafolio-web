// === Trabajos v2 (proyectos/trabajos.html) ===
// Grilla tipo mosaico y detalle de cada trabajo.
(function () {
  const grilla = document.querySelector('.t2-grilla');
  if (!grilla) return;

  const sinMovimiento = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const esVideo = (src) => /\.(mp4|webm|mov)$/i.test(src);

  // Letra y nombre de cada categoría (los colores están en trabajos2.css)
  const CATEGORIAS = {
    branding:    { letra: 'B', nombre: 'Branding' },
    editorial:   { letra: 'E', nombre: 'Editorial' },
    ilustracion: { letra: 'I', nombre: 'Ilustración' },
    packaging:   { letra: 'P', nombre: 'Packaging' },
    digital:     { letra: 'D', nombre: 'Digital' },
    animacion:   { letra: 'A', nombre: 'Animación' },
    tipografia:  { letra: 'T', nombre: 'Tipografía' },
  };

  // Cada vez que se carga la página los trabajos salen en otro orden
  const obras = [...grilla.querySelectorAll('.obra')];
  for (let i = obras.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [obras[i], obras[j]] = [obras[j], obras[i]];
  }
  grilla.append(...obras);

  const crear = (etiqueta, clase, texto) => {
    const el = document.createElement(etiqueta);
    if (clase) el.className = clase;
    if (texto) el.textContent = texto;
    return el;
  };

  // Prepara cada tarjeta: proporción, categorías y datos
  obras.forEach((obra) => {
    obra.proporcion = parseFloat(obra.dataset.proporcion) || 1;
    obra.cats = obra.dataset.cats.split(/\s+/).filter((c) => CATEGORIAS[c]);
    obra.media = obra.dataset.media.split(',').map((s) => s.trim()).filter(Boolean);
    obra.style.setProperty('--proporcion', obra.proporcion);
    // Llega un poco girada, cada una hacia un lado distinto
    obra.style.setProperty('--giro', (Math.random() * 12 - 6).toFixed(1) + 'deg');

    const tarjeta = obra.querySelector('.obra-tarjeta');
    tarjeta.setAttribute('aria-label', obra.querySelector('.obra-titulo').textContent + ', ' + obra.dataset.año);
    tarjeta.addEventListener('click', () => abrir(obra));
    animarAlPasar(obra, tarjeta);
  });

  // ── Mosaico: cada tarjeta va a la columna más corta ──────────────────
  function ordenar() {
    const estilo = getComputedStyle(grilla);
    const columnas = parseInt(estilo.getPropertyValue('--columnas'), 10) || 4;
    const espacio = parseFloat(estilo.getPropertyValue('--espacio')) || 20;
    const ancho = grilla.clientWidth - parseFloat(estilo.paddingLeft) - parseFloat(estilo.paddingRight);
    const anchoCol = (ancho - espacio * (columnas - 1)) / columnas;
    const alturas = new Array(columnas).fill(0);
    const filas = new Array(columnas).fill(0);

    grilla.classList.add('mosaico');
    obras.forEach((obra) => {
      obra.style.width = anchoCol + 'px';
      const col = alturas.indexOf(Math.min(...alturas));
      const x = parseFloat(estilo.paddingLeft) + col * (anchoCol + espacio);
      obra.style.transform = `translate(${x}px, ${alturas[col]}px)`;
      alturas[col] += anchoCol / obra.proporcion + espacio;
      // Orden de llegada: de izquierda a derecha y luego hacia abajo
      obra.retraso = col * 90 + filas[col]++ * 160;
      obra.style.setProperty('--retraso', obra.retraso + 'ms');
    });
    grilla.style.height = Math.max(0, Math.max(...alturas) - espacio) + 'px';
  }

  // Sin transición en el primer orden, para que no vuelen desde la esquina
  obras.forEach((o) => (o.style.transition = 'none'));
  ordenar();
  requestAnimationFrame(() => obras.forEach((o) => (o.style.transition = '')));

  let espera;
  addEventListener('resize', () => {
    clearTimeout(espera);
    espera = setTimeout(ordenar, 80);
  });

  // Entrada: suben desde abajo una tras otra; al terminar se quita para que el hover funcione
  if (!sinMovimiento) {
    grilla.classList.add('entrar');
    const ultima = Math.max(...obras.map((o) => o.retraso));
    setTimeout(() => grilla.classList.remove('entrar'), ultima + 1300);
  }

  // ── Al pasar el cursor: videos se reproducen, imágenes van cambiando ──
  function animarAlPasar(obra, tarjeta) {
    const video = tarjeta.querySelector('video');
    if (video) {
      video.addEventListener('playing', () => video.classList.add('reproduciendo'));
      if (sinMovimiento) {
        video.removeAttribute('autoplay');
        video.pause();
        return;
      }
      if (video.hasAttribute('data-siempre')) return;
      tarjeta.addEventListener('mouseenter', () => video.play().catch(() => {}));
      tarjeta.addEventListener('mouseleave', () => {
        video.pause();
        video.classList.remove('reproduciendo');
      });
      return;
    }

    const imagenes = obra.media.filter((m) => !esVideo(m));
    const img = tarjeta.querySelector('img');
    if (imagenes.length < 2 || sinMovimiento) return;
    let indice = 0;
    let intervalo;
    tarjeta.addEventListener('mouseenter', () => {
      imagenes.forEach((src) => (new Image().src = src));
      clearInterval(intervalo);
      intervalo = setInterval(() => {
        indice = (indice + 1) % imagenes.length;
        img.src = imagenes[indice];
      }, 1100);
    });
    tarjeta.addEventListener('mouseleave', () => {
      clearInterval(intervalo);
      indice = 0;
      img.src = imagenes[0];
    });
  }

  // ── Detalle ──────────────────────────────────────────────────────────
  const detalle = document.querySelector('.t2-detalle');
  const visor = detalle.querySelector('.t2-visor');
  const miniaturas = detalle.querySelector('.t2-miniaturas');
  const titulo = detalle.querySelector('#t2-detalle-titulo');
  const año = detalle.querySelector('.t2-detalle-año');
  const listaCats = detalle.querySelector('.t2-detalle-cats');
  const texto = detalle.querySelector('.t2-detalle-texto');
  const cerrarBoton = detalle.querySelector('.t2-cerrar');
  const tituloPagina = document.title;

  let actual = null;
  let indiceMedia = 0;
  let volverA = null;
  let abiertoAqui = false; // true si el detalle agregó una entrada al historial

  function mostrarMedia(i) {
    indiceMedia = (i + actual.media.length) % actual.media.length;
    const src = actual.media[indiceMedia];
    visor.querySelectorAll('video').forEach((v) => v.pause());
    visor.replaceChildren();
    let el;
    if (esVideo(src)) {
      el = crear('video');
      Object.assign(el, { src, controls: true, playsInline: true, muted: true, loop: true });
      if (!sinMovimiento) el.autoplay = true;
    } else {
      el = crear('img');
      el.src = src;
      el.alt = `${actual.querySelector('h2').textContent}, imagen ${indiceMedia + 1} de ${actual.media.length}`;
    }
    visor.append(el);
    miniaturas.querySelectorAll('button').forEach((b, j) => b.setAttribute('aria-current', String(j === indiceMedia)));
    miniaturas.children[indiceMedia]?.scrollIntoView({ block: 'nearest', inline: 'center' });
  }

  function abrir(obra, guardar = true) {
    const primeraVez = detalle.hidden;
    actual = obra;
    if (primeraVez) volverA = document.activeElement;

    titulo.textContent = obra.querySelector('h2').textContent;
    año.textContent = obra.dataset.año;
    listaCats.replaceChildren(...obra.cats.map((c) => {
      const li = crear('li', 'cat-' + c);
      li.append(crear('span', 'obra-cat', CATEGORIAS[c].letra), CATEGORIAS[c].nombre);
      return li;
    }));
    texto.replaceChildren(...[...obra.querySelector('.obra-texto').children]
      .filter((el) => el.tagName !== 'H2')
      .map((el) => el.cloneNode(true)));

    miniaturas.replaceChildren(...obra.media.map((src, j) => {
      const b = crear('button', esVideo(src) ? 'es-video' : '');
      b.type = 'button';
      b.setAttribute('aria-label', `Ver ${esVideo(src) ? 'video' : 'imagen'} ${j + 1}`);
      const m = crear(esVideo(src) ? 'video' : 'img');
      if (esVideo(src)) {
        m.src = src + '#t=1';
        m.muted = true;
        m.preload = 'metadata';
      } else {
        m.src = src;
        m.alt = '';
        m.loading = 'lazy';
      }
      b.append(m);
      b.addEventListener('click', () => mostrarMedia(j));
      return b;
    }));
    miniaturas.parentElement.hidden = obra.media.length < 2;
    mostrarMedia(0);
    detalle.querySelector('.t2-detalle-info').scrollTop = 0;
    detalle.scrollTop = 0;

    document.title = `${titulo.textContent} — Daniela Salamanca`;
    if (guardar) {
      history[primeraVez ? 'pushState' : 'replaceState'](null, '', '#' + obra.id);
      if (primeraVez) abiertoAqui = true;
    }

    if (primeraVez) {
      detalle.hidden = false;
      document.body.classList.add('detalle-abierto');
      detalle.classList.remove('saliendo');
      detalle.classList.add('entrando');
      cerrarBoton.focus({ preventScroll: true });
    }
  }

  function cerrar(guardar = true) {
    if (detalle.hidden || detalle.classList.contains('saliendo')) return;
    visor.querySelectorAll('video').forEach((v) => v.pause());
    document.title = tituloPagina;
    if (guardar) {
      // Si lo abrimos aquí, volver atrás deja el historial como estaba
      if (abiertoAqui) history.back();
      else history.replaceState(null, '', location.pathname + location.search);
    }
    abiertoAqui = false;
    const terminar = () => {
      detalle.hidden = true;
      detalle.classList.remove('saliendo');
      visor.replaceChildren();
      document.body.classList.remove('detalle-abierto');
      volverA?.focus({ preventScroll: true });
    };
    detalle.classList.remove('entrando');
    if (sinMovimiento) return terminar();
    detalle.classList.add('saliendo');
    setTimeout(terminar, 250);
  }

  // Anterior / siguiente trabajo
  function vecino(paso) {
    abrir(obras[(obras.indexOf(actual) + paso + obras.length) % obras.length]);
  }

  cerrarBoton.addEventListener('click', () => cerrar());
  detalle.querySelector('.t2-anterior').addEventListener('click', () => vecino(-1));
  detalle.querySelector('.t2-siguiente').addEventListener('click', () => vecino(1));

  document.addEventListener('keydown', (e) => {
    if (detalle.hidden) return;
    if (e.key === 'Escape') cerrar();
    else if (e.key === 'ArrowRight' && e.target.tagName !== 'VIDEO') mostrarMedia(indiceMedia + 1);
    else if (e.key === 'ArrowLeft' && e.target.tagName !== 'VIDEO') mostrarMedia(indiceMedia - 1);
    else if (e.key === 'Tab') {
      // Mantener el foco dentro del detalle
      const enfocables = [...detalle.querySelectorAll('button, a[href], video[controls]')]
        .filter((el) => el.offsetParent !== null);
      const primero = enfocables[0];
      const ultimo = enfocables[enfocables.length - 1];
      if (e.shiftKey && document.activeElement === primero) { e.preventDefault(); ultimo.focus(); }
      else if (!e.shiftKey && document.activeElement === ultimo) { e.preventDefault(); primero.focus(); }
    }
  });

  // Enlaces directos (trabajos.html#sheet) y botón atrás del navegador
  function desdeDireccion() {
    const obra = obras.find((o) => '#' + o.id === decodeURIComponent(location.hash));
    if (obra) abrir(obra, false);
    else cerrar(false);
  }
  addEventListener('popstate', desdeDireccion);
  if (location.hash) desdeDireccion();
})();
