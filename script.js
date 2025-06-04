const upload = document.getElementById("upload");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const zoomIn = document.getElementById("zoomIn");
const zoomOut = document.getElementById("zoomOut");
const reset = document.getElementById("reset");
const download = document.getElementById("download");
const shareBtn = document.getElementById("shareBtn");

let userImg = null;
let frameImg = new Image();
let scale = 1;
let posX = 0;
let posY = 0;
let isDragging = false;
let dragStartX = 0;
let dragStartY = 0;

frameImg.src = "frame.png"; // your frame image

function draw() {
  canvas.width = 1080;
  canvas.height = 1080;

  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (userImg) {
    const w = userImg.width * scale;
    const h = userImg.height * scale;
    ctx.drawImage(userImg, posX, posY, w, h);
  }

  ctx.drawImage(frameImg, 0, 0, canvas.width, canvas.height);
}

upload.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (event) => {
    userImg = new Image();
    userImg.onload = () => {
      scale = 1;
      posX = (canvas.width - userImg.width) / 2;
      posY = (canvas.height - userImg.height) / 2;
      draw();
    };
    userImg.src = event.target.result;
  };
  reader.readAsDataURL(file);
});

// Zoom in/out/reset
zoomIn.addEventListener("click", () => {
  scale += 0.1;
  draw();
});

zoomOut.addEventListener("click", () => {
  scale = Math.max(0.1, scale - 0.1);
  draw();
});

reset.addEventListener("click", () => {
  if (userImg) {
    scale = 1;
    posX = (canvas.width - userImg.width) / 2;
    posY = (canvas.height - userImg.height) / 2;
    draw();
  }
});

// Drag to move image
canvas.addEventListener("mousedown", (e) => {
  if (!userImg) return;
  isDragging = true;
  dragStartX = e.offsetX - posX;
  dragStartY = e.offsetY - posY;
});

canvas.addEventListener("mousemove", (e) => {
  if (isDragging) {
    posX = e.offsetX - dragStartX;
    posY = e.offsetY - dragStartY;
    draw();
  }
});

canvas.addEventListener("mouseup", () => { isDragging = false; });
canvas.addEventListener("mouseleave", () => { isDragging = false; });

// Touch support
canvas.addEventListener("touchstart", (e) => {
  if (!userImg) return;
  isDragging = true;
  const touch = e.touches[0];
  const rect = canvas.getBoundingClientRect();
  dragStartX = touch.clientX - rect.left - posX;
  dragStartY = touch.clientY - rect.top - posY;
  e.preventDefault();
});

canvas.addEventListener("touchmove", (e) => {
  if (isDragging) {
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    posX = touch.clientX - rect.left - dragStartX;
    posY = touch.clientY - rect.top - dragStartY;
    draw();
  }
  e.preventDefault();
});

canvas.addEventListener("touchend", () => { isDragging = false; });

// Download button
download.addEventListener("click", () => {
  canvas.toBlob((blob) => {
    const link = document.createElement("a");
    link.download = "SRPFrame.png";
    link.href = URL.createObjectURL(blob);
    link.click();
  }, "image/png", 1.0);
});

// Share button
shareBtn.addEventListener("click", () => {
  canvas.toBlob((blob) => {
    const file = new File([blob], "SRPFrame.png", { type: "image/png" });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      navigator.share({
        title: "My SRPFrame Picture",
        files: [file],
      })
      .then(() => console.log("Shared successfully"))
      .catch((err) => console.error("Share failed:", err));

    } else {
      const link = document.createElement("a");
      link.download = "SRPFrame.png";
      link.href = URL.createObjectURL(blob);
      link.click();
      alert("Downloaded — you can now share it via your gallery or apps.");
    }
  }, "image/png", 1.0);
});
