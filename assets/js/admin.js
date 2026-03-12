import { auth, db } from "./utils/firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

const userEmailEl = document.getElementById("cf-user-email");
const signoutBtn = document.getElementById("cf-signout");
const form = document.getElementById("cf-news-form");
const titleEl = document.getElementById("cf-title");
const categoryEl = document.getElementById("cf-category");
const descriptionEl = document.getElementById("cf-description");
const successEl = document.getElementById("cf-success");
const errorEl = document.getElementById("cf-error");
const submitBtn = document.getElementById("cf-submit");
const loadingIcon = document.getElementById("cf-loading");
const previewContainer = document.getElementById("cf-preview-container");

let currentUser = null;

// --- Preview Logic ---

const badgeClass = (category) => {
  if (category === "Update") return "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30";
  if (category === "Event") return "bg-fuchsia-500/15 text-fuchsia-400 border border-fuchsia-500/30";
  if (category === "Dev Diary") return "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30";
  if (category === "Careers") return "bg-amber-500/15 text-amber-400 border border-amber-500/30";
  return "bg-white/10 text-slate-300 border border-white/20";
};

const updatePreview = () => {
    if (!previewContainer) return;
    
    const title = titleEl.value.trim() || "News Title";
    const category = categoryEl.value || "Category";
    const description = descriptionEl.value.trim() || "Description will appear here...";
    const dateStr = new Date().toLocaleDateString(undefined, { month: "short", day: "2-digit", year: "numeric" });

    previewContainer.innerHTML = `
      <article class="bg-brand-card border border-slate-800 rounded-xl p-6 hover:border-brand-accent transition-colors">
        <div class="flex items-center justify-between mb-3">
          <span class="text-xs px-2 py-1 rounded-full ${badgeClass(categoryEl.value)} uppercase tracking-wider">${category}</span>
          <span class="text-xs text-slate-400">${dateStr}</span>
        </div>
        <h3 class="text-xl font-bold text-white mb-2 break-words">${title}</h3>
        <p class="text-slate-400 whitespace-pre-wrap break-words">${description}</p>
      </article>
    `;
};

// Event Listeners for Preview
[titleEl, categoryEl, descriptionEl].forEach(el => {
    if (el) el.addEventListener('input', updatePreview);
});

// Initial Preview
updatePreview();

// --- End Preview Logic ---

const setLoading = (state) => {
  submitBtn.disabled = state;
  loadingIcon.classList.toggle("hidden", !state);
};

const showError = (msg) => {
  errorEl.textContent = msg;
  errorEl.classList.remove("hidden");
  successEl.classList.add("hidden");
};

const showSuccess = (msg) => {
  successEl.textContent = msg;
  successEl.classList.remove("hidden");
  errorEl.classList.add("hidden");
};

onAuthStateChanged(auth, (user) => {
  if (!user) {
    const redirect = encodeURIComponent("/pages/add-news.html");
    window.location.href = `/pages/admin-login.html?redirect=${redirect}`;
    return;
  }
  currentUser = user;
  userEmailEl.textContent = user.email || "";
});

signoutBtn.addEventListener("click", async () => {
  await signOut(auth);
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!currentUser) return;
  const title = titleEl.value.trim();
  const category = categoryEl.value;
  const description = descriptionEl.value.trim();
  if (!title || !category || !description) {
    showError("Fill all fields.");
    return;
  }
  setLoading(true);
  try {
    const ref = collection(db, "news");
    await addDoc(ref, {
      title,
      category,
      description,
      authorUid: currentUser.uid,
      createdAt: serverTimestamp()
    });
    form.reset();
    showSuccess("News item saved.");
  } catch (err) {
    showError("Save failed.");
  } finally {
    setLoading(false);
  }
});
