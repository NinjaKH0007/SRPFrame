const frameSrc = 'frame.png';  // Your frame image URL

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const uploadInput = document.getElementById('upload');
const zoomInBtn = document.getElementById('zoomInBtn');
const zoomOutBtn = document.getElementById('zoomOutBtn');
const resetBtn = document.getElementById('resetBtn');
const downloadBtn = document.getElementById('downloadBtn');
const shareBtn = document.getElementById('shareBtn');

let frameImage = new Image();
let userImage = null;

// Logical canvas size (1080x1080)
const LOGICAL_SIZE = 1080;

canvas.width = LOGICAL_SIZE;
canvas.height = LOGICAL_SIZE;

// State for user image transform
let scale = 1;
let minScale = 0.3;  // <-- zoom out more
let maxScale = 4;
let posX = 0;
let posY = 0;

let dragStart = null;
let isDragging = false;

// For pinch zoom
let initialPinchDistance = null;
let lastScale = 1;

// Load frame image
frameImage.onload = () => {
  draw();
};
frameImage.src = frameSrc;

function draw() {
  ctx.clearRect(0, 0, LOGICAL_SIZE, LOGICAL_SIZE);

  // Draw user image
  if (userImage && userImage.complete) {
    const iw = userImage.width;
    const ih = userImage.height;

    const scaledWidth = iw * scale;
    const scaledHeight = ih * scale;

    const dx = LOGICAL_SIZE / 2 - scaledWidth / 2 + posX;
    const dy = LOGICAL_SIZE / 2 - scaledHeight / 2 + posY;

    ctx.drawImage(userImage, dx, dy, scaledWidth, scaledHeight);
  }

  // Draw frame on top scaled to 1080x1080
  ctx.drawImage(frameImage, 0, 0, LOGICAL_SIZE, LOGICAL_SIZE);
}

// Fit uploaded user image inside 1080x1080 and set minScale accordingly
function fitUserImage() {
  if (!userImage) return;
  const scaleX = LOGICAL_SIZE / userImage.width;
  const scaleY = LOGICAL_SIZE / userImage.height;
  minScale = Math.min(scaleX, scaleY, 0.3); // allow zoom out more here
  scale = minScale;
  posX = 0;
  posY = 0;
}

uploadInput.addEventListener('change', (e) => {
  if (e.target.files && e.target.files[0]) {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = (evt) => {
      userImage = new Image();
      userImage.onload = () => {
        fitUserImage();
        draw();
      };
      userImage.src = evt.target.result;
    };

    reader.readAsDataURL(file);
  }
});

// Zoom controls
zoomInBtn.addEventListener('click', () => {
  if (!userImage) return;
  scale = Math.min(scale * 1.2, maxScale);
  draw();
});
zoomOutBtn.addEventListener('click', () => {
  if (!userImage) return;
  scale = Math.max(scale / 1.2, minScale);
  draw();
});
resetBtn.addEventListener('click', () => {
  if (!userImage) return;
  scale = minScale;
  posX = 0;
  posY = 0;
  draw();
});

// Download full 1080x1080 PNG
downloadBtn.addEventListener('click', () => {
  if (!userImage) return;
  canvas.toBlob((blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'SRPFrame.png';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  }, 'image/png', 1);
});

