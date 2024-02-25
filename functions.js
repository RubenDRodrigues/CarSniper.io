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
var lastKnownKey = null;
var orderFilter = "name"
var limitTo = "limitToFirst"
const rangeInput = document.querySelectorAll(".range-input input"),
  priceInput = document.querySelectorAll(".price-input input"),
  range = document.querySelector(".slider .progress");

let minVal = parseInt(rangeInput[0].value),
maxVal = parseInt(rangeInput[1].value);

document.getElementById("btn_seeMore").onclick = seeMoreAds;
document.getElementById("submitId").onclick = searchQuery;


window.onscroll = function() {
  if (window.innerHeight + window.pageYOffset >= document.body.offsetHeight) {
    seeMoreAds()
  }
 }

// Create a new post reference with an auto-generated id
const db = getDatabase();
const firstQuery = query(ref(db, 'anuncios'),orderByChild(orderFilter) ,startAt(itemsPerPage*(currentPage-1)), limitToFirst(itemsPerPage)  );
onValue(firstQuery, (snapshot) => {
  snapshot.forEach((childSnapshot) => {
    const childKey = childSnapshot.key;
    const childData = childSnapshot.val();
    createCarAd(childData)
    lastKnownKey = childSnapshot.key;
    
  });
}, {
  onlyOnce: true
});

function searchQuery(){
  // Create a new post reference with an auto-generated id
  var counter = 0
  const elements = document.getElementsByClassName("container");
  while (elements.length > 0) elements[0].remove();

  var newQueryRef =null //,startAt(queryName) ,endAt(queryName+"\uf8ff"));
  const queryName = document.getElementById("searchBarId").value

  if (queryName != ""){
    newQueryRef =query(ref(db, 'anuncios'),orderByChild("name")) // ,endAt(queryName+"\uf8ff"));
  }
  else{
    if (limitTo == "limitToFirst"){
      newQueryRef =query(ref(db, 'anuncios'),orderByChild(orderFilter),startAt(queryName),limitToFirst(10)) //,startAt(queryName) ,endAt(queryName+"\uf8ff"));
    }
    else{
      newQueryRef =query(ref(db, 'anuncios'),orderByChild(orderFilter),startAt(queryName),limitToLast(itemsPerPage)) //,startAt(queryName) ,endAt(queryName+"\uf8ff"));
    }
  }



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

      lastKnownKey = childSnapshot.key;


      if ((text.toUpperCase().includes(queryName.toUpperCase()))){
        createCarAd(childData)

      }
      
    });
  });

}

function seeMoreAds(){
   currentPage++
   var counter = 1
   console.log(currentPage)
   var nextQuery = null

   if (limitTo == "limitToFirst"){

    nextQuery =query(ref(db, 'anuncios'),orderByChild(orderFilter),limitToFirst(itemsPerPage),startAt(lastKnownKey)) //,startAt(queryName) ,endAt(queryName+"\uf8ff"));
   }
   else{
    nextQuery =query(ref(db, 'anuncios'),orderByChild(orderFilter),limitToLast(itemsPerPage*currentPage)) //,startAt(queryName) ,endAt(queryName+"\uf8ff"));
   }

   var firstCheck = 0
   console.log(nextQuery)
 
   onValue(nextQuery, (snapshot) => {
     snapshot.forEach((childSnapshot) => {
       if (firstCheck == 0){
        firstCheck=1
        
       }
       else{
        const childKey = childSnapshot.key;
        const childData = childSnapshot.val();
        const link_image=childData["link_images"]
        const text=childData["name"]
        const link=childData["link"]
        if (limitTo == "limitToFirst"){lastKnownKey = childSnapshot.key;}
        if (counter < itemsPerPage){
          createCarAd(childData)

        }
        counter++

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




let priceGap = 1000;

priceInput.forEach((input) => {
  input.addEventListener("input", (e) => {
    let minPrice = parseInt(priceInput[0].value),
      maxPrice = parseInt(priceInput[1].value);

    if (maxPrice - minPrice >= priceGap && maxPrice <= rangeInput[1].max) {
      if (e.target.className === "input-min") {
        rangeInput[0].value = minPrice;
        range.style.left = (minPrice / rangeInput[0].max) * 100 + "%";
      } else {
        rangeInput[1].value = maxPrice;
        range.style.right = 100 - (maxPrice / rangeInput[1].max) * 100 + "%";
      }
    }
  });
});

rangeInput.forEach((input) => {
  input.addEventListener("input", (e) => {
    let minVal = parseInt(rangeInput[0].value),
      maxVal = parseInt(rangeInput[1].value);

    if (maxVal - minVal < priceGap) {
      if (e.target.className === "range-min") {
        rangeInput[0].value = maxVal - priceGap;
      } else {
        rangeInput[1].value = minVal + priceGap;
      }
    } else {
      priceInput[0].value = minVal;
      priceInput[1].value = maxVal;
      range.style.left = (minVal / rangeInput[0].max) * 100 + "%";
      range.style.right = 100 - (maxVal / rangeInput[1].max) * 100 + "%";
    }
  });
});
/* When the user clicks on the button,
toggle between hiding and showing the dropdown content */
document.getElementById("dropdownBtn").addEventListener('click', toggleDropdown)
function toggleDropdown() {
  document.getElementById("dropdown").classList.toggle("show");
}


document.getElementById("dropdown_OrderByHigherToLower").addEventListener('click', function() {  changeFilter('HigherToLower');})
document.getElementById("dropdown_OrderByLowerToHigher").addEventListener('click', function() {  changeFilter("LowerToHigher");})
document.getElementById("dropdown_OrderByName").addEventListener('click', function() {  changeFilter("name");})

function changeFilter(type){

  console.log(type)
  
  if (type == "HigherToLower"){
    limitTo = "limitToFirst"
    orderFilter = "preco"
  }

  if (type == "LowerToHigher"){
    limitTo = "limitToLast"
    orderFilter ="preco"
  }

  if (type == "name"){
    limitTo = "limitToFirst"
    orderFilter ="name"
  }
  currentPage = 1

  searchQuery()
  

}



// Close the dropdown menu if the user clicks outside of it
window.onclick = function(event) {
  if (!event.target.matches('.dropbtn')) {
    var dropdowns = document.getElementsByClassName("dropdown-content");
    var i;
    for (i = 0; i < dropdowns.length; i++) {
      var openDropdown = dropdowns[i];
      if (openDropdown.classList.contains('show')) {
        openDropdown.classList.remove('show');
      }
    }
  }
}