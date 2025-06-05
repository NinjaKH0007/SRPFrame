import { db, ref, get, increment, update, onValue } from "./firebase-config.js";

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const imageLoader = document.getElementById('imageLoader');

let img = new Image();
let frame = new Image();
let scale = 1;
let posX = 0;
let posY = 0;
let dragging = false;
let startX, startY;

canvas.width = 1080;
canvas.height = 1080;

// Load frame
frame.src = 'frame.png';
frame.onload = () => draw();

imageLoader.addEventListener('change', e => {
  const reader = new FileReader();
  reader.onload = event => {
    img = new Image();
    img.onload = () => {
      scale = 1;
      posX = 0;
      posY = 0;
      draw();
    }
    img.src = event.target.result;
  }
  reader.readAsDataURL(e.target.files[0]);
});

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (img.src) {
    const iw = img.width * scale;
    const ih = img.height * scale;
    ctx.drawImage(img, posX, posY, iw, ih);
  }
  ctx.drawImage(frame, 0, 0, canvas.width, canvas.height);
}

canvas.addEventListener('mousedown', e => {
  dragging = true;
  startX = e.offsetX - posX;
  startY = e.offsetY - posY;
});

canvas.addEventListener('mouseup', () => dragging = false);
canvas.addEventListener('mouseleave', () => dragging = false);

canvas.addEventListener('mousemove', e => {
  if (dragging) {
    posX = e.offsetX - startX;
    posY = e.offsetY - startY;
    draw();
  }
});

canvas.addEventListener('touchstart', e => {
  e.preventDefault();
  dragging = true;
  const rect = canvas.getBoundingClientRect();
  startX = e.touches[0].clientX - rect.left - posX;
  startY = e.touches[0].clientY - rect.top - posY;
});

canvas.addEventListener('touchend', () => dragging = false);
canvas.addEventListener('touchmove', e => {
  e.preventDefault();
  if (dragging) {
    const rect = canvas.getBoundingClientRect();
    posX = e.touches[0].clientX - rect.left - startX;
    posY = e.touches[0].clientY - rect.top - startY;
    draw();
  }
});

document.getElementById('zoomIn').onclick = () => { scale *= 1.1; draw(); }
document.getElementById('zoomOut').onclick = () => { scale *= 0.9; draw(); }
document.getElementById('reset').onclick = () => {
  scale = 1; posX = 0; posY = 0; draw();
}

document.getElementById('downloadBtn').onclick = () => {
  canvas.toBlob(blob => {
    const link = document.createElement('a');
    link.download = 'SRPFrame.png';
    link.href = URL.createObjectURL(blob);
    link.click();
    incrementCounter('downloads');
  }, 'image/png', 1.0);
};

document.getElementById('shareBtn').onclick = async () => {
  canvas.toBlob(async blob => {
    const file = new File([blob], "SRPFrame.png", { type: "image/png" });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        files: [file],
        title: 'SRPFrame',
        text: 'Check out my frame!'
      });
      incrementCounter('shares');
    } else {
      alert("Your device doesn't support native sharing.");
    }
  }, 'image/png', 1.0);
};

// Fetch and display counters
function setupCounters() {
  onValue(ref(db, 'counts/'), snapshot => {
    const data = snapshot.val() || {};
    document.getElementById('downloadCount').textContent = data.downloads || 0;
    document.getElementById('shareCount').textContent = data.shares || 0;
  });
}
setupCounters();

// Increment a counter
function incrementCounter(counter) {
  const counterRef = ref(db, 'counts/' + counter);
  get(counterRef).then(snapshot => {
    const value = snapshot.exists() ? snapshot.val() + 1 : 1;
    update(ref(db, 'counts/'), { [counter]: value });
  });
}
