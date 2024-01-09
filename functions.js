// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase,ref, get,onValue , set } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js"

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCmCcnRPWb5J8nZiPR_zWViUA3MDNBqPRE",
  authDomain: "carsniper-fe526.firebaseapp.com",
  databaseURL: "https://carsniper-fe526-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "carsniper-fe526",
  storageBucket: "carsniper-fe526.appspot.com",
  messagingSenderId: "873602962190",
  appId: "1:873602962190:web:05a721b986cf24cccb3d5f",
  measurementId: "G-9ZP4616YZS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const db = getDatabase();
const starCountRef = ref(db);
onValue(starCountRef, (snapshot) => {
  const data = snapshot.val();
  console.log(data)
});

function writeUserData(userId, name, email, imageUrl) {
  const db = getDatabase();
  set(ref(db, 'users/' + userId), {
    username: name,
    email: email,
    profile_picture : imageUrl
  });
}


writeUserData("userId", "name", "email", "imageUrl")
