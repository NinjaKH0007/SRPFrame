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

canvas.width = 1080;
canvas.height = 1080;

frameImg.src = "frame.png";
frameImg.onload = draw;

function draw() {
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

// Mouse drag
canvas.addEventListener("mousedown", (e) => {
  if (!userImg) return;
  isDragging = true;
  const scaleFactor = canvas.width / canvas.getBoundingClientRect().width;
  dragStartX = (e.clientX - canvas.getBoundingClientRect().left) * scaleFactor - posX;
  dragStartY = (e.clientY - canvas.getBoundingClientRect().top) * scaleFactor - posY;
});

canvas.addEventListener("mousemove", (e) => {
  if (isDragging) {
    const scaleFactor = canvas.width / canvas.getBoundingClientRect().width;
    posX = (e.clientX - canvas.getBoundingClientRect().left) * scaleFactor - dragStartX;
    posY = (e.clientY - canvas.getBoundingClientRect().top) * scaleFactor - dragStartY;
    draw();
  }
});

canvas.addEventListener("mouseup", () => { isDragging = false; });
canvas.addEventListener("mouseleave", () => { isDragging = false; });

// Touch drag
canvas.addEventListener("touchstart", (e) => {
  if (!userImg) return;
  isDragging = true;
  const touch = e.touches[0];
  const scaleFactor = canvas.width / canvas.getBoundingClientRect().width;
  dragStartX = (touch.clientX - canvas.getBoundingClientRect().left) * scaleFactor - posX;
  dragStartY = (touch.clientY - canvas.getBoundingClientRect().top) * scaleFactor - posY;
  e.preventDefault();
});

canvas.addEventListener("touchmove", (e) => {
  if (isDragging) {
    const touch = e.touches[0];
    const scaleFactor = canvas.width / canvas.getBoundingClientRect().width;
    posX = (touch.clientX - canvas.getBoundingClientRect().left) * scaleFactor - dragStartX;
    posY = (touch.clientY - canvas.getBoundingClientRect().top) * scaleFactor - dragStartY;
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
        title: "My SRPFrame",
        files: [file],
      })
      .then(() => console.log("Shared"))
      .catch((err) => console.error("Share failed:", err));
    } else {
      const link = document.createElement("a");
      link.download = "SRPFrame.png";
      link.href = URL.createObjectURL(blob);
      link.click();
      alert("Downloaded — you can now share it manually.");
    }
  }, "image/png", 1.0);
});
