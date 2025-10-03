# 🚀 Деплой Gemini Video Analyzer на Vercel

## ✅ Репозиторий готов!
Код успешно загружен в: https://github.com/lenkomade-max/gemini-video-analysy

## 📋 Следующие шаги для деплоя:

### 1. Подключение к Vercel
1. Перейдите на https://vercel.com/new
2. Войдите в аккаунт GitHub
3. Нажмите "Import Project"
4. Выберите репозиторий `lenkomade-max/gemini-video-analysy`
5. Нажмите "Import"

### 2. Настройка Environment Variables
В настройках проекта Vercel добавьте:
- **Variable Name**: `GEMINI_API_KEY`
- **Value**: `AIzaSyCLwyI7YITNKGTkJC5wvK7rISOcsd8TeSQ`

### 3. Настройки сборки
Vercel автоматически определит настройки:
- **Framework**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 4. Деплой
Нажмите "Deploy" - приложение будет автоматически собрано и задеплоено.

## 🎯 Результат
После деплоя ваше приложение будет доступно по адресу:
`https://gemini-video-analysy.vercel.app`

## 🔧 Использование

### Автоматический анализ видео:
```
https://gemini-video-analysy.vercel.app/?videoUrl=https://example.com/video.mp4&callbackUrl=https://your-server.com/callback&run=true
```

### Ручной анализ:
1. Откройте приложение
2. Введите URL видео
3. Введите callback URL для отправки результатов
4. Нажмите "Анализировать"

## 📡 Интеграция с вашим сервером
Ваш сервер может отправлять POST запросы на callback URL с результатами анализа видео в формате:

```json
{
  "video_url": "https://example.com/video.mp4",
  "result": {
    "voiceover": true,
    "music_or_sfx": true,
    "subtitles": true,
    "subtitle_style": "анимированные желтые",
    "visual_effects": ["VHS", "зернистость"],
    "text_overlays": ["заголовок"],
    "analysis_confidence": 0.95
  }
}
```

## 🎉 Готово!
Приложение готово к использованию с вашим сервером для анализа видео!
