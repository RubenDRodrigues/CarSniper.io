// functions.js — pure JS module (no <script> tags)

// Firebase v10 (modular)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getDatabase, ref, query, orderByKey, startAt, limitToFirst, get
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

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
const db  = getDatabase(app);

// ------- UI/State -------
const itemsPerPage = 10;
let lastKnownKey = null;
let searchQueryExecuting = false;
let noMoreAds = false;
const list_of_cars = [];

const rangeInputs = document.querySelectorAll(".price-input input");
const searchInput = document.getElementById("searchBarId");

document.getElementById("btn_seeMore").onclick = searchQuery;
document.getElementById("submitId").onclick   = clear_and_search;

window.onscroll = function () {
  if (window.innerHeight + window.pageYOffset >= document.body.offsetHeight - 8) {
    if (!searchQueryExecuting && !noMoreAds) searchQuery();
  }
};

// ------- Helpers -------
function parsePriceInt(v) {
  const s = (v ?? "").toString().replace(/\u202f|\xa0/g, "");
  const digits = s.match(/\d+/g);
  return digits ? parseInt(digits.join(""), 10) : Number.POSITIVE_INFINITY;
}

function getSelectedPath() {
  const selected = document.querySelector('input[name="test"]:checked')?.id;
  if (selected === "optNome")      return "anuncios-nome";
  if (selected === "optPrecoAsc")  return "anuncios-preco-ascendente";
  if (selected === "optPrecoDesc") return "anuncios-preco-descendente";
  return "anuncios-preco-ascendente";
}

// Replace your fetchChunk with this:
async function fetchChunk(path, startIndex, pageSize) {
  const q = query(
    ref(db, path),
    orderByKey(),
    startAt(String(startIndex)),
    limitToFirst(pageSize)
  );
  const snap = await get(q);
  const out = [];
  if (!snap.exists()) return out;

  snap.forEach(child => {
    const k = child.key;        // "0","1",...
    const val = child.val();    // can be ["id",{...}] OR {"0":"id","1":{...}}

    // normalize to pair [id, payload]
    let id, payload;

    if (Array.isArray(val) && val.length >= 2) {
      id = val[0];
      payload = val[1];
    } else if (val && typeof val === "object" && ("0" in val) && ("1" in val)) {
      id = val["0"];
      payload = val["1"];
    } else {
      // skip stray entries (e.g., "visited_pages" or malformed rows)
      return;
    }

    if (payload && typeof payload === "object") {
      out.push({ key: Number(k), id, payload });
    }
  });

  return out;
}


function clearRenderedCards() {
  const nodes = document.getElementsByClassName("container");
  while (nodes.length > 0) nodes[0].remove();
}

function clear_and_search() {
  list_of_cars.length = 0;
  lastKnownKey = null;
  noMoreAds = false;
  clearRenderedCards();
  searchQuery();
}

// ------- Renderers (your original) -------
function createCarAd(childData) {
  const link_image = childData["link_images"];
  const text       = childData["name"];
  const link       = childData["link"];
  const price      = childData["preco"];
  let quilometer   = childData["quilometros"];
  const location   = childData["localizacao"];
  if (quilometer === undefined) quilometer = "Não Definido";

  const section = document.getElementById("pageSection");
  const mainDiv = document.createElement("div");
  mainDiv.classList.add("container");
  section.appendChild(mainDiv);

  const imgDiv = document.createElement("div");
  imgDiv.classList.add("container__img");
  mainDiv.appendChild(imgDiv);

  const image = document.createElement("img");
  image.src = link_image;
  imgDiv.appendChild(image);

  const container__text = document.createElement("div");
  container__text.classList.add("container__text");
  mainDiv.appendChild(container__text);

  const Title = document.createElement("h1");
  Title.appendChild(document.createTextNode(text));
  container__text.appendChild(Title);

  try {
    const specs = childData["Carateristicas"];
    const words = (Array.isArray(specs) ? specs[0] : "").split('\n');
    for (let w of words) {
      if (!w) continue;
      const descriptionButton = document.createElement("button");
      descriptionButton.classList.add("button_description");
      descriptionButton.appendChild(document.createTextNode(w));
      container__text.appendChild(descriptionButton);
    }
  } catch (_) {}

  const container__text__timing = document.createElement("div");
  container__text__timing.classList.add("container__text__timing");
  container__text.appendChild(container__text__timing);

  create_ad_property(container__text__timing, "Preço:", price);
  create_ad_property(container__text__timing, "Quilómetros:", quilometer);
  create_ad_property(container__text__timing, "Localização", location);

  create_button(mainDiv, link);
}

function create_ad_property(parent_div, category, value) {
  const row = document.createElement("div");
  row.classList.add("container__text__timing_time");
  parent_div.appendChild(row);

  const label = document.createElement("h2");
  label.appendChild(document.createTextNode(category));
  row.appendChild(label);

  const val = document.createElement("p");
  val.appendChild(document.createTextNode(value));
  row.appendChild(val);
}

function create_button(parent_div, link) {
  const button = document.createElement("button");
  button.classList.add("btn");
  button.onclick = () => (location.href = link);
  const icon = document.createElement("i");
  icon.classList.add("fa", "fa-arrow-right");
  button.appendChild(icon);
  parent_div.appendChild(button);
}

// ------- Main paginate/search -------
async function searchQuery() {
  if (searchQueryExecuting || noMoreAds) return;
  searchQueryExecuting = true;

  const qName = (searchInput?.value || "").toUpperCase();
  const minVal = parseInt(rangeInputs[0]?.value || "0", 10);
  const maxVal = parseInt(rangeInputs[1]?.value || "999999999", 10);

  const path = getSelectedPath();
  let startIndex = (lastKnownKey == null) ? 0 : lastKnownKey + 1;

  let added = 0;
  while (added < itemsPerPage) {
    const chunk = await fetchChunk(path, startIndex, 50);
    if (chunk.length === 0) { noMoreAds = true; break; }

    for (const row of chunk) {
      const data = row.payload || {};
      const text = (data.name || "").toString();
      const precoInt = parsePriceInt(data.preco);

      if (
        text.toUpperCase().includes(qName) &&
        precoInt >= minVal &&
        precoInt <= maxVal &&
        !list_of_cars.includes(text)
      ) {
        createCarAd(data);
        list_of_cars.push(text);
        added++;
        if (added >= itemsPerPage) break;
      }
    }

    const lastInChunk = chunk[chunk.length - 1];
    lastKnownKey = lastInChunk.key;
    startIndex = lastKnownKey + 1;

    if (chunk.length < 50) { if (added === 0) noMoreAds = true; break; }
  }

  searchQueryExecuting = false;
}

// initial load
searchQuery();

// Close dropdown when clicking outside
window.addEventListener("click", (event) => {
  if (!event.target.matches('.dropbtn')) {
    const dropdowns = document.getElementsByClassName("dropdown-content");
    for (let i = 0; i < dropdowns.length; i++) dropdowns[i].classList.remove('show');
  }
});
