#!/bin/bash

# Create Expense Tracker Shortcuts for Linux/macOS
# This script creates desktop entries and application shortcuts

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_NAME="Expense Tracker"
SHORTCUT_NAME="expense-tracker"

echo -e "${BLUE}========================================"
echo -e "    Creating Expense Tracker Shortcuts"
echo -e "========================================${NC}"
echo

echo "Project directory: $SCRIPT_DIR"
echo

# Detect operating system
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    OS="macos"
    DESKTOP_PATH="$HOME/Desktop"
    APPLICATIONS_PATH="/Applications"
    echo -e "${GREEN}Detected: macOS${NC}"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    OS="linux"
    DESKTOP_PATH="$HOME/Desktop"
    APPLICATIONS_PATH="$HOME/.local/share/applications"
    echo -e "${GREEN}Detected: Linux${NC}"
else
    echo -e "${RED}Unsupported operating system: $OSTYPE${NC}"
    exit 1
fi

# Create applications directory if it doesn't exist
mkdir -p "$APPLICATIONS_PATH"

# Make the startup script executable
chmod +x "$SCRIPT_DIR/start-expense-tracker.sh"

# Function to create desktop entry
create_desktop_entry() {
    local entry_path="$1"
    local entry_name="$2"
    local description="$3"
    
    cat > "$entry_path" << EOF
[Desktop Entry]
Name=$PROJECT_NAME
Comment=$description
Exec="$SCRIPT_DIR/start-expense-tracker.sh"
Icon=$SCRIPT_DIR/frontend/public/favicon.ico
Terminal=false
Type=Application
Categories=Finance;Office;
Keywords=expense;tracker;finance;budget;
EOF

    chmod +x "$entry_path"
    echo -e "${GREEN}✓ Created: $entry_name${NC}"
}

# Create desktop shortcut
echo -e "${YELLOW}[1/3] Creating desktop shortcut...${NC}"
if [ "$OS" = "macos" ]; then
    # macOS: Create .command file
    DESKTOP_SHORTCUT="$DESKTOP_PATH/ExpenseTracker.command"
    cat > "$DESKTOP_SHORTCUT" << 'EOF'
#!/bin/bash
cd "$(dirname "$0")"
./start-expense-tracker.sh
EOF
    chmod +x "$DESKTOP_SHORTCUT"
    echo -e "${GREEN}✓ Created: Desktop shortcut (.command)${NC}"
else
    # Linux: Create .desktop file
    DESKTOP_SHORTCUT="$DESKTOP_PATH/$SHORTCUT_NAME.desktop"
    create_desktop_entry "$DESKTOP_SHORTCUT" "Desktop shortcut" "Personal expense tracking application"
fi

# Create applications menu entry
echo -e "${YELLOW}[2/3] Creating applications menu entry...${NC}"
if [ "$OS" = "macos" ]; then
    # macOS: Create .app bundle (simplified)
    APP_BUNDLE="$APPLICATIONS_PATH/ExpenseTracker.app"
    mkdir -p "$APP_BUNDLE/Contents/MacOS"
    mkdir -p "$APP_BUNDLE/Contents/Resources"
    
    # Create Info.plist
    cat > "$APP_BUNDLE/Contents/Info.plist" << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleExecutable</key>
    <string>ExpenseTracker</string>
    <key>CFBundleIdentifier</key>
    <string>com.expensetracker.app</string>
    <key>CFBundleName</key>
    <string>Expense Tracker</string>
    <key>CFBundleVersion</key>
    <string>1.0</string>
    <key>CFBundleShortVersionString</key>
    <string>1.0</string>
    <key>CFBundleIconFile</key>
    <string>favicon.ico</string>
</dict>
</plist>
EOF

    # Create executable
    cat > "$APP_BUNDLE/Contents/MacOS/ExpenseTracker" << EOF
#!/bin/bash
cd "$SCRIPT_DIR"
./start-expense-tracker.sh
EOF
    chmod +x "$APP_BUNDLE/Contents/MacOS/ExpenseTracker"
    
    # Copy icon
    cp "$SCRIPT_DIR/frontend/public/favicon.ico" "$APP_BUNDLE/Contents/Resources/" 2>/dev/null || true
    
    echo -e "${GREEN}✓ Created: Applications menu entry (.app)${NC}"
else
    # Linux: Create .desktop file in applications directory
    APP_ENTRY="$APPLICATIONS_PATH/$SHORTCUT_NAME.desktop"
    create_desktop_entry "$APP_ENTRY" "Applications menu entry" "Personal expense tracking application"
fi

# Create startup entry (optional)
echo -e "${YELLOW}[3/3] Creating startup entry...${NC}"
if [ "$OS" = "macos" ]; then
    # macOS: Create LaunchAgent
    LAUNCH_AGENT="$HOME/Library/LaunchAgents/com.expensetracker.startup.plist"
    mkdir -p "$(dirname "$LAUNCH_AGENT")"
    
    cat > "$LAUNCH_AGENT" << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.expensetracker.startup</string>
    <key>ProgramArguments</key>
    <array>
        <string>$SCRIPT_DIR/start-expense-tracker.sh</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <false/>
</dict>
</plist>
EOF

    echo -e "${GREEN}✓ Created: Startup entry (LaunchAgent)${NC}"
    echo -e "${YELLOW}Note: To enable auto-start, run: launchctl load $LAUNCH_AGENT${NC}"
else
    # Linux: Create autostart entry
    AUTOSTART_DIR="$HOME/.config/autostart"
    mkdir -p "$AUTOSTART_DIR"
    AUTOSTART_ENTRY="$AUTOSTART_DIR/$SHORTCUT_NAME.desktop"
    create_desktop_entry "$AUTOSTART_ENTRY" "Startup entry" "Personal expense tracking application (Auto-start)"
fi

echo
echo -e "${GREEN}========================================"
echo -e "    Shortcuts Created Successfully!"
echo -e "========================================${NC}"
echo
echo -e "${BLUE}Created shortcuts:${NC}"
if [ "$OS" = "macos" ]; then
    echo "• Desktop: $DESKTOP_SHORTCUT"
    echo "• Applications: $APP_BUNDLE"
    echo "• Startup: $LAUNCH_AGENT"
else
    echo "• Desktop: $DESKTOP_SHORTCUT"
    echo "• Applications: $APP_ENTRY"
    echo "• Startup: $AUTOSTART_ENTRY"
fi
echo
echo -e "${BLUE}To use the shortcuts:${NC}"
echo "1. Double-click any shortcut to start the app"
echo "2. Drag desktop shortcut to dock/taskbar for quick access"
echo "3. Search for 'Expense Tracker' in applications menu"
echo
echo -e "${YELLOW}Note:${NC} First run may take longer as dependencies are downloaded"
echo
read -p "Press Enter to continue..." 