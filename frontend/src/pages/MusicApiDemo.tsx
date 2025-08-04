import { useState } from 'react';

// 実際のAPIクライアント実装
const SunoModel = {
  V3_5: 'V3_5',
  V4: 'V4',
  V4_5: 'V4_5',
  V4_5PLUS: 'V4_5PLUS',
};

const GenerationStatus = {
  SUCCEEDED: 'succeeded',
  FAILED: 'failed',
  PENDING: 'pending',
  PROCESSING: 'processing',
};

class SunoAPIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public response?: any
  ) {
    super(message);
    this.name = 'SunoAPIError';
  }
}

class SunoClient {
  private apiKey: string;
  private baseUrl: string;
  private timeout: number;

  constructor(config: { apiKey: string; baseUrl: string; timeout: number }) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl;
    this.timeout = config.timeout;
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          ...options.headers,
        },
        signal: controller.signal,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new SunoAPIError(
          data.error?.message ||
            `API request failed with status ${response.status}`,
          response.status,
          data
        );
      }

      return data;
    } catch (error: any) {
      if (error.name === 'AbortError') {
        throw new Error('Request timed out');
      }
      if (error instanceof SunoAPIError) {
        throw error;
      }
      throw new SunoAPIError(error.message || 'Network error');
    } finally {
      clearTimeout(timeoutId);
    }
  }

  async generateMusic(params: any) {
    return this.request('/api/v1/generate', {
      method: 'POST',
      body: JSON.stringify({
        prompt: params.prompt,
        tags: params.style,
        model: 'V3_5',
        instrumental: params.instrumental,
        callBackUrl: 'https://example.com/callback',
        customMode: false,  // 通常の生成モード
      }),
    });
  }

  async generateCustomMusic(params: any) {
    return this.request('/api/v1/custom_generate', {
      method: 'POST',
      body: JSON.stringify({
        prompt: params.lyrics,
        title: params.title,
        tags: params.style,
        model: 'V3_5',
        callBackUrl: 'https://example.com/callback',
        customMode: true,  // カスタム生成モード
      }),
    });
  }

  async getGenerationStatus(taskId: string) {
    // まだ正しいエンドポイントが不明
    return this.request(`/api/v1/query?taskId=${taskId}`);
  }

  async extendMusic(params: any) {
    return this.request('/api/v1/extend_audio', {
      method: 'POST',
      body: JSON.stringify({
        audio_id: params.audio_id,
        prompt: params.lyrics || '',
        continue_at: params.continue_at,
        tags: params.style,
        model: 'V3_5',
        callBackUrl: 'https://example.com/callback',  // APIが要求するパラメータ
      }),
    });
  }

  async generateLyrics(params: any) {
    return this.request('/api/v1/generate_lyrics', {
      method: 'POST',
      body: JSON.stringify({
        prompt: params.prompt,
        callBackUrl: 'https://example.com/callback',  // APIが要求するパラメータ
      }),
    });
  }
}

