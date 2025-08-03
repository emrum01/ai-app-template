from typing import Optional, List, Dict, Any, Literal
from enum import Enum
from datetime import datetime, timezone
from pydantic import BaseModel, Field, field_validator
import httpx
from fastapi import HTTPException, UploadFile, File
import os
from abc import ABC, abstractmethod


class AspectRatio(str, Enum):
    SQUARE = "1:1"
    LANDSCAPE = "16:9"
    PORTRAIT = "9:16"
    WIDE = "21:9"
    CUSTOM = "custom"


class StylePreset(str, Enum):
    NONE = "none"
    ANIME = "anime"
    PHOTOGRAPHIC = "photographic"
    DIGITAL_ART = "digital-art"
    COMIC_BOOK = "comic-book"
    FANTASY_ART = "fantasy-art"
    LINE_ART = "line-art"
    ANALOG_FILM = "analog-film"
    NEON_PUNK = "neon-punk"
    ISOMETRIC = "isometric"
    LOW_POLY = "low-poly"
    ORIGAMI = "origami"
    MODELING_COMPOUND = "modeling-compound"
    CINEMATIC = "cinematic"
    TILE_TEXTURE = "tile-texture"


class ImageSize(BaseModel):
    width: int
    height: int
    label: str


class TextToImageRequest(BaseModel):
    prompt: str = Field(..., min_length=1, max_length=1000)
    negative_prompt: Optional[str] = Field(None, max_length=1000)
    width: Optional[int] = Field(1024, ge=64, le=2048)
    height: Optional[int] = Field(1024, ge=64, le=2048)
    aspect_ratio: Optional[AspectRatio] = None
    style_preset: Optional[StylePreset] = StylePreset.NONE
    seed: Optional[int] = None
    steps: Optional[int] = Field(30, ge=1, le=150)

    @field_validator('width', 'height')
    def validate_dimensions(cls, v):
        if v % 64 != 0:
            raise ValueError('Dimensions must be multiples of 64')
        return v


class ImageMetadata(BaseModel):
    prompt: str
    width: int
    height: int
    model: str
    timestamp: datetime
    style_preset: Optional[StylePreset] = None
    seed: Optional[int] = None


class ImageGenerationResponse(BaseModel):
    image_url: str
    image_id: str
    metadata: ImageMetadata


class ImageToImageRequest(TextToImageRequest):
    source_image: str  # Base64 encoded image
    strength: float = Field(0.7, ge=0.0, le=1.0)
    preserve_original: Optional[bool] = False


class InpaintingRequest(ImageToImageRequest):
    mask_image: str  # Base64 encoded mask
    mask_blur: Optional[int] = Field(0, ge=0, le=64)
    mask_mode: Optional[Literal["black", "white"]] = Field("black")


class UpscaleRequest(BaseModel):
    image_id: str
    scale_factor: Literal[2, 4] = Field(2)
    model: Optional[Literal["esrgan", "real-esrgan", "ldm"]] = Field("esrgan")


class ImageGenerationErrorCode(str, Enum):
    INVALID_PROMPT = "INVALID_PROMPT"
    NSFW_CONTENT = "NSFW_CONTENT"
    RATE_LIMIT = "RATE_LIMIT"
    INSUFFICIENT_CREDITS = "INSUFFICIENT_CREDITS"
    API_ERROR = "API_ERROR"
    INVALID_IMAGE = "INVALID_IMAGE"
    PROCESSING_ERROR = "PROCESSING_ERROR"


class ImageGenerationError(Exception):
    def __init__(self, message: str, code: ImageGenerationErrorCode, details: Any = None):
        self.message = message
        self.code = code
        self.details = details
        super().__init__(self.message)


PRESET_SIZES = [
    ImageSize(width=512, height=512, label="Small (512x512)"),
    ImageSize(width=768, height=768, label="Medium (768x768)"),
    ImageSize(width=1024, height=1024, label="Large (1024x1024)"),
    ImageSize(width=1920, height=1080, label="HD (1920x1080)"),
    ImageSize(width=2048, height=2048, label="Ultra HD (2048x2048)")
]


class ImageGenerationAPI(ABC):
    """Abstract base class for image generation API implementations"""
    
    @abstractmethod
    async def generate_image(self, request: TextToImageRequest) -> ImageGenerationResponse:
        pass
    
    @abstractmethod
    async def transform_image(self, request: ImageToImageRequest) -> ImageGenerationResponse:
        pass
    
    @abstractmethod
    async def inpaint_image(self, request: InpaintingRequest) -> ImageGenerationResponse:
        pass
    
    @abstractmethod
    async def upscale_image(self, request: UpscaleRequest) -> ImageGenerationResponse:
        pass
    
    @abstractmethod
    async def get_generation_history(self, user_id: str, limit: Optional[int] = 10) -> List[ImageGenerationResponse]:
        pass
    
    @abstractmethod
    async def delete_image(self, image_id: str) -> None:
        pass


