import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js"
import { getAuth } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js"
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js"

let app = null
let auth = null
let db = null

export const initFirebase = (config) => {
  if (!app) {
    app = initializeApp(config)
    auth = getAuth(app)
    db = getFirestore(app)
  }
  return { app, auth, db }
}

export { app, auth, db }
