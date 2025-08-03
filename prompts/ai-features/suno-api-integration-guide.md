# Suno API統合ガイド

## 🎵 概要

このガイドは、Suno APIを使用した音楽生成機能の実装における具体的な統合方法、ベストプラクティス、トラブルシューティングを提供します。

## 🚀 クイックスタート

### 1. 依存関係のインストール

**フロントエンド (React + TypeScript)**
```bash
npm install howler @types/howler
npm install @tanstack/react-query zustand
npm install lucide-react        # アイコン
npm install tailwindcss         # スタイリング (オプション)
```

**バックエンド (Python + FastAPI)**
```bash
pip install aiohttp requests fastapi
pip install python-multipart   # ファイルアップロード
pip install redis              # キャッシング (オプション)
```

### 2. 環境変数設定

```env
# .env
SUNO_API_KEY=your_api_key_here
SUNO_API_BASE_URL=https://api.acedata.cloud/suno
SUNO_CALLBACK_URL=https://your-domain.com/api/suno/callback
MAX_CONCURRENT_GENERATIONS=3
MUSIC_STORAGE_PATH=/app/storage/music
```

## 🔧 バックエンド実装

### Suno APIクライアント

```python
# backend/app/api/music/suno_client.py

import asyncio
import aiohttp
import json
from typing import Dict, List, Optional, Union
from dataclasses import dataclass
from enum import Enum

class SunoModel(Enum):
    V3_5 = "chirp-v3.5"
    V4 = "chirp-v4"
    V4_5 = "chirp-v4.5"

class GenerationAction(Enum):
    GENERATE = "generate"
    EXTEND = "extend"
    COVER = "cover"
    STEMS = "stems"
    CONCAT = "concat"

@dataclass
class SunoConfig:
    api_key: str
    base_url: str = "https://api.acedata.cloud/suno"
    timeout: int = 300
    max_retries: int = 3

class SunoAPIError(Exception):
    def __init__(self, code: str, message: str, status_code: int = None):
        self.code = code
        self.message = message
        self.status_code = status_code
        super().__init__(f"{code}: {message}")

class SunoClient:
    def __init__(self, config: SunoConfig):
        self.config = config
        self.session: Optional[aiohttp.ClientSession] = None
    
    async def __aenter__(self):
        self.session = aiohttp.ClientSession(
            timeout=aiohttp.ClientTimeout(total=self.config.timeout),
            headers={
                "Authorization": f"Bearer {self.config.api_key}",
                "Content-Type": "application/json"
            }
        )
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def _make_request(
        self, 
        method: str, 
        endpoint: str, 
        data: Dict = None,
        params: Dict = None
    ) -> Dict:
        """APIリクエストの実行"""
        url = f"{self.config.base_url}/{endpoint.lstrip('/')}"
        
        for attempt in range(self.config.max_retries):
            try:
                async with self.session.request(
                    method, url, json=data, params=params
                ) as response:
                    result = await response.json()
                    
                    if response.status == 200:
                        return result
                    elif response.status >= 400:
                        error = result.get("error", {})
                        raise SunoAPIError(
                            code=error.get("code", "unknown_error"),
                            message=error.get("message", "Unknown error occurred"),
                            status_code=response.status
                        )
            
            except aiohttp.ClientError as e:
                if attempt == self.config.max_retries - 1:
                    raise SunoAPIError("network_error", str(e))
                await asyncio.sleep(2 ** attempt)  # 指数バックオフ
        
        raise SunoAPIError("max_retries_exceeded", "Maximum retry attempts exceeded")
    
    async def generate_music(
        self,
        prompt: str,
        model: SunoModel = SunoModel.V4,
        style: Optional[str] = None,
        instrumental: bool = False,
        callback_url: Optional[str] = None
    ) -> Dict:
        """基本的な音楽生成"""
        payload = {
            "action": GenerationAction.GENERATE.value,
            "prompt": prompt,
            "model": model.value,
            "instrumental": instrumental
        }
        
        if style:
            payload["style"] = style
        if callback_url:
            payload["callback_url"] = callback_url
        
        return await self._make_request("POST", "/audios", data=payload)
    
    async def generate_custom_music(
        self,
        lyrics: str,
        title: str,
        style: Optional[str] = None,
        model: SunoModel = SunoModel.V4,
        callback_url: Optional[str] = None
    ) -> Dict:
        """カスタム歌詞での音楽生成"""
        payload = {
            "custom": True,
            "lyric": lyrics,
            "title": title,
            "model": model.value
        }
        
        if style:
            payload["style"] = style
        if callback_url:
            payload["callback_url"] = callback_url
        
        return await self._make_request("POST", "/audios", data=payload)
    
    async def extend_music(
        self,
        audio_id: str,
        continue_at: float,
        lyrics: Optional[str] = None,
        style: Optional[str] = None,
        model: SunoModel = SunoModel.V4
    ) -> Dict:
        """音楽の継続生成"""
        payload = {
            "action": GenerationAction.EXTEND.value,
            "audio_id": audio_id,
            "continue_at": continue_at,
            "model": model.value
        }
        
        if lyrics:
            payload["lyric"] = lyrics
        if style:
            payload["style"] = style
        
        return await self._make_request("POST", "/audios", data=payload)
    
    async def create_cover(
        self,
        audio_id: str,
        lyrics: str,
        style: str,
        model: SunoModel = SunoModel.V4
    ) -> Dict:
        """音楽カバーの生成"""
        payload = {
            "action": GenerationAction.COVER.value,
            "audio_id": audio_id,
            "lyric": lyrics,
            "style": style,
            "model": model.value
        }
        
        return await self._make_request("POST", "/audios", data=payload)
    
    async def separate_stems(self, audio_id: str) -> Dict:
        """ボーカル・楽器分離"""
        payload = {
            "action": GenerationAction.STEMS.value,
            "audio_id": audio_id
        }
        
        return await self._make_request("POST", "/audios", data=payload)
    
    async def get_generation_status(self, generation_id: str) -> Dict:
        """生成状況の取得"""
        params = {"generation_id": generation_id}
        return await self._make_request("GET", "/audios", params=params)
    
    async def generate_lyrics(
        self,
        prompt: str,
        callback_url: Optional[str] = None
    ) -> Dict:
        """歌詞生成"""
        payload = {"prompt": prompt}
        if callback_url:
            payload["callback_url"] = callback_url
        
        return await self._make_request("POST", "/lyrics", data=payload)

# 使用例
async def example_usage():
    config = SunoConfig(api_key="your_api_key")
    
    async with SunoClient(config) as client:
        # 基本的な音楽生成
        result = await client.generate_music(
            prompt="A cheerful pop song about friendship",
            style="pop, upbeat",
            model=SunoModel.V4
        )
        
        print(f"Task ID: {result.get('task_id')}")
        print(f"Generated music: {result.get('data')}")
```

