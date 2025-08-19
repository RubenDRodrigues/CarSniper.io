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
let lastKnownKey = null;        // numeric array index we've rendered up to
let searchQueryExecuting = false;
let noMoreAds = false;
const seenIds = new Set();      // dedupe by ID (names can repeat)

const searchInput = document.getElementById("searchBarId");
const rangeInputs = document.querySelectorAll(".price-input input");
const seeMoreBtn  = document.getElementById("btn_seeMore");
const submitBtn   = document.getElementById("submitId");

if (seeMoreBtn)  seeMoreBtn.addEventListener("click", searchQuery);
if (submitBtn)   submitBtn.addEventListener("click", clear_and_search);
// Reset & reload when changing the sort radio
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
function isNumericKey(k) { return /^\d+$/.test(k); }

function parsePriceInt(v) {
  const s = (v ?? "").toString().replace(/\u202f|\xa0/g, "");
  const digits = s.match(/\d+/g);
  return digits ? parseInt(digits.join(""), 10) : Number.POSITIVE_INFINITY;
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
    const k = child.key;                 // "0","1",...
    if (!isNumericKey(k)) return;        // skip any stray keys
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
  const link_image = childData["link_images"] || childData["image"] || "";
  const text       = childData["name"] || "(Sem título)";
  const link       = childData["link"] || "#";
  const price      = childData["preco"] ?? "—";
  let quilometer   = childData["quilometros"];
  const location   = childData["localizacao"] || "—";
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
  const minValRaw = parseInt(rangeInputs?.[0]?.value ?? "0", 10);
  const maxValRaw = parseInt(rangeInputs?.[1]?.value ?? "999999999", 10);
  const minVal = Number.isFinite(minValRaw) ? minValRaw : 0;
  const maxVal = Number.isFinite(maxValRaw) ? maxValRaw : 999999999;

  const path = getSelectedPath();
  let startIndex = (lastKnownKey == null) ? 0 : lastKnownKey + 1;

  let added = 0;
  while (added < itemsPerPage) {
    const rows = await fetchChunk(path, startIndex, 50);
    if (rows.length === 0) { noMoreAds = true; break; }

    for (const r of rows) {
      const data = r.payload || {};
      const text = (data.name || "").toString();
      const precoInt = parsePriceInt(data.preco);

      if (
        text.toUpperCase().includes(qName) &&
        precoInt >= minVal &&
        precoInt <= maxVal &&
        !seenIds.has(r.id)
      ) {
        try { createCarAd(data); seenIds.add(r.id); } catch (e) { console.error(e); }
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

/* // Optional debug:
(async () => {
  const test = await get(query(ref(db, getSelectedPath()), orderByKey(), startAt("0"), limitToFirst(3)));
  console.log("[DEBUG] first 3 rows:", test.val());
})();
*/
