// Firebase config (unchanged)
const firebaseConfig = {
  apiKey: "AIzaSyAIIfwK6Esa1f59Sd6GspYzrZK3WqB3hiI",
  authDomain: "counting-be8f3.firebaseapp.com",
  databaseURL: "https://counting-be8f3-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "counting-be8f3",
  storageBucket: "counting-be8f3.appspot.com",
  messagingSenderId: "109310986222",
  appId: "1:109310986222:web:9fe0bfc5f982b2530a30ff"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const countRef = db.ref('count');

// Listen for count updates without overwriting on init
countRef.on('value', snapshot => {
  const count = snapshot.val();
  // If count is null (no value yet), just display 0 without setting anything in DB
  document.getElementById('count').innerText = `Downloads & Shares: ${count ?? 0}`;
});

// Increment count safely via transaction when download or share occurs
function incrementCount() {
  countRef.transaction(current => (current || 0) + 1);
}

// Modify download and share functions to call incrementCount()

function downloadImage() {
  const link = document.createElement('a');
  link.download = 'photo.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
  incrementCount();
}

function shareImage() {
  canvas.toBlob(blob => {
    const file = new File([blob], 'photo.png', { type: 'image/png' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      navigator.share({
        files: [file],
        title: 'Photo with Frame',
        text: 'Check out this framed photo!',
      }).then(() => {
        incrementCount();
      }).catch(console.error);
    } else {
      alert('Sharing not supported on this device/browser. Please download the image.');
    }
  });
}
