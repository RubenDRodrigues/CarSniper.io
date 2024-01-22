// Import the functions you need from the SDKs you need
import { initializeApp ,limitToLast,limitToFirst,orderByKey  } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, query } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js"

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

const app = initializeApp(firebaseConfig);

const db = getDatabase();
const recentPostsRef = ref(db, "anuncios")


recentPostsRef.orderByKey().limitToFirst(10).once('name')
  .then(snapshot => {
    // Handle the snapshot (contains the first 10 items)
    snapshot.forEach(childSnapshot => {
      const key = childSnapshot.key;
      const data = childSnapshot.val();
      console.log(`Key: ${key}, Data: ${JSON.stringify(data)}`);
    });
  })
  .catch(error => {
    // Handle errors
    console.error('Error reading data:', error);
  });