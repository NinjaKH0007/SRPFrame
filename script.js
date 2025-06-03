const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const upload = document.getElementById('upload');
const zoomInBtn = document.getElementById('zoomInBtn');
const zoomOutBtn = document.getElementById('zoomOutBtn');
const resetBtn = document.getElementById('resetBtn');
const downloadBtn = document.getElementById('download');
const shareBtn = document.getElementById('share');

const FRAME_SRC = 'frame.png'; // Make sure frame.png is in the same folder

let userImage = new Image();
let frameImage = new Image();
frameImage.src = FRAME_SRC;

let scale = 1;
let offsetX = 0;
let offsetY = 0;

let isDragging = false;
let dragStartX = 0;
let dragStartY = 0;

// When user uploads photo
upload.addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(event) {
    userImage.src = event.target.result;
  }
  reader.readAsDataURL(file);
});

// Draw function
function draw() {
  // Clear
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw user image centered with scale and offset
  if (userImage.src) {
    const iw = userImage.width;
    const ih = userImage.height;

    // Center point of canvas
    const cx = canvas.width / 2 + offsetX;
    const cy = canvas.height / 2 + offsetY;

    const dw = iw * scale;
    const dh = ih * scale;

    ctx.drawImage(userImage, cx - dw/2, cy - dh/2, dw, dh);
  }

  // Draw frame full canvas
  if (frameImage.complete) {
    ctx.drawImage(frameImage, 0, 0, canvas.width, canvas.height);
  }
}

// Zoom In/Out/Reset
zoomInBtn.onclick = () => {
  scale *= 1.1;
  draw();
}

zoomOutBtn.onclick = () => {
  scale /= 1.1;
  draw();
}

resetBtn.onclick = () => {
  scale = 1;
  offsetX = 0;
  offsetY = 0;
  draw();
}

// Drag to move user image
canvas.addEventListener('mousedown', e => {
  isDragging = true;
  dragStartX = e.clientX;
  dragStartY = e.clientY;
});

canvas.addEventListener('mouseup', e => {
  isDragging = false;
});

canvas.addEventListener('mouseleave', e => {
  isDragging = false;
});

canvas.addEventListener('mousemove', e => {
  if (isDragging) {
    const dx = e.clientX - dragStartX;
    const dy = e.clientY - dragStartY;
    dragStartX = e.clientX;
    dragStartY = e.clientY;

    offsetX += dx;
    offsetY += dy;
    draw();
  }
});

// Touch support for mobile drag
canvas.addEventListener('touchstart', e => {
  if(e.touches.length == 1) {
    isDragging = true;
    dragStartX = e.touches[0].clientX;
    dragStartY = e.touches[0].clientY;
  }
});

canvas.addEventListener('touchmove', e => {
  if(isDragging && e.touches.length == 1) {
    const dx = e.touches[0].clientX - dragStartX;
    const dy = e.touches[0].clientY - dragStartY;
    dragStartX = e.touches[0].clientX;
    dragStartY = e.touches[0].clientY;

    offsetX += dx;
    offsetY += dy;
    draw();
    e.preventDefault();
  }
});

canvas.addEventListener('touchend', e => {
  isDragging = false;
});

// Download function
downloadBtn.onclick = () => {
  const link = document.createElement('a');
  link.download = 'SRPFrame.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
}

// Share function
shareBtn.onclick = async () => {
  if (navigator.canShare && navigator.canShare({ files: [] })) {
    canvas.toBlob(async (blob) => {
      const filesArray = [
        new File([blob], 'SRPFrame.png', {
          type: blob.type,
          lastModified: new Date().getTime()
        })
      ];

      try {
        await navigator.share({
          files: filesArray,
          title: 'SRPFrame',
          text: 'Check out my photo with SRPFrame!'
        });
      } catch (err) {
        alert('Share failed: ' + err.message);
      }
    });
  } else {
    alert('Sharing is not supported on this device. Downloading instead.');
    downloadBtn.click();
  }
}

// When frame image loads, draw initially
frameImage.onload = () => {
  draw();
}
