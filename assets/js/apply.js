import { db } from "./utils/firebase.js";
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

const form = document.getElementById("apply-form");
const nameEl = document.getElementById("applicant-name");
const emailEl = document.getElementById("applicant-email");
const portfolioEl = document.getElementById("portfolio-url");
const letterEl = document.getElementById("cover-letter");
const messageEl = document.getElementById("form-message");
const submitBtn = document.getElementById("submit-btn");
const spinner = document.getElementById("loading-spinner");
const jobTitleDisplay = document.getElementById("job-title-display");
const jobIdInput = document.getElementById("job-id");
const jobTitleInput = document.getElementById("job-title-hidden");

// Parse Query Params
const params = new URLSearchParams(window.location.search);
const jobId = params.get("id");
const jobTitle = params.get("title") || "General Application";

if (jobId) {
    jobTitleDisplay.textContent = jobTitle;
    jobIdInput.value = jobId;
    jobTitleInput.value = jobTitle;
    document.title = `Apply for ${jobTitle} - CrownForge Games`;
} else {
    jobTitleDisplay.textContent = "General Application";
    document.title = "General Application - CrownForge Games";
}

const setLoading = (state) => {
    submitBtn.disabled = state;
    spinner.classList.toggle("hidden", !state);
    submitBtn.querySelector("span").textContent = state ? "Sending..." : "Submit Application";
};

const showMessage = (msg, type) => {
    messageEl.textContent = msg;
    messageEl.classList.remove("hidden", "bg-emerald-500/10", "text-emerald-300", "border-emerald-500/40", "bg-red-500/10", "text-red-300", "border-red-500/40", "border");
    
    if (type === "success") {
        messageEl.classList.add("bg-emerald-500/10", "text-emerald-300", "border-emerald-500/40", "border");
    } else {
        messageEl.classList.add("bg-red-500/10", "text-red-300", "border-red-500/40", "border");
    }
};

form.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const name = nameEl.value.trim();
    const email = emailEl.value.trim();
    const portfolio = portfolioEl.value.trim();
    const message = letterEl.value.trim();
    const jId = jobIdInput.value;
    const jTitle = jobTitleInput.value;

    if (!name || !email || !message) {
        showMessage("Please fill in all required fields.", "error");
        return;
    }

    setLoading(true);
    showMessage("", "hidden"); // clear previous

    try {
        await addDoc(collection(db, "applications"), {
            jobId: jId || null,
            jobTitle: jTitle,
            applicantName: name,
            applicantEmail: email,
            portfolioUrl: portfolio,
            message: message,
            status: "pending", // pending, reviewed, rejected, hired
            appliedAt: serverTimestamp()
        });

        form.reset();
        showMessage("Application submitted successfully! We'll be in touch.", "success");
        setTimeout(() => {
            window.location.href = "careers.html";
        }, 3000);
    } catch (error) {
        console.error("Application error:", error);
        // Show specific error message for debugging
        if (error.code === 'permission-denied') {
            showMessage("Permission denied. Please ask the admin to update Firestore security rules.", "error");
        } else {
            showMessage(`Failed to submit: ${error.message || "Unknown error"}`, "error");
        }
    } finally {
        setLoading(false);
    }
});
