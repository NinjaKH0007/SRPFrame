const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const uploadInput = document.getElementById('upload');
const zoomInBtn = document.getElementById('zoomIn');
const zoomOutBtn = document.getElementById('zoomOut');
const resetBtn = document.getElementById('reset');
const downloadBtn = document.getElementById('download');
const shareBtn = document.getElementById('share');

const frameImage = new Image();
frameImage.src = 'frame.png';  // your frame file

// Variables for user image and transformation
let userImage = new Image();
let imgX = 0;
let imgY = 0;
let imgScale = 1;
let imgStartX = 0;
let imgStartY = 0;
let isDragging = false;
let lastX = 0;
let lastY = 0;

// Responsive canvas setup
function resizeCanvas() {
  // Make canvas width max 400px or 90% of window width, height proportional
  let maxWidth = 400;
  let padding = 40; // container padding

  const width = Math.min(window.innerWidth - padding, maxWidth);
  canvas.style.width = width + 'px';

  // Set actual canvas resolution higher for high-quality download
  canvas.width = 800;
  canvas.height = 800 * (width / maxWidth);
  draw();
}

window.addEventListener('resize', resizeCanvas);

// Load user image and fit canvas
uploadInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (event) {
    userImage = new Image();
    userImage.onload = () => {
      resetImagePosition();
      draw();
    };
    userImage.src = event.target.result;
  };
  reader.readAsDataURL(file);
});

function resetImagePosition() {
  // Reset zoom and position to fit the canvas nicely
  imgScale = 1;
  imgX = canvas.width / 2;
  imgY = canvas.height / 2;

  // Scale image to fit canvas inside 90%
  const scaleX = canvas.width * 0.9 / userImage.width;
  const scaleY = canvas.height * 0.9 / userImage.height;
  imgScale = Math.min(scaleX, scaleY);
}

// Draw everything on canvas
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (userImage.src) {
    const imgWidth = userImage.width * imgScale;
    const imgHeight = userImage.height * imgScale;

    ctx.drawImage(userImage, imgX - imgWidth / 2, imgY - imgHeight / 2, imgWidth, imgHeight);
  }

  // Draw frame on top, fit full canvas
  ctx.drawImage(frameImage, 0, 0, canvas.width, canvas.height);
}

// Mouse and touch events for drag support
function pointerDown(e) {
  e.preventDefault();
  isDragging = true;
  if (e.type === 'touchstart') {
    lastX = e.touches[0].clientX;
    lastY = e.touches[0].clientY;
  } else {
    lastX = e.clientX;
    lastY = e.clientY;
  }
}

function pointerMove(e) {
  if (!isDragging) return;
  e.preventDefault();

  let currentX, currentY;
  if (e.type === 'touchmove') {
    currentX = e.touches[0].clientX;
    currentY = e.touches[0].clientY;
  } else {
    currentX = e.clientX;
    currentY = e.clientY;
  }

  let dx = currentX - lastX;
  let dy = currentY - lastY;

  imgX += dx;
  imgY += dy;

  lastX = currentX;
  lastY = currentY;

  draw();
}

function pointerUp(e) {
  e.preventDefault();
  isDragging = false;
}

// Add event listeners
canvas.addEventListener('mousedown', pointerDown);
canvas.addEventListener('mousemove', pointerMove);
canvas.addEventListener('mouseup', pointerUp);
canvas.addEventListener('mouseleave', pointerUp);

canvas.addEventListener('touchstart', pointerDown);
canvas.addEventListener('touchmove', pointerMove);
canvas.addEventListener('touchend', pointerUp);
canvas.addEventListener('touchcancel', pointerUp);

// Zoom functions
zoomInBtn.addEventListener('click', () => {
  imgScale *= 1.1;
  draw();
});

zoomOutBtn.addEventListener('click', () => {
  imgScale /= 1.1;
  draw();
});

resetBtn.addEventListener('click', () => {
  if (userImage.src) {
    resetImagePosition();
    draw();
  }
});

// Download function with high quality
downloadBtn.addEventListener('click', () => {
  if (!userImage.src) {
    alert('Please upload an image first.');
    return;
  }

  // Create a temp canvas with full resolution
  const tmpCanvas = document.createElement('canvas');
  const tmpCtx = tmpCanvas.getContext('2d');

  // Let's create a 2000x2000 px image for high quality
  tmpCanvas.width = 2000;
  tmpCanvas.height = 2000;

  // Calculate scaling factor between display canvas and tmp canvas
  const scaleFactorX = tmpCanvas.width / canvas.width;
  const scaleFactorY = tmpCanvas.height / canvas.height;

  // Draw user image with adjusted position and scale
  const imgWidth = userImage.width * imgScale * scaleFactorX;
  const imgHeight = userImage.height * imgScale * scaleFactorY;
  const drawX = (imgX - (userImage.width * imgScale) / 2) * scaleFactorX;
  const drawY = (imgY - (userImage.height * imgScale) / 2) * scaleFactorY;

  tmpCtx.drawImage(userImage, drawX, drawY, imgWidth, imgHeight);

  // Draw frame at full canvas size
  tmpCtx.drawImage(frameImage, 0, 0, tmpCanvas.width, tmpCanvas.height);

  tmpCanvas.toBlob((blob) => {
    const url = URL.createObjectURL(blob);

    // Use anchor to download
    const a = document.createElement('a');
    a.href = url;
    a.download = 'SRPFrame.png';
    document.body.appendChild(a);
    a.click();
    a.remove();

    URL.revokeObjectURL(url);
  }, 'image/png', 1);
});

// Share button (mobile/social)
shareBtn.addEventListener('click', async () => {
  if (!userImage.src) {
    alert('Please upload an image first.');
    return;
  }

  if (navigator.canShare && navigator.canShare({ files: [] })) {
    // Create high quality blob same as download
    const tmpCanvas = document.createElement('canvas');
    const tmpCtx = tmpCanvas.getContext('2d');

    tmpCanvas.width = 2000;
    tmpCanvas.height = 2000;

    const scaleFactorX = tmpCanvas.width / canvas.width;
    const scaleFactorY = tmpCanvas.height / canvas.height;

    const imgWidth = userImage.width * imgScale * scaleFactorX;
    const imgHeight = userImage.height * imgScale * scaleFactorY;
    const drawX = (imgX - (userImage.width * imgScale) / 2) * scaleFactorX;
    const drawY = (imgY - (userImage.height * imgScale) / 2) * scaleFactorY;

    tmpCtx.drawImage(userImage, drawX, drawY, imgWidth, imgHeight);
    tmpCtx.drawImage(frameImage, 0, 0, tmpCanvas.width, tmpCanvas.height);

    tmpCanvas.toBlob(async (blob) => {
      const filesArray = [new File([blob], 'SRPFrame.png', { type: 'image/png' })];
      try {
        await navigator.share({
          files: filesArray,
          title: 'SRPFrame',
          text: 'Check out my framed photo!',
        });
      } catch (err) {
        alert('Sharing failed: ' + err.message);
      }
    }, 'image/png', 1);
  } else {
    alert('Sharing not supported on this browser. Please download and share manually.');
  }
});

// Initial setup
frameImage.onload = () => {
  resizeCanvas();
  draw();
};

window.onload = () => {
  resizeCanvas();
};
