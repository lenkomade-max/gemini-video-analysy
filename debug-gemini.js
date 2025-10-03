// Диагностический тест для Gemini API
const testGeminiAPI = async () => {
  console.log('=== ДИАГНОСТИКА GEMINI API ===');
  
  // 1. Проверка API ключа
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
  console.log('API ключ:', apiKey ? `${apiKey.substring(0, 10)}...` : 'НЕТ');
  
  if (!apiKey) {
    console.error('❌ API ключ не найден!');
    return;
  }
  
  // 2. Тест простого текстового запроса
  try {
    console.log('Тестирую простой текстовый запрос...');
    const ai = new GoogleGenAI({ apiKey });
    
    const result = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [{ text: 'Привет! Ответь одним словом: "Работает"' }] }
    });
    
    console.log('✅ Текстовый запрос работает:', result.text);
  } catch (error) {
    console.error('❌ Ошибка текстового запроса:', error);
  }
  
  // 3. Тест с видео (маленький файл)
  try {
    console.log('Тестирую видео запрос...');
    
    // Создаем маленький тестовый видео файл
    const canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 100;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'red';
    ctx.fillRect(0, 0, 100, 100);
    
    canvas.toBlob(async (blob) => {
      const file = new File([blob], 'test.mp4', { type: 'video/mp4' });
      
      // Конвертируем в base64
      const reader = new FileReader();
      reader.onload = async () => {
        const result = reader.result;
        const parts = result.split(';base64,');
        const mimeType = parts[0].split(':')[1];
        const data = parts[1];
        
        try {
          const ai = new GoogleGenAI({ apiKey });
          const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { 
              parts: [
                { text: 'Что ты видишь на этом изображении?' },
                { inlineData: { mimeType, data } }
              ] 
            }
          });
          
          console.log('✅ Видео запрос работает:', response.text);
        } catch (error) {
          console.error('❌ Ошибка видео запроса:', error);
        }
      };
      reader.readAsDataURL(file);
    }, 'video/mp4');
    
  } catch (error) {
    console.error('❌ Ошибка создания тестового видео:', error);
  }
};

// Запустить диагностику
testGeminiAPI();
