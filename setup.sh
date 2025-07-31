#!/bin/bash

# Colors for terminal output
GREEN="\033[0;32m"
BLUE="\033[0;34m"
YELLOW="\033[1;33m"
NC="\033[0m" # No Color

# Function to print formatted messages
print_message() {
  echo -e "${BLUE}[Workout Discipline Tracker]${NC} $1"
}

print_success() {
  echo -e "${GREEN}✓ Success:${NC} $1"
}

print_step() {
  echo -e "\n${YELLOW}▶ Step $1:${NC} $2"
}

# Start setup
clear
print_message "Starting project setup..."
echo -e "⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯"

# Step 1: Install dependencies
print_step "1" "Installing dependencies"
if npm install; then
  print_success "Dependencies installed successfully"
else
  echo -e "\033[0;31m✗ Error: Failed to install dependencies\033[0m"
  exit 1
fi

# Step 2: Create src/utils directory if it doesn't exist
print_step "2" "Setting up project structure"
mkdir -p src/utils
if [ $? -eq 0 ]; then
  print_success "Project structure created successfully"
else
  echo -e "\033[0;31m✗ Error: Failed to create project structure\033[0m"
  exit 1
fi

# Step 3: Copy shared imports file
print_step "3" "Setting up shared imports"
if [ -f "scripts/sharedImports.ts" ]; then
  cp scripts/sharedImports.ts src/utils/sharedImports.ts
  if [ $? -eq 0 ]; then
    print_success "Shared imports copied successfully"
  else
    echo -e "\033[0;31m✗ Error: Failed to copy shared imports\033[0m"
    exit 1
  fi
else
  # Create a default sharedImports.ts if it doesn't exist
  print_message "Creating default shared imports file..."
  mkdir -p scripts
  cat > scripts/sharedImports.ts << EOL
/**
 * Centralized imports for the Workout Discipline Tracker
 * 
 * This file provides a single source of imports for commonly used
 * React hooks, components, and utilities across the application.
 */

// React imports
import { useState, useEffect, useRef, useMemo, useCallback } from 'react';

// Next.js imports
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

// Export common React hooks
export {
  useState, 
  useEffect, 
  useRef, 
  useMemo, 
  useCallback,
  Link,
  Image,
  useRouter
};

// App-specific utility functions
export function useFormattedDate() {
  return () => new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

// Add your commonly used utilities and hooks here
EOL

  cp scripts/sharedImports.ts src/utils/sharedImports.ts
  if [ $? -eq 0 ]; then
    print_success "Default shared imports created and copied successfully"
  else
    echo -e "\033[0;31m✗ Error: Failed to create default shared imports\033[0m"
    exit 1
  fi
fi

# Step 4: Final success message
echo -e "\n${GREEN}✅ Setup Complete!${NC}"
echo -e "${BLUE}[Workout Discipline Tracker]${NC} Your project is ready to use."
echo -e "${BLUE}[Workout Discipline Tracker]${NC} Run 'npm run dev' to start the development server.\n"
