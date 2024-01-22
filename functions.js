// Import the functions you need from the SDKs you need
import { initializeApp   } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, set,orderByChild, ref, limitToLast,limitToFirst,orderByKey,startAt,onValue  } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js"
import { collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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
const itemsPerPage = 10
const currentPage = 1

// Create a new post reference with an auto-generated id
const db = getDatabase();
const topUserPostsRef = query(ref(db, 'anuncios'),startAt(10*(currentPage-1)));
console.log(topUserPostsRef)

onValue(topUserPostsRef, (snapshot) => {
  snapshot.forEach((childSnapshot) => {
    const childKey = childSnapshot.key;
    const childData = childSnapshot.val();
    console.log(childData["link"])
    const link_image=childData["link_images"]
    const text=childData["name"]
    const link=childData["link"]
    createCarAd(link_image,text,link)
    
  });
}, {
  onlyOnce: true
});

function createCarAd(link_image,text){

  const section = document.getElementById("pageSection");
  const mainDiv = document.createElement("div");
  mainDiv.classList.add("product")
  section.appendChild(mainDiv)

  const Title = document.createElement("h2");
  const node = document.createTextNode(text);
  Title.appendChild(node);
  mainDiv.appendChild(Title);

  const image = document.createElement("img");
  image.src = link_image;
  mainDiv.appendChild(image)

  const button = document.createElement("button");
  button.setAttribute('content', 'Ver anuncio');
  button.onclick = function () {
    location.href = link;
  };
  mainDiv.appendChild(button)



}