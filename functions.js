// Import the functions you need from the SDKs you need
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.1.3/firebase-app.js';
import { getDatabase, ref, limitToFirst, startAt, on, off } from 'https://www.gstatic.com/firebasejs/9.1.3/firebase-database.js';

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
const database = getDatabase(app);

const itemsPerPage = 10;
let currentPage = 1;
let unsubscribe;

function fetchData(page) {
  const dataList = document.getElementById('data-list');
  dataList.innerHTML = ''; // Clear previous data

  const startAtKey = page === 1 ? null : page * itemsPerPage;

  const query = ref(database, 'anuncios');
  const paginatedQuery = startAt(query, startAtKey);
  const limitedQuery = limitToFirst(paginatedQuery, itemsPerPage);

  unsubscribe = on(limitedQuery, 'value', (snapshot) => {
    snapshot.forEach((childSnapshot) => {
      const item = childSnapshot.val();
      const li = document.createElement('li');
      li.textContent = item.name; // Assuming 'name' is a property in your data
      dataList.appendChild(li);
    });
  });
}

function initPagination() {
  const paginationContainer = document.getElementById('pagination-container');
  const nextBtn = document.createElement('button');
  nextBtn.textContent = 'Next';
  nextBtn.addEventListener('click', () => {
    currentPage++;
    fetchData(currentPage);
  });
  paginationContainer.appendChild(nextBtn);
}

document.addEventListener('DOMContentLoaded', () => {
  fetchData(currentPage);
  initPagination();
});

// Optional: Clean up the listener when the page is unloaded
window.addEventListener('beforeunload', () => {
  if (unsubscribe) {
    off(unsubscribe);
  }
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
