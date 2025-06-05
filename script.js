let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');
let img = new Image();
let frame = new Image();
frame.src = 'frame.png';
let scale = 1;
let posX = 0, posY = 0;
let isDragging = false;
let startX, startY;
let downloadCount = 0;
let shareCount = 0;

// Adjust canvas size
function resizeCanvas() {
  canvas.width = Math.min(window.innerWidth * 0.9, 600);
  canvas.height = canvas.width;
  draw();
}

window.addEventListener('resize', resizeCanvas);

document.getElementById('upload').onchange = function(e) {
  let reader = new FileReader();
  reader.onload = function(event) {
    img.src = event.target.result;
    scale = 1;
    posX = 0;
    posY = 0;
    img.onload = () => {
      resizeCanvas();
    };
  };
  reader.readAsDataURL(e.target.files[0]);
};

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (img.src) {
    let imgW = img.width * scale;
    let imgH = img.height * scale;
    ctx.drawImage(img, posX, posY, imgW, imgH);
  }
  ctx.drawImage(frame, 0, 0, canvas.width, canvas.height);
}

// Zoom In / Out / Reset
function zoomIn() {
  scale += 0.1;
  draw();
}

function zoomOut() {
  scale = Math.max(0.2, scale - 0.1);
  draw();
}

function reset() {
  scale = 1;
  posX = 0;
  posY = 0;
  draw();
}

// Download Image
function download() {
  let link = document.createElement('a');
  link.download = 'SRPFrame.png';
  link.href = canvas.toDataURL('image/png', 1.0);
  link.click();
  downloadCount++;
  updateCounters();
}

// Share Image
function shareImage() {
  canvas.toBlob(blob => {
    let file = new File([blob], 'SRPFrame.png', {type: 'image/png'});
    if (navigator.canShare && navigator.canShare({files: [file]})) {
      navigator.share({
        title: 'SRPFrame',
        files: [file],
      }).then(() => {
        shareCount++;
        updateCounters();
      });
    } else {
      alert('Sharing not supported on this browser.');
    }
  }, 'image/png', 1.0);
}

// Drag / Touch Move
canvas.addEventListener('mousedown', e => {
  isDragging = true;
  startX = e.offsetX;
  startY = e.offsetY;
});

canvas.addEventListener('mousemove', e => {
  if (isDragging) {
    posX += e.offsetX - startX;
    posY += e.offsetY - startY;
    startX = e.offsetX;
    startY = e.offsetY;
    draw();
  }
});

canvas.addEventListener('mouseup', () => isDragging = false);
canvas.addEventListener('mouseout', () => isDragging = false);

canvas.addEventListener('touchstart', e => {
  isDragging = true;
  startX = e.touches[0].clientX - canvas.offsetLeft;
  startY = e.touches[0].clientY - canvas.offsetTop;
}, false);

canvas.addEventListener('touchmove', e => {
  if (isDragging) {
    let moveX = e.touches[0].clientX - canvas.offsetLeft;
    let moveY = e.touches[0].clientY - canvas.offsetTop;
    posX += moveX - startX;
    posY += moveY - startY;
    startX = moveX;
    startY = moveY;
    draw();
  }
}, false);

canvas.addEventListener('touchend', () => isDragging = false);

function updateCounters() {
  document.getElementById('downloadCount').innerText = downloadCount;
  document.getElementById('shareCount').innerText = shareCount;
}

frame.onload = () => resizeCanvas();
