console.log("¡Bienvenida a mi portafolio!");


// --- Rebote de burbujas en los bordes ---
document.querySelectorAll('.burbuja').forEach(burbuja => {
  let velocity = { x: 0, y: 0 };
  let position = { x: 0, y: 0 };
  let animationFrame;
  let lastMouse = { x: 0, y: 0 };
  let isMoving = false;

  // Inicializa la posición relativa
  burbuja.style.position = 'absolute';
  const rect = burbuja.getBoundingClientRect();
  position.x = rect.left + window.scrollX;
  position.y = rect.top + window.scrollY;
  burbuja.style.left = position.x + 'px';
  burbuja.style.top = position.y + 'px';

  function animate() {
    // Aplica fricción
    velocity.x *= 0.94;
    velocity.y *= 0.94;

    position.x += velocity.x;
    position.y += velocity.y;

    // Tamaño de la burbuja
    const width = burbuja.offsetWidth;
    const height = burbuja.offsetHeight;

    // Límites de la ventana
    const minX = 0;
    const minY = 0;
    const maxX = window.innerWidth - width;
    const maxY = window.innerHeight - height;

    // Rebote horizontal
    if (position.x < minX) {
      position.x = minX;
      velocity.x *= -0.7; // rebote y pierde energía
    } else if (position.x > maxX) {
      position.x = maxX;
      velocity.x *= -0.7;
    }

    // Rebote vertical
    if (position.y < minY) {
      position.y = minY;
      velocity.y *= -0.7;
    } else if (position.y > maxY) {
      position.y = maxY;
      velocity.y *= -0.7;
    }

    burbuja.style.left = position.x + 'px';
    burbuja.style.top = position.y + 'px';

    // Si la velocidad es significativa, sigue animando
    if (Math.abs(velocity.x) > 0.5 || Math.abs(velocity.y) > 0.5) {
      animationFrame = requestAnimationFrame(animate);
    } else {
      isMoving = false;
    }
  }

  burbuja.addEventListener('mousemove', (e) => {
    const rect = burbuja.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const edgeThreshold = 20;

    // Calcula la velocidad del mouse
    const dx = e.movementX || e.clientX - lastMouse.x;
    const dy = e.movementY || e.clientY - lastMouse.y;
    lastMouse = { x: e.clientX, y: e.clientY };

    let hit = false;

    if (x < edgeThreshold) {
  velocity.x = -dx * 1.5;
  hit = true;
} else if (x > rect.width - edgeThreshold) {
  velocity.x = dx * 1.5;
  hit = true;
}

if (y < edgeThreshold) {
  velocity.y = -dy * 1.5;
  hit = true;
} else if (y > rect.height - edgeThreshold) {
  velocity.y = dy * 1.5;
  hit = true;
}

    if (hit && !isMoving) {
      isMoving = true;
      cancelAnimationFrame(animationFrame);
      animationFrame = requestAnimationFrame(animate);
    }
  });
});