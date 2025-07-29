# Expense Tracker - Complete Setup Guide

## 🚀 Quick Start for Any System

### **System Requirements**
- **Java 17+** (for Spring Boot backend)
- **Node.js 16+** (for React frontend)
- **Git** (to clone the repository)
- **4GB RAM** minimum
- **2GB free disk space**

---

## 📋 Step-by-Step Installation

### **1. Clone the Repository**
```bash
git clone https://github.com/fiyaznafa/DailyExpense.git
cd DailyExpense
```

### **2. Install Prerequisites**

#### **Windows:**
- Download [Java 17+](https://adoptium.net/) and install
- Download [Node.js 16+](https://nodejs.org/) and install
- Verify installation:
  ```cmd
  java -version
  node --version
  npm --version
  ```

#### **macOS:**
```bash
# Using Homebrew
brew install openjdk@17
brew install node

# Or download from official websites
```

#### **Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install openjdk-17-jdk
sudo apt install nodejs npm
```

### **3. First-Time Setup**
```bash
# Install frontend dependencies
cd frontend
npm install
cd ..
```

---

## 🎯 Running the Application

### **Method 1: Using Provided Scripts (Recommended)**

#### **Windows:**
```powershell
# Option A: PowerShell script
.\launch-expense-tracker.ps1

# Option B: VBScript (double-click)
start-simple.vbs
```

#### **Linux/macOS:**
```bash
# Make scripts executable
chmod +x mvnw
chmod +x start-expense-tracker.sh

# Run the launcher
./start-expense-tracker.sh
```

### **Method 2: Manual Start**
```bash
# Terminal 1: Start Backend
./mvnw spring-boot:run

# Terminal 2: Start Frontend
cd frontend
npm start
```

### **Method 3: One-Command Start**
```bash
# Windows
start-expense-tracker.bat

# Linux/macOS
./start-expense-tracker.sh
```

---

## 🔗 Creating Shortcuts

### **Windows Shortcuts**

#### **Desktop Shortcut:**
1. Right-click on desktop → New → Shortcut
2. Target: `powershell.exe -ExecutionPolicy Bypass -File "C:\path\to\DailyExpense\launch-expense-tracker.ps1"`
3. Name: "Expense Tracker"
4. Right-click shortcut → Properties → Change Icon → Browse to `frontend\public\favicon.ico`

#### **Start Menu Shortcut:**
1. Press `Win + R`, type `shell:startup`
2. Create shortcut with same target as above
3. App will auto-start with Windows

#### **Taskbar Pinned Shortcut:**
1. Run the app once using any method
2. Right-click the browser tab → Pin to taskbar
3. Or pin the PowerShell shortcut to taskbar

### **macOS Shortcuts**

#### **Applications Folder Shortcut:**
```bash
# Create .command file
cat > ~/Desktop/ExpenseTracker.command << 'EOF'
#!/bin/bash
cd "/path/to/DailyExpense"
./start-expense-tracker.sh
EOF

chmod +x ~/Desktop/ExpenseTracker.command
```

#### **Dock Shortcut:**
1. Drag the `.command` file to Applications folder
2. Drag from Applications to Dock

### **Linux Shortcuts**

#### **Desktop Entry:**
```bash
cat > ~/.local/share/applications/expense-tracker.desktop << EOF
[Desktop Entry]
Name=Expense Tracker
Comment=Personal expense tracking application
Exec=/path/to/DailyExpense/start-expense-tracker.sh
Icon=/path/to/DailyExpense/frontend/public/favicon.ico
Terminal=false
Type=Application
Categories=Finance;
EOF
```

---

## 🌐 Access Points

Once running, access the app at:
- **Main App:** http://localhost:3000
- **Backend API:** http://localhost:8080
- **Database Console:** http://localhost:8080/h2-console

---

## 🛠️ Troubleshooting

### **Common Issues:**

1. **Port Already in Use:**
   ```bash
   # Windows
   netstat -ano | findstr :8080
   taskkill /PID <PID> /F

   # Linux/macOS
   lsof -i :8080
   kill -9 <PID>
   ```

2. **Java Version Issues:**
   ```bash
   java -version  # Should show Java 17+
   ```

3. **Node.js Issues:**
   ```bash
   node --version  # Should show 16+
   npm install     # Reinstall if needed
   ```

4. **Permission Issues (Linux/macOS):**
   ```bash
   chmod +x mvnw
   chmod +x *.sh
   ```

5. **Database Issues:**
   - Delete `data/` folder to reset database
   - Check H2 console at http://localhost:8080/h2-console

---

## 📱 Mobile Access

### **Local Network Access:**
1. Find your computer's IP address:
   ```bash
   # Windows
   ipconfig

   # Linux/macOS
   ifconfig
   ```

2. Access from mobile: `http://YOUR_IP:3000`

### **Port Forwarding (Advanced):**
- Configure router to forward port 3000 to your computer
- Access from anywhere: `http://YOUR_PUBLIC_IP:3000`

---

## 🔧 Advanced Configuration

### **Custom Ports:**
Edit `frontend/package.json`:
```json
"scripts": {
  "start": "PORT=3001 react-scripts start"
}
```

Edit `src/main/resources/application.properties`:
```properties
server.port=8081
```

### **Database Configuration:**
The app uses H2 database with file persistence:
- Database file: `./data/expenses.mv.db`
- H2 Console: http://localhost:8080/h2-console
- JDBC URL: `jdbc:h2:file:./data/expenses`
- Username: `sa`
- Password: (empty)

---

## 📦 Distribution

### **For Other Users:**
1. Clone the repository
2. Install prerequisites (Java 17+, Node.js 16+)
3. Run `cd frontend && npm install`
4. Create shortcuts using methods above
5. Share the shortcut files

### **Portable Version:**
1. Include Java and Node.js in the distribution
2. Create self-contained launcher scripts
3. Package as ZIP file with instructions

---

## 🎉 Success!

Your Expense Tracker is now ready to use! The app will:
- Track daily expenses with categories
- Show spending trends and charts
- Export reports as PDF
- Work on desktop and mobile browsers
- Persist data between sessions

**Happy Expense Tracking! 💰📊** 