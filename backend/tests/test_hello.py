import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_root():
    """ルートエンドポイントのテスト"""
    response = client.get("/")
    assert response.status_code == 200
    assert "message" in response.json()
    assert "Hello World" in response.json()["message"]

def test_health():
    """ヘルスチェックエンドポイントのテスト"""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_hello_world():
    """Hello World APIエンドポイントのテスト"""
    response = client.get("/api/hello")
    assert response.status_code == 200
    assert "message" in response.json()
    assert "Hello World" in response.json()["message"]

def test_hello_name():
    """名前付きHello World APIエンドポイントのテスト"""
    name = "TestUser"
    response = client.get(f"/api/hello/{name}")
    assert response.status_code == 200
    assert "message" in response.json()
    assert name in response.json()["message"] 