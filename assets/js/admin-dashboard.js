import { auth } from "./utils/firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

const userEmailEl = document.getElementById("cf-user-email");
const signoutBtn = document.getElementById("cf-signout");
const dateEl = document.getElementById("current-date");

// Display Date
if (dateEl) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    dateEl.textContent = new Date().toLocaleDateString(undefined, options);
}

// Auth Check
onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = "admin-login.html";
        return;
    }
    if (userEmailEl) userEmailEl.textContent = user.email;
});

// Logout
if (signoutBtn) {
    signoutBtn.addEventListener("click", async () => {
        try {
            await signOut(auth);
            window.location.href = "admin-login.html";
        } catch (error) {
            console.error("Logout failed", error);
        }
    });
}
