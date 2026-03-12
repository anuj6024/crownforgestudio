import { auth, db } from "./utils/firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { collection, getDocs, query, orderBy, doc, updateDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

const listEl = document.getElementById("messages-list");
const userEmailEl = document.getElementById("cf-user-email");
const signoutBtn = document.getElementById("cf-signout");
const refreshBtn = document.getElementById("refresh-btn");

// Modal Elements
const modal = document.getElementById("msg-modal");
const closeModalBtn = document.getElementById("close-modal");
const modalSubject = document.getElementById("modal-subject");
const modalCategory = document.getElementById("modal-category");
const modalSender = document.getElementById("modal-sender");
const modalEmail = document.getElementById("modal-email");
const modalDate = document.getElementById("modal-date");
const modalMessage = document.getElementById("modal-message");
const modalStatus = document.getElementById("modal-status");
const saveStatusBtn = document.getElementById("save-status-btn");
const replyLink = document.getElementById("reply-link");

let currentMsgId = null;
let currentUser = null;

// Auth Check
onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = "/pages/admin-login.html";
        return;
    }
    currentUser = user;
    userEmailEl.textContent = user.email;
    loadMessages();
});

signoutBtn.addEventListener("click", async () => {
    await signOut(auth);
});

refreshBtn.addEventListener("click", () => {
    loadMessages();
});

// Load Messages
const loadMessages = async () => {
    listEl.innerHTML = `<tr><td colspan="6" class="p-8 text-center text-slate-500 animate-pulse">Loading messages...</td></tr>`;
    
    try {
        const q = query(collection(db, "messages"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        
        if (snapshot.empty) {
            listEl.innerHTML = `<tr><td colspan="6" class="p-8 text-center text-slate-500">No messages found.</td></tr>`;
            return;
        }

        listEl.innerHTML = "";
        
        snapshot.forEach(docSnap => {
            const data = docSnap.data();
            const id = docSnap.id;
            const date = data.createdAt ? new Date(data.createdAt.seconds * 1000).toLocaleDateString() : "N/A";
            
            const tr = document.createElement("tr");
            tr.className = "hover:bg-white/5 transition-colors group cursor-pointer border-b border-slate-800/50 last:border-0";
            tr.innerHTML = `
                <td class="p-4">
                    <div class="font-medium text-white">${data.name || "Unknown"}</div>
                    <div class="text-xs text-slate-500">${data.email || ""}</div>
                </td>
                <td class="p-4 text-slate-300 text-sm truncate max-w-[200px]">${data.subject || "No Subject"}</td>
                <td class="p-4 text-slate-400 text-sm">${data.category || "General"}</td>
                <td class="p-4 text-slate-400 text-sm">${date}</td>
                <td class="p-4">
                    <span class="px-2 py-1 rounded-full text-xs font-medium uppercase tracking-wider ${getStatusColor(data.status)}">
                        ${data.status || "new"}
                    </span>
                </td>
                <td class="p-4 text-right">
                    <button class="text-brand-accent hover:text-white text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">View &rarr;</button>
                </td>
            `;
            
            tr.addEventListener("click", () => openModal(id, data));
            listEl.appendChild(tr);
        });

    } catch (error) {
        console.error("Error loading messages:", error);
        listEl.innerHTML = `<tr><td colspan="6" class="p-8 text-center text-red-400">Failed to load messages.</td></tr>`;
    }
};

const getStatusColor = (status) => {
    switch (status) {
        case 'new': return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
        case 'replied': return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
        case 'archived': return 'bg-slate-500/10 text-slate-500 border border-slate-500/20';
        default: return 'bg-slate-500/10 text-slate-400 border border-slate-500/20';
    }
};

// Modal Logic
const openModal = (id, data) => {
    currentMsgId = id;
    modalSubject.textContent = data.subject;
    modalCategory.textContent = data.category;
    modalSender.innerHTML = `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg> ${data.name}`;
    modalEmail.innerHTML = `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg> ${data.email}`;
    modalDate.textContent = data.createdAt ? new Date(data.createdAt.seconds * 1000).toLocaleString() : "N/A";
    modalMessage.textContent = data.message;
    modalStatus.value = data.status || "new";
    
    replyLink.href = `mailto:${data.email}?subject=Re: ${data.subject}`;

    modal.classList.remove("hidden");
    document.body.style.overflow = "hidden";
    
    // Auto-mark as read if new? Maybe later.
};

const closeModal = () => {
    modal.classList.add("hidden");
    document.body.style.overflow = "";
    currentMsgId = null;
};

closeModalBtn.addEventListener("click", closeModal);
modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
});

// Update Status
saveStatusBtn.addEventListener("click", async () => {
    if (!currentMsgId) return;
    
    const newStatus = modalStatus.value;
    const btn = saveStatusBtn;
    
    btn.disabled = true;
    btn.textContent = "...";
    
    try {
        const ref = doc(db, "messages", currentMsgId);
        await updateDoc(ref, { status: newStatus });
        
        loadMessages(); 
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
