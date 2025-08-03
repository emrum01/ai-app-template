from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Query
from typing import List, Optional
import base64
from io import BytesIO
from PIL import Image

from .image_generation import (
    TextToImageRequest,
    ImageToImageRequest,
    InpaintingRequest,
    UpscaleRequest,
    ImageGenerationResponse,
    ImageGenerationAPI,
    MockImageGenerationAPI,
    PromptOptimizer,
    ContentFilter,
    ImageGenerationError,
    ImageGenerationErrorCode,
    PRESET_SIZES
)

router = APIRouter(prefix="/api/v1/images", tags=["images"])

# Initialize services (in production, these would be dependency injected)
image_api = MockImageGenerationAPI()
prompt_optimizer = PromptOptimizer()
content_filter = ContentFilter()


async def get_image_api() -> ImageGenerationAPI:
    """Dependency to get image generation API instance"""
    return image_api


@router.post("/generate", response_model=ImageGenerationResponse)
async def generate_image(
    request: TextToImageRequest,
    api: ImageGenerationAPI = Depends(get_image_api)
):
    """Generate an image from text prompt"""
    try:
        # Check content
        content_check = await content_filter.check_prompt(request.prompt)
        if not content_check["is_allowed"]:
            raise ImageGenerationError(
                content_check["reason"],
                ImageGenerationErrorCode.NSFW_CONTENT
            )
        
        # Enhance prompt if style is specified
        if request.style_preset:
            request.prompt = await prompt_optimizer.enhance_prompt(
                request.prompt,
                request.style_preset
            )
            
            # Add suggested negative prompt if none provided
            if not request.negative_prompt:
                request.negative_prompt = await prompt_optimizer.suggest_negative_prompt(
                    request.prompt,
                    request.style_preset
                )
        
        # Generate image
        response = await api.generate_image(request)
        return response
        
    except ImageGenerationError as e:
        raise HTTPException(
            status_code=400,
            detail={
                "error": e.code,
                "message": e.message,
                "details": e.details
            }
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={
                "error": ImageGenerationErrorCode.API_ERROR,
                "message": str(e)
            }
        )


@router.post("/transform", response_model=ImageGenerationResponse)
async def transform_image(
    prompt: str,
    negative_prompt: Optional[str] = None,
    strength: float = 0.7,
    style_preset: Optional[str] = None,
    source_image: UploadFile = File(...),
    api: ImageGenerationAPI = Depends(get_image_api)
):
    """Transform an existing image using img2img"""
    try:
        # Read and encode image
        image_data = await source_image.read()
        encoded_image = base64.b64encode(image_data).decode()
        
        # Create request
        request = ImageToImageRequest(
            prompt=prompt,
            negative_prompt=negative_prompt,
            source_image=encoded_image,
            strength=strength,
            style_preset=style_preset
        )
        
        # Check content
        content_check = await content_filter.check_prompt(prompt)
        if not content_check["is_allowed"]:
            raise ImageGenerationError(
                content_check["reason"],
                ImageGenerationErrorCode.NSFW_CONTENT
            )
        
        # Transform image
        response = await api.transform_image(request)
        return response
        
    except ImageGenerationError as e:
        raise HTTPException(
            status_code=400,
            detail={
                "error": e.code,
                "message": e.message
            }
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={
                "error": ImageGenerationErrorCode.API_ERROR,
                "message": str(e)
            }
        )


@router.post("/inpaint", response_model=ImageGenerationResponse)
async def inpaint_image(
    prompt: str,
    source_image: UploadFile = File(...),
    mask_image: UploadFile = File(...),
    strength: float = 0.7,
    mask_blur: int = 0,
    api: ImageGenerationAPI = Depends(get_image_api)
):
    """Inpaint parts of an image"""
    try:
        # Read and encode images
        source_data = await source_image.read()
        mask_data = await mask_image.read()
        
        encoded_source = base64.b64encode(source_data).decode()
        encoded_mask = base64.b64encode(mask_data).decode()
        
        # Create request
        request = InpaintingRequest(
            prompt=prompt,
            source_image=encoded_source,
            mask_image=encoded_mask,
            strength=strength,
            mask_blur=mask_blur
        )
        
        # Inpaint image
        response = await api.inpaint_image(request)
        return response
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={
                "error": ImageGenerationErrorCode.API_ERROR,
                "message": str(e)
            }
        )


@router.post("/upscale", response_model=ImageGenerationResponse)
async def upscale_image(
    request: UpscaleRequest,
    api: ImageGenerationAPI = Depends(get_image_api)
):
    """Upscale an image by 2x or 4x"""
    try:
        response = await api.upscale_image(request)
        return response
    except ImageGenerationError as e:
        raise HTTPException(
            status_code=400,
            detail={
                "error": e.code,
                "message": e.message
            }
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={
                "error": ImageGenerationErrorCode.API_ERROR,
                "message": str(e)
            }
        )


@router.get("/history", response_model=List[ImageGenerationResponse])
async def get_generation_history(
    user_id: str = Query(..., description="User ID"),
    limit: int = Query(10, ge=1, le=100),
    api: ImageGenerationAPI = Depends(get_image_api)
):
    """Get user's image generation history"""
    try:
        history = await api.get_generation_history(user_id, limit)
        return history
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={
                "error": ImageGenerationErrorCode.API_ERROR,
                "message": str(e)
            }
        )


@router.delete("/{image_id}")
async def delete_image(
    image_id: str,
    api: ImageGenerationAPI = Depends(get_image_api)
):
    """Delete a generated image"""
    try:
        await api.delete_image(image_id)
        return {"message": "Image deleted successfully"}
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={
                "error": ImageGenerationErrorCode.API_ERROR,
                "message": str(e)
            }
        )


@router.post("/validate-prompt")
async def validate_prompt(prompt: str):
    """Validate and analyze a prompt"""
    validation_result = await prompt_optimizer.validate_prompt(prompt)
    content_check = await content_filter.check_prompt(prompt)
    
    return {
        "prompt": prompt,
        "validation": validation_result,
        "content_check": content_check
    }


@router.post("/enhance-prompt")
async def enhance_prompt(
    prompt: str,
    style_preset: Optional[str] = None
):
    """Enhance a prompt with style-specific additions"""
    enhanced = await prompt_optimizer.enhance_prompt(prompt, style_preset)
    negative = await prompt_optimizer.suggest_negative_prompt(prompt, style_preset)
    
    return {
        "original": prompt,
        "enhanced": enhanced,
        "suggested_negative": negative
    }


@router.get("/sizes")
async def get_preset_sizes():
    """Get list of preset image sizes"""
    return PRESET_SIZES


@router.get("/styles")
async def get_style_presets():
    """Get list of available style presets"""
    from .image_generation import StylePreset
    return [
        {
            "value": style.value,
            "name": style.name.replace("_", " ").title()
        }
        for style in StylePreset
    ]