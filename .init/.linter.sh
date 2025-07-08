#!/bin/bash
cd /home/kavia/workspace/code-generation/webtictactoe-arena-69408-0f01fb57/tic_tac_toe_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

