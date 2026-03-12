import { db } from "./utils/firebase.js";
import { collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

const pickContainer = () => {
  const byId = document.getElementById("cf-news-feed");
  if (byId) return byId;
  const byData = document.querySelector("[data-news-feed]");
  if (byData) return byData;
  const grid = document.querySelector(".grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-3");
  return grid || null;
};

const badgeClass = (category) => {
  if (category === "Update") return "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30";
  if (category === "Event") return "bg-fuchsia-500/15 text-fuchsia-400 border border-fuchsia-500/30";
  if (category === "Dev Diary") return "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30";
  if (category === "Careers") return "bg-amber-500/15 text-amber-400 border border-amber-500/30";
  return "bg-white/10 text-slate-300 border border-white/20";
};

const formatDate = (val) => {
  if (!val) return "";
  try {
    const d = typeof val.toDate === "function" ? val.toDate() : new Date(val);
    return d.toLocaleDateString(undefined, { month: "short", day: "2-digit", year: "numeric" });
  } catch {
    return String(val);
  }
};

const renderCard = (item) => {
  const article = document.createElement("article");
  article.className = "bg-brand-card border border-slate-800 rounded-xl p-6 hover:border-brand-accent transition-colors";
  article.innerHTML = `
    <div class="flex items-center justify-between mb-3">
      <span class="text-xs px-2 py-1 rounded-full ${badgeClass(item.category)} uppercase tracking-wider">${item.category || "News"}</span>
      <span class="text-xs text-slate-400">${formatDate(item.createdAt || item.date)}</span>
    </div>
    <h3 class="text-xl font-bold text-white mb-2">${item.title || "Untitled"}</h3>
    <p class="text-slate-400">${item.description || ""}</p>
  `;
  return article;
};

const loadNews = async () => {
  const container = pickContainer();
  if (!container) return;
  container.innerHTML = "";
  try {
    const q = query(collection(db, "news"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    const items = [];
    snap.forEach(doc => {
      const data = doc.data();
      const created = data.createdAt;
      const createdMs = created && typeof created.toMillis === "function" ? created.toMillis() : 0;
      const sortKey = createdMs;
      items.push({ ...data, sortKey });
    });
    items.sort((a, b) => b.sortKey - a.sortKey);
    if (!items.length) {
      const empty = document.createElement("div");
      empty.className = "text-slate-400";
      empty.textContent = "No news yet.";
      container.appendChild(empty);
      return;
    }
    items.forEach(item => container.appendChild(renderCard(item)));
  } catch {
    const err = document.createElement("div");
    err.className = "rounded border border-red-500/40 bg-red-500/10 text-red-300 text-sm px-3 py-2";
    err.textContent = "Failed to load news.";
    container.appendChild(err);
  }
};

document.addEventListener("DOMContentLoaded", loadNews);
