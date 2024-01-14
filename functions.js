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

firebase.initializeApp(firebaseConfig);
const database = firebase.database();

const itemsPerPage = 10;
let currentPage = 1;

function fetchData(page) {
  const dataList = document.getElementById('data-list');

  // Start at the index of the last item on the previous page
  const startAtKey = page === 1 ? null : page * itemsPerPage;

  // Retrieve data from the database
  database.ref('your_data_path')
    .orderByKey()
    .startAt(String(startAtKey))
    .limitToFirst(itemsPerPage)
    .once('value')
    .then(snapshot => {
      snapshot.forEach(childSnapshot => {
        const item = childSnapshot.val();
        const li = document.createElement('li');
        li.textContent = item.name; // Assuming 'name' is a property in your data
        dataList.appendChild(li);
      });
    });
}

function loadMore() {
  currentPage++;
  fetchData(currentPage);
}

document.addEventListener('DOMContentLoaded', () => {
  fetchData(currentPage);
});