const MusicApiDemo = () => {
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('pop, upbeat');
  const [isInstrumental, setIsInstrumental] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [taskId, setTaskId] = useState<string | null>(null);

  // カスタム楽曲用
  const [lyrics, setLyrics] = useState('');
  const [title, setTitle] = useState('');

  // 拡張用
  const [audioId, setAudioId] = useState('');
  const [continueAt, setContinueAt] = useState(60);

  // APIクライアントの初期化
  const client = new SunoClient({
    apiKey: import.meta.env.VITE_SUNO_API_KEY || '',
    baseUrl: import.meta.env.VITE_SUNO_API_URL || '',
    timeout: 30000,
  });

  const handleGenerateMusic = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await client.generateMusic({
        prompt,
        style,
        model: SunoModel.V3_5,
        instrumental: isInstrumental,
      });
      setResult(response);
      if (response.data?.taskId) {
        setTaskId(response.data.taskId);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCustomMusic = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await client.generateCustomMusic({
        lyrics,
        title,
        style,
      });
      setResult(response);
      if (response.data?.taskId) {
        setTaskId(response.data.taskId);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckStatus = async () => {
    if (!taskId) return;

    setLoading(true);
    setError(null);
    try {
      const response = await client.getGenerationStatus(taskId);
      setResult(response);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExtendMusic = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await client.extendMusic({
        audio_id: audioId,
        continue_at: continueAt,
        lyrics,
        style,
      });
      setResult(response);
      if (response.data?.taskId) {
        setTaskId(response.data.taskId);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateLyrics = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await client.generateLyrics({
        prompt,
      });
      setResult(response);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Music API Demo</h1>

      <div
        style={{ display: 'grid', gap: '20px', gridTemplateColumns: '1fr 1fr' }}
      >
        {/* 通常の音楽生成 */}
        <div
          style={{
            border: '1px solid #ccc',
            padding: '20px',
            borderRadius: '8px',
          }}
        >
          <h2>Generate Music</h2>
          <div
            style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}
          >
            <input
              type="text"
              placeholder="Enter prompt (e.g., Create a happy song)"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              style={{ padding: '8px' }}
            />
            <input
              type="text"
              placeholder="Style (e.g., pop, upbeat)"
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              style={{ padding: '8px' }}
            />
            <label>
              <input
                type="checkbox"
                checked={isInstrumental}
                onChange={(e) => setIsInstrumental(e.target.checked)}
              />
              Instrumental
            </label>
            <button
              onClick={handleGenerateMusic}
              disabled={loading || !prompt}
              style={{ padding: '10px', cursor: 'pointer' }}
            >
              Generate Music
            </button>
          </div>
        </div>

        {/* カスタム楽曲生成 */}
        <div
          style={{
            border: '1px solid #ccc',
            padding: '20px',
            borderRadius: '8px',
          }}
        >
          <h2>Generate Custom Music</h2>
          <div
            style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}
          >
            <input
              type="text"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{ padding: '8px' }}
            />
            <textarea
              placeholder="Lyrics (e.g., [Verse]\nHappy lyrics here)"
              value={lyrics}
              onChange={(e) => setLyrics(e.target.value)}
              style={{ padding: '8px', minHeight: '100px' }}
            />
            <input
              type="text"
              placeholder="Style"
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              style={{ padding: '8px' }}
            />
            <button
              onClick={handleGenerateCustomMusic}
              disabled={loading || !lyrics || !title}
              style={{ padding: '10px', cursor: 'pointer' }}
            >
              Generate Custom Music
            </button>
          </div>
        </div>

        {/* 楽曲拡張 */}
        <div
          style={{
            border: '1px solid #ccc',
            padding: '20px',
            borderRadius: '8px',
          }}
        >
          <h2>Extend Music</h2>
          <div
            style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}
          >
            <input
              type="text"
              placeholder="Audio ID"
              value={audioId}
              onChange={(e) => setAudioId(e.target.value)}
              style={{ padding: '8px' }}
            />
            <input
              type="number"
              placeholder="Continue at (seconds)"
              value={continueAt}
              onChange={(e) => setContinueAt(Number(e.target.value))}
              style={{ padding: '8px' }}
            />
            <textarea
              placeholder="Extended lyrics"
              value={lyrics}
              onChange={(e) => setLyrics(e.target.value)}
              style={{ padding: '8px', minHeight: '80px' }}
            />
            <button
              onClick={handleExtendMusic}
              disabled={loading || !audioId}
              style={{ padding: '10px', cursor: 'pointer' }}
            >
              Extend Music
            </button>
          </div>
        </div>

        {/* 歌詞生成 */}
        <div
          style={{
            border: '1px solid #ccc',
            padding: '20px',
            borderRadius: '8px',
          }}
        >
          <h2>Generate Lyrics</h2>
          <div
            style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}
          >
            <input
              type="text"
              placeholder="Lyrics prompt (e.g., Write lyrics about friendship)"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              style={{ padding: '8px' }}
            />
            <button
              onClick={handleGenerateLyrics}
              disabled={loading || !prompt}
              style={{ padding: '10px', cursor: 'pointer' }}
            >
              Generate Lyrics
            </button>
          </div>
        </div>
      </div>

      {/* ステータスチェック */}
      {taskId && (
        <div
          style={{
            marginTop: '20px',
            border: '1px solid #ccc',
            padding: '20px',
            borderRadius: '8px',
          }}
        >
          <h3>Check Generation Status</h3>
          <p>Task ID: {taskId}</p>
          <button
            onClick={handleCheckStatus}
            disabled={loading}
            style={{ padding: '10px', cursor: 'pointer' }}
          >
            Check Status
          </button>
        </div>
      )}

      {/* エラー表示 */}
      {error && (
        <div
          style={{
            marginTop: '20px',
            padding: '10px',
            backgroundColor: '#fee',
            borderRadius: '4px',
          }}
        >
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* 結果表示 */}
      {result && (
        <div
          style={{
            marginTop: '20px',
            padding: '20px',
            backgroundColor: '#f5f5f5',
            borderRadius: '8px',
          }}
        >
          <h3>Result:</h3>
          <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            {JSON.stringify(result, null, 2)}
          </pre>

          {/* 生成された音楽の表示 */}
          {result &&
            (Array.isArray(result)
              ? result
              : result.data
              ? Array.isArray(result.data)
                ? result.data
                : [result.data]
              : []
            ).map((track: any, index: number) => (
              <div
                key={track.id || index}
                style={{
                  marginTop: '20px',
                  padding: '15px',
                  backgroundColor: 'white',
                  borderRadius: '8px',
                }}
              >
                <h4>{track.title || 'Untitled'}</h4>
                <p>
                  <strong>Status:</strong> {track.state || 'Unknown'}
                </p>
                <p>
                  <strong>Style:</strong> {track.style}
                </p>
                <p>
                  <strong>Duration:</strong> {track.duration}s
                </p>

                {track.image_url && (
                  <img
                    src={track.image_url}
                    alt={track.title}
                    style={{ maxWidth: '200px', marginTop: '10px' }}
                  />
                )}

                {track.audio_url &&
                  (track.state === GenerationStatus.SUCCEEDED ||
                    track.status === 'complete') && (
                    <div style={{ marginTop: '10px' }}>
                      <audio controls>
                        <source src={track.audio_url} type="audio/mpeg" />
                        Your browser does not support the audio element.
                      </audio>
                    </div>
                  )}

                {track.lyric && (
                  <div style={{ marginTop: '10px' }}>
                    <strong>Lyrics:</strong>
                    <pre style={{ whiteSpace: 'pre-wrap' }}>{track.lyric}</pre>
                  </div>
                )}
              </div>
            ))}
        </div>
      )}

      {/* ローディング表示 */}
      {loading && (
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <p>Loading...</p>
        </div>
      )}
    </div>
  );
};

export default MusicApiDemo;
