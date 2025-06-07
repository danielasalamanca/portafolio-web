console.log("¡Bienvenida a mi portafolio!");

const colores = [
  "#5ca089", "#6496f7", "#de97c9", "#b0ae54", "#f9da74",
  "#f18f38", "#efd6fb", "#fd7591", "#90b4f8", "#cddc39"
];

const tipos = [
  { clase: 'editorial', texto: 'Editorial' },
  { clase: 'branding', texto: 'Branding' },
  { clase: 'ilustracion', texto: 'Ilustración' }
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
    // Color barajado
    div.style.background = colorList[colorIndex++];
    // Posición aleatoria
    const left = Math.random() * (containerWidth - 200);
    const top = Math.random() * (containerHeight - 100);
    div.style.left = `${left}px`;
    div.style.top = `${top}px`;
    div.style.position = 'absolute';
    burbujasContainer.appendChild(div);
  });
}

// --- Rebote de burbujas en los bordes ---
document.querySelectorAll('.burbuja').forEach(burbuja => {
  let velocity = { x: 0, y: 0 };
  let position = {
    x: parseFloat(burbuja.style.left),
    y: parseFloat(burbuja.style.top)
  };
  let animationFrame;
  let lastMouse = { x: 0, y: 0 };
  let isMoving = false;

  function animate() {
    velocity.x *= 0.94;
    velocity.y *= 0.94;
    position.x += velocity.x;
    position.y += velocity.y;
    const width = burbuja.offsetWidth;
    const height = burbuja.offsetHeight;
    const containerRect = burbujasContainer.getBoundingClientRect();
    const minX = 0;
    const minY = 0;
    const maxX = burbujasContainer.offsetWidth - width;
    const maxY = burbujasContainer.offsetHeight - height;
    if (position.x < minX) { position.x = minX; velocity.x *= -0.7; }
    else if (position.x > maxX) { position.x = maxX; velocity.x *= -0.7; }
    if (position.y < minY) { position.y = minY; velocity.y *= -0.7; }
    else if (position.y > maxY) { position.y = maxY; velocity.y *= -0.7; }
    burbuja.style.left = position.x + 'px';
    burbuja.style.top = position.y + 'px';
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
    const edgeThreshold = 40;
    const dx = e.movementX || e.clientX - lastMouse.x;
    const dy = e.movementY || e.clientY - lastMouse.y;
    lastMouse = { x: e.clientX, y: e.clientY };
    let hit = false;
    if (x < edgeThreshold) { velocity.x = -dx * 3; hit = true; }
    else if (x > rect.width - edgeThreshold) { velocity.x = dx * 3; hit = true; }
    if (y < edgeThreshold) { velocity.y = -dy * 3; hit = true; }
    else if (y > rect.height - edgeThreshold) { velocity.y = dy * 3; hit = true; }
    if (hit && !isMoving) {
      isMoving = true;
      cancelAnimationFrame(animationFrame);
      animationFrame = requestAnimationFrame(animate);
    }
  });
});