### FastAPI エンドポイント

```python
# backend/app/api/music/routes.py

from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import Optional, List
import asyncio

from .suno_client import SunoClient, SunoConfig, SunoModel
from .models import MusicGeneration, GenerationStatus

router = APIRouter(prefix="/api/music", tags=["music"])

# リクエストモデル
class MusicGenerationRequest(BaseModel):
    prompt: str
    style: Optional[str] = None
    model: SunoModel = SunoModel.V4
    instrumental: bool = False

class CustomMusicRequest(BaseModel):
    lyrics: str
    title: str
    style: Optional[str] = None
    model: SunoModel = SunoModel.V4

class ExtendMusicRequest(BaseModel):
    audio_id: str
    continue_at: float
    lyrics: Optional[str] = None
    style: Optional[str] = None

# 生成管理用のメモリストレージ（実際の実装ではRedis等を使用）
generation_cache: Dict[str, Dict] = {}

@router.post("/generate")
async def generate_music(
    request: MusicGenerationRequest,
    background_tasks: BackgroundTasks
):
    """音楽生成API"""
    config = SunoConfig(api_key=os.getenv("SUNO_API_KEY"))
    
    async with SunoClient(config) as client:
        try:
            result = await client.generate_music(
                prompt=request.prompt,
                style=request.style,
                model=request.model,
                instrumental=request.instrumental,
                callback_url=f"{os.getenv('SUNO_CALLBACK_URL')}"
            )
            
            task_id = result.get("task_id")
            if task_id:
                generation_cache[task_id] = {
                    "status": "queued",
                    "request": request.dict(),
                    "created_at": datetime.utcnow().isoformat()
                }
            
            return {"task_id": task_id, "status": "queued"}
            
        except SunoAPIError as e:
            raise HTTPException(status_code=400, detail=str(e))

@router.post("/generate-custom")
async def generate_custom_music(request: CustomMusicRequest):
    """カスタム歌詞での音楽生成"""
    config = SunoConfig(api_key=os.getenv("SUNO_API_KEY"))
    
    async with SunoClient(config) as client:
        try:
            result = await client.generate_custom_music(
                lyrics=request.lyrics,
                title=request.title,
                style=request.style,
                model=request.model
            )
            
            return result
            
        except SunoAPIError as e:
            raise HTTPException(status_code=400, detail=str(e))

@router.post("/extend")
async def extend_music(request: ExtendMusicRequest):
    """音楽継続生成"""
    config = SunoConfig(api_key=os.getenv("SUNO_API_KEY"))
    
    async with SunoClient(config) as client:
        try:
            result = await client.extend_music(
                audio_id=request.audio_id,
                continue_at=request.continue_at,
                lyrics=request.lyrics,
                style=request.style
            )
            
            return result
            
        except SunoAPIError as e:
            raise HTTPException(status_code=400, detail=str(e))

@router.get("/status/{task_id}")
async def get_generation_status(task_id: str):
    """生成状況確認"""
    # まずローカルキャッシュを確認
    if task_id in generation_cache:
        cached_data = generation_cache[task_id]
        if cached_data["status"] == "completed":
            return cached_data
    
    # Suno APIで最新状況を確認
    config = SunoConfig(api_key=os.getenv("SUNO_API_KEY"))
    
    async with SunoClient(config) as client:
        try:
            result = await client.get_generation_status(task_id)
            
            # キャッシュを更新
            if task_id in generation_cache:
                generation_cache[task_id].update({
                    "status": "completed" if result.get("success") else "failed",
                    "result": result
                })
            
            return result
            
        except SunoAPIError as e:
            raise HTTPException(status_code=400, detail=str(e))

@router.post("/callback")
async def suno_callback(payload: dict):
    """Suno APIからのコールバック処理"""
    task_id = payload.get("task_id")
    
    if task_id and task_id in generation_cache:
        generation_cache[task_id].update({
            "status": "completed",
            "result": payload,
            "completed_at": datetime.utcnow().isoformat()
        })
        
        # WebSocket等でフロントエンドに通知
        # await notify_frontend(task_id, payload)
    
    return {"status": "ok"}
```

