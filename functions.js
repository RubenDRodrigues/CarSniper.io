// Import the functions you need from the SDKs you need
import { initializeApp  } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase  } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js"

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
const database = firebase.database();
const itemsRef = database.ref('anuncios');
// Initial page load (first 10 items)
let pageSize = 10;
let lastItemKey = null;


function loadPage() {
  let query = itemsRef.orderByKey();

  if (lastItemKey) {
    // If lastItemKey is set, start the query after the last item
    query = query.startAt(lastItemKey).limitToFirst(pageSize + 1);
  } else {
    // Initial page load
    query = query.limitToFirst(pageSize);
  }

  query.once('value')
    .then(snapshot => {
      const items = snapshot.val();
      const keys = Object.keys(items);

      if (keys.length > 0) {
        // Remove the extra item used for pagination if it exists
        if (keys.length > pageSize) {
          keys.pop();
        }

        // Update lastItemKey for the next page
        lastItemKey = keys[keys.length - 1];

        // Process the items as needed
        keys.forEach(key => {
          const item = items[key];
          console.log(item);
        });
      } else {
        console.log('No more items');
      }
    })
    .catch(error => {
      console.error('Error loading page:', error);
    });
}

// Example usage:
loadPage();
// You can call loadPage() again to load the next page
