import { auth } from "./utils/firebase.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

const form = document.getElementById("cf-login-form");
const emailEl = document.getElementById("cf-email");
const passwordEl = document.getElementById("cf-password");
const errorEl = document.getElementById("cf-error");
const submitBtn = document.getElementById("cf-submit");
const loadingIcon = document.getElementById("cf-loading");

const setLoading = (state) => {
  submitBtn.disabled = state;
  loadingIcon.classList.toggle("hidden", !state);
};

const showError = (msg) => {
  errorEl.textContent = msg;
  errorEl.classList.remove("hidden");
};

const clearError = () => {
  errorEl.textContent = "";
  errorEl.classList.add("hidden");
};

const friendlyMessage = (code) => {
  if (code === "auth/invalid-email") return "Invalid email address.";
  if (code === "auth/user-disabled") return "Account disabled.";
  if (code === "auth/user-not-found") return "User not found.";
  if (code === "auth/wrong-password") return "Incorrect password.";
  if (code === "auth/too-many-requests") return "Too many attempts. Try later.";
  if (code === "auth/network-request-failed") return "Network error. Check connection.";
  return "Login failed.";
};

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  clearError();
  const email = emailEl.value.trim();
  const password = passwordEl.value;
  if (!email || !password) {
    showError("Enter email and password.");
    return;
  }
  setLoading(true);
  try {
    await signInWithEmailAndPassword(auth, email, password);
    const params = new URLSearchParams(window.location.search);
    const redirect = params.get("redirect") || "admin.html";
    window.location.href = redirect;
  } catch (err) {
    showError(friendlyMessage(err.code));
  } finally {
    setLoading(false);
  }
});
