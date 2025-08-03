import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, AsyncMock
import base64
import io

from app.main import app
from app.api.image_generation import (
    ImageGenerationResponse,
    ImageMetadata,
    ImageGenerationError,
    ImageGenerationErrorCode,
    StylePreset
)


@pytest.fixture
def client():
    return TestClient(app)


@pytest.fixture
def mock_image_response():
    return ImageGenerationResponse(
        image_url="https://example.com/generated.jpg",
        image_id="test-123",
        metadata=ImageMetadata(
            prompt="Test prompt",
            width=1024,
            height=1024,
            model="test-model",
            timestamp="2024-01-01T00:00:00Z"
        )
    )


class TestImageGenerationEndpoints:
    """Test image generation API endpoints"""
    
    @patch('app.api.image_routes.image_api')
    def test_generate_image_success(self, mock_api, client, mock_image_response):
        mock_api.generate_image = AsyncMock(return_value=mock_image_response)
        
        response = client.post("/api/v1/images/generate", json={
            "prompt": "A beautiful sunset",
            "width": 1024,
            "height": 1024
        })
        
        assert response.status_code == 200
        data = response.json()
        assert data["image_id"] == "test-123"
        assert data["image_url"] == "https://example.com/generated.jpg"
    
    @patch('app.api.image_routes.content_filter')
    def test_generate_image_blocked_content(self, mock_filter, client):
        mock_filter.check_prompt = AsyncMock(return_value={
            "is_allowed": False,
            "reason": "Inappropriate content detected"
        })
        
        response = client.post("/api/v1/images/generate", json={
            "prompt": "inappropriate content"
        })
        
        assert response.status_code == 400
        data = response.json()
        assert data["detail"]["error"] == ImageGenerationErrorCode.NSFW_CONTENT
    
    @patch('app.api.image_routes.prompt_optimizer')
    @patch('app.api.image_routes.image_api')
    def test_generate_with_style_enhancement(self, mock_api, mock_optimizer, client, mock_image_response):
        mock_optimizer.enhance_prompt = AsyncMock(return_value="enhanced prompt")
        mock_optimizer.suggest_negative_prompt = AsyncMock(return_value="negative prompt")
        mock_api.generate_image = AsyncMock(return_value=mock_image_response)
        
        response = client.post("/api/v1/images/generate", json={
            "prompt": "original prompt",
            "stylePreset": "anime"
        })
        
        assert response.status_code == 200
        mock_optimizer.enhance_prompt.assert_called_once()
        mock_optimizer.suggest_negative_prompt.assert_called_once()
    
    def test_generate_image_invalid_request(self, client):
        response = client.post("/api/v1/images/generate", json={
            "prompt": "",  # Empty prompt
            "width": 1024
        })
        
        assert response.status_code == 422  # Validation error
    
    @patch('app.api.image_routes.image_api')
    def test_transform_image_success(self, mock_api, client, mock_image_response):
        mock_api.transform_image = AsyncMock(return_value=mock_image_response)
        
        # Create a fake image bytes (simple PNG header)
        # This is a minimal valid PNG file (1x1 pixel, transparent)
        fake_png = base64.b64decode(
            "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
        )
        img_bytes = io.BytesIO(fake_png)
        
        response = client.post(
            "/api/v1/images/transform",
            data={
                "prompt": "Make it blue",
                "strength": "0.5"
            },
            files={
                "source_image": ("test.png", img_bytes, "image/png")
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["image_id"] == "test-123"
    
    @patch('app.api.image_routes.image_api')
    def test_upscale_image_success(self, mock_api, client, mock_image_response):
        mock_api.upscale_image = AsyncMock(return_value=mock_image_response)
        
        response = client.post("/api/v1/images/upscale", json={
            "image_id": "test-123",
            "scale_factor": 2
        })
        
        assert response.status_code == 200
        data = response.json()
        assert data["image_id"] == "test-123"
    
    @patch('app.api.image_routes.image_api')
    def test_get_history_success(self, mock_api, client, mock_image_response):
        mock_api.get_generation_history = AsyncMock(return_value=[mock_image_response])
        
        response = client.get("/api/v1/images/history?user_id=test-user&limit=10")
        
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["image_id"] == "test-123"
    
    @patch('app.api.image_routes.image_api')
    def test_delete_image_success(self, mock_api, client):
        mock_api.delete_image = AsyncMock()
        
        response = client.delete("/api/v1/images/test-123")
        
        assert response.status_code == 200
        data = response.json()
        assert data["message"] == "Image deleted successfully"
    
    @patch('app.api.image_routes.prompt_optimizer')
    def test_validate_prompt_endpoint(self, mock_optimizer, client):
        mock_optimizer.validate_prompt = AsyncMock(return_value={
            "is_valid": True,
            "warnings": [],
            "suggestions": ["Add more detail"]
        })
        
        response = client.post("/api/v1/images/validate-prompt?prompt=test%20prompt")
        
        assert response.status_code == 200
        data = response.json()
        assert data["prompt"] == "test prompt"
        assert data["validation"]["is_valid"] is True
    
    @patch('app.api.image_routes.prompt_optimizer')
    def test_enhance_prompt_endpoint(self, mock_optimizer, client):
        mock_optimizer.enhance_prompt = AsyncMock(return_value="enhanced test prompt")
        mock_optimizer.suggest_negative_prompt = AsyncMock(return_value="low quality")
        
        response = client.post("/api/v1/images/enhance-prompt?prompt=test%20prompt&style_preset=anime")
        
        assert response.status_code == 200
        data = response.json()
        assert data["original"] == "test prompt"
        assert data["enhanced"] == "enhanced test prompt"
        assert data["suggested_negative"] == "low quality"
    
    def test_get_preset_sizes(self, client):
        response = client.get("/api/v1/images/sizes")
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
        assert all("width" in size and "height" in size and "label" in size for size in data)
    
    def test_get_style_presets(self, client):
        response = client.get("/api/v1/images/styles")
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
        assert all("value" in style and "name" in style for style in data)


class TestErrorHandling:
    """Test error handling in image generation endpoints"""
    
    @patch('app.api.image_routes.image_api')
    def test_api_error_handling(self, mock_api, client):
        mock_api.generate_image = AsyncMock(side_effect=Exception("API is down"))
        
        response = client.post("/api/v1/images/generate", json={
            "prompt": "Test prompt"
        })
        
        assert response.status_code == 500
        data = response.json()
        assert data["detail"]["error"] == ImageGenerationErrorCode.API_ERROR
    
    @patch('app.api.image_routes.image_api')
    def test_custom_error_handling(self, mock_api, client):
        mock_api.generate_image = AsyncMock(side_effect=ImageGenerationError(
            "Rate limit exceeded",
            ImageGenerationErrorCode.RATE_LIMIT,
            {"reset_at": "2024-01-01T01:00:00Z"}
        ))
        
        response = client.post("/api/v1/images/generate", json={
            "prompt": "Test prompt"
        })
        
        assert response.status_code == 400
        data = response.json()
        assert data["detail"]["error"] == ImageGenerationErrorCode.RATE_LIMIT
        assert data["detail"]["message"] == "Rate limit exceeded"