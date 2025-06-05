// Firebase config & init (compat)
const firebaseConfig = {
  apiKey: "AIzaSyAIIfwK6Esa1f59Sd6GspYzrZK3WqB3hiI",
  authDomain: "counting-be8f3.firebaseapp.com",
  databaseURL: "https://counting-be8f3-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "counting-be8f3",
  storageBucket: "counting-be8f3.appspot.com",
  messagingSenderId: "109310986222",
  appId: "1:109310986222:web:9fe0bfc5f982b2530a30ff",
  measurementId: "G-QTC45PN8B6"
};

firebase.initializeApp(firebaseConfig);
const database = firebase.database();

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const frameImg = new Image();
frameImg.src = "frame.png"; // Your new frame here

let userImg = new Image();
let userImgLoaded = false;

let scale = 1;
let minScale = 0.4;
let maxScale = 4;
let offsetX = 0;
let offsetY = 0;
let isDragging = false;
let dragStart = { x: 0, y: 0 };

const downloadCountElem = document.getElementById("downloadCount");
const shareCountElem = document.getElementById("shareCount");

const uploadInput = document.getElementById("upload");
const zoomInBtn = document.getElementById("zoomIn");
const zoomOutBtn = document.getElementById("zoomOut");
const resetBtn = document.getElementById("reset");
const downloadBtn = document.getElementById("download");
const shareBtn = document.getElementById("share");

function resizeCanvas() {
  const container = document.querySelector(".frame-wrapper");
  canvas.width = 1080; // fixed canvas resolution for quality
  canvas.height = 1080;

  // To display responsively on page:
  canvas.style.width = "100%";
  canvas.style.height = "auto";
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (userImgLoaded) {
    const iw = userImg.width;
    const ih = userImg.height;

    // Calculate scaled image size
    const scaledW = iw * scale;
    const scaledH = ih * scale;

    // Draw user image with offset
    ctx.drawImage(userImg, offsetX, offsetY, scaledW, scaledH);
  }

  // Draw frame on top at full canvas size
  ctx.drawImage(frameImg, 0, 0, canvas.width, canvas.height);
}

// Event handlers
uploadInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (event) {
    userImg.onload = () => {
      userImgLoaded = true;
      // Reset zoom and offset for new image
      scale = 1;
      offsetX = (canvas.width - userImg.width) / 2;
      offsetY = (canvas.height - userImg.height) / 2;
      draw();
    };
    userImg.src = event.target.result;
  };
  reader.readAsDataURL(file);
});

canvas.addEventListener("mousedown", (e) => {
  isDragging = true;
  dragStart.x = e.clientX - offsetX;
  dragStart.y = e.clientY - offsetY;
});

canvas.addEventListener("mouseup", () => {
  isDragging = false;
});

canvas.addEventListener("mouseout", () => {
  isDragging = false;
});

canvas.addEventListener("mousemove", (e) => {
  if (isDragging) {
    offsetX = e.clientX - dragStart.x;
    offsetY = e.clientY - dragStart.y;
    draw();
  }
});

// Touch support for drag
canvas.addEventListener("touchstart", (e) => {
  if (e.touches.length === 1) {
    isDragging = true;
    const touch = e.touches[0];
    dragStart.x = touch.clientX - offsetX;
    dragStart.y = touch.clientY - offsetY;
  }
});

canvas.addEventListener("touchmove", (e) => {
  if (isDragging && e.touches.length === 1) {
    const touch = e.touches[0];
    offsetX = touch.clientX - dragStart.x;
    offsetY = touch.clientY - dragStart.y;
    draw();
    e.preventDefault();
  }
});

canvas.addEventListener("touchend", () => {
  isDragging = false;
});

// Pinch zoom support
let lastDist = null;
canvas.addEventListener("touchmove", (e) => {
  if (e.touches.length === 2) {
    const touch1 = e.touches[0];
    const touch2 = e.touches[1];
    const dist = Math.hypot(
      touch2.clientX - touch1.clientX,
      touch2.clientY - touch1.clientY
    );
    if (lastDist !== null) {
      let delta = dist - lastDist;
      scale += delta * 0.005;
      scale = Math.min(maxScale, Math.max(minScale, scale));
      draw();
    }
    lastDist = dist;
    e.preventDefault();
  }
});

canvas.addEventListener("touchend", (e) => {
  if (e.touches.length < 2) {
    lastDist = null;
  }
});

// Zoom buttons
zoomInBtn.addEventListener("click", () => {
  scale *= 1.15;
  if (scale > maxScale) scale = maxScale;
  draw();
});
zoomOutBtn.addEventListener("click", () => {
  scale /= 1.15;
  if (scale < minScale) scale = minScale;
  draw();
});
resetBtn.addEventListener("click", () => {
  scale = 1;
  offsetX = (canvas.width - userImg.width) / 2;
  offsetY = (canvas.height - userImg.height) / 2;
  draw();
});

// Download button - increments Firebase counter and triggers download
downloadBtn.addEventListener("click", () => {
  incrementCount("downloads");
  const link = document.createElement("a");
  link.download = "photo_with_frame.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
});

// Share button - increments Firebase counter (you can add share logic here)
shareBtn.addEventListener("click", () => {
  incrementCount("shares");
  alert("Thank you for sharing!");
});

// Firebase counting functions with transaction to avoid overwrite
function incrementCount(type) {
  const ref = database.ref(`counts/${type}`);
  ref.transaction((current) => (current || 0) + 1);
}

// On load: read counts once and update UI, no overwrite
function loadCounts() {
  database.ref("counts").once("value", (snapshot) => {
    const counts = snapshot.val() || {};
    downloadCountElem.textContent = counts.downloads || 0;
    shareCountElem.textContent = counts.shares || 0;
  });
}

// Init
window.onload = () => {
  resizeCanvas();
  loadCounts();

  // Center offsets if user image not loaded
  offsetX = canvas.width / 2;
  offsetY = canvas.height / 2;

  frameImg.onload = () => {
    draw();
  };
};
