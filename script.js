const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const upload = document.getElementById('upload');
const zoomRange = document.getElementById('zoomRange');
const downloadBtn = document.getElementById('downloadBtn');

const frame = new Image();
frame.src = 'frame.png'; // Your frame PNG file, transparent background

let userImage = null;
let userImageX = 0;
let userImageY = 0;
let scale = 1;

let isDragging = false;
let dragStartX = 0;
let dragStartY = 0;

function drawCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (userImage) {
    const w = userImage.width * scale;
    const h = userImage.height * scale;

    ctx.drawImage(userImage, userImageX, userImageY, w, h);
  }

  if (frame.complete) {
    ctx.drawImage(frame, 0, 0, canvas.width, canvas.height);
  }
}

// Zoom slider event
zoomRange.addEventListener('input', () => {
  scale = parseFloat(zoomRange.value);
  drawCanvas();
});

// Drag events
canvas.addEventListener('mousedown', (e) => {
  if (!userImage) return;
  isDragging = true;
  dragStartX = e.offsetX - userImageX;
  dragStartY = e.offsetY - userImageY;
  canvas.style.cursor = 'grabbing';
});

canvas.addEventListener('mouseup', () => {
  isDragging = false;
  canvas.style.cursor = 'grab';
});

canvas.addEventListener('mouseout', () => {
  isDragging = false;
  canvas.style.cursor = 'grab';
});

canvas.addEventListener('mousemove', (e) => {
  if (isDragging) {
    userImageX = e.offsetX - dragStartX;
    userImageY = e.offsetY - dragStartY;
    drawCanvas();
  }
});

// Handle user image upload
upload.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(event) {
    userImage = new Image();
    userImage.onload = function() {
      // Reset scale and position
      scale = 1;
      zoomRange.value = scale;

      // Center user image in canvas
      userImageX = (canvas.width - userImage.width) / 2;
      userImageY = (canvas.height - userImage.height) / 2;

      drawCanvas();
      downloadBtn.disabled = false;
    };
    userImage.src = event.target.result;
  };
  reader.readAsDataURL(file);
});

// Download button event
downloadBtn.addEventListener('click', () => {
  const link = document.createElement('a');
  link.download = 'framed-photo.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
});
