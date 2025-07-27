from fastapi import APIRouter

router = APIRouter(prefix="/api", tags=["hello"])

@router.get("/hello")
async def hello_world():
    """Hello World APIエンドポイント"""
    return {"message": "Hello World from AI App Backend API!"}

@router.get("/hello/{name}")
async def hello_name(name: str):
    """名前付きHello World APIエンドポイント"""
    return {"message": f"Hello {name} from AI App Backend API!"} 