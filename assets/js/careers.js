import { db } from "./utils/firebase.js";
import { collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

const listEl = () => document.getElementById("cf-careers-list");

const renderCard = (doc) => {
  const { id, title, type, description, skills = [], location } = doc;
  const article = document.createElement("article");
  article.className = "border border-white/10 rounded-lg p-5 hover:border-brand-accent transition-colors bg-brand-card";
  const tags = skills.map(s => `<span class="px-2 py-1 rounded bg-white/5 border border-white/10 text-slate-300 text-xs">${s}</span>`).join(" ");
  article.innerHTML = `
    <div class="flex items-center justify-between">
      <h3 class="text-xl font-semibold text-white">${title || "Untitled"}</h3>
      <span class="text-xs text-slate-400">${type || ""}</span>
    </div>
    <p class="mt-1 text-xs text-slate-500">${location || ""}</p>
    <p class="mt-2 text-slate-400">${description || ""}</p>
    <div class="mt-4 flex flex-wrap gap-2">${tags}</div>
    <a href="apply.html?id=${id}&title=${encodeURIComponent(title || "Role")}" class="mt-4 inline-block px-4 py-2 rounded bg-brand-accent text-brand-dark font-bold hover:bg-white transition-colors">Apply Now</a>
  `;
  return article;
};

const loadCareers = async () => {
  const container = listEl();
  if (!container) return;
  container.innerHTML = "";
  try {
    const q = query(collection(db, "careers"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    const items = [];
    snap.forEach(d => {
      items.push({ id: d.id, ...d.data() });
    });
    if (!items.length) {
      const empty = document.createElement("div");
      empty.className = "text-slate-400";
      empty.textContent = "No openings currently.";
      container.appendChild(empty);
      return;
    }
    items.forEach(doc => container.appendChild(renderCard(doc)));
  } catch {
    const err = document.createElement("div");
    err.className = "rounded border border-red-500/40 bg-red-500/10 text-red-300 text-sm px-3 py-2";
    err.textContent = "Failed to load careers.";
    container.appendChild(err);
  }
};

document.addEventListener("DOMContentLoaded", loadCareers);
