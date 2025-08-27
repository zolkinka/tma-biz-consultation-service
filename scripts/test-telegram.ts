import dotenv from 'dotenv';
import { TelegramNotificationService } from '../services/telegram.service';
import { TelegramConfig } from '../types/consultation';

// Загружаем переменные окружения
dotenv.config();

async function testTelegramConnection() {
  console.log('🧪 Тестирование подключения к Telegram...');

  const telegramConfig: TelegramConfig = {
    botToken: process.env.TELEGRAM_BOT_TOKEN || '',
    adminChatId: process.env.TELEGRAM_ADMIN_CHAT_ID || ''
  };

  if (!telegramConfig.botToken) {
    console.error('❌ TELEGRAM_BOT_TOKEN не установлен в переменных окружения');
    process.exit(1);
  }

  if (!telegramConfig.adminChatId) {
    console.error('❌ TELEGRAM_ADMIN_CHAT_ID не установлен в переменных окружения');
    process.exit(1);
  }

  console.log('📋 Конфигурация:');
  console.log(`Bot Token: ${telegramConfig.botToken.substring(0, 10)}...`);
  console.log(`Admin Chat ID: ${telegramConfig.adminChatId}`);

  const telegramService = new TelegramNotificationService(telegramConfig);

  try {
    console.log('📤 Отправка тестового сообщения...');
    const success = await telegramService.sendTestMessage();

    if (success) {
      console.log('✅ Тестовое сообщение успешно отправлено!');
      console.log('🎉 Telegram интеграция работает корректно!');
    } else {
      console.log('❌ Не удалось отправить тестовое сообщение');
      console.log('🔍 Проверьте:');
      console.log('  - Правильность токена бота');
      console.log('  - ID чата администратора');
      console.log('  - Что бот добавлен в чат или начата переписка с ботом');
    }
  } catch (error) {
    console.error('💥 Ошибка при тестировании:', error);
    process.exit(1);
  }
}

// Запуск теста
testTelegramConnection();
