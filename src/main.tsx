import React, { useState, useCallback, useEffect } from 'react';
import ReactDOM from 'react-dom/client';

// Helper function to convert a File object to a base64 string for the API
const fileToGenerativePart = (file: File): Promise<{ mimeType: string; data: string; }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        return reject('Failed to read file');
      }
      const result = reader.result;
      const parts = result.split(';base64,');
      const mimeType = parts[0].split(':')[1];
      const data = parts[1];
      resolve({ mimeType, data });
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

const App: React.FC = () => {
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [callbackUrl, setCallbackUrl] = useState<string>('http://178.156.142.35:4123/api/gemini-results');
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [shouldAutoRun, setShouldAutoRun] = useState(false);
  
  const handleAnalyze = useCallback(async () => {
    if (!videoUrl || !callbackUrl) return;

    console.log('[АНАЛИЗ НАЧАТ] URL видео:', videoUrl, '| Callback URL:', callbackUrl);
    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);
    setStatusMessage('1/5: Анализ запущен...');

    try {
      setStatusMessage('2/5: Загрузка видео по ссылке...');
      console.log('[2/5] Начинаю загрузку видео с', videoUrl);
      const response = await fetch(videoUrl);
      if (!response.ok) {
        throw new Error(`Не удалось загрузить видео. Статус: ${response.status}`);
      }
      const blob = await response.blob();
      console.log('[2/5] Видео успешно загружено, размер:', blob.size, 'байт');
      const fileName = videoUrl.split('/').pop() || 'video_from_url';
      const file = new File([blob], fileName, { type: blob.type });

      setStatusMessage('3/5: Подготовка видео для анализа...');
      console.log('[3/5] Конвертирую видео в base64...');
      const videoPart = await fileToGenerativePart(file);
      console.log('[3/5] Видео готово для отправки в Gemini.');

      if (!videoPart) {
        throw new Error("Не удалось обработать видеофайл.");
      }
      
      setStatusMessage('4/5: Анализ видео с помощью Gemini...');
      console.log('[4/5] Отправляю запрос в Gemini API...');
      
      const prompt = `Проанализируй это видео, включая его аудиодорожку. Основываясь на аудио и визуальных данных, определи наличие следующих элементов:

1. **Закадровый голос**: голос диктора, который не принадлежит персонажам в кадре.
2. **Музыка или звуковые эффекты**: любые фоновые звуки, не являющиеся речью.
3. **Субтитры**: Любой текст, транскрибирующий или переводящий речь, НЕЗАВИСИМО от его стиля, цвета, анимации или положения на экране. Это включает в себя как традиционные субтитры внизу кадра, так и стилизованные/анимированные субтитры (например, созданные в CapCut, 'караоке'-стиль, всплывающие слова). Ключевой фактор - текст дублирует или переводит речь.
4. **Стиль субтитров**: Если субтитры обнаружены (согласно п.3), кратко опиши их стиль (например, 'статичные белые внизу', 'анимированные желтые по центру', 'караоке-стиль с подсветкой'). Если субтитров нет, оставь это поле пустым.
5. **Визуальные эффекты**: например, VHS, зернистость, наложения, размытие. Не включай сюда анимированный текст, если он является субтитрами.
6. **Текстовые наложения**: Любой текст, который НЕ является субтитрами (не транскрибирует речь). Примеры: заголовки, плашки, водяные знаки, информационные вставки.

Ответь только в формате JSON, соответствующем предоставленной схеме. Не добавляй никаких пояснений или markdown-форматирования.`;
      
      // Прямой запрос к Gemini API (без прокси)
      const apiKey = 'AIzaSyCLwyI7YITNKGTkJC5wvK7rISOcsd8TeSQ';
      const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: {
            parts: [
              { text: prompt },
              { inlineData: videoPart }
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

      if (!geminiResponse.ok) {
        const errorText = await geminiResponse.text();
        throw new Error(`Gemini API ошибка: ${geminiResponse.status} - ${errorText}`);
      }

      const result = await geminiResponse.json();
      console.log('[4/5] Получен ответ от Gemini.');
      setStatusMessage('5/5: Результат получен от Gemini.');
      
      const resultJson = result.candidates?.[0]?.content?.parts?.[0]?.text ? JSON.parse(result.candidates[0].content.parts[0].text) : result;
      setAnalysisResult(resultJson);
      
      // Call sendCallback and wait for it to complete
      await sendCallback(resultJson, videoUrl);

    } catch (e: any) {
      let errorMessage = e.message || 'Произошла неизвестная ошибка во время анализа.';
      
      if (e instanceof TypeError && e.message.toLowerCase().includes('failed to fetch')) {
        errorMessage = `Сетевая ошибка при загрузке видео с ${videoUrl}. Вероятная причина: CORS-политика на сервере, где хранится видео. Проверьте консоль браузера (F12) на наличие ошибок CORS.`;
      } else if (e.message && e.message.toLowerCase().includes('api key')) {
        errorMessage = 'Ошибка аутентификации Gemini. Убедитесь, что API ключ действителен и правильно настроен.';
      }
      
      console.error('[ОШИБКА АНАЛИЗА]', e);
      setError(errorMessage);
      setStatusMessage('Анализ прерван из-за ошибки.');
    } finally {
      setIsLoading(false);
    }
  }, [videoUrl, callbackUrl]);

  const sendCallback = async (result: any, videoUrl: string) => {
    if (!callbackUrl) return;
    setStatusMessage('Отправка результата на ваш сервер...');
    console.log('[ОТПРАВКА] Начинаю отправку на callback URL:', callbackUrl);
    
    const payload = {
      video_url: videoUrl,
      result: result,
    };
    
    console.log('[ОТПРАВКА] Тело запроса (payload):', JSON.stringify(payload, null, 2));
    setError(null);
    try {
      const response = await fetch(callbackUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (response.ok) {
        console.log('[ОТПРАВКА] Успешно! Статус:', response.status);
        setStatusMessage('Анализ завершен! Результат успешно отправлен на сервер.');
      } else {
        const errorText = await response.text();
        console.error('[ОТПРАВКА] Ошибка сервера:', response.status, errorText);
        setStatusMessage('Анализ завершен, но сервер вернул ошибку при сохранении результата.');
      }
      
    } catch (e: any) {
      console.error('[ОТПРАВКА] Критическая ошибка при отправке запроса:', e);
      setStatusMessage('');
      setError(`Ошибка при отправке на callback URL. Проверьте консоль браузера (F12) на наличие сетевых проблем. Сообщение: ${e.message}`);
    }
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const videoUrlParam = urlParams.get('videoUrl');
    const callbackUrlParam = urlParams.get('callbackUrl') || urlParams.get('callback');
    const runParam = urlParams.get('run');
    
    // Logic for pre-filling fields and auto-running
    if (videoUrlParam && callbackUrlParam && runParam === 'true') {
      try {
        const decodedVideoUrl = decodeURIComponent(videoUrlParam);
        const decodedCallbackUrl = decodeURIComponent(callbackUrlParam);
        setVideoUrl(decodedVideoUrl);
        setCallbackUrl(decodedCallbackUrl);
        setShouldAutoRun(true); // Signal that analysis should start automatically
      } catch (e) {
        console.error("Failed to decode URL parameters for auto-run:", e);
        setError("Некорректные URL в параметрах для автозапуска.");
      }
    } else if (callbackUrlParam) { // Handle just pre-filling the callback URL
       try {
        setCallbackUrl(decodeURIComponent(callbackUrlParam));
      } catch (e) {
        console.error("Failed to decode callback URL parameter:", e);
        setError("Некорректный callback URL в параметрах.");
      }
    }
  }, []); // Run only once on component mount

  useEffect(() => {
    // This effect triggers the analysis if the auto-run flag is set and URLs are valid
    if (shouldAutoRun && videoUrl && callbackUrl) {
      handleAnalyze();
      setShouldAutoRun(false); // Reset the flag to prevent re-runs on re-renders
    }
  }, [shouldAutoRun, videoUrl, callbackUrl, handleAnalyze]);

  return (
    <div className="container">
      <header>
        <h1>🎬 Gemini Video Analyzer</h1>
        <p>Анализ видео с помощью Gemini AI для определения субтитров, озвучки и эффектов</p>
      </header>
      
      <main>
        <div className="input-group">
            <label htmlFor="video-url-input">Ссылка на видео</label>
            <input 
                id="video-url-input"
                type="text"
                placeholder="http://178.156.142.35:4123/videos/gemini_test.mp4"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                disabled={isLoading}
            />
        </div>

        <div className="input-group">
            <label htmlFor="callback-url-input">Callback URL (наш сервер)</label>
            <input 
                id="callback-url-input"
                type="text"
                placeholder="http://178.156.142.35:4123/api/gemini-results"
                value={callbackUrl}
                onChange={(e) => setCallbackUrl(e.target.value)}
                disabled={isLoading}
            />
        </div>
        
        <button className="analyze-button" onClick={handleAnalyze} disabled={!videoUrl || !callbackUrl || isLoading}>
          {isLoading ? 'Анализ...' : 'Анализировать видео'}
        </button>
        
        <div className="results-area">
          {(isLoading || statusMessage) && !error && (
            <div className="loader">
              {isLoading && <div className="spinner"></div>}
              <p>{statusMessage || 'Инициализация...'}</p>
            </div>
          )}
          {error && (
            <div className="error">
                <h2>❌ Ошибка</h2>
                <p>{error}</p>
            </div>
          )}
          {analysisResult && !isLoading && !error && (
            <div className="result">
                <h2>✅ Результат анализа</h2>
                <pre>{JSON.stringify(analysisResult, null, 2)}</pre>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);