const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = 800;
canvas.height = 800;

let userImage = new Image();
let frameImage = new Image();
frameImage.src = "frame.png";

let scale = 1;
let posX = 0;
let posY = 0;

let dragging = false;
let startX, startY;

// Load user image
document.getElementById("upload").addEventListener("change", (e) => {
  const reader = new FileReader();
  reader.onload = (event) => {
    userImage.src = event.target.result;
    userImage.onload = () => {
      scale = 1;
      posX = (canvas.width - userImage.width) / 2;
      posY = (canvas.height - userImage.height) / 2;
      drawCanvas();
    };
  };
  reader.readAsDataURL(e.target.files[0]);
});

// Drag handlers - mouse
canvas.addEventListener("mousedown", (e) => {
  dragging = true;
  startX = e.offsetX;
  startY = e.offsetY;
});
canvas.addEventListener("mouseup", () => (dragging = false));
canvas.addEventListener("mouseleave", () => (dragging = false));
canvas.addEventListener("mousemove", (e) => {
  if (dragging) {
    posX += e.offsetX - startX;
    posY += e.offsetY - startY;
    startX = e.offsetX;
    startY = e.offsetY;
    drawCanvas();
  }
});

// Drag handlers - touch
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

// Zoom with mouse wheel (keep from previous)
canvas.addEventListener("wheel", (e) => {
  e.preventDefault();
  const wheel = e.deltaY < 0 ? 0.1 : -0.1;
  setScale(scale + wheel, e.offsetX, e.offsetY);
});

// Zoom in button
function zoomIn() {
  setScale(scale + 0.1, canvas.width / 2, canvas.height / 2);
}
// Zoom out button
function zoomOut() {
  setScale(scale - 0.1, canvas.width / 2, canvas.height / 2);
}
// Reset button
function resetTransform() {
  scale = 1;
  if (userImage.src) {
    posX = (canvas.width - userImage.width) / 2;
    posY = (canvas.height - userImage.height) / 2;
  } else {
    posX = 0;
    posY = 0;
  }
  drawCanvas();
}

// Set scale with clamping, adjust posX and posY to zoom at mouse/touch position
function setScale(newScale, centerX, centerY) {
  newScale = Math.min(Math.max(0.5, newScale), 3);

  // Calculate image offset for zoom effect at pointer
  const prevScale = scale;
  const scaleRatio = newScale / prevScale;

  posX = centerX - scaleRatio * (centerX - posX);
  posY = centerY - scaleRatio * (centerY - posY);

  scale = newScale;
  drawCanvas();
}

// Draw function
function drawCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (userImage.src) {
    const w = userImage.width * scale;
    const h = userImage.height * scale;
    ctx.drawImage(userImage, posX, posY, w, h);
  }

  if (frameImage.complete) {
    ctx.drawImage(frameImage, 0, 0, canvas.width, canvas.height);
  }
}

// Download image (default download behavior)
function downloadImage() {
  const link = document.createElement("a");
  link.download = "SRPFrame.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
}

// Share function: tries to save to gallery on mobile and also social sharing
async function shareImage() {
  // For mobile: try saving image to gallery using the File System Access or fallback to download
  if (navigator.userAgent.match(/Android/i) || navigator.userAgent.match(/iPhone|iPad|iPod/i)) {
    try {
      // Try the Web Share API with files support
      if (navigator.canShare && navigator.canShare({ files: [] })) {
        canvas.toBlob(async (blob) => {
          const file = new File([blob], "SRPFrame.png", { type: "image/png" });
          try {
            await navigator.share({
              files: [file],
              title: "SRPFrame Photo",
              text: "Check out my SRPFrame photo!",
            });
          } catch (err) {
            alert("Sharing canceled or failed. The image will be downloaded instead.");
            downloadImage();
          }
        });
      } else {
        // Fallback: trigger download to let user save manually (usually ends up in gallery)
        alert("Your browser does not support sharing files directly. The image will be downloaded. Please save it to your gallery.");
        downloadImage();
      }
    } catch (e) {
      alert("Sharing failed: " + e.message);
      downloadImage();
    }
  } else {
    // Desktop fallback: just download and notify
    alert("Sharing is supported only on mobile devices. The image will be downloaded.");
    downloadImage();
  }
}

// Initial draw with just the frame
frameImage.onload = () => {
  drawCanvas();
};
