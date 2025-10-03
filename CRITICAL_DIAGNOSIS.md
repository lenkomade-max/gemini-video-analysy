# 🚨 КРИТИЧЕСКАЯ ДИАГНОСТИКА GEMINI API

## Проблема: Все три приложения не работают

### Возможные причины:

## 1. GEMINI API ОГРАНИЧЕНИЯ
- **CORS блокировка** - Gemini API может блокировать запросы из браузера
- **Лимиты API** - превышены квоты или rate limits
- **Региональные ограничения** - API недоступен в некоторых регионах

## 2. VERCEL ОГРАНИЧЕНИЯ
- **Serverless функции** - Gemini API может не работать в serverless среде
- **Timeout** - анализ видео занимает больше 10 секунд (лимит Vercel)
- **Memory limits** - обработка видео требует много памяти

## 3. БРАУЗЕРНЫЕ ОГРАНИЧЕНИЯ
- **CORS политика** - браузер блокирует запросы к Gemini API
- **Mixed content** - HTTPS/HTTP конфликты
- **File size limits** - видео слишком большое для браузера

## 🔧 ПЛАН ДИАГНОСТИКИ:

### Шаг 1: Проверка API ключа
```javascript
// В консоли браузера на https://gemini-video-analysy.vercel.app/
console.log('API ключ:', process.env.GEMINI_API_KEY ? 'ЕСТЬ' : 'НЕТ');
```

### Шаг 2: Тест простого запроса
```javascript
// Тест текстового запроса (без видео)
const ai = new GoogleGenAI({ apiKey: 'AIzaSyCLwyI7YITNKGTkJC5wvK7rISOcsd8TeSQ' });
ai.models.generateContent({
  model: 'gemini-2.5-flash',
  contents: { parts: [{ text: 'Привет!' }] }
}).then(result => console.log('✅ Работает:', result.text))
  .catch(error => console.error('❌ Ошибка:', error));
```

### Шаг 3: Проверка CORS
```javascript
// Тест CORS запроса
fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Goog-Api-Key': 'AIzaSyCLwyI7YITNKGTkJC5wvK7rISOcsd8TeSQ'
  },
  body: JSON.stringify({
    contents: [{ parts: [{ text: 'Тест' }] }]
  })
}).then(response => console.log('✅ CORS OK:', response.status))
  .catch(error => console.error('❌ CORS Error:', error));
```

## 🚨 ВОЗМОЖНОЕ РЕШЕНИЕ:

### Проблема: Gemini API не работает в браузере из-за CORS

**Решение**: Создать прокси-сервер на Vercel:

1. Создать API route в `/api/gemini.js`
2. Отправлять запросы к Gemini через сервер
3. Обойти CORS ограничения

### Альтернативное решение:
- Использовать другой AI API (OpenAI, Anthropic)
- Переместить анализ на серверную сторону
- Использовать WebSocket для больших файлов

## 📋 СЛЕДУЮЩИЕ ШАГИ:

1. **Проверить консоль браузера** на ошибки CORS
2. **Протестировать API ключ** напрямую
3. **Создать прокси-сервер** если CORS блокирует
4. **Рассмотреть альтернативы** Gemini API