## 🎨 フロントエンド実装

### Suno API クライアント (TypeScript)

```typescript
// frontend/src/components/MusicGeneration/api.ts

export interface SunoConfig {
  apiKey: string;
  baseUrl: string;
}

export enum SunoModel {
  V3_5 = 'chirp-v3.5',
  V4 = 'chirp-v4',
  V4_5 = 'chirp-v4.5'
}

export interface MusicGenerationRequest {
  prompt: string;
  style?: string;
  model?: SunoModel;
  instrumental?: boolean;
}

export interface CustomMusicRequest {
  lyrics: string;
  title: string;
  style?: string;
  model?: SunoModel;
}

export interface MusicTrack {
  id: string;
  title: string;
  image_url: string;
  lyric: string;
  audio_url: string;
  video_url: string;
  created_at: string;
  model: string;
  state: 'pending' | 'running' | 'succeeded' | 'error';
  style: string;
  duration: number;
}

export interface GenerationResponse {
  task_id: string;
  status: string;
  data?: MusicTrack[];
}

class SunoAPIClient {
  private config: SunoConfig;

  constructor(config: SunoConfig) {
    this.config = config;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.config.baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  async generateMusic(request: MusicGenerationRequest): Promise<GenerationResponse> {
    return this.makeRequest<GenerationResponse>('/api/music/generate', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async generateCustomMusic(request: CustomMusicRequest): Promise<GenerationResponse> {
    return this.makeRequest<GenerationResponse>('/api/music/generate-custom', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async getGenerationStatus(taskId: string): Promise<GenerationResponse> {
    return this.makeRequest<GenerationResponse>(`/api/music/status/${taskId}`);
  }

  async extendMusic(
    audioId: string,
    continueAt: number,
    lyrics?: string,
    style?: string
  ): Promise<GenerationResponse> {
    return this.makeRequest<GenerationResponse>('/api/music/extend', {
      method: 'POST',
      body: JSON.stringify({
        audio_id: audioId,
        continue_at: continueAt,
        lyrics,
        style,
      }),
    });
  }
}

export default SunoAPIClient;
```

