# Expense Tracker - Quick Start Guide

## 🚀 How to Use This App on Any System

### **Prerequisites (Install Once):**
- **Java 17+** - [Download here](https://adoptium.net/)
- **Node.js 16+** - [Download here](https://nodejs.org/)
- **Git** - [Download here](https://git-scm.com/)

### **Step 1: Get the App**
```bash
git clone https://github.com/fiyaznafa/DailyExpense.git
cd DailyExpense
```

### **Step 2: Install Dependencies**
```bash
cd frontend
npm install
cd ..
```

### **Step 3: Start the App**

#### **Windows:**
```cmd
# Option 1: One-click batch file
start-expense-tracker.bat

# Option 2: PowerShell script
.\launch-expense-tracker.ps1

# Option 3: VBScript (double-click)
start-simple.vbs
```

#### **Linux/macOS:**
```bash
# Make scripts executable (first time only)
chmod +x start-expense-tracker.sh
chmod +x create-shortcuts.sh

# Start the app
./start-expense-tracker.sh
```

### **Step 4: Access the App**
- **Main App:** http://localhost:3000
- **Backend API:** http://localhost:8080
- **Database Console:** http://localhost:8080/h2-console

---

## 🔗 Creating Shortcuts for Easy Access

### **Windows Shortcuts:**
```cmd
# Automatic shortcut creation
create-shortcuts.bat
```

**This creates:**
- Desktop shortcut with custom icon
- Start menu entry
- Auto-start option

### **Linux/macOS Shortcuts:**
```bash
# Automatic shortcut creation
./create-shortcuts.sh
```

**This creates:**
- Desktop shortcut
- Applications menu entry
- Auto-start option

### **Manual Shortcut Creation:**

#### **Windows:**
1. Right-click desktop → New → Shortcut
2. Target: `powershell.exe -ExecutionPolicy Bypass -File "C:\path\to\DailyExpense\launch-expense-tracker.ps1"`
3. Name: "Expense Tracker"
4. Change icon to: `frontend\public\favicon.ico`

#### **macOS:**
```bash
# Create .command file
cat > ~/Desktop/ExpenseTracker.command << 'EOF'
#!/bin/bash
cd "/path/to/DailyExpense"
./start-expense-tracker.sh
EOF
chmod +x ~/Desktop/ExpenseTracker.command
```

#### **Linux:**
```bash
# Create desktop entry
cat > ~/Desktop/expense-tracker.desktop << EOF
[Desktop Entry]
Name=Expense Tracker
Exec=/path/to/DailyExpense/start-expense-tracker.sh
Icon=/path/to/DailyExpense/frontend/public/favicon.ico
Terminal=false
Type=Application
Categories=Finance;
EOF
chmod +x ~/Desktop/expense-tracker.desktop
```

---

## 📱 Mobile Access

### **Local Network Access:**
1. Find your computer's IP:
   ```bash
   # Windows
   ipconfig
   
   # Linux/macOS
   ifconfig
   ```
2. Access from mobile: `http://YOUR_IP:3000`

### **Mobile Shortcuts:**
1. Open app on mobile browser
2. Add to home screen/bookmarks
3. Access like a native app

---

## 🛠️ Troubleshooting

### **Common Issues:**

#### **Port Already in Use:**
```bash
# Windows
netstat -ano | findstr :8080
taskkill /PID <PID> /F

# Linux/macOS
lsof -i :8080
kill -9 <PID>
```

#### **Java/Node.js Not Found:**
```bash
# Check versions
java -version
node --version
npm --version
```

#### **Permission Issues (Linux/macOS):**
```bash
chmod +x *.sh
chmod +x mvnw
```

#### **Database Issues:**
- Delete `data/` folder to reset
- Check H2 console at http://localhost:8080/h2-console

---

## 🎯 Quick Commands Reference

### **Start the App:**
- **Windows:** `start-expense-tracker.bat`
- **Linux/macOS:** `./start-expense-tracker.sh`

### **Create Shortcuts:**
- **Windows:** `create-shortcuts.bat`
- **Linux/macOS:** `./create-shortcuts.sh`

### **Manual Start:**
```bash
# Terminal 1: Backend
./mvnw spring-boot:run

# Terminal 2: Frontend
cd frontend && npm start
```

### **Stop the App:**
- Close browser tabs
- Close command windows
- Or press Ctrl+C in terminals

---

## 📋 Setup Checklist

### **First Time Setup:**
- [ ] Install Java 17+
- [ ] Install Node.js 16+
- [ ] Clone repository
- [ ] Run `cd frontend && npm install`
- [ ] Test app startup
- [ ] Create shortcuts
- [ ] Test shortcuts
- [ ] Pin to taskbar/dock

### **For Other Users:**
- [ ] Share repository URL
- [ ] Include setup instructions
- [ ] Provide shortcut scripts
- [ ] Test on target system

---

## 🎉 You're Ready!

Your Expense Tracker is now:
- ✅ **Installed and running**
- ✅ **Accessible via shortcuts**
- ✅ **Available on mobile**
- ✅ **Ready for daily use**

**Start tracking your expenses! 💰📊** 