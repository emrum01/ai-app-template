from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.hello import router as hello_router

app = FastAPI(
    title="AI App Backend",
    description="FastAPI backend for AI-powered rapid app generation",
    version="0.1.0"
)

# CORS設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 本番環境では適切に設定してください
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# APIルーターの登録
app.include_router(hello_router)

@app.get("/")
async def root():
    """ルートエンドポイント"""
    return {"message": "Hello World! AI App Backend is running."}

@app.get("/health")
async def health_check():
    """ヘルスチェックエンドポイント"""
    return {"status": "healthy", "message": "Backend is running successfully"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 