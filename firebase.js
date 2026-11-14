
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-database.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDxM0rJB3cwCGGvbM9LS0Dht4Hr-cstMy8",
  authDomain: "hujan-project-event-organizer.firebaseapp.com",
  databaseURL: "https://hujan-project-event-organizer-default-rtdb.firebaseio.com",
  projectId: "hujan-project-event-organizer",
  storageBucket: "hujan-project-event-organizer.firebasestorage.app",
  messagingSenderId: "603062875423",
  appId: "1:603062875423:web:b4d05d73cc5b493fd72c2a",
  measurementId: "G-V6DT1QZEKP"
};

const app = initializeApp(firebaseConfig);

export const db = getDatabase(app);
export const auth = getAuth(app);
