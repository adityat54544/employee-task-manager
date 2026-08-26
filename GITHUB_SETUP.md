# 🚀 GitHub Repository Setup & Push Guide

Follow these simple steps to push your new Employee Task Manager project to GitHub:

---

## 1. Create a New Repository on GitHub
1. Open [GitHub](https://github.com/new).
2. Set Repository Name: `employee-task-manager` (or `taskmaster-pro`).
3. Set Visibility: **Public** (to showcase to employers).
4. Do **not** check "Initialize with README" or .gitignore (we already have them generated).
5. Click **"Create repository"**.

---

## 2. Initialize Git & Commit All Files

Open PowerShell / Terminal in your project root (`c:\Users\adity\Desktop\App`):

```bash
# 1. Initialize Git (if not already done)
git init

# 2. Stage all project files
git add .

# 3. Create initial commit
git commit -m "feat: complete employee task manager with react native, node express, and firebase"

# 4. Set main branch
git branch -M main

# 5. Link to your GitHub remote repository (replace with your repo URL)
git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/employee-task-manager.git

# 6. Push code to GitHub
git push -u origin main
```

---

## 3. Pushing Future Updates

Whenever you make changes or additions:
```bash
git add .
git commit -m "feat: update task progress workflow and UI animations"
git push
```
