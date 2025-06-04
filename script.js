console.log("¡Bienvenida a mi portafolio!");

// --- Activar clase activa en el menú ---
const links = document.querySelectorAll('.menu-links a');
links.forEach(link => {
  link.addEventListener('click', () => {
    links.forEach(l => l.classList.remove('activo'));
    link.classList.add('activo');
  });
});

document.querySelectorAll('.burbuja').forEach(img => {
  let isDragging = false;
  let offsetX, offsetY;

  img.addEventListener('mousedown', function(e) {
    isDragging = true;

    const rect = img.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;

    img.style.cursor = 'grabbing';

    function moveAt(clientX, clientY) {
  const containerRect = img.parentElement.getBoundingClientRect();
  let left = clientX - containerRect.left - offsetX;
  let top = clientY - containerRect.top - offsetY;

  // Limita que no se salga del contenedor
  left = Math.max(0, Math.min(left, containerRect.width - rect.width));
  top = Math.max(0, Math.min(top, containerRect.height - rect.height));

  img.style.left = left + 'px';
  img.style.top = top + 'px';
}

    function onMouseMove(e) {
      if (!isDragging) return;
      moveAt(e.clientX, e.clientY);
    }

    function onMouseUp() {
      isDragging = false;
      img.style.cursor = 'grab';
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    }

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  });

  img.ondragstart = () => false;
});


