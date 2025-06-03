let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");
canvas.width = 800;
canvas.height = 800;

let userImage = new Image();
let frameImage = new Image();
frameImage.src = "frame.png"; // your overlay frame image (transparent PNG)

let scale = 1;
let posX = 0;
let posY = 0;
let dragging = false;
let startX, startY;

document.getElementById("upload").addEventListener("change", function(e) {
  let reader = new FileReader();
  reader.onload = function(event) {
    userImage.src = event.target.result;
    userImage.onload = () => drawCanvas();
  };
  reader.readAsDataURL(e.target.files[0]);
});

// Zoom & Pan handlers
canvas.addEventListener("mousedown", (e) => {
  dragging = true;
  startX = e.offsetX;
  startY = e.offsetY;
});

canvas.addEventListener("mouseup", () => dragging = false);

canvas.addEventListener("mousemove", (e) => {
  if (dragging) {
    posX += (e.offsetX - startX);
    posY += (e.offsetY - startY);
    startX = e.offsetX;
    startY = e.offsetY;
    drawCanvas();
  }
});

// Touch events for mobile
canvas.addEventListener("touchstart", (e) => {
  e.preventDefault();
  dragging = true;
  let touch = e.touches[0];
  startX = touch.clientX - canvas.getBoundingClientRect().left;
  startY = touch.clientY - canvas.getBoundingClientRect().top;
});

canvas.addEventListener("touchend", () => dragging = false);

canvas.addEventListener("touchmove", (e) => {
  if (dragging) {
    let touch = e.touches[0];
    let x = touch.clientX - canvas.getBoundingClientRect().left;
    let y = touch.clientY - canvas.getBoundingClientRect().top;
    posX += (x - startX);
    posY += (y - startY);
    startX = x;
    startY = y;
    drawCanvas();
  }
});

// Zoom controls with mouse wheel or pinch zoom
canvas.addEventListener("wheel", (e) => {
  e.preventDefault();
  scale += e.deltaY * -0.001;
  scale = Math.min(Math.max(0.5, scale), 3);
  drawCanvas();
});

function drawCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (userImage.src) {
    let imgW = userImage.width * scale;
    let imgH = userImage.height * scale;
    ctx.drawImage(userImage, posX, posY, imgW, imgH);
  }
  ctx.drawImage(frameImage, 0, 0, canvas.width, canvas.height);
}

function downloadImage() {
  let link = document.createElement("a");
  link.download = "SRPFrame.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
}

function shareImage() {
  if (!navigator.canShare) {
    alert("Share not supported — use Download button instead.");
    return;
  }
  canvas.toBlob(blob => {
    const file = new File([blob], "SRPFrame.png", { type: "image/png" });
    navigator.share({
      files: [file],
      title: "SRPFrame Photo",
      text: "Here's my SRPFrame pic!"
    });
  });
}
