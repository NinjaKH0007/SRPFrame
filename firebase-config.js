// Firebase config module
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, get, increment, update, onValue } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyAIIfwK6Esa1f59Sd6GspYzrZK3WqB3hiI",
  authDomain: "counting-be8f3.firebaseapp.com",
  databaseURL: "https://counting-be8f3-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "counting-be8f3",
  storageBucket: "counting-be8f3.appspot.com",
  messagingSenderId: "109310986222",
  appId: "1:109310986222:web:9fe0bfc5f982b2530a30ff",
  measurementId: "G-QTC45PN8B6"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export { db, ref, get, increment, update, onValue };