### React コンポーネント

```tsx
// frontend/src/components/MusicGeneration/MusicGenerator.tsx

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Play, Pause, Download, Loader2 } from 'lucide-react';

import SunoAPIClient, { SunoModel, MusicGenerationRequest } from './api';
import AudioPlayer from './AudioPlayer';
import PromptInput from './PromptInput';
import StyleSelector from './StyleSelector';

const sunoClient = new SunoAPIClient({
  apiKey: process.env.REACT_APP_SUNO_API_KEY || '',
  baseUrl: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000'
});

interface MusicGeneratorProps {
  onMusicGenerated?: (tracks: MusicTrack[]) => void;
}

const MusicGenerator: React.FC<MusicGeneratorProps> = ({ onMusicGenerated }) => {
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('');
  const [model, setModel] = useState<SunoModel>(SunoModel.V4);
  const [instrumental, setInstrumental] = useState(false);
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);

  const queryClient = useQueryClient();

  // 音楽生成ミューテーション
  const generateMutation = useMutation({
    mutationFn: (request: MusicGenerationRequest) => 
      sunoClient.generateMusic(request),
    onSuccess: (data) => {
      setCurrentTaskId(data.task_id);
    },
    onError: (error) => {
      console.error('音楽生成エラー:', error);
    },
  });

  // 生成状況監視
  const { data: generationStatus, isLoading: isChecking } = useQuery({
    queryKey: ['generation-status', currentTaskId],
    queryFn: () => currentTaskId ? sunoClient.getGenerationStatus(currentTaskId) : null,
    enabled: !!currentTaskId,
    refetchInterval: (data) => {
      // 完了していない場合は5秒ごとにポーリング
      return data?.status === 'completed' ? false : 5000;
    },
  });

  const handleGenerate = () => {
    if (!prompt.trim()) return;

    generateMutation.mutate({
      prompt,
      style: style || undefined,
      model,
      instrumental,
    });
  };

  const isGenerating = generateMutation.isPending || isChecking;
  const tracks = generationStatus?.data || [];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">音楽生成</h2>
        
        {/* プロンプト入力 */}
        <PromptInput
          value={prompt}
          onChange={setPrompt}
          placeholder="どんな音楽を作りたいですか？例: A cheerful pop song about friendship"
        />
        
        {/* スタイル選択 */}
        <StyleSelector
          value={style}
          onChange={setStyle}
          className="mt-4"
        />
        
        {/* 詳細設定 */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              モデル
            </label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value as SunoModel)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value={SunoModel.V3_5}>V3.5 (Balanced)</option>
              <option value={SunoModel.V4}>V4 (High Quality)</option>
              <option value={SunoModel.V4_5}>V4.5 (Advanced)</option>
            </select>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="instrumental"
              checked={instrumental}
              onChange={(e) => setInstrumental(e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="instrumental" className="text-sm text-gray-700">
              楽器音楽のみ
            </label>
          </div>
        </div>
        
        {/* 生成ボタン */}
        <button
          onClick={handleGenerate}
          disabled={!prompt.trim() || isGenerating}
          className="mt-6 w-full bg-blue-600 text-white py-3 px-4 rounded-md font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              生成中...
            </>
          ) : (
            '音楽を生成'
          )}
        </button>
      </div>

      {/* 生成結果 */}
      {tracks.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-900">生成された音楽</h3>
          {tracks.map((track) => (
            <div key={track.id} className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-start gap-4">
                <img
                  src={track.image_url}
                  alt={track.title}
                  className="w-20 h-20 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-gray-900">
                    {track.title}
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    {track.style} • {Math.round(track.duration)}秒
                  </p>
                  
                  {/* オーディオプレイヤー */}
                  <AudioPlayer
                    src={track.audio_url}
                    title={track.title}
                    className="mt-4"
                  />
                  
                  {/* ダウンロードボタン */}
                  <div className="mt-4 flex gap-2">
                    <a
                      href={track.audio_url}
                      download={`${track.title}.mp3`}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                      <Download className="w-4 h-4" />
                      MP3ダウンロード
                    </a>
                    {track.video_url && (
                      <a
                        href={track.video_url}
                        download={`${track.title}.mp4`}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                      >
                        <Download className="w-4 h-4" />
                        MP4ダウンロード
                      </a>
                    )}
                  </div>
                </div>
              </div>
              
              {/* 歌詞表示 */}
              {track.lyric && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h5 className="font-medium text-gray-900 mb-2">歌詞</h5>
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                    {track.lyric}
                  </pre>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MusicGenerator;
```

