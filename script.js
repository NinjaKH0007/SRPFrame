const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// Set canvas to fixed size for better image quality (adjust as needed)
canvas.width = 800;
canvas.height = 800;

let userImage = new Image();
let frameImage = new Image();
frameImage.src = "frame.png"; // Your transparent PNG frame overlay

// Initial transform variables
let scale = 1;
let posX = 0;
let posY = 0;

let dragging = false;
let startX, startY;

// Handle user image upload
document.getElementById("upload").addEventListener("change", (e) => {
  const reader = new FileReader();
  reader.onload = (event) => {
    userImage.src = event.target.result;
    userImage.onload = () => {
      // Reset position & scale on new image load
      scale = 1;
      posX = (canvas.width - userImage.width) / 2;
      posY = (canvas.height - userImage.height) / 2;
      drawCanvas();
    };
  };
  reader.readAsDataURL(e.target.files[0]);
});

// Mouse events for drag to move
canvas.addEventListener("mousedown", (e) => {
  dragging = true;
  startX = e.offsetX;
  startY = e.offsetY;
});

canvas.addEventListener("mouseup", () => {
  dragging = false;
});

canvas.addEventListener("mouseleave", () => {
  dragging = false;
});

canvas.addEventListener("mousemove", (e) => {
  if (dragging) {
    posX += e.offsetX - startX;
    posY += e.offsetY - startY;
    startX = e.offsetX;
    startY = e.offsetY;
    drawCanvas();
  }
});

// Touch events for mobile dragging
canvas.addEventListener("touchstart", (e) => {
  e.preventDefault();
  if (e.touches.length === 1) {
    dragging = true;
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    startX = touch.clientX - rect.left;
    startY = touch.clientY - rect.top;
  }
});

canvas.addEventListener("touchend", (e) => {
  e.preventDefault();
  dragging = false;
});

canvas.addEventListener("touchmove", (e) => {
  e.preventDefault();
  if (dragging && e.touches.length === 1) {
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    posX += x - startX;
    posY += y - startY;
    startX = x;
    startY = y;
    drawCanvas();
  }
});

// Zoom with mouse wheel
canvas.addEventListener("wheel", (e) => {
  e.preventDefault();
  const zoomAmount = -e.deltaY * 0.001;
  let newScale = scale + zoomAmount;

  // Clamp scale between 0.5 and 3
  newScale = Math.min(Math.max(0.5, newScale), 3);

  // To zoom relative to mouse position:
  const rect = canvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;

  // Calculate offset to keep zoom focused on cursor
  posX -= (mx / scale - mx / newScale);
  posY -= (my / scale - my / newScale);

  scale = newScale;
  drawCanvas();
});

// Draw the canvas with user image and frame overlay
function drawCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (userImage.src) {
    const imgW = userImage.width * scale;
    const imgH = userImage.height * scale;
    ctx.drawImage(userImage, posX, posY, imgW, imgH);
  }

  if (frameImage.complete) {
    ctx.drawImage(frameImage, 0, 0, canvas.width, canvas.height);
  }
}

// Download canvas image
function downloadImage() {
  const link = document.createElement("a");
  link.download = "SRPFrame.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
}

// Share image using Web Share API (mobile browsers support)
function shareImage() {
  if (!navigator.canShare || !navigator.canShare({ files: [] })) {
    alert("Your browser does not support sharing files. Please use the Download button.");
    return;
  }
  canvas.toBlob((blob) => {
    const file = new File([blob], "SRPFrame.png", { type: "image/png" });
    navigator.share({
      files: [file],
      title: "SRPFrame Photo",
      text: "Check out my SRPFrame photo!",
    }).catch((error) => {
      console.error("Sharing failed", error);
    });
  });
}

// Initial draw to show just the frame (if needed)
frameImage.onload = () => {
  drawCanvas();
};
