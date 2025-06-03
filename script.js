const upload = document.getElementById('upload');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let img = new Image();
let scale = 1, posX = 0, posY = 0, dragging = false, startX, startY;

const frame = new Image();
frame.src = 'frame.png';

upload.onchange = e => {
  const reader = new FileReader();
  reader.onload = function(event) {
    img.src = event.target.result;
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      draw();
    };
  };
  reader.readAsDataURL(e.target.files[0]);
};

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, posX, posY, img.width * scale, img.height * scale);
  ctx.drawImage(frame, 0, 0, canvas.width, canvas.height);
}

canvas.addEventListener('wheel', e => {
  e.preventDefault();
  scale += e.deltaY * -0.001;
  scale = Math.min(Math.max(0.1, scale), 5);
  draw();
});

canvas.addEventListener('mousedown', e => {
  dragging = true;
  startX = e.offsetX - posX;
  startY = e.offsetY - posY;
});

canvas.addEventListener('mouseup', () => dragging = false);
canvas.addEventListener('mouseout', () => dragging = false);

canvas.addEventListener('mousemove', e => {
  if (dragging) {
    posX = e.offsetX - startX;
    posY = e.offsetY - startY;
    draw();
  }
});

document.getElementById('download').onclick = () => {
  const link = document.createElement('a');
  link.download = 'SRPFrame.png';
  link.href = canvas.toDataURL();
  link.click();
  alert("Image saved! Check your Downloads album in Gallery.");
};