### オーディオプレイヤー

```tsx
// frontend/src/components/MusicGeneration/AudioPlayer.tsx

import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';

interface AudioPlayerProps {
  src: string;
  title?: string;
  className?: string;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ src, title, className = '' }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [src]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newTime = parseFloat(e.target.value);
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newVolume = parseFloat(e.target.value);
    audio.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isMuted) {
      audio.volume = volume;
      setIsMuted(false);
    } else {
      audio.volume = 0;
      setIsMuted(true);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`bg-gray-50 rounded-lg p-4 ${className}`}>
      <audio ref={audioRef} src={src} preload="metadata" />
      
      {title && (
        <div className="text-sm font-medium text-gray-900 mb-3">{title}</div>
      )}
      
      <div className="flex items-center gap-4">
        {/* 再生/一時停止ボタン */}
        <button
          onClick={togglePlay}
          className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors"
        >
          {isPlaying ? (
            <Pause className="w-5 h-5" />
          ) : (
            <Play className="w-5 h-5 ml-1" />
          )}
        </button>
        
        {/* 時間表示 */}
        <div className="text-sm text-gray-600 flex-shrink-0">
          {formatTime(currentTime)}
        </div>
        
        {/* シークバー */}
        <div className="flex-1">
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>
        
        {/* 総時間 */}
        <div className="text-sm text-gray-600 flex-shrink-0">
          {formatTime(duration)}
        </div>
        
        {/* 音量コントロール */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleMute}
            className="text-gray-600 hover:text-gray-900"
          >
            {isMuted ? (
              <VolumeX className="w-5 h-5" />
            ) : (
              <Volume2 className="w-5 h-5" />
            )}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className="w-20 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>
      </div>
      
      {/* プログレスバー視覚化 */}
      <div className="mt-2 w-full bg-gray-200 rounded-full h-1">
        <div
          className="bg-blue-600 h-1 rounded-full transition-all duration-100"
          style={{
            width: `${duration ? (currentTime / duration) * 100 : 0}%`,
          }}
        />
      </div>
    </div>
  );
};

export default AudioPlayer;
```

