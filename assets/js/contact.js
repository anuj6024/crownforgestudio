import { db } from "./utils/firebase.js";
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

const form = document.getElementById("cf-contact-form");
const nameEl = document.getElementById("cf-name");
const emailEl = document.getElementById("cf-email");
const subjectEl = document.getElementById("cf-subject");
const categoryEl = document.getElementById("cf-category");
const messageEl = document.getElementById("cf-message");
const submitBtn = document.getElementById("cf-submit-btn");
const spinner = document.getElementById("cf-loading-spinner");
const statusEl = document.getElementById("cf-form-status");

const setLoading = (state) => {
    submitBtn.disabled = state;
    spinner.classList.toggle("hidden", !state);
    submitBtn.querySelector("span").textContent = state ? "Sending..." : "Send Message";
};

const showMessage = (msg, type) => {
    statusEl.textContent = msg;
    statusEl.classList.remove("hidden", "bg-emerald-500/10", "text-emerald-300", "border-emerald-500/40", "bg-red-500/10", "text-red-300", "border-red-500/40", "border-emerald-500", "border-red-500");
    
    if (type === "success") {
        statusEl.classList.add("bg-emerald-500/10", "text-emerald-300", "border-emerald-500/40", "border");
    } else {
        statusEl.classList.add("bg-red-500/10", "text-red-300", "border-red-500/40", "border");
    }
};

form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const name = nameEl.value.trim();
    const email = emailEl.value.trim();
    const subject = subjectEl.value.trim();
    const category = categoryEl.value;
    const message = messageEl.value.trim();

    if (!name || !email || !subject || !message) {
        showMessage("Please fill in all required fields.", "error");
        return;
    }

    setLoading(true);
    showMessage("", "hidden"); // clear previous

    try {
        await addDoc(collection(db, "messages"), {
            name,
            email,
            subject,
            category,
            message,
            read: false, // For admin to mark as read
            status: "new", // new, replied, archived
            createdAt: serverTimestamp()
        });

        form.reset();
        showMessage("Thanks! Your message has been received. We'll get back to you soon.", "success");
    } catch (error) {
        console.error("Contact error:", error);
        if (error.code === 'permission-denied') {
            showMessage("Permission denied. Please try again later.", "error");
        } else {
            showMessage("Failed to send message. Please try again.", "error");
        }
    } finally {
        setLoading(false);
    }
});
