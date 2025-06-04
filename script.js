const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const uploadInput = document.getElementById('upload');
const zoomInBtn = document.getElementById('zoomIn');
const zoomOutBtn = document.getElementById('zoomOut');
const resetBtn = document.getElementById('reset');
const downloadBtn = document.getElementById('download');

const CANVAS_WIDTH = 400;  // fixed size, match frame.png
const CANVAS_HEIGHT = 400;

canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;

let userImage = null;
let frameImage = new Image();
frameImage.src = 'frame.png';  // Your frame PNG, 400x400

// User image properties for zoom and pan
let imgX = CANVAS_WIDTH / 2;
let imgY = CANVAS_HEIGHT / 2;
let imgScale = 1;
let isDragging = false;
let dragStartX = 0;
let dragStartY = 0;
let imgOffsetX = 0;
let imgOffsetY = 0;

function draw() {
  // Clear canvas
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  if (userImage) {
    ctx.save();
    // Move to image position
    ctx.translate(imgX, imgY);
    ctx.scale(imgScale, imgScale);
    // Draw image centered on imgX,imgY
    ctx.drawImage(userImage, -userImage.width / 2, -userImage.height / 2);
    ctx.restore();
  }

  // Draw frame on top
  ctx.drawImage(frameImage, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
}

function resetImagePosition() {
  if (!userImage) return;

  imgScale = Math.min(
    CANVAS_WIDTH / userImage.width,
    CANVAS_HEIGHT / userImage.height
  );
  imgX = CANVAS_WIDTH / 2;
  imgY = CANVAS_HEIGHT / 2;
}

uploadInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    alert('Please upload a valid image file.');
    return;
  }

  const reader = new FileReader();
  reader.onload = function (event) {
    userImage = new Image();

    userImage.onload = () => {
      resetImagePosition();
      draw();
    };

    userImage.onerror = () => {
      alert('Failed to load image.');
    };

    userImage.src = event.target.result;
  };

  reader.readAsDataURL(file);
});

// Mouse and touch events for dragging

function getEventPos(e) {
  if (e.touches && e.touches.length > 0) {
    return { x: e.touches[0].clientX, y: e.touches[0].clientY };
  } else {
    return { x: e.clientX, y: e.clientY };
  }
}

canvas.addEventListener('mousedown', (e) => {
  if (!userImage) return;
  isDragging = true;
  const pos = getEventPos(e);
  dragStartX = pos.x;
  dragStartY = pos.y;
});

canvas.addEventListener('touchstart', (e) => {
  if (!userImage) return;
  isDragging = true;
  const pos = getEventPos(e);
  dragStartX = pos.x;
  dragStartY = pos.y;
});

canvas.addEventListener('mousemove', (e) => {
  if (!isDragging) return;
  const pos = getEventPos(e);
  const dx = pos.x - dragStartX;
  const dy = pos.y - dragStartY;
  dragStartX = pos.x;
  dragStartY = pos.y;

  imgX += dx;
  imgY += dy;

  // Limit panning to some extent if needed (optional)

  draw();
});

canvas.addEventListener('touchmove', (e) => {
  if (!isDragging) return;
  e.preventDefault(); // prevent scroll
  const pos = getEventPos(e);
  const dx = pos.x - dragStartX;
  const dy = pos.y - dragStartY;
  dragStartX = pos.x;
  dragStartY = pos.y;

  imgX += dx;
  imgY += dy;

  draw();
}, { passive: false });

canvas.addEventListener('mouseup', () => {
  isDragging = false;
});

canvas.addEventListener('touchend', () => {
  isDragging = false;
});

// Zoom buttons

zoomInBtn.addEventListener('click', () => {
  if (!userImage) return;
  imgScale *= 1.1;
  draw();
});

zoomOutBtn.addEventListener('click', () => {
  if (!userImage) return;
  imgScale /= 1.1;
  draw();
});

resetBtn.addEventListener('click', () => {
  resetImagePosition();
  draw();
});

// Download button (highest quality)

downloadBtn.addEventListener('click', () => {
  if (!userImage) return;

  // Create a temp canvas for full res output
  const outputCanvas = document.createElement('canvas');
  const outputCtx = outputCanvas.getContext('2d');

  outputCanvas.width = CANVAS_WIDTH;
  outputCanvas.height = CANVAS_HEIGHT;

  // Draw user image
  outputCtx.save();
  outputCtx.translate(imgX, imgY);
  outputCtx.scale(imgScale, imgScale);
  outputCtx.drawImage(userImage, -userImage.width / 2, -userImage.height / 2);
  outputCtx.restore();

  // Draw frame on top
  outputCtx.drawImage(frameImage, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Save as PNG with max quality
  outputCanvas.toBlob((blob) => {
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'SRPFrame.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 'image/png', 1);
});