class MockImageGenerationAPI(ImageGenerationAPI):
    """Mock implementation for testing"""
    
    def __init__(self):
        self.generated_images: Dict[str, ImageGenerationResponse] = {}
        self.user_history: Dict[str, List[str]] = {}
    
    async def generate_image(self, request: TextToImageRequest) -> ImageGenerationResponse:
        # Simulate API delay
        import asyncio
        await asyncio.sleep(0.1)
        
        # Generate mock response
        import uuid
        image_id = str(uuid.uuid4())
        
        response = ImageGenerationResponse(
            image_url=f"https://placeholder.com/{request.width}x{request.height}",
            image_id=image_id,
            metadata=ImageMetadata(
                prompt=request.prompt,
                width=request.width,
                height=request.height,
                model="mock-model-v1",
                timestamp=datetime.now(timezone.utc),
                style_preset=request.style_preset,
                seed=request.seed
            )
        )
        
        self.generated_images[image_id] = response
        return response
    
    async def transform_image(self, request: ImageToImageRequest) -> ImageGenerationResponse:
        # For mock, just generate a new image
        return await self.generate_image(request)
    
    async def inpaint_image(self, request: InpaintingRequest) -> ImageGenerationResponse:
        # For mock, just generate a new image
        return await self.generate_image(request)
    
    async def upscale_image(self, request: UpscaleRequest) -> ImageGenerationResponse:
        if request.image_id not in self.generated_images:
            raise ImageGenerationError(
                "Image not found",
                ImageGenerationErrorCode.INVALID_IMAGE
            )
        
        original = self.generated_images[request.image_id]
        import uuid
        new_id = str(uuid.uuid4())
        
        response = ImageGenerationResponse(
            image_url=f"https://placeholder.com/{original.metadata.width * request.scale_factor}x{original.metadata.height * request.scale_factor}",
            image_id=new_id,
            metadata=ImageMetadata(
                prompt=f"Upscaled: {original.metadata.prompt}",
                width=original.metadata.width * request.scale_factor,
                height=original.metadata.height * request.scale_factor,
                model=f"upscale-{request.model}",
                timestamp=datetime.now(timezone.utc)
            )
        )
        
        self.generated_images[new_id] = response
        return response
    
    async def get_generation_history(self, user_id: str, limit: Optional[int] = 10) -> List[ImageGenerationResponse]:
        # Return mock history
        return list(self.generated_images.values())[:limit]
    
    async def delete_image(self, image_id: str) -> None:
        if image_id in self.generated_images:
            del self.generated_images[image_id]


class PromptOptimizer:
    """Handles prompt enhancement and validation"""
    
    STYLE_ENHANCEMENTS = {
        StylePreset.ANIME: {
            "prefix": "anime style, manga art, ",
            "suffix": ", detailed anime illustration",
            "negative": "realistic, photo, 3d render"
        },
        StylePreset.PHOTOGRAPHIC: {
            "prefix": "photograph, realistic, ",
            "suffix": ", high quality photo, dslr",
            "negative": "cartoon, illustration, painting"
        },
        StylePreset.DIGITAL_ART: {
            "prefix": "digital art, digital painting, ",
            "suffix": ", artstation, concept art",
            "negative": "photo, realistic"
        },
        StylePreset.CINEMATIC: {
            "prefix": "cinematic shot, movie still, ",
            "suffix": ", dramatic lighting, film grain",
            "negative": "cartoon, anime, illustration"
        }
    }
    
    async def enhance_prompt(self, original_prompt: str, style: Optional[StylePreset] = None) -> str:
        """Enhance prompt with style-specific additions"""
        if style and style in self.STYLE_ENHANCEMENTS:
            enhancement = self.STYLE_ENHANCEMENTS[style]
            return f"{enhancement.get('prefix', '')}{original_prompt}{enhancement.get('suffix', '')}"
        return original_prompt
    
    async def suggest_negative_prompt(self, prompt: str, style: Optional[StylePreset] = None) -> str:
        """Suggest negative prompt based on style"""
        base_negative = "low quality, blurry, pixelated, distorted"
        
        if style and style in self.STYLE_ENHANCEMENTS:
            style_negative = self.STYLE_ENHANCEMENTS[style].get('negative', '')
            return f"{base_negative}, {style_negative}" if style_negative else base_negative
        
        return base_negative
    
    async def validate_prompt(self, prompt: str) -> Dict[str, Any]:
        """Validate prompt and return suggestions"""
        warnings = []
        suggestions = []
        
        # Check length
        if len(prompt) < 10:
            warnings.append("Prompt is very short. Consider adding more detail.")
        
        if len(prompt) > 500:
            warnings.append("Prompt is very long. Consider being more concise.")
        
        # Check for common issues
        if prompt.isupper():
            warnings.append("Avoid using all caps in prompts.")
        
        # Suggest improvements
        if "beautiful" not in prompt.lower() and "quality" not in prompt.lower():
            suggestions.append("Consider adding quality descriptors like 'high quality' or 'detailed'")
        
        return {
            "is_valid": len(warnings) == 0,
            "warnings": warnings,
            "suggestions": suggestions
        }


# Content filtering
class ContentFilter:
    """Basic content filtering for prompts and images"""
    
    BLOCKED_TERMS = [
        # Add actual blocked terms here
        "inappropriate",
        "nsfw"
    ]
    
    async def check_prompt(self, prompt: str) -> Dict[str, Any]:
        """Check if prompt contains inappropriate content"""
        prompt_lower = prompt.lower()
        
        for term in self.BLOCKED_TERMS:
            if term in prompt_lower:
                return {
                    "is_allowed": False,
                    "reason": "Prompt contains inappropriate content",
                    "category": "inappropriate"
                }
        
        return {"is_allowed": True}
    
    async def check_image(self, image_data: bytes) -> Dict[str, Any]:
        """Check if image contains inappropriate content"""
        # In a real implementation, this would use an image classification model
        return {"is_allowed": True}