// Native share if available
shareBtn.addEventListener('click', async () => {
  if (!userImage) return;
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

// Utility: get pointer position relative to canvas
function getPointerPos(evt) {
  const rect = canvas.getBoundingClientRect();
  if (evt.touches && evt.touches.length > 0) {
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

// Dragging with mouse or single touch (support pointer events if available)
if(window.PointerEvent){
  canvas.addEventListener('pointerdown', pointerDown);
  canvas.addEventListener('pointermove', pointerMove);
  canvas.addEventListener('pointerup', pointerUp);
  canvas.addEventListener('pointercancel', pointerUp);
}else{
  // fallback mouse/touch events
  canvas.addEventListener('mousedown', mouseDown);
  canvas.addEventListener('mousemove', mouseMove);
  canvas.addEventListener('mouseup', mouseUp);
  canvas.addEventListener('mouseleave', mouseUp);
  canvas.addEventListener('touchstart', touchStart, {passive:false});
  canvas.addEventListener('touchmove', touchMove, {passive:false});
  canvas.addEventListener('touchend', touchEnd);
}

let pointers = [];
function pointerDown(evt) {
  if(!userImage) return;
  evt.preventDefault();
  pointers.push(evt);
  if(pointers.length === 1){
    dragStart = getPointerPos(evt);
    isDragging = true;
  } else if(pointers.length === 2){
    isDragging = false;
    initialPinchDistance = getDistance(pointers[0], pointers[1]);
    lastScale = scale;
  }
}

function pointerMove(evt) {
  if(!userImage) return;
  evt.preventDefault();
  for(let i=0; i<pointers.length; i++){
    if(pointers[i].pointerId === evt.pointerId){
      pointers[i] = evt;
      break;
    }
  }
  if(pointers.length === 1 && isDragging){
    const pos = getPointerPos(evt);
    if(!pos || !dragStart) return;
    const dx = pos.x - dragStart.x;
    const dy = pos.y - dragStart.y;
    posX += dx * (LOGICAL_SIZE / canvas.getBoundingClientRect().width);
    posY += dy * (LOGICAL_SIZE / canvas.getBoundingClientRect().height);
    dragStart = pos;
    draw();
  } else if(pointers.length === 2){
    const dist = getDistance(pointers[0], pointers[1]);
    if(!initialPinchDistance) initialPinchDistance = dist;
    else{
      const scaleFactor = dist / initialPinchDistance;
      scale = Math.min(maxScale, Math.max(minScale, lastScale * scaleFactor));
      draw();
    }
  }
}

function pointerUp(evt) {
  if(!userImage) return;
  evt.preventDefault();
  pointers = pointers.filter(p => p.pointerId !== evt.pointerId);
  if(pointers.length < 2){
    initialPinchDistance = null;
    lastScale = scale;
  }
  if(pointers.length === 0){
    isDragging = false;
    dragStart = null;
  }
}

// Mouse fallback
function mouseDown(evt){
  if(!userImage) return;
  isDragging = true;
  dragStart = getPointerPos(evt);
}

function mouseMove(evt){
  if(!isDragging || !userImage) return;
  const pos = getPointerPos(evt);
  if(!pos || !dragStart) return;
  const dx = pos.x - dragStart.x;
  const dy = pos.y - dragStart.y;
  posX += dx * (LOGICAL_SIZE / canvas.getBoundingClientRect().width);
  posY += dy * (LOGICAL_SIZE / canvas.getBoundingClientRect().height);
  dragStart = pos;
  draw();
}

function mouseUp(evt){
  isDragging = false;
  dragStart = null;
}

// Touch fallback (single finger drag + pinch handled in pointer events, but fallback here)
function touchStart(evt){
  if(!userImage) return;
  if(evt.touches.length === 1){
    isDragging = true;
    dragStart = getPointerPos(evt);
  }
}
function touchMove(evt){
  if(!isDragging || !userImage) return;
  if(evt.touches.length === 1){
    const pos = getPointerPos(evt);
    if(!pos || !dragStart) return;
    const dx = pos.x - dragStart.x;
    const dy = pos.y - dragStart.y;
    posX += dx * (LOGICAL_SIZE / canvas.getBoundingClientRect().width);
    posY += dy * (LOGICAL_SIZE / canvas.getBoundingClientRect().height);
    dragStart = pos;
    draw();
  } else if(evt.touches.length === 2){
    evt.preventDefault(); // prevent page scroll
  }
}
function touchEnd(evt){
  if(evt.touches.length === 0){
    isDragging = false;
    dragStart = null;
    initialPinchDistance = null;
    lastScale = scale;
  }
}

function getDistance(p1, p2){
  const dx = p1.clientX - p2.clientX;
  const dy = p1.clientY - p2.clientY;
  return Math.sqrt(dx*dx + dy*dy);
}
