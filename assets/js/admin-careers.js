import { auth, db } from "./utils/firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

const userEmailEl = document.getElementById("cf-user-email");
const signoutBtn = document.getElementById("cf-signout");
const form = document.getElementById("cf-career-form");
const titleEl = document.getElementById("cf-title");
const typeEl = document.getElementById("cf-type");
const locationEl = document.getElementById("cf-location");
const descriptionEl = document.getElementById("cf-description");
const skillsEl = document.getElementById("cf-skills");
const successEl = document.getElementById("cf-success");
const errorEl = document.getElementById("cf-error");
const submitBtn = document.getElementById("cf-submit");
const loadingIcon = document.getElementById("cf-loading");
const previewContainer = document.getElementById("cf-preview-container");

let currentUser = null;

// --- Preview Logic ---

const updatePreview = () => {
    if (!previewContainer) return;
    
    const title = titleEl.value.trim() || "Job Title";
    const type = typeEl.value.trim() || "Type";
    const location = locationEl.value.trim() || "Location";
    const description = descriptionEl.value.trim() || "Role details...";
    const skills = skillsEl.value.split(",").map(s => s.trim()).filter(Boolean);
    const skillsDisplay = skills.length > 0 ? skills : ["Skill 1", "Skill 2"];

    const tags = skillsDisplay.map(s => `<span class="px-2 py-1 rounded bg-white/5 border border-white/10 text-slate-300 text-xs">${s}</span>`).join(" ");

    previewContainer.innerHTML = `
      <article class="border border-white/10 rounded-lg p-5 hover:border-brand-accent transition-colors bg-brand-card">
        <div class="flex items-center justify-between">
          <h3 class="text-xl font-semibold text-white break-words">${title}</h3>
          <span class="text-xs text-slate-400">${type}</span>
        </div>
        <p class="mt-1 text-xs text-slate-500">${location}</p>
        <p class="mt-2 text-slate-400 whitespace-pre-wrap break-words">${description}</p>
        <div class="mt-4 flex flex-wrap gap-2">${tags}</div>
        <a href="#" class="mt-4 inline-block px-4 py-2 rounded bg-brand-accent text-brand-dark font-bold pointer-events-none opacity-50">Apply</a>
      </article>
    `;
};

// Event Listeners for Preview
[titleEl, typeEl, locationEl, descriptionEl, skillsEl].forEach(el => {
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
    const redirect = encodeURIComponent("/pages/add-career.html");
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
  const type = typeEl.value.trim();
  const location = locationEl.value.trim();
  const description = descriptionEl.value.trim();
  const skills = skillsEl.value.split(",").map(s => s.trim()).filter(Boolean);
  if (!title || !type || !location || !description || !skills.length) {
    showError("Fill all fields.");
    return;
  }
  setLoading(true);
  try {
    const ref = collection(db, "careers");
    await addDoc(ref, {
      title,
      type,
      location,
      description,
      skills,
      authorUid: currentUser.uid,
      createdAt: serverTimestamp()
    });
    form.reset();
    showSuccess("Career opening saved.");
  } catch (err) {
    console.error("careers: add failed", err);
    const msg = err?.message || "Save failed.";
    showError(msg);
  } finally {
    setLoading(false);
  }
});
