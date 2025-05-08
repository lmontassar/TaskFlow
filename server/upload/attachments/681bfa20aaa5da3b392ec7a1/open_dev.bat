@echo off

REM Open VS Code for server and client silently
start "" /b code server
start "" /b code client

REM Move to client folder and start the dev server
cd client
npm run dev


