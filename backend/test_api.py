#!/usr/bin/env python3

import sys
import os
sys.path.append(os.path.dirname(__file__))

from app.main import app
import uvicorn

if __name__ == "__main__":
    print("Starting Clutch Log API server...")
    print("Available endpoints:")
    print("- GET /: Welcome message")
    print("- GET /health: Health check")
    print("- GET /api/motorcycles/makes: Available makes")
    print("- GET /api/motorcycles/makes/{make}/models: Available models")
    print("- POST /api/motorcycles: Create motorcycle")
    print("- GET /api/motorcycles: List motorcycles")
    print("- GET /docs: API documentation")
    
    uvicorn.run(app, host="127.0.0.1", port=8000, log_level="info")