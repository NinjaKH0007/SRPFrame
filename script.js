const upload = document.getElementById('upload');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const zoomIn = document.getElementById('zoomIn');
const zoomOut = document.getElementById('zoomOut');
const reset = document.getElementById('reset');
const download = document.getElementById('download');
const shareBtn = document.getElementById('shareBtn');

let userImg = null;
let scale = 1;
let posX = 0;
let posY = 0;

const frameImg = new Image();
frameImg.src = 'frame.png';  // your custom frame

function draw() {
  canvas.width = 1080;
  canvas.height = 1080;

  // Fill background white
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (userImg) {
    const imgW = userImg.width * scale;
    const imgH = userImg.height * scale;
    ctx.drawImage(userImg, posX, posY, imgW, imgH);
  }

  ctx.drawImage(frameImg, 0, 0, canvas.width, canvas.height);
}

upload.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (event) {
    userImg = new Image();
    userImg.onload = function () {
      scale = 1;
      posX = (canvas.width - userImg.width) / 2;
      posY = (canvas.height - userImg.height) / 2;
      draw();
    };
    userImg.src = event.target.result;
  };
  reader.readAsDataURL(file);
});

zoomIn.addEventListener('click', () => {
  scale += 0.1;
  draw();
});

zoomOut.addEventListener('click', () => {
  scale -= 0.1;
  if (scale < 0.1) scale = 0.1;
  draw();
});

reset.addEventListener('click', () => {
  if (userImg) {
    scale = 1;
    posX = (canvas.width - userImg.width) / 2;
    posY = (canvas.height - userImg.height) / 2;
    draw();
  }
});

download.addEventListener('click', () => {
  canvas.toBlob((blob) => {
    const link = document.createElement('a');
    link.download = 'SRPFrame.png';
    link.href = URL.createObjectURL(blob);
    link.click();
  }, 'image/png', 1.0);
});

shareBtn.addEventListener('click', () => {
  canvas.toBlob((blob) => {
    const file = new File([blob], 'SRPFrame.png', { type: 'image/png' });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      navigator.share({
        title: 'My SRPFrame Pic',
        files: [file]
      })
      .then(() => console.log('Shared successfully'))
      .catch((err) => console.error('Share failed:', err));

    } else {
      const link = document.createElement('a');
      link.download = 'SRPFrame.png';
      link.href = URL.createObjectURL(blob);
      link.click();
      alert("Downloaded! You can now share it via your gallery or social apps.");
    }
  }, 'image/png', 1.0);
});