## 🚨 エラーハンドリング

### 一般的なエラーと対処法

```python
# backend/app/api/music/error_handlers.py

from fastapi import HTTPException
from typing import Dict, Any

class MusicGenerationError(Exception):
    """音楽生成関連のカスタムエラー"""
    pass

def handle_suno_api_errors(error_response: Dict[str, Any]) -> HTTPException:
    """Suno APIエラーの統一ハンドリング"""
    error = error_response.get("error", {})
    code = error.get("code", "unknown_error")
    message = error.get("message", "Unknown error occurred")
    
    # エラーコード別の対応
    error_mappings = {
        "forbidden": {
            "status_code": 403,
            "detail": f"コンテンツが制限されています: {message}"
        },
        "bad_request": {
            "status_code": 400,
            "detail": f"リクエストが無効です: {message}"
        },
        "timeout": {
            "status_code": 504,
            "detail": "音楽生成がタイムアウトしました。しばらく待ってから再試行してください。"
        },
        "api_error": {
            "status_code": 500,
            "detail": f"サービスエラー: {message}"
        }
    }
    
    mapping = error_mappings.get(code, {
        "status_code": 500,
        "detail": f"予期しないエラーが発生しました: {message}"
    })
    
    return HTTPException(**mapping)

# フロントエンド用エラーハンドリング
def get_user_friendly_error_message(error_code: str, error_message: str) -> str:
    """ユーザーフレンドリーなエラーメッセージを生成"""
    messages = {
        "forbidden": "このコンテンツは生成できません。プロンプトを変更してください。",
        "bad_request": "入力内容に問題があります。内容を確認してください。",
        "timeout": "生成に時間がかかっています。しばらく待ってから確認してください。",
        "api_error": "一時的な問題が発生しました。しばらく待ってから再試行してください。",
        "network_error": "接続に問題があります。インターネット接続を確認してください。"
    }
    
    return messages.get(error_code, f"エラーが発生しました: {error_message}")
```

## 🔧 実用的なユーティリティ

### 音楽メタデータ管理

