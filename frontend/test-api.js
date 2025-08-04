// Suno API テストスクリプト
const API_KEY = 'd0df9c3e20e9171fa804168d309a575b';
const API_URL = 'https://api.sunoapi.org';

async function testGenerateMusic() {
  console.log('Testing Generate Music API...');
  
  try {
    const response = await fetch(`${API_URL}/api/v1/generate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: 'Create a happy song about summer',
        tags: 'pop, upbeat',
        model: 'V3_5',  // mvではなくmodel
        instrumental: false,
        callBackUrl: 'https://example.com/callback',
        customMode: false
      })
    });

    const data = await response.json();
    console.log('Response:', JSON.stringify(data, null, 2));
    
    if (!response.ok) {
      console.log('Error status:', response.status);
    }
    
    return data;
  } catch (error) {
    console.error('Error:', error);
  }
}

async function testGetStatus(taskId) {
  console.log('Testing Get Status API...');
  
  try {
    const response = await fetch(`${API_URL}/api/v1/queryAudio?taskId=${taskId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
      }
    });

    const data = await response.json();
    console.log('Status Response:', JSON.stringify(data, null, 2));
    
    return data;
  } catch (error) {
    console.error('Error:', error);
  }
}

// 実行
async function main() {
  // クレジット不足のため、既存のタスクIDでテスト
  await testGetStatus('978d9f3d0a78f1370400f721396fa0ac');
}

main();