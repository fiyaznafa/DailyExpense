#!/bin/bash

# Expense Tracker Launcher Script for Linux/macOS
# This script starts both the Spring Boot backend and React frontend

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo -e "${BLUE}========================================"
echo -e "    Expense Tracker - Starting Up..."
echo -e "========================================${NC}"
echo

# Check if we're in the right directory
if [ ! -f "pom.xml" ]; then
    echo -e "${RED}ERROR: pom.xml not found!${NC}"
    echo "Please ensure this script is in the Expense Tracker project directory."
    echo "Current directory: $(pwd)"
    read -p "Press Enter to exit..."
    exit 1
fi

# Check if frontend directory exists
if [ ! -d "frontend" ]; then
    echo -e "${RED}ERROR: frontend directory not found!${NC}"
    echo "Please ensure this script is in the Expense Tracker project directory."
    read -p "Press Enter to exit..."
    exit 1
fi

# Check if Maven wrapper exists
if [ ! -f "mvnw" ]; then
    echo -e "${RED}ERROR: Maven wrapper (mvnw) not found!${NC}"
    echo "Please ensure this script is in the Expense Tracker project directory."
    read -p "Press Enter to exit..."
    exit 1
fi

# Make mvnw executable
chmod +x mvnw

echo -e "${GREEN}Starting Expense Tracker...${NC}"
echo "Project directory: $(pwd)"
echo

# Function to cleanup background processes
cleanup() {
    echo -e "\n${YELLOW}Shutting down services...${NC}"
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null
    fi
    echo -e "${GREEN}Services stopped.${NC}"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Start the Spring Boot backend
echo -e "${YELLOW}[1/3] Starting Spring Boot backend...${NC}"
./mvnw spring-boot:run > backend.log 2>&1 &
BACKEND_PID=$!

# Wait for backend to start
echo "Waiting for backend to start..."
sleep 10

# Check if backend started successfully
if ! kill -0 $BACKEND_PID 2>/dev/null; then
    echo -e "${RED}ERROR: Backend failed to start!${NC}"
    echo "Check backend.log for details."
    read -p "Press Enter to exit..."
    exit 1
fi

# Start the React frontend
echo -e "${YELLOW}[2/3] Starting React frontend...${NC}"
cd frontend
export BROWSER=none
npm start > ../frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

# Wait for frontend to start
echo "Waiting for frontend to start..."
sleep 15

# Check if frontend started successfully
if ! kill -0 $FRONTEND_PID 2>/dev/null; then
    echo -e "${RED}ERROR: Frontend failed to start!${NC}"
    echo "Check frontend.log for details."
    cleanup
    exit 1
fi

# Open the browser
echo -e "${YELLOW}[3/3] Opening browser...${NC}"
if command -v xdg-open > /dev/null; then
    # Linux
    xdg-open http://localhost:3000 &
elif command -v open > /dev/null; then
    # macOS
    open http://localhost:3000 &
else
    echo "Please open http://localhost:3000 in your browser"
fi

echo
echo -e "${GREEN}========================================"
echo -e "    Expense Tracker is Running!"
echo -e "========================================${NC}"
echo
echo -e "${BLUE}Backend:  ${NC}http://localhost:8080"
echo -e "${BLUE}Frontend: ${NC}http://localhost:3000"
echo -e "${BLUE}H2 Console: ${NC}http://localhost:8080/h2-console"
echo
echo -e "${YELLOW}To stop the services:${NC}"
echo "1. Press Ctrl+C in this terminal"
echo "2. Or close the browser tabs"
echo
echo -e "${GREEN}Press Ctrl+C to stop all services...${NC}"

# Wait for user to stop
wait 