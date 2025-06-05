// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyAIIfwK6Esa1f59Sd6GspYzrZK3WqB3hiI",
  authDomain: "counting-be8f3.firebaseapp.com",
  databaseURL: "https://counting-be8f3-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "counting-be8f3",
  storageBucket: "counting-be8f3.appspot.com",
  messagingSenderId: "109310986222",
  appId: "1:109310986222:web:9fe0bfc5f982b2530a30ff"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

let downloadCount = 0, shareCount = 0;
db.ref("downloads").on("value", snapshot => {
  downloadCount = snapshot.val() || 0;
  document.getElementById("downloadCount").innerText = downloadCount;
});
db.ref("shares").on("value", snapshot => {
  shareCount = snapshot.val() || 0;
  document.getElementById("shareCount").innerText = shareCount;
});

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
let uploadedImage, frameImage = new Image();
let scale = 1, originX = 0, originY = 0, dragging = false, startX, startY;

frameImage.src = 'frame.png';
canvas.width = 1080;
canvas.height = 1080;

document.getElementById("upload").addEventListener("change", e => {
  const file = e.target.files[0];
  if (file) {
    uploadedImage = new Image();
    uploadedImage.onload = () => {
      reset();
      draw();
    };
    uploadedImage.src = URL.createObjectURL(file);
  }
});

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (uploadedImage) {
    ctx.save();
    ctx.translate(originX, originY);
    ctx.scale(scale, scale);
    ctx.drawImage(uploadedImage, 0, 0, canvas.width, canvas.height);
    ctx.restore();
  }
  ctx.drawImage(frameImage, 0, 0, canvas.width, canvas.height);
}

// Dragging
canvas.addEventListener("mousedown", e => {
  dragging = true;
  startX = e.offsetX;
  startY = e.offsetY;
});
canvas.addEventListener("mouseup", () => dragging = false);
canvas.addEventListener("mousemove", e => {
  if (dragging) {
    originX += e.offsetX - startX;
    originY += e.offsetY - startY;
    startX = e.offsetX;
    startY = e.offsetY;
    draw();
  }
});

// Touch Dragging & Pinch Zoom
let lastTouchDist = 0;
canvas.addEventListener("touchstart", e => {
  if (e.touches.length === 2) {
    lastTouchDist = getTouchDist(e);
  } else if (e.touches.length === 1) {
    dragging = true;
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
  }
});
canvas.addEventListener("touchmove", e => {
  e.preventDefault();
  if (e.touches.length === 2) {
    const dist = getTouchDist(e);
    const delta = dist - lastTouchDist;
    if (Math.abs(delta) > 5) {
      scale += delta * 0.002;
      draw();
    }
    lastTouchDist = dist;
  } else if (dragging && e.touches.length === 1) {
    originX += e.touches[0].clientX - startX;
    originY += e.touches[0].clientY - startY;
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    draw();
  }
}, { passive: false });
canvas.addEventListener("touchend", () => dragging = false);

function getTouchDist(e) {
  const dx = e.touches[0].clientX - e.touches[1].clientX;
  const dy = e.touches[0].clientY - e.touches[1].clientY;
  return Math.hypot(dx, dy);
}

// Zoom & Reset
function zoomIn() { scale += 0.1; draw(); }
function zoomOut() { scale = Math.max(0.1, scale - 0.1); draw(); }
function reset() {
  scale = 1;
  originX = 0;
  originY = 0;
  draw();
}

// Download
function downloadImage() {
  const link = document.createElement('a');
  link.download = 'support-cambodia.png';
  link.href = canvas.toDataURL('image/png', 1.0);
  link.click();
  db.ref("downloads").set(downloadCount + 1);
}

// Share
function shareImage() {
  canvas.toBlob(blob => {
    const file = new File([blob], "support-cambodia.png", { type: "image/png" });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      navigator.share({
        files: [file],
        title: 'ខ្ញុំគាំទ្ររាជរដ្ឋាភិបាលកម្ពុជាក្នុងការដោះបញ្ហាព្រំដែន'
      }).then(() => db.ref("shares").set(shareCount + 1));
    } else {
      alert("Your device doesn't support native sharing.");
    }
  }, "image/png", 1.0);
}
