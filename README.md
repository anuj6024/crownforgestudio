# CrownForge Games

A professional gaming studio website for **CrownForge Games**, featuring a high-performance frontend and a robust Firebase-powered backend for content management.

## 🚀 Features

### **Public Site**
- **Home**: Immersive hero section and studio highlights.
- **Games**: Detailed showcase of titles like *The Black Vaile*, *War-X*, and *Zombie Strikeforce*.
- **News & Updates**: Real-time news feed fetched from Firestore.
- **Careers**: Dynamic job listings with a built-in application system.
- **Contact & Support**: Support form that routes messages directly to the admin dashboard.

### **Admin System**
- **Secure Login**: Protected by Firebase Authentication.
- **Dashboard**: Unified control center for all studio operations.
- **News Management**: Post updates with real-time "Live Preview" as you type.
- **Career Management**: Add job openings with instant preview.
- **Applications Hub**: Review candidate submissions, manage statuses (Pending, Interviewing, Hired, etc.).
- **Message Center**: View and manage support inquiries directly from the dashboard.

## 🛠️ Tech Stack

- **Frontend**: HTML5, Vanilla JavaScript (ES Modules)
- **Styling**: Tailwind CSS (via CDN) with custom Dark Theme
- **Backend**: Firebase (Authentication & Firestore)
- **Deployment**: Static site hosting (e.g., Firebase Hosting, GitHub Pages)

## 📁 Project Structure

```text
crownforge/
├── assets/
│   ├── css/            # Custom styles & Tailwind overrides
│   ├── images/         # Game art, logos, and team photos
│   └── js/             # Modular JS logic
│       ├── modules/    # UI components
│       ├── utils/      # Firebase configuration
│       └── [feature].js # Feature-specific logic
├── pages/              # Sub-pages (Games, Admin, Careers, etc.)
├── index.html          # Main landing page
└── firestore.rules     # Database security configuration
```

## ⚙️ Setup & Configuration

1. **Firebase Setup**:
   - Create a Firebase project.
   - Enable **Firestore Database** and **Authentication** (Email/Password).
   - Copy your configuration to `assets/js/utils/firebase.js`.

2. **Database Collections**:
   - `news`: For blog posts and updates.
   - `careers`: For job openings.
   - `applications`: For candidate submissions.
   - `messages`: For contact form inquiries.

3. **Security Rules**:
   - Deploy the rules found in `firestore.rules` to ensure public users can submit forms while only admins can read/manage data.

## 🎨 Design Philosophy

The site follows a **Modern Dark Theme** aesthetic with "Brand Neon" accents (#facc15). It utilizes backdrop blurs, glassmorphism, and smooth transitions to provide a premium "AAA Studio" feel.

---
*© 2026 CrownForge Games. Built for the next generation of players.*
