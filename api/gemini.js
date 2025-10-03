// API route для проксирования запросов к Gemini API
// Обходит CORS ограничения браузера

export default async function handler(req, res) {
  // Настройка CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { videoData, prompt } = req.body;
    
    if (!videoData || !prompt) {
      return res.status(400).json({ error: 'Missing videoData or prompt' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Gemini API key not configured' });
    }

    console.log('[GEMINI PROXY] Starting video analysis...');
    console.log('[GEMINI PROXY] Video size:', videoData.length, 'characters');
    console.log('[GEMINI PROXY] API key:', apiKey.substring(0, 10) + '...');

    // Отправляем запрос к Gemini API
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: {
          parts: [
            { text: prompt },
            { inlineData: videoData }
          ]
        },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "object",
            properties: {
              voiceover: { type: "boolean", description: 'Наличие закадрового голоса на основе анализа аудио.' },
              music_or_sfx: { type: "boolean", description: 'Наличие музыки или звуковых эффектов на основе анализа аудио.' },
              subtitles: { type: "boolean", description: 'Есть ли встроенные субтитры, которые транскрибируют или переводят речь, независимо от их стиля и анимации.' },
              subtitle_style: { type: "string", description: "Описание стиля обнаруженных субтитров (например, 'анимированные', 'статичные'). Пустая строка, если субтитров нет." },
              visual_effects: {
                type: "array",
                items: { type: "string" },
                description: 'Список обнаруженных визуальных эффектов.'
              },
              text_overlays: { 
                type: "array",
                items: { type: "string" },
                description: 'Список обнаруженных текстовых наложений (заголовки, плашки, и т.д., исключая субтитры).' 
              },
              analysis_confidence: { type: "number", description: 'Уверенность анализа от 0.0 до 1.0.' },
            },
            required: ["voiceover", "music_or_sfx", "subtitles", "subtitle_style", "visual_effects", "text_overlays", "analysis_confidence"]
          }
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[GEMINI PROXY] API Error:', response.status, errorText);
      return res.status(response.status).json({ 
        error: 'Gemini API error', 
        details: errorText,
        status: response.status 
      });
    }

    const result = await response.json();
    console.log('[GEMINI PROXY] Analysis completed successfully');
    
    return res.status(200).json(result);

  } catch (error) {
    console.error('[GEMINI PROXY] Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message 
    });
  }
}
