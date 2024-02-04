// Import the functions you need from the SDKs you need
import { initializeApp   } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, set,orderByChild, ref, limitToLast,limitToFirst,orderByKey,startAt,onValue ,endAt,orderByValue,equalTo,query } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js"


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
var itemsPerPage = 10
var currentPage = 1


document.getElementById("submitId").onclick = searchQuery;

// Create a new post reference with an auto-generated id
const db = getDatabase();
const firstQuery = query(ref(db, 'anuncios'),orderByValue() ,startAt(itemsPerPage*(currentPage-1)), limitToFirst(itemsPerPage)  );

onValue(firstQuery, (snapshot) => {
  snapshot.forEach((childSnapshot) => {
    const childKey = childSnapshot.key;
    const childData = childSnapshot.val();
    console.log(childData)
    createCarAd(childData)
    
  });
}, {
  onlyOnce: true
});

function searchQuery(){
  // Create a new post reference with an auto-generated id
  const elements = document.getElementsByClassName("container");
  while (elements.length > 0) elements[0].remove();

  const queryName = document.getElementById("searchBarId").value
  const newQueryRef =query(ref(db, 'anuncios')) //,orderByChild("name"),startAt(queryName) ,endAt(queryName+"\uf8ff"));
  console.log(newQueryRef)

  onValue(newQueryRef, (snapshot) => {
    snapshot.forEach((childSnapshot) => {
      const childKey = childSnapshot.key;
      const childData = childSnapshot.val();
      const link_image=childData["link_images"]
      const text=childData["name"]
      const link=childData["link"]
      console.log(text)
      console.log(queryName)
      console.log(text.includes(queryName))


      if ((text.toUpperCase().includes(queryName.toUpperCase()))){
        createCarAd(link_image,text,link)

      }
      
    });
  });

}

function goToPage(page){
   currentPage = page
   var nextQuery = query(ref(db, 'anuncios'),orderByValue() ,startAt(itemsPerPage*(currentPage-1)), limitToFirst(itemsPerPage)  );

   console.log(nextQuery)
 
   onValue(nextQuery, (snapshot) => {
     snapshot.forEach((childSnapshot) => {
       const childKey = childSnapshot.key;
       const childData = childSnapshot.val();
       const link_image=childData["link_images"]
       const text=childData["name"]
       const link=childData["link"]
       console.log(text)
       console.log(queryName)
       console.log(text.includes(queryName))
 
 
       if ((text.toUpperCase().includes(queryName.toUpperCase()))){
         createCarAd(link_image,text,link)
 
       }
       
     });
   });
 
}


function createCarAd(childData){


  const link_image=childData["link_images"]
  const text=childData["name"]
  const link=childData["link"]
  const price=childData["preco"]
  const quilometer=childData["quilometros"]
  const location=childData["localizacao"]




  

  const section = document.getElementById("pageSection");
  const mainDiv = document.createElement("div");
  mainDiv.classList.add("container")
  section.appendChild(mainDiv)

  const image = document.createElement("img");
  image.src = link_image;
  mainDiv.appendChild(image)

  const container__text = document.createElement("div");
  container__text.classList.add("container__text")
  mainDiv.appendChild(container__text)

  const Title = document.createElement("h1");
  const node = document.createTextNode(text);
  Title.appendChild(node);
  container__text.appendChild(Title);

  try {
    const specs =childData["Carateristicas"]
    const words = specs[0].split('\n');

    for (let i = 0; i < words.length; i++){
      var descriptionWord = words[i] ;

      const descriptionButton = document.createElement("button");
      descriptionButton.classList.add("button_description")
      descriptionButton.appendChild(document.createTextNode(descriptionWord))
      container__text.appendChild(descriptionButton)

    }
    
  } catch (e) {
  }
  


 
  const container__text__timing = document.createElement("div");
  container__text__timing.classList.add("container__text__timing")
  container__text.appendChild(container__text__timing);

  create_ad_property(container__text__timing,"Preço:",price)
  create_ad_property(container__text__timing,"Quilómetros:",quilometer)
  create_ad_property(container__text__timing,"Localização",location)

  create_button(mainDiv,link)


}

function create_ad_property(parent_div,category,price){

  const container__text__timing_1 = document.createElement("div");
  container__text__timing_1.classList.add("container__text__timing_time")
  parent_div.appendChild(container__text__timing_1);

  const property_1 = document.createElement("h2");
  const property_1_text = document.createTextNode(category);
  property_1.appendChild(property_1_text);
  container__text__timing_1.appendChild(property_1);

  const property_1_value = document.createElement("p");
  const property_1_value_text = document.createTextNode(price);
  property_1_value.appendChild(property_1_value_text);
  container__text__timing_1.appendChild(property_1_value);
}

function create_button(parent_div,link){
  const button = document.createElement("button");
  button.classList.add("btn")
  button.appendChild(document.createTextNode('Ver anuncio'))
  button.onclick = function () {
    location.href = link;
  };
  const button_arrow = document.createElement("i");
  button_arrow.classList.add("fa", "fa-arrow-right")
  button.appendChild(button_arrow)
  parent_div.appendChild(button)
}


