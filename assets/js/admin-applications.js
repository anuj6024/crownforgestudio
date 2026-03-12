import { auth, db } from "./utils/firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { collection, getDocs, query, orderBy, doc, updateDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

const listEl = document.getElementById("applications-list");
const userEmailEl = document.getElementById("cf-user-email");
const signoutBtn = document.getElementById("cf-signout");
const refreshBtn = document.getElementById("refresh-btn");

// Modal Elements
const modal = document.getElementById("app-modal");
const closeModalBtn = document.getElementById("close-modal");
const modalName = document.getElementById("modal-name");
const modalRole = document.getElementById("modal-role");
const modalEmail = document.getElementById("modal-email");
const modalDate = document.getElementById("modal-date");
const modalPortfolio = document.getElementById("modal-portfolio");
const modalMessage = document.getElementById("modal-message");
const modalStatus = document.getElementById("modal-status");
const saveStatusBtn = document.getElementById("save-status-btn");

let currentAppId = null;
let currentUser = null;

// Auth Check
onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = "/pages/admin-login.html";
        return;
    }
    currentUser = user;
    userEmailEl.textContent = user.email;
    loadApplications();
});

signoutBtn.addEventListener("click", async () => {
    await signOut(auth);
});

refreshBtn.addEventListener("click", () => {
    loadApplications();
});

// Load Applications
const loadApplications = async () => {
    listEl.innerHTML = `<tr><td colspan="5" class="p-8 text-center text-slate-500 animate-pulse">Loading applications...</td></tr>`;
    
    try {
        const q = query(collection(db, "applications"), orderBy("appliedAt", "desc"));
        const snapshot = await getDocs(q);
        
        if (snapshot.empty) {
            listEl.innerHTML = `<tr><td colspan="5" class="p-8 text-center text-slate-500">No applications found yet.</td></tr>`;
            return;
        }

        listEl.innerHTML = "";
        
        snapshot.forEach(docSnap => {
            const data = docSnap.data();
            const id = docSnap.id;
            const date = data.appliedAt ? new Date(data.appliedAt.seconds * 1000).toLocaleDateString() : "N/A";
            
            const tr = document.createElement("tr");
            tr.className = "hover:bg-white/5 transition-colors group cursor-pointer border-b border-slate-800/50 last:border-0";
            tr.innerHTML = `
                <td class="p-4">
                    <div class="font-medium text-white">${data.applicantName || "Unknown"}</div>
                    <div class="text-xs text-slate-500">${data.applicantEmail || ""}</div>
                </td>
                <td class="p-4 text-slate-300 text-sm">${data.jobTitle || "General"}</td>
                <td class="p-4 text-slate-400 text-sm">${date}</td>
                <td class="p-4">
                    <span class="px-2 py-1 rounded-full text-xs font-medium uppercase tracking-wider ${getStatusColor(data.status)}">
                        ${data.status || "pending"}
                    </span>
                </td>
                <td class="p-4 text-right">
                    <button class="text-brand-accent hover:text-white text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">View Details &rarr;</button>
                </td>
            `;
            
            tr.addEventListener("click", () => openModal(id, data));
            listEl.appendChild(tr);
        });

    } catch (error) {
        console.error("Error loading apps:", error);
        listEl.innerHTML = `<tr><td colspan="5" class="p-8 text-center text-red-400">Failed to load applications.</td></tr>`;
    }
};

const getStatusColor = (status) => {
    switch (status) {
        case 'reviewed': return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
        case 'interviewing': return 'bg-purple-500/10 text-purple-400 border border-purple-500/20';
        case 'hired': return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
        case 'rejected': return 'bg-red-500/10 text-red-400 border border-red-500/20';
        default: return 'bg-slate-500/10 text-slate-400 border border-slate-500/20';
    }
};

// Modal Logic
const openModal = (id, data) => {
    currentAppId = id;
    modalName.textContent = data.applicantName;
    modalRole.textContent = data.jobTitle;
    modalEmail.innerHTML = `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg> ${data.applicantEmail}`;
    modalDate.textContent = data.appliedAt ? new Date(data.appliedAt.seconds * 1000).toDateString() : "N/A";
    modalPortfolio.href = data.portfolioUrl;
    modalPortfolio.textContent = data.portfolioUrl;
    modalMessage.textContent = data.message;
    modalStatus.value = data.status || "pending";
    
    modal.classList.remove("hidden");
    document.body.style.overflow = "hidden";
};

const closeModal = () => {
    modal.classList.add("hidden");
    document.body.style.overflow = "";
    currentAppId = null;
};

closeModalBtn.addEventListener("click", closeModal);
modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
});

// Update Status
saveStatusBtn.addEventListener("click", async () => {
    if (!currentAppId) return;
    
    const newStatus = modalStatus.value;
    const btn = saveStatusBtn;
    
    btn.disabled = true;
    btn.textContent = "...";
    
    try {
        const ref = doc(db, "applications", currentAppId);
        await updateDoc(ref, { status: newStatus });
        
        // Update UI row immediately without reload if possible, or just reload
        loadApplications(); 
        btn.textContent = "Saved";
        setTimeout(() => {
            btn.textContent = "Update";
            btn.disabled = false;
        }, 1000);
    } catch (err) {
        console.error("Update failed", err);
        btn.textContent = "Error";
        btn.disabled = false;
    }
});
