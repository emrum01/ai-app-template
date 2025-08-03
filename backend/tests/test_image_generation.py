import pytest
from unittest.mock import Mock, patch, AsyncMock
from fastapi import HTTPException
import base64
from datetime import datetime

from app.api.image_generation import (
    TextToImageRequest,
    ImageToImageRequest,
    InpaintingRequest,
    UpscaleRequest,
    ImageGenerationResponse,
    ImageMetadata,
    MockImageGenerationAPI,
    PromptOptimizer,
    ContentFilter,
    ImageGenerationError,
    ImageGenerationErrorCode,
    StylePreset,
    AspectRatio
)


class TestMockImageGenerationAPI:
    """Test the mock implementation of the image generation API"""
    
    @pytest.fixture
    def api(self):
        return MockImageGenerationAPI()
    
    @pytest.mark.asyncio
    async def test_generate_image_with_valid_prompt(self, api):
        request = TextToImageRequest(
            prompt="A beautiful sunset over mountains",
            width=1024,
            height=768,
            style_preset=StylePreset.PHOTOGRAPHIC
        )
        
        response = await api.generate_image(request)
        
        assert isinstance(response, ImageGenerationResponse)
        assert response.image_url == "https://placeholder.com/1024x768"
        assert response.metadata.prompt == request.prompt
        assert response.metadata.width == 1024
        assert response.metadata.height == 768
        assert response.metadata.style_preset == StylePreset.PHOTOGRAPHIC
    
    @pytest.mark.asyncio
    async def test_generate_image_stores_in_history(self, api):
        request = TextToImageRequest(prompt="Test image")
        
        response = await api.generate_image(request)
        image_id = response.image_id
        
        # Check that image is stored
        assert image_id in api.generated_images
        assert api.generated_images[image_id] == response
    
    @pytest.mark.asyncio
    async def test_upscale_image_success(self, api):
        # First generate an image
        original = await api.generate_image(TextToImageRequest(prompt="Original"))
        
        # Then upscale it
        upscale_request = UpscaleRequest(
            image_id=original.image_id,
            scale_factor=2
        )
        
        upscaled = await api.upscale_image(upscale_request)
        
        assert upscaled.metadata.width == original.metadata.width * 2
        assert upscaled.metadata.height == original.metadata.height * 2
        assert "Upscaled:" in upscaled.metadata.prompt
    
    @pytest.mark.asyncio
    async def test_upscale_image_not_found(self, api):
        request = UpscaleRequest(image_id="non-existent", scale_factor=2)
        
        with pytest.raises(ImageGenerationError) as exc_info:
            await api.upscale_image(request)
        
        assert exc_info.value.code == ImageGenerationErrorCode.INVALID_IMAGE
    
    @pytest.mark.asyncio
    async def test_delete_image(self, api):
        # Generate an image
        response = await api.generate_image(TextToImageRequest(prompt="To delete"))
        image_id = response.image_id
        
        # Verify it exists
        assert image_id in api.generated_images
        
        # Delete it
        await api.delete_image(image_id)
        
        # Verify it's gone
        assert image_id not in api.generated_images
    
    @pytest.mark.asyncio
    async def test_get_generation_history(self, api):
        # Generate multiple images
        for i in range(5):
            await api.generate_image(TextToImageRequest(prompt=f"Image {i}"))
        
        # Get history
        history = await api.get_generation_history("user123", limit=3)
        
        assert len(history) == 3
        assert all(isinstance(img, ImageGenerationResponse) for img in history)


class TestPromptOptimizer:
    """Test the prompt optimization functionality"""
    
    @pytest.fixture
    def optimizer(self):
        return PromptOptimizer()
    
    @pytest.mark.asyncio
    async def test_enhance_prompt_with_style(self, optimizer):
        original = "a cat"
        enhanced = await optimizer.enhance_prompt(original, StylePreset.ANIME)
        
        assert "anime style" in enhanced
        assert "a cat" in enhanced
        assert "detailed anime illustration" in enhanced
    
    @pytest.mark.asyncio
    async def test_enhance_prompt_no_style(self, optimizer):
        original = "a beautiful landscape"
        enhanced = await optimizer.enhance_prompt(original)
        
        assert enhanced == original
    
    @pytest.mark.asyncio
    async def test_suggest_negative_prompt_with_style(self, optimizer):
        negative = await optimizer.suggest_negative_prompt("test", StylePreset.PHOTOGRAPHIC)
        
        assert "low quality" in negative
        assert "cartoon" in negative
        assert "illustration" in negative
    
    @pytest.mark.asyncio
    async def test_validate_prompt_too_short(self, optimizer):
        result = await optimizer.validate_prompt("cat")
        
        assert not result["is_valid"]
        assert len(result["warnings"]) > 0
        assert any("short" in w for w in result["warnings"])
    
    @pytest.mark.asyncio
    async def test_validate_prompt_too_long(self, optimizer):
        long_prompt = "x" * 600
        result = await optimizer.validate_prompt(long_prompt)
        
        assert not result["is_valid"]
        assert len(result["warnings"]) > 0
        assert any("long" in w for w in result["warnings"])
    
    @pytest.mark.asyncio
    async def test_validate_prompt_all_caps(self, optimizer):
        result = await optimizer.validate_prompt("THIS IS ALL CAPS PROMPT")
        
        assert not result["is_valid"]
        assert any("caps" in w.lower() for w in result["warnings"])
    
    @pytest.mark.asyncio
    async def test_validate_prompt_suggestions(self, optimizer):
        result = await optimizer.validate_prompt("a simple cat image")
        
        assert len(result["suggestions"]) > 0
        assert any("quality" in s.lower() for s in result["suggestions"])


class TestContentFilter:
    """Test content filtering functionality"""
    
    @pytest.fixture
    def filter(self):
        return ContentFilter()
    
    @pytest.mark.asyncio
    async def test_check_prompt_allowed(self, filter):
        result = await filter.check_prompt("A beautiful sunset")
        
        assert result["is_allowed"] is True
    
    @pytest.mark.asyncio
    async def test_check_prompt_blocked(self, filter):
        result = await filter.check_prompt("Some inappropriate content")
        
        assert result["is_allowed"] is False
        assert "reason" in result
        assert "category" in result
    
    @pytest.mark.asyncio
    async def test_check_image_allowed(self, filter):
        # For now, all images are allowed in the mock
        result = await filter.check_image(b"fake image data")
        
        assert result["is_allowed"] is True


class TestTextToImageRequest:
    """Test request validation"""
    
    def test_valid_request(self):
        request = TextToImageRequest(
            prompt="A valid prompt",
            width=1024,
            height=1024
        )
        assert request.prompt == "A valid prompt"
        assert request.width == 1024
        assert request.height == 1024
    
    def test_invalid_dimensions_not_multiple_of_64(self):
        with pytest.raises(ValueError, match="multiples of 64"):
            TextToImageRequest(
                prompt="Test",
                width=1000,  # Not a multiple of 64
                height=1024
            )
    
    def test_dimensions_within_bounds(self):
        request = TextToImageRequest(
            prompt="Test",
            width=2048,
            height=64
        )
        assert request.width == 2048
        assert request.height == 64
    
    def test_empty_prompt_validation(self):
        with pytest.raises(ValueError):
            TextToImageRequest(
                prompt="",  # Empty prompt
                width=1024,
                height=1024
            )