#!/bin/bash
cd "$(dirname "$0")"

echo "Activating virtual environment..."
source venv/bin/activate 2>/dev/null || true

echo "Installing dependencies..."
pip install -r requirements.txt -q

echo "Initializing database..."
python3 scripts/init_db.py
python3 scripts/init_flows_api.py

echo "Starting FastAPI server..."
python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload