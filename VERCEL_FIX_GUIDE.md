# 🚨 КРИТИЧЕСКИЕ ИСПРАВЛЕНИЯ ДЛЯ VERCEL

## Проблема: Gemini API не работает

### ❌ Что не работает:
- Gemini API анализ не запускается
- Callback не отправляется на сервер
- Нет логов в консоли браузера

### ✅ Решение:

## 1. НАСТРОЙКА ENVIRONMENT VARIABLES В VERCEL

1. Зайдите в панель Vercel: https://vercel.com/dashboard
2. Найдите проект `gemini-video-analysy`
3. Перейдите в **Settings** → **Environment Variables**
4. Добавьте переменную:
   - **Name**: `GEMINI_API_KEY`
   - **Value**: `AIzaSyCLwyI7YITNKGTkJC5wvK7rISOcsd8TeSQ`
   - **Environment**: Production, Preview, Development (все три)

## 2. ПЕРЕДЕПЛОЙ ПРИЛОЖЕНИЯ

После добавления переменной:
1. Перейдите в **Deployments**
2. Нажмите **Redeploy** на последнем деплое
3. Или сделайте новый коммит и push

## 3. ПРОВЕРКА В КОНСОЛИ БРАУЗЕРА

Откройте https://gemini-video-analysy-q82k.vercel.app/ и:
1. Нажмите F12 (Developer Tools)
2. Перейдите в **Console**
3. Попробуйте анализ видео
4. Проверьте ошибки в консоли

## 4. ТЕСТИРОВАНИЕ

Используйте этот URL для тестирования:
```
https://gemini-video-analysy-q82k.vercel.app/?videoUrl=https://example.com/video.mp4&callbackUrl=https://your-server.com/callback&run=true
```

## 5. ВОЗМОЖНЫЕ ОШИБКИ

### Если видите "Ключ Gemini API не настроен":
- Environment variable не добавлена в Vercel
- Нужен передеплой после добавления переменной

### Если видите CORS ошибки:
- Проверьте URL callback сервера
- Убедитесь что сервер принимает POST запросы

### Если анализ зависает:
- Gemini API может быть медленным
- Проверьте размер видео (должно быть < 20MB)

## 6. ЛОГИ ДЛЯ ДИАГНОСТИКИ

В консоли браузера должны появиться:
```
[АНАЛИЗ НАЧАТ] URL видео: ... | Callback URL: ...
[2/5] Начинаю загрузку видео с ...
[3/5] Конвертирую видео в base64...
[4/5] Отправляю запрос в Gemini API...
[ОТПРАВКА] Начинаю отправку на callback URL: ...
```

Если этих логов нет - проблема в настройке API ключа!