```python
# backend/app/api/music/utils.py

import re
from typing import Dict, List, Optional
from dataclasses import dataclass

@dataclass
class LyricSection:
    type: str  # verse, chorus, bridge, intro, outro
    content: str
    order: int

class LyricsParser:
    """Suno形式の歌詞パーサー"""
    
    SECTION_PATTERNS = {
        'verse': r'\[Verse\s*(\d*)\]',
        'chorus': r'\[Chorus\]',
        'bridge': r'\[Bridge\]',
        'intro': r'\[Intro\]',
        'outro': r'\[Outro\]',
        'pre_chorus': r'\[Pre-Chorus\]'
    }
    
    @classmethod
    def parse_lyrics(cls, lyrics: str) -> List[LyricSection]:
        """歌詞をセクションに分割"""
        sections = []
        current_section = None
        current_content = []
        order = 0
        
        for line in lyrics.split('\n'):
            line = line.strip()
            if not line:
                continue
                
            # セクションヘッダーをチェック
            section_found = False
            for section_type, pattern in cls.SECTION_PATTERNS.items():
                if re.match(pattern, line, re.IGNORECASE):
                    # 前のセクションを保存
                    if current_section:
                        sections.append(LyricSection(
                            type=current_section,
                            content='\n'.join(current_content),
                            order=order
                        ))
                        order += 1
                    
                    current_section = section_type
                    current_content = []
                    section_found = True
                    break
            
            if not section_found and current_section:
                current_content.append(line)
        
        # 最後のセクションを保存
        if current_section and current_content:
            sections.append(LyricSection(
                type=current_section,
                content='\n'.join(current_content),
                order=order
            ))
        
        return sections
    
    @classmethod
    def format_lyrics(cls, sections: List[LyricSection]) -> str:
        """セクションから歌詞を再構築"""
        formatted_lyrics = []
        
        for section in sorted(sections, key=lambda x: x.order):
            # セクションヘッダーを追加
            if section.type == 'verse':
                header = f"[Verse {section.order + 1}]"
            else:
                header = f"[{section.type.replace('_', '-').title()}]"
            
            formatted_lyrics.append(header)
            formatted_lyrics.append(section.content)
            formatted_lyrics.append("")  # 空行
        
        return '\n'.join(formatted_lyrics).strip()

class StyleManager:
    """音楽スタイル管理"""
    
    GENRE_PRESETS = {
        'pop': ['pop', 'upbeat', 'catchy'],
        'rock': ['rock', 'electric guitar', 'drums'],
        'jazz': ['jazz', 'smooth', 'saxophone'],
        'classical': ['classical', 'orchestral', 'elegant'],
        'hip_hop': ['hip-hop', 'rap', 'urban'],
        'electronic': ['electronic', 'synthesizer', 'digital'],
        'folk': ['folk', 'acoustic', 'storytelling'],
        'country': ['country', 'guitar', 'heartfelt']
    }
    
    MOOD_MODIFIERS = {
        'happy': ['cheerful', 'uplifting', 'joyful'],
        'sad': ['melancholic', 'emotional', 'heartbreaking'],
        'energetic': ['energetic', 'powerful', 'dynamic'],
        'calm': ['peaceful', 'relaxing', 'gentle'],
        'romantic': ['romantic', 'love', 'intimate'],
        'dark': ['dark', 'mysterious', 'intense']
    }
    
    @classmethod
    def generate_style_string(
        cls, 
        genre: str, 
        mood: Optional[str] = None,
        instruments: Optional[List[str]] = None,
        tempo: Optional[str] = None
    ) -> str:
        """スタイル文字列を生成"""
        style_parts = []
        
        # ジャンル
        if genre in cls.GENRE_PRESETS:
            style_parts.extend(cls.GENRE_PRESETS[genre])
        else:
            style_parts.append(genre)
        
        # ムード
        if mood and mood in cls.MOOD_MODIFIERS:
            style_parts.extend(cls.MOOD_MODIFIERS[mood])
        
        # 楽器
        if instruments:
            style_parts.extend(instruments)
        
        # テンポ
        if tempo:
            style_parts.append(tempo)
        
        return ', '.join(style_parts)

# 使用例
def format_music_for_frontend(suno_response: Dict) -> Dict:
    """Suno APIレスポンスをフロントエンド用に整形"""
    tracks = []
    
    for track_data in suno_response.get('data', []):
        # 歌詞をパース
        sections = LyricsParser.parse_lyrics(track_data.get('lyric', ''))
        
        # メタデータを整形
        track = {
            'id': track_data['id'],
            'title': track_data['title'],
            'image_url': track_data['image_url'],
            'audio_url': track_data['audio_url'],
            'video_url': track_data.get('video_url'),
            'duration': track_data.get('duration', 0),
            'created_at': track_data['created_at'],
            'model': track_data['model'],
            'style': track_data.get('style', ''),
            'state': track_data['state'],
            'lyrics': {
                'raw': track_data.get('lyric', ''),
                'sections': [
                    {
                        'type': section.type,
                        'content': section.content,
                        'order': section.order
                    }
                    for section in sections
                ]
            }
        }
        
        tracks.append(track)
    
    return {
        'success': suno_response.get('success', False),
        'task_id': suno_response.get('task_id'),
        'tracks': tracks
    }
```

## 📊 モニタリングとログ

