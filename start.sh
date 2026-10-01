#!/bin/bash

# Get the directory of this script
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR"

echo "========================================="
echo "       eComFly Dev Server Runner       "
echo "========================================="

# Variable to store process ID
APP_PID=""

start_server() {
    echo -e "\n🚀 Starting frontend and backend..."
    # We use setsid or similar to run in new process group? No, just run it
    set -m; npm run dev &
    APP_PID=$!
}

stop_server() {
    if [ -n "$APP_PID" ]; then
        echo -e "\n🛑 Stopping servers (PID: $APP_PID)..."
        # Send SIGTERM to the process group of the app to kill all children (concurrently, vite, node)
        kill -TERM -$APP_PID 2>/dev/null || kill -TERM $APP_PID 2>/dev/null
        # Wait for the process to actually terminate
        wait $APP_PID 2>/dev/null
        APP_PID=""
    fi
}

# Trap exit signals to ensure we clean up processes when terminal is closed
trap stop_server EXIT INT TERM

start_server

echo "-----------------------------------------"
echo " Commands:"
echo " [r] Rebuild and reload the app"
echo " [o] Open frontend in browser"
echo " [q] Quit and stop servers"
echo "-----------------------------------------"

while true; do
    read -n 1 -s key
    if [[ "$key" == "r" || "$key" == "R" ]]; then
        stop_server
        start_server
        echo "-----------------------------------------"
        echo " Commands: [r] Reload | [o] Open Browser | [q] Quit"
        echo "-----------------------------------------"
    elif [[ "$key" == "o" || "$key" == "O" ]]; then
        echo -e "\n🌐 Opening http://localhost:3000 in browser..."
        open http://localhost:3000
    elif [[ "$key" == "q" || "$key" == "Q" ]]; then
        echo -e "\n👋 Exiting..."
        stop_server
        exit 0
    fi
done
