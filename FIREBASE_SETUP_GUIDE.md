# 🔥 Firebase Firestore Setup & Connection Guide

This guide details both the **Automated Firebase CLI** approach and the **Manual Firebase Web Console** approach to configure Google Cloud Firebase Firestore with the Employee Task Manager backend.

---

## ⚡ Zero-Config Demo Mode (Default)
When you run the project out-of-the-box without Firebase credentials, the backend **automatically activates its built-in High-Fidelity In-Memory Firestore engine** pre-seeded with Sarah (Manager), Rahul (Employee), and Alex (Employee). This guarantees that employers and code reviewers can clone and run your repository with **zero setup hurdles**.

---

## 🛠️ Method 1: Firebase CLI Setup (Command Line)

### Step 1: Install Firebase CLI Tools
```bash
npm install -g firebase-tools
```

### Step 2: Login to Google Cloud Firebase
```bash
firebase login
```
*This opens your browser to authenticate with your Google account.*

### Step 3: List / Create Firebase Project
```bash
# List existing projects:
firebase projects:list

# Or create a new project:
firebase projects:create employee-task-manager-prod
```

### Step 4: Initialize Firestore in your project
```bash
firebase init firestore
```
*Follow the interactive prompt: select your project and accept default `firestore.rules` and `firestore.indexes.json`.*

### Step 5: Generate Admin SDK Service Account Key
1. Go to your terminal or Google Cloud Console:
   ```bash
   gcloud iam service-accounts keys create ./backend/serviceAccountKey.json \
       --iam-account=firebase-adminsdk@<YOUR_PROJECT_ID>.iam.gserviceaccount.com
   ```
2. Place `serviceAccountKey.json` inside the `backend/` directory.

---

## 🌐 Method 2: Manual Firebase Console Setup (Step-by-Step)

If you prefer using the Firebase Web Console:

1. **Create Firebase Project**:
   - Open [Firebase Console](https://console.firebase.google.com/).
   - Click **"Add project"** and name it `employee-task-manager`.
   - Disable Google Analytics (optional) and click **Create Project**.

2. **Create Cloud Firestore Database**:
   - In the left sidebar, click **Build ➔ Firestore Database**.
   - Click **"Create database"**.
   - Choose your nearest cloud location (e.g. `nam5 (us-central)` or `asia-south1`).
   - Select **"Start in test mode"** (allows immediate read/write access for testing) and click **Enable**.

3. **Generate Service Account Key**:
   - Click the ⚙️ **Gear icon** (top left next to Project Overview) ➔ **Project settings**.
   - Navigate to the **"Service accounts"** tab.
   - Select **"Node.js"** and click **"Generate new private key"**.
   - A `.json` file will download to your computer.

4. **Add to Backend**:
   - Rename the downloaded file to `serviceAccountKey.json`.
   - Move it into the `backend/` directory of this repository:
     ```
     App/
     └── backend/
         └── serviceAccountKey.json   <-- Place here
     ```

5. **Start / Restart Backend**:
   ```bash
   cd backend
   npm start
   ```
   You will see:
   ```
   🔥 [Firebase] Connected successfully to Cloud Firestore: <YOUR_PROJECT_ID>
   🌱 [Seed] Seeding database with demo users, tasks, and updates...
   ```

---

## 🌱 Demo Seed Data Runner

To re-seed or populate the database anytime with fresh demo tasks and employees:

```bash
# Via npm script
cd backend
npm run seed

# Or via REST API trigger:
curl -X POST http://localhost:5000/api/seed
```

### Pre-loaded Demo Accounts:
| Role | Name | Email | Password | Code |
| :--- | :--- | :--- | :--- | :--- |
| **Manager** | Sarah Jenkins | `manager@company.com` | `password123` | `MGR-001` |
| **Employee** | Rahul Sharma | `rahul@company.com` | `password123` | `EMP-104` |
| **Employee** | Alex Chen | `alex@company.com` | `password123` | `EMP-108` |
| **Employee** | Priya Patel | `priya@company.com` | `password123` | `EMP-112` |
