// functions.js — expects RTDB lists as arrays of [id, payload] pairs

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getDatabase, ref, query, orderByKey, startAt, limitToFirst, get
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

/* ---------------- Firebase ---------------- */
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

/* ---------------- State & DOM ---------------- */
const itemsPerPage = 10;
let lastKnownKey = null;
let searchQueryExecuting = false;
let noMoreAds = false;
const seenIds = new Set();

const searchInput = document.getElementById("searchBarId");
const rangeInputs = document.querySelectorAll(".price-input input");
const seeMoreBtn  = document.getElementById("btn_seeMore");
const submitBtn   = document.getElementById("submitId");

if (seeMoreBtn)  seeMoreBtn.addEventListener("click", searchQuery);
if (submitBtn)   submitBtn.addEventListener("click", clear_and_search);
document.querySelectorAll('input[name="test"]').forEach(r =>
  r.addEventListener('change', clear_and_search)
);

window.addEventListener("scroll", () => {
  if (window.innerHeight + window.pageYOffset >= document.body.offsetHeight - 8) {
    if (!searchQueryExecuting && !noMoreAds) searchQuery();
  }
});

/* ---------------- Helpers ---------------- */
function getSelectedPath() {
  const selected = document.querySelector('input[name="test"]:checked')?.id;
  if (selected === "optNome")      return "anuncios-nome";
  if (selected === "optPrecoAsc")  return "anuncios-preco-ascendente";
  if (selected === "optPrecoDesc") return "anuncios-preco-descendente";
  return "anuncios-preco-ascendente";
}
const NUM_KEY = /^\d+$/;

function getFirst(obj, ...keys) {
  for (const k of keys) {
    const v = obj?.[k];
    if (v !== undefined && v !== null && v !== "") return v;
  }
  return undefined;
}

function getImageUrl(o) {
  // direct single field
  let v = getFirst(o, "link_images","image","thumbnail","thumb","photo","picture","img","imageUrl","imageURL");
  if (v) return v;
  // array fields
  const arr = getFirst(o, "images","pictures","photos","imgs");
  if (Array.isArray(arr) && arr.length) return arr[0];
  return "";
}

function parsePriceInt(raw) {
  const s = (raw ?? "").toString().replace(/\u202f|\xa0/g, "");
  const digits = s.match(/\d+/g);
  return digits ? parseInt(digits.join(""), 10) : Number.NaN; // NaN => treat as "no numeric price"
}

// Accept ["id",{…}] or {"0":"id","1":{…}} (how RTDB arrays sometimes come back)
function normalizePair(val) {
  if (Array.isArray(val) && val.length >= 2) return [val[0], val[1]];
  if (val && typeof val === "object" && ("0" in val) && ("1" in val)) return [val["0"], val["1"]];
  return null;
}

/** Fetch a chunk by numeric array index. Returns [{key, id, payload}] */
async function fetchChunk(path, startIndex, pageSize) {
  const q = query(ref(db, path), orderByKey(), startAt(String(startIndex)), limitToFirst(pageSize));
  const snap = await get(q);
  const out = [];
  if (!snap.exists()) return out;

  snap.forEach(child => {
    const k = child.key;
    if (!NUM_KEY.test(k)) return;
    const pair = normalizePair(child.val());
    if (!pair) return;
    const [id, payload] = pair;
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
  seenIds.clear();
  lastKnownKey = null;
  noMoreAds = false;
  clearRenderedCards();
  searchQuery();
}

/* ---------------- Rendering ---------------- */
function createCarAd(childData){
  const link_image = getImageUrl(childData);
  const text       = getFirst(childData, "name","title") || "(Sem título)";
  const link       = getFirst(childData, "link","url") || "#";
  const price      = getFirst(childData, "preco","price") ?? "—";
  let quilometer   = getFirst(childData, "quilometros","kilometros","quilómetros","kilometers","km","kms");
  const location   = getFirst(childData, "localizacao","location","cidade","city","local") || "—";
  if (quilometer === undefined || quilometer === null) quilometer = "Não Definido";

  const section = document.getElementById("pageSection");
  if (!section) { console.warn("#pageSection not found"); return; }

  const mainDiv = document.createElement("div");
  mainDiv.classList.add("container");
  section.appendChild(mainDiv);

  const imgDiv = document.createElement("div");
  imgDiv.classList.add("container__img");
  mainDiv.appendChild(imgDiv);

  const image = document.createElement("img");
  image.loading = "lazy";
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
      const chip = document.createElement("button");
      chip.classList.add("button_description");
      chip.appendChild(document.createTextNode(w));
      container__text.appendChild(chip);
    }
  } catch (_) {}

  const info = document.createElement("div");
  info.classList.add("container__text__timing");
  container__text.appendChild(info);

  create_ad_property(info,"Preço:",price);
  create_ad_property(info,"Quilómetros:",quilometer);
  create_ad_property(info,"Localização",location);

  create_button(mainDiv,link);
}

function create_ad_property(parent_div, category, value){
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

function create_button(parent_div,link){
  const button = document.createElement("button");
  button.classList.add("btn");
  button.onclick = function () { location.href = link; };
  const icon = document.createElement("i");
  icon.classList.add("fa", "fa-arrow-right");
  button.appendChild(icon);
  parent_div.appendChild(button);
}

/* ---------------- Main paginate/search ---------------- */
async function searchQuery() {
  if (searchQueryExecuting || noMoreAds) return;
  searchQueryExecuting = true;

  const qName = (searchInput?.value || "").toUpperCase();

  // Blank input = no limit
  const minStr = (rangeInputs?.[0]?.value ?? "").trim();
  const maxStr = (rangeInputs?.[1]?.value ?? "").trim();
  const minVal = minStr === "" ? 0 : Number.parseInt(minStr, 10);
  const maxVal = maxStr === "" ? Number.POSITIVE_INFINITY : Number.parseInt(maxStr, 10);

  const path = getSelectedPath();
  let startIndex = (lastKnownKey == null) ? 0 : lastKnownKey + 1;

  let added = 0;
  while (added < itemsPerPage) {
    const rows = await fetchChunk(path, startIndex, 50);
    if (rows.length === 0) { noMoreAds = true; break; }

    for (const r of rows) {
      const d = r.payload || {};
      const titleOrName = (getFirst(d, "name","title") || "").toString();

      // Use preco OR price
      const rawPrice = getFirst(d, "preco","price");
      const priceVal = parsePriceInt(rawPrice);
      const passPrice = Number.isNaN(priceVal)
        ? true
        : (priceVal >= minVal && priceVal <= maxVal);

      if (
        titleOrName.toUpperCase().includes(qName) &&
        passPrice &&
        !seenIds.has(r.id)
      ) {
        try { createCarAd(d); seenIds.add(r.id); } catch (e) { console.error(e, d); }
        added++;
        if (added >= itemsPerPage) break;
      }
    }

    // advance cursor
    const lastInChunk = rows[rows.length - 1];
    lastKnownKey = lastInChunk.key;
    startIndex = lastKnownKey + 1;

    if (rows.length < 50) { if (added === 0) noMoreAds = true; break; }
  }

  searchQueryExecuting = false;
}

/* ---------------- Initial load ---------------- */
searchQuery();

// Optional: peek to confirm shape
(async () => {
  const snap = await get(query(ref(db, getSelectedPath()), orderByKey(), startAt("0"), limitToFirst(3)));
  console.log("[DEBUG] first 3 rows:", snap.val());
})();
