#!/bin/bash

# ANSI color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
RESET='\033[0m'

echo -e "${MAGENTA}"
echo "==============================================="
echo "    TownTap Quick Setup and Optimization"
echo "==============================================="
echo -e "${RESET}"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}Error: Node.js is not installed or not in PATH${RESET}"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}Error: npm is not installed or not in PATH${RESET}"
    echo "Please check your Node.js installation"
    exit 1
fi

# Make this script executable if it isn't already
if [ ! -x "$0" ]; then
    chmod +x "$0"
fi

# Run the project setup script
echo -e "${CYAN}Running project setup and optimization...${RESET}"
echo
node scripts/project-setup.js

if [ $? -ne 0 ]; then
    echo
    echo -e "${YELLOW}Setup encountered some issues. Please check the output above.${RESET}"
else
    echo
    echo -e "${GREEN}Setup completed successfully!${RESET}"
fi

echo
echo "Press Enter to exit..."
read
