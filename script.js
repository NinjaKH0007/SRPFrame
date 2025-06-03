const upload = document.getElementById('upload');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const frame = new Image();
frame.src = 'frame.png';

const steps = document.querySelectorAll('.step');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

let currentStep = 0;
let userImage = null;

// Show the current step, hide others
function showStep(index) {
  steps.forEach((step, i) => {
    step.classList.toggle('active', i === index);
  });
  prevBtn.disabled = index === 0;
  nextBtn.disabled = (index === 0 && !userImage) || index === steps.length - 1;
}

function drawCanvas() {
  if (!userImage) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(userImage, 0, 0, canvas.width, canvas.height);
  ctx.drawImage(frame, 0, 0, canvas.width, canvas.height);
}

upload.addEventListener('change', function(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(event) {
    userImage = new Image();
    userImage.onload = function() {
      drawCanvas();
      // Enable Next button to go preview
      nextBtn.disabled = false;
    };
    userImage.src = event.target.result;
  };
  reader.readAsDataURL(file);
});

prevBtn.addEventListener('click', () => {
  if (currentStep > 0) {
    currentStep--;
    showStep(currentStep);
  }
});

nextBtn.addEventListener('click', () => {
  if (currentStep < steps.length - 1) {
    currentStep++;
    showStep(currentStep);
  }
});

document.getElementById('download').addEventListener('click', function() {
  if (!userImage) return alert('Please upload a photo first.');
  const link = document.createElement('a');
  link.download = 'SRPFrame_Photo.png';
  link.href = canvas.toDataURL();
  link.click();
});

// Initialize first step
showStep(currentStep);
