# Система обработки заявок на консультацию

Эта система обрабатывает заявки на консультацию с сайта и отправляет уведомления администратору в Telegram.

## Возможности

- ✅ Прием и валидация заявок на консультацию
- ✅ Отправка уведомлений в Telegram администратору
- ✅ Сохранение заявок в JSON файлы
- ✅ API для получения статистики заявок
- ✅ Тестирование Telegram интеграции
- ✅ Защита от спама и валидация данных

## Структура проекта

```
src/consultation-system/
├── types/
│   └── consultation.ts          # Типы данных
├── services/
│   ├── telegram.service.ts      # Сервис отправки в Telegram
│   └── consultation.service.ts  # Основной сервис обработки заявок
├── server/
│   └── index.ts                 # Express сервер
├── scripts/
│   └── test-telegram.ts         # Скрипт тестирования Telegram
├── data/                        # Папка для сохранения заявок (создается автоматически)
├── package.json                 # Зависимости системы
├── .env.example                 # Пример переменных окружения
└── README.md                    # Этот файл
```

## Установка и настройка

### 1. Установка зависимостей

Перейдите в папку системы и установите зависимости:

```bash
cd src/consultation-system
npm install
```

### 2. Настройка Telegram бота

1. Создайте бота через [@BotFather](https://t.me/BotFather):
   - Отправьте `/newbot`
   - Придумайте имя и username для бота
   - Получите токен бота

2. Получите ID чата администратора:
   - Напишите боту [@userinfobot](https://t.me/userinfobot)
   - Отправьте любое сообщение
   - Скопируйте ваш User ID

### 3. Настройка переменных окружения

Скопируйте файл с примером и заполните переменные:

```bash
cp .env.example .env
```

Отредактируйте `.env`:

```bash
# Обязательные переменные
TELEGRAM_BOT_TOKEN=your_bot_token_from_botfather
TELEGRAM_ADMIN_CHAT_ID=your_user_id_from_userinfobot

# Опциональные переменные
CONSULTATION_PORT=3001
ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com
```

### 4. Тестирование Telegram интеграции

Запустите тест для проверки настроек:

```bash
npm run test-telegram
```

Если настройки корректны, вы получите тестовое сообщение в Telegram.

## Запуск

### Режим разработки (с автоперезагрузкой)

```bash
npm run dev
```

### Продакшн режим

```bash
npm start
```

Сервер будет доступен по адресу: `http://localhost:3001`

## API Endpoints

### POST /api/consultation
Отправка заявки на консультацию

**Тело запроса:**
```json
{
  "name": "Иван Иванов",
  "email": "ivan@example.com",
  "phone": "+7 (999) 123-45-67",
  "company": "ООО Пример",
  "projectDescription": "Хочу создать Telegram Mini App для интернет-магазина",
  "serviceType": "Бесплатная консультация",
  "budget": "До 100 000 ₽",
  "timeline": "1-2 месяца",
  "additionalInfo": "Дополнительная информация"
}
```

**Ответ:**
```json
{
  "success": true,
  "data": {
    "id": "cons_123456_abc789",
    "name": "Иван Иванов",
    "email": "ivan@example.com",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "status": "new"
  },
  "message": "Заявка успешно отправлена! Мы свяжемся с вами в ближайшее время."
}
```

### POST /api/test-telegram
Тестирование отправки сообщений в Telegram

### GET /api/consultation/stats
Получение статистики заявок

### GET /api/consultation/by-date/:date
Получение заявок за конкретную дату (формат: YYYY-MM-DD)

### GET /health
Health check сервера

## Интеграция с Next.js сайтом

Добавьте скрипты в основной `package.json` проекта:

```json
{
  "scripts": {
    "consultation:dev": "cd src/consultation-system && npm run dev",
    "consultation:start": "cd src/consultation-system && npm start",
    "consultation:install": "cd src/consultation-system && npm install",
    "consultation:test": "cd src/consultation-system && npm run test-telegram"
  }
}
```

## Использование в React компонентах

Пример отправки заявки из React формы:

```typescript
const submitConsultation = async (formData: ConsultationFormData) => {
  try {
    const response = await fetch('http://localhost:3001/api/consultation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData)
    });

    const result = await response.json();

    if (result.success) {
      // Успешная отправка
      alert(result.message);
    } else {
      // Ошибка
      alert(result.error);
    }
  } catch (error) {
    console.error('Ошибка отправки:', error);
  }
};
```

## Структура Telegram уведомления

При получении заявки администратор получит сообщение в следующем формате:

```
🚀 Новая заявка на консультацию!

📅 Дата: 15.01.2024, 13:30
👤 Имя: Иван Иванов
📧 Email: ivan@example.com
📞 Телефон: +7 (999) 123-45-67
🏢 Компания: ООО Пример
🎯 Услуга: Бесплатная консультация
💰 Бюджет: До 100 000 ₽
⏰ Сроки: 1-2 месяца
📝 Описание проекта:
Хочу создать Telegram Mini App для интернет-магазина

💬 Дополнительная информация:
Дополнительная информация

#новая_заявка #консультация
```

## Хранение данных

Заявки сохраняются в JSON файлы в папке `data/`:
- Файлы именуются по дате: `consultations_2024-01-15.json`
- Каждый файл содержит массив заявок за день
- Данные сохраняются в формате, удобном для импорта в Excel/Google Sheets

## Безопасность

- ✅ Валидация всех входящих данных
- ✅ CORS защита
- ✅ Лимиты на размер запросов
- ✅ Экранирование HTML в Telegram сообщениях
- ✅ Валидация email и телефонов

## Мониторинг и логирование

Сервер логирует:
- Все входящие запросы
- Успешные и неудачные отправки в Telegram
- Ошибки обработки заявок
- Статистику по заявкам

## Развертывание в продакшене

1. Установите PM2 для управления процессом:
```bash
npm install -g pm2
```

2. Создайте ecosystem файл для PM2:
```javascript
module.exports = {
  apps: [{
    name: 'consultation-system',
    script: 'server/index.ts',
    cwd: './src/consultation-system',
    interpreter: 'tsx',
    env: {
      NODE_ENV: 'production'
    }
  }]
};
```

3. Запустите через PM2:
```bash
pm2 start ecosystem.config.js
```

## Поддержка

При возникновении проблем проверьте:

1. **Telegram не получает сообщения:**
   - Корректность токена бота
   - Корректность ID чата
   - Запущена ли переписка с ботом

2. **Ошибки валидации:**
   - Проверьте формат отправляемых данных
   - Убедитесь, что обязательные поля заполнены

3. **Сервер не запускается:**
   - Проверьте доступность порта 3001
   - Убедитесь, что установлены все зависимости

## Changelog

### v1.0.0
- Первоначальный релиз
- Обработка заявок на консультацию
- Telegram интеграция
- Базовая статистика
