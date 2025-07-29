# Expense Tracker - Shortcut Creation Guide

## 🎯 Quick Shortcut Creation

### **Windows Users:**
1. **Automatic Creation:**
   ```cmd
   create-shortcuts.bat
   ```
   This creates desktop, start menu, and taskbar shortcuts automatically.

2. **Manual Creation:**
   - Right-click desktop → New → Shortcut
   - Target: `powershell.exe -ExecutionPolicy Bypass -File "C:\path\to\DailyExpense\launch-expense-tracker.ps1"`
   - Name: "Expense Tracker"
   - Change icon to: `frontend\public\favicon.ico`

### **Linux/macOS Users:**
1. **Automatic Creation:**
   ```bash
   chmod +x create-shortcuts.sh
   ./create-shortcuts.sh
   ```

2. **Manual Creation:**
   ```bash
   # Make startup script executable
   chmod +x start-expense-tracker.sh
   
   # Create desktop shortcut
   ln -s "$(pwd)/start-expense-tracker.sh" ~/Desktop/ExpenseTracker
   ```

---

## 🔗 Types of Shortcuts Available

### **1. Desktop Shortcuts**
- **Windows:** `.lnk` files with custom icons
- **macOS:** `.command` files
- **Linux:** `.desktop` files

### **2. Start Menu / Applications Menu**
- **Windows:** Start menu and startup folder
- **macOS:** Applications folder with `.app` bundle
- **Linux:** Applications menu with `.desktop` entries

### **3. Taskbar / Dock Shortcuts**
- Pin browser tabs or application shortcuts
- Quick access from system tray/dock

### **4. Auto-Start Shortcuts**
- **Windows:** Startup folder
- **macOS:** LaunchAgents
- **Linux:** Autostart directory

---

## 🚀 How to Use Shortcuts

### **Starting the App:**
1. **Double-click** any shortcut
2. Wait for services to start (30-60 seconds first time)
3. Browser opens automatically to http://localhost:3000

### **Stopping the App:**
1. **Close browser tabs**
2. **Close command windows** (Spring Boot & React)
3. **Or press Ctrl+C** in terminal windows

### **Quick Access:**
- **Pin to taskbar/dock** for one-click access
- **Use keyboard shortcuts** (Win+R, type shortcut name)
- **Search in start menu** for "Expense Tracker"

---

## 🛠️ Customizing Shortcuts

### **Windows Customization:**

#### **Change Icon:**
1. Right-click shortcut → Properties
2. Click "Change Icon"
3. Browse to `frontend\public\favicon.ico`

#### **Run as Administrator:**
1. Right-click shortcut → Properties
2. Click "Advanced"
3. Check "Run as administrator"

#### **Keyboard Shortcut:**
1. Right-click shortcut → Properties
2. Click in "Shortcut key" field
3. Press desired key combination (e.g., Ctrl+Alt+E)

### **macOS Customization:**

#### **Change Icon:**
1. Get Info on shortcut
2. Drag new icon to the icon area
3. Or copy icon from another app

#### **Add to Dock:**
1. Drag `.command` file to Applications
2. Drag from Applications to Dock

### **Linux Customization:**

#### **Edit Desktop Entry:**
```bash
nano ~/Desktop/expense-tracker.desktop
```

#### **Change Icon:**
```bash
# Update icon path in .desktop file
Icon=/path/to/your/icon.png
```

---

## 🔧 Advanced Shortcut Features

### **Windows Advanced:**

#### **Create System-Wide Shortcuts:**
```cmd
# Run as Administrator
mklink "C:\ProgramData\Microsoft\Windows\Start Menu\Programs\Expense Tracker.lnk" "C:\path\to\launch-expense-tracker.ps1"
```

#### **Create URL Shortcut:**
```cmd
# Create .url file
echo [InternetShortcut] > "Expense Tracker.url"
echo URL=http://localhost:3000 >> "Expense Tracker.url"
```

### **macOS Advanced:**

#### **Create Service:**
1. Open Automator
2. Create new Service
3. Add "Run Shell Script" action
4. Set script to: `cd "/path/to/DailyExpense" && ./start-expense-tracker.sh`

#### **Create Quick Action:**
1. Open Automator
2. Create new Quick Action
3. Add "Run Shell Script"
4. Save as "Start Expense Tracker"

### **Linux Advanced:**

#### **Create Keyboard Shortcut:**
1. Settings → Keyboard → Custom Shortcuts
2. Add new shortcut
3. Command: `/path/to/start-expense-tracker.sh`
4. Shortcut: Ctrl+Alt+E

#### **Create Panel Applet:**
```bash
# Create panel launcher
cat > ~/.config/panel/expense-tracker.desktop << EOF
[Desktop Entry]
Name=Expense Tracker
Exec=/path/to/start-expense-tracker.sh
Icon=/path/to/favicon.ico
Type=Application
EOF
```

---

## 📱 Mobile Access Shortcuts

### **Create Mobile Bookmarks:**
1. Open app on mobile browser
2. Add to home screen/bookmarks
3. Access from mobile home screen

### **QR Code Shortcuts:**
1. Generate QR code for http://localhost:3000
2. Scan with mobile device
3. Quick access from camera app

### **PWA Installation:**
1. Open app in Chrome/Edge
2. Click "Install" in address bar
3. App appears in app drawer

---

## 🔄 Updating Shortcuts

### **When Moving the Project:**
1. **Delete old shortcuts**
2. **Run shortcut creation script again**
3. **Or manually update paths**

### **When Updating the App:**
1. **Shortcuts remain valid**
2. **No need to recreate**
3. **Just restart the app**

---

## 🚨 Troubleshooting Shortcuts

### **Common Issues:**

#### **Shortcut Not Working:**
1. **Check file paths** are correct
2. **Verify permissions** on scripts
3. **Run as administrator** if needed

#### **Icon Not Showing:**
1. **Check icon file exists**
2. **Use absolute paths** for icons
3. **Clear icon cache** (Windows: `ie4uinit.exe -show`)

#### **Auto-Start Not Working:**
1. **Check startup folder permissions**
2. **Verify script paths** are absolute
3. **Check system startup settings**

#### **Permission Denied:**
```bash
# Linux/macOS
chmod +x *.sh
chmod +x mvnw

# Windows
# Run as Administrator
```

---

## 📋 Shortcut Checklist

### **After Installation:**
- [ ] Run shortcut creation script
- [ ] Test desktop shortcut
- [ ] Test applications menu entry
- [ ] Pin to taskbar/dock
- [ ] Test auto-start (optional)
- [ ] Create mobile bookmark

### **For Distribution:**
- [ ] Include shortcut scripts
- [ ] Test on target system
- [ ] Provide setup instructions
- [ ] Include troubleshooting guide

---

## 🎉 Success!

Your Expense Tracker now has convenient shortcuts for:
- ✅ **One-click startup**
- ✅ **Quick access from anywhere**
- ✅ **Auto-start with system** (optional)
- ✅ **Mobile access**
- ✅ **Professional appearance**

**Happy shortcutting! 🚀** 