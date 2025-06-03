let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");
let image = new Image();
let frame = new Image();
let scale = 1;
let posX = 0;
let posY = 0;
let isDragging = false;
let startX, startY;

canvas.width = 600;
canvas.height = 600;

// Load frame overlay
frame.src = "frame.png";
frame.onload = draw;

// Upload user photo
document.getElementById("upload").onchange = function (e) {
  let reader = new FileReader();
  reader.onload = function (event) {
    image.src = event.target.result;
    image.onload = () => {
      scale = 1;
      posX = 0;
      posY = 0;
      draw();
    };
  };
  reader.readAsDataURL(e.target.files[0]);
};

// Zoom buttons
document.getElementById("zoom-in").onclick = () => {
  scale += 0.1;
  draw();
};

document.getElementById("zoom-out").onclick = () => {
  scale -= 0.1;
  if (scale < 0.2) scale = 0.2;
  draw();
};

document.getElementById("reset").onclick = () => {
  scale = 1;
  posX = 0;
  posY = 0;
  draw();
};

// Download button
document.getElementById("download").onclick = () => {
  let link = document.createElement("a");
  link.download = "SRPFrame.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
};

// Draw function
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (image.src) {
    let imgW = image.width * scale;
    let imgH = image.height * scale;
    ctx.drawImage(image, posX, posY, imgW, imgH);
  }
  ctx.drawImage(frame, 0, 0, canvas.width, canvas.height);
}

// Drag move functionality
canvas.addEventListener("mousedown", startDrag);
canvas.addEventListener("mousemove", duringDrag);
canvas.addEventListener("mouseup", endDrag);
canvas.addEventListener("touchstart", startDrag);
canvas.addEventListener("touchmove", duringDrag);
canvas.addEventListener("touchend", endDrag);

function getEventPos(e) {
  if (e.touches) {
    return { x: e.touches[0].clientX, y: e.touches[0].clientY };
  } else {
    return { x: e.clientX, y: e.clientY };
  }
}

function startDrag(e) {
  e.preventDefault();
  isDragging = true;
  let pos = getEventPos(e);
  startX = pos.x - posX;
  startY = pos.y - posY;
}

function duringDrag(e) {
  if (!isDragging) return;
  e.preventDefault();
  let pos = getEventPos(e);
  posX = pos.x - startX;
  posY = pos.y - startY;
  draw();
}

function endDrag() {
  isDragging = false;
}
