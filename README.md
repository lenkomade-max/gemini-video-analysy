# Gemini Video Analyzer

Веб-приложение для анализа видео с помощью Google Gemini API.

## Возможности

- Анализ видео по URL
- Определение закадрового голоса, музыки, субтитров
- Отправка результатов на callback URL
- Автоматический запуск анализа через URL параметры

## Environment Variables

Для работы приложения необходимо настроить следующие переменные окружения:

- `GEMINI_API_KEY` - API ключ Google Gemini

## Деплой на Vercel

1. Подключите репозиторий к Vercel
2. Настройте Environment Variables в настройках проекта:
   - `GEMINI_API_KEY`: ваш API ключ Gemini
3. Деплой произойдет автоматически

## Использование

### Автоматический анализ
```
https://your-app.vercel.app/?videoUrl=https://example.com/video.mp4&callbackUrl=https://your-server.com/callback&run=true
```

### Ручной анализ
Откройте приложение и введите:
- URL видео для анализа
- Callback URL для отправки результатов

## Локальная разработка

```bash
npm install
npm run dev
```