```python
# backend/app/api/music/monitoring.py

import logging
import time
from functools import wraps
from typing import Dict, Any

# ログ設定
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def log_api_request(func):
    """API リクエストのログ記録デコレータ"""
    @wraps(func)
    async def wrapper(*args, **kwargs):
        start_time = time.time()
        
        try:
            result = await func(*args, **kwargs)
            duration = time.time() - start_time
            
            logger.info(f"API Request Success: {func.__name__} - Duration: {duration:.2f}s")
            return result
            
        except Exception as e:
            duration = time.time() - start_time
            logger.error(f"API Request Failed: {func.__name__} - Duration: {duration:.2f}s - Error: {str(e)}")
            raise
    
    return wrapper

class MusicGenerationMetrics:
    """音楽生成メトリクス収集"""
    
    def __init__(self):
        self.generation_count = 0
        self.success_count = 0
        self.error_count = 0
        self.total_duration = 0
    
    def record_generation_start(self):
        """生成開始の記録"""
        self.generation_count += 1
        logger.info(f"Music generation started. Total: {self.generation_count}")
    
    def record_generation_success(self, duration: float):
        """生成成功の記録"""
        self.success_count += 1
        self.total_duration += duration
        logger.info(f"Music generation successful. Duration: {duration:.2f}s")
    
    def record_generation_error(self, error: str):
        """生成エラーの記録"""
        self.error_count += 1
        logger.error(f"Music generation failed: {error}")
    
    def get_metrics(self) -> Dict[str, Any]:
        """メトリクス取得"""
        success_rate = (self.success_count / self.generation_count * 100) if self.generation_count > 0 else 0
        avg_duration = (self.total_duration / self.success_count) if self.success_count > 0 else 0
        
        return {
            'total_generations': self.generation_count,
            'successful_generations': self.success_count,
            'failed_generations': self.error_count,
            'success_rate': round(success_rate, 2),
            'average_generation_time': round(avg_duration, 2)
        }

# グローバルメトリクスインスタンス
metrics = MusicGenerationMetrics()
```

## 🔒 セキュリティベストプラクティス

```python
# backend/app/api/music/security.py

import hashlib
import hmac
from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

security = HTTPBearer()

def verify_api_key(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """APIキー検証"""
    expected_key = os.getenv("SUNO_API_KEY")
    if not expected_key:
        raise HTTPException(status_code=500, detail="API key not configured")
    
    if credentials.credentials != expected_key:
        raise HTTPException(status_code=401, detail="Invalid API key")
    
    return credentials.credentials

def validate_prompt(prompt: str) -> bool:
    """プロンプトの内容検証"""
    # 不適切なコンテンツのフィルタリング
    forbidden_keywords = [
        'copyright', 'copyrighted', 'illegal', 'piracy'
    ]
    
    prompt_lower = prompt.lower()
    for keyword in forbidden_keywords:
        if keyword in prompt_lower:
            return False
    
    return True

def sanitize_filename(filename: str) -> str:
    """ファイル名のサニタイズ"""
    import re
    # 危険な文字を除去
    safe_filename = re.sub(r'[<>:"/\\|?*]', '_', filename)
    # 長さ制限
    return safe_filename[:100]

class RateLimiter:
    """レート制限実装"""
    
    def __init__(self, max_requests: int = 10, window_minutes: int = 60):
        self.max_requests = max_requests
        self.window_seconds = window_minutes * 60
        self.requests = {}
    
    def is_allowed(self, user_id: str) -> bool:
        """リクエストが許可されているかチェック"""
        now = time.time()
        
        if user_id not in self.requests:
            self.requests[user_id] = []
        
        # 古いリクエストを削除
        self.requests[user_id] = [
            req_time for req_time in self.requests[user_id]
            if now - req_time < self.window_seconds
        ]
        
        # リクエスト数をチェック
        if len(self.requests[user_id]) >= self.max_requests:
            return False
        
        # 新しいリクエストを記録
        self.requests[user_id].append(now)
        return True

# グローバルレート制限インスタンス
rate_limiter = RateLimiter(max_requests=10, window_minutes=60)
```

このガイドを使用して、Suno APIと統合した包括的な音楽生成機能を実装できます。各セクションは独立して実装可能で、段階的な開発を支援します。