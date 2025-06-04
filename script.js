// Configuration: Replace this with your frame image URL or path
const frameSrc = 'frame.png';  // make sure frame.png is in same folder

// Canvas and context
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const uploadInput = document.getElementById('upload');
const zoomInBtn = document.getElementById('zoomInBtn');
const zoomOutBtn = document.getElementById('zoomOutBtn');
const resetBtn = document.getElementById('resetBtn');
const downloadBtn = document.getElementById('downloadBtn');
const shareBtn = document.getElementById('shareBtn');

// State variables
let frameImage = new Image();
let userImage = new Image();

let canvasWidth, canvasHeight;

// Image transform state for user image
let scale = 1;
let minScale = 1;
let maxScale = 4;
let posX = 0;
let posY = 0;
let dragStart = null;
let isDragging = false;

// To handle touch gestures
let lastTouchDistance = null;

// Load frame image first
frameImage.onload = () => {
  canvasWidth = frameImage.width;
  canvasHeight = frameImage.height;

  canvas.width = canvasWidth;
  canvas.height = canvasHeight;

  // Reset user image to null on frame load
  userImage = null;

  draw();
};

frameImage.src = frameSrc;

// Helper: reset user image transform
function resetUserImage() {
  scale = 1;
  posX = 0;
  posY = 0;
}

// Draw function: draws user image then frame on top
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw user image if loaded
  if (userImage && userImage.complete) {
    let iw = userImage.width;
    let ih = userImage.height;

    // Calculate scaled width and height
    let scaledWidth = iw * scale;
    let scaledHeight = ih * scale;

    // Draw user image centered with posX and posY offset
    let dx = canvasWidth / 2 - scaledWidth / 2 + posX;
    let dy = canvasHeight / 2 - scaledHeight / 2 + posY;

    ctx.drawImage(userImage, dx, dy, scaledWidth, scaledHeight);
  }

  // Draw frame on top
  ctx.drawImage(frameImage, 0, 0, canvasWidth, canvasHeight);
}

// Handle upload image
uploadInput.addEventListener('change', (e) => {
  if (e.target.files && e.target.files[0]) {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = (evt) => {
      userImage = new Image();
      userImage.onload = () => {
        // Calculate scale to fit user image inside canvas
        const scaleX = canvasWidth / userImage.width;
        const scaleY = canvasHeight / userImage.height;
        minScale = Math.min(scaleX, scaleY, 1);
        scale = minScale;

        // Reset position
        posX = 0;
        posY = 0;

        draw();
      };
      userImage.src = evt.target.result;
    };

    reader.readAsDataURL(file);
  }
});

// Zoom in
zoomInBtn.addEventListener('click', () => {
  if (!userImage) return;
  scale = Math.min(scale * 1.2, maxScale);
  draw();
});

// Zoom out
zoomOutBtn.addEventListener('click', () => {
  if (!userImage) return;
  scale = Math.max(scale / 1.2, minScale);
  draw();
});

// Reset
resetBtn.addEventListener('click', () => {
  if (!userImage) return;
  scale = minScale;
  posX = 0;
  posY = 0;
  draw();
});

// Download canvas as PNG
downloadBtn.addEventListener('click', () => {
  if (!userImage) return;
  canvas.toBlob((blob) => {
    const url = URL.createObjectURL(blob);

    // Create a temporary link and click it
    const a = document.createElement('a');
    a.href = url;
    a.download = 'SRPFrame.png';
    document.body.appendChild(a);
    a.click();

    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  }, 'image/png', 1); // quality 1 for highest
});

// Share using Web Share API if available
shareBtn.addEventListener('click', async () => {
  if (!userImage) return;

  // Convert canvas to blob first
  canvas.toBlob(async (blob) => {
    if (navigator.canShare && navigator.canShare({ files: [new File([blob], 'SRPFrame.png', { type: 'image/png' })] })) {
      try {
        await navigator.share({
          files: [new File([blob], 'SRPFrame.png', { type: 'image/png' })],
          title: 'SRPFrame Image',
          text: 'Check out my framed photo!'
        });
      } catch (err) {
        alert('Sharing failed: ' + err.message);
      }
    } else {
      alert('Sharing not supported on this device/browser.');
    }
  }, 'image/png', 1);
});

// Dragging support
function getPointerPos(evt) {
  const rect = canvas.getBoundingClientRect();
  if (evt.touches && evt.touches.length === 1) {
    return {
      x: evt.touches[0].clientX - rect.left,
      y: evt.touches[0].clientY - rect.top
    };
  } else if (evt.clientX !== undefined) {
    return {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top
    };
  }
  return null;
}

canvas.addEventListener('mousedown', (evt) => {
  if (!userImage) return;
  isDragging = true;
  dragStart = getPointerPos(evt);
});

canvas.addEventListener('touchstart', (evt) => {
  if (!userImage) return;
  if (evt.touches.length === 1) {
    isDragging = true;
    dragStart = getPointerPos(evt);
  }
  if (evt.touches.length === 2) {
    // For pinch zoom, not implemented here (optional)
  }
});

canvas.addEventListener('mousemove', (evt) => {
  if (!isDragging || !userImage) return;
  const pos = getPointerPos(evt);
  if (!pos || !dragStart) return;

  const dx = pos.x - dragStart.x;
  const dy = pos.y - dragStart.y;
  posX += dx;
  posY += dy;
  dragStart = pos;
  draw();
});

canvas.addEventListener('touchmove', (evt) => {
  if (!isDragging || !userImage) return;
  if (evt.touches.length !== 1) return;
  evt.preventDefault(); // prevent scrolling

  const pos = getPointerPos(evt);
  if (!pos || !dragStart) return;

  const dx = pos.x - dragStart.x;
  const dy = pos.y - dragStart.y;
  posX += dx;
  posY += dy;
  dragStart = pos;
  draw();
}, { passive: false });

canvas.addEventListener('mouseup', () => {
  isDragging = false;
  dragStart = null;
});

canvas.addEventListener('touchend', () => {
  isDragging = false;
  dragStart = null;
});
