# TaskMaster Pro — Enterprise Employee Task Management & Collaboration Platform

Built from the ground up by **Aditya Tiwari** ([+91 6390857720](https://wa.me/916390857720)).

---

## 🌟 Executive Summary & Portfolio Overview

TaskMaster Pro is a full-stack, enterprise-grade task delegation and live team collaboration system designed to streamline managerial oversight and employee delivery across modern engineering and office organizations.

### 👨‍💻 Architect & Developer Information
- **Creator**: **Aditya Tiwari**
- **Role**: Lead Full-Stack Mobile & Backend Architect
- **WhatsApp Contact**: [**+91 6390857720**](https://wa.me/916390857720?text=Hi%20Aditya,%20I%20reviewed%20your%20TaskMaster%20Pro%20application!)
- **Direct Phone**: `+91 6390857720`
- **GitHub**: [https://github.com/adityat54544/employee-task-manager](https://github.com/adityat54544/employee-task-manager)

---

## ⚡ Key Features

### 1. 👑 Manager Power Suite
- **Task Delegation & Assignment**: Create and delegate tasks to specific employees with priorities (`High`, `Medium`, `Low`), deadlines, and categories.
- **Specification Editing & Reassignment**: Edit pre-existing tasks, modify requirements, and reassign tasks dynamically.
- **Employee Onboarding Portal**: Create custom employee accounts or 1-click auto-generate random credentials (`email`, `password`, `EMP-code`).
- **Batch Generator**: Spawn 3 ready-to-test employee accounts in a single click.
- **Account Moderation**: Remove employee accounts with automated unassigned task protection.

### 2. ⚡ Employee Action Cockpit
- **1-Tap Direct Completion**: "I Have Completed This Task!" sets status to `Completed` (100%), triggers a milestone celebration, and logs an automated audit entry.
- **Sprint Transitions**: Freely transition status between `In Progress`, `Pending`, `Completed`, and `Blocked`.
- **Daily Work Logs**: Log hours spent, percentage progress, and blocker notes.
- **Live Shift & Presence**: Toggle presence (🟢 `Working Online`, 🚀 `Deep Focus`, ☕ `On Break`, 🏖️ `Out of Office`).

### 3. 💬 Real-Time Live Chat & Direct Messaging
- **Public & Peer Channels**: `# general` (all-company), `# dev-team` (peer developer chat), `# announcements`.
- **Confidential 1-on-1 DMs to Manager**: Secure private direct message thread between employee and Manager (`Sarah Jenkins`).
- **Manager Moderation**: Pin announcements to the top, delete messages, edit content, broadcast alerts, and react with emojis.

### 4. 🎨 Next-Level Glassmorphic UI/UX
- Ergonomic dark midnight canvas (`#080C14`).
- Psychological color hierarchy: Trust Indigo (`#6366F1`), Mint Emerald (`#10B981`), Warm Amber (`#F59E0B`), Coral Rose (`#F43F5E`).
- Spring physics animations, pulsing live indicators, and dynamic urgency countdowns.
- Password show/hide toggle with spring animated eye icon.

---

## 🚀 Live Deployment Guide

### Option 1: Backend on Render.com (100% Free)
1. Link GitHub repository `adityat54544/employee-task-manager`.
2. Set Root Directory: `backend`.
3. Set Start Command: `node server.js`.
4. Deploy!

### Option 2: Frontend on Vercel.com (1-Click Web Deployment)
1. Import GitHub repository `adityat54544/employee-task-manager`.
2. Set Root Directory: `mobile`.
3. Build Command: `npx expo export --platform web`.
4. Output Directory: `dist`.
5. Set `EXPO_PUBLIC_API_URL` to your live Render backend URL.

### Option 3: Mobile APK Build (Android)
```bash
cd mobile
npx eas build -p android --profile preview
```

---

## 🔑 Demo Login Accounts

| Role | Name | Email | Password |
| :--- | :--- | :--- | :--- |
| **👑 Manager** | Sarah Jenkins | `manager@company.com` | `password123` |
| **👨‍💻 Lead Developer** | Aditya Tiwari | `aditya@company.com` | `aditya@123` |
| **💻 Mobile Engineer** | Rahul Sharma | `rahul@company.com` | `password123` |
| **☁️ Backend Engineer** | Alex Chen | `alex@company.com` | `password123` |
| **🎨 UI/UX Designer** | Priya Patel | `priya@company.com` | `password123` |

---

## 🛠️ Tech Stack
- **Frontend**: React Native, Expo, React Navigation, Expo LinearGradient, Animated API
- **Backend**: Node.js, Express, JWT, bcryptjs, CORS
- **Database**: Cloud Firebase Firestore (Admin SDK) + High-Fidelity In-Memory Store
- **Tools**: GitHub CLI, Firebase CLI, Expo EAS
