const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const upload = document.getElementById("upload");
const frame = new Image();
frame.src = "frame.png";

let img = new Image();
let imgX = 0, imgY = 0, scale = 1;
let dragging = false, startX, startY;

// Initial draw
frame.onload = () => {
  ctx.drawImage(frame, 0, 0, 1080, 1080);
};

// Upload image
upload.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    img.src = reader.result;
    img.onload = () => {
      imgX = 0;
      imgY = 0;
      scale = 1;
      drawCanvas();
    };
  };
  reader.readAsDataURL(file);
});

// Draw everything
function drawCanvas() {
  ctx.clearRect(0, 0, 1080, 1080);
  if (img.src) {
    const imgW = img.width * scale;
    const imgH = img.height * scale;
    ctx.drawImage(img, imgX, imgY, imgW, imgH);
  }
  ctx.drawImage(frame, 0, 0, 1080, 1080);
}

// Dragging
canvas.addEventListener("mousedown", startDrag);
canvas.addEventListener("mousemove", drag);
canvas.addEventListener("mouseup", stopDrag);
canvas.addEventListener("touchstart", startDrag);
canvas.addEventListener("touchmove", drag);
canvas.addEventListener("touchend", stopDrag);

function startDrag(e) {
  dragging = true;
  startX = e.clientX || e.touches[0].clientX;
  startY = e.clientY || e.touches[0].clientY;
}

function drag(e) {
  if (!dragging) return;
  const x = e.clientX || e.touches[0].clientX;
  const y = e.clientY || e.touches[0].clientY;
  imgX += x - startX;
  imgY += y - startY;
  startX = x;
  startY = y;
  drawCanvas();
}

function stopDrag() {
  dragging = false;
}

// Zoom functions
function zoomIn() {
  scale *= 1.1;
  drawCanvas();
}

function zoomOut() {
  scale /= 1.1;
  drawCanvas();
}

function resetImage() {
  imgX = 0;
  imgY = 0;
  scale = 1;
  drawCanvas();
}

// Download image
function downloadImage() {
  const link = document.createElement("a");
  link.download = "srpframe.png";
  link.href = canvas.toDataURL("image/png");
  link.click();

  let count = parseInt(localStorage.getItem("downloads")) || 0;
  count++;
  localStorage.setItem("downloads", count);
  document.getElementById("downloadCount").innerText = count;
}

// Share image
function shareImage() {
  canvas.toBlob((blob) => {
    const file = new File([blob], "srpframe.png", { type: "image/png" });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      navigator.share({
        files: [file],
        title: "My SRPFrame Photo",
        text: "Check out my frame image!"
      }).then(() => {
        let count = parseInt(localStorage.getItem("shares")) || 0;
        count++;
        localStorage.setItem("shares", count);
        document.getElementById("shareCount").innerText = count;
      }).catch(console.error);
    } else {
      alert("Sharing not supported on this device/browser.");
    }
  }, "image/png");
}

// Load saved counts
window.onload = () => {
  document.getElementById("downloadCount").innerText = localStorage.getItem("downloads") || 0;
  document.getElementById("shareCount").innerText = localStorage.getItem("shares") || 0;
};
