from fastapi.testclient import TestClient
from app.main import app
from pathlib import Path
import json
client = TestClient(app)

def test_schedule_success():
    json_path = Path(__file__).parent / "data.json"
    with open(json_path, "r", encoding="utf-8") as f:
        sample_request = json.load(f)
    
    response = client.post("/schedule", json=sample_request)
    assert response.status_code == 200
    json_data = response.json()
    assert "schedule" in json_data
