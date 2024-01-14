// Import the functions you need from the SDKs you need
import { firebase } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { orderByKey,limitToFirst, get,onValue , set } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js"

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
firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const resultList = document.getElementById('resultList');
let lastKey = null;

function loadData(limit) {
    let query = database.ref('anuncios').orderByKey().limitToFirst(limit);
    if (lastKey) {
        query = query.startAt(lastKey);
    }
    
    return query.once('value');
}

function loadMore() {
    loadData(5).then(snapshot => {
        snapshot.forEach(childSnapshot => {
            const data = childSnapshot.val();
            const listItem = document.createElement('li');
            listItem.textContent = data.yourProperty;
            resultList.appendChild(listItem);
        });

        // Update lastKey for the next pagination
        const lastItem = resultList.lastChild;
        lastKey = lastItem ? lastItem.getAttribute('name') : null;
    });
}

        // Load initial data
        loadMore();