import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { ConsultationService } from '../services/consultation.service';
import { TelegramNotificationService } from '../services/telegram.service';
import { ConsultationFormData, TelegramConfig } from '../types/consultation';

// Загружаем переменные окружения
dotenv.config();

const app = express();
const PORT = process.env.CONSULTATION_PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Инициализация сервисов
const telegramConfig: TelegramConfig = {
  botToken: process.env.TELEGRAM_BOT_TOKEN || '',
  adminChatId: process.env.TELEGRAM_ADMIN_CHAT_ID || ''
};

if (!telegramConfig.botToken || !telegramConfig.adminChatId) {
  console.error('❌ Telegram configuration is missing!');
  console.error('Please set TELEGRAM_BOT_TOKEN and TELEGRAM_ADMIN_CHAT_ID in your .env file');
  process.exit(1);
}

const telegramService = new TelegramNotificationService(telegramConfig);
const consultationService = new ConsultationService(telegramService);

// Middleware для логирования
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Обработка заявок на консультацию
app.post('/api/consultation', async (req, res) => {
  try {
    const formData: ConsultationFormData = req.body;
    
    console.log('📝 Received consultation request from:', formData.email);
    
    const result = await consultationService.processConsultationRequest(formData);
    
    if (result.success) {
      console.log('✅ Consultation request processed successfully:', result.data?.id);
      res.status(200).json(result);
    } else {
      console.log('❌ Consultation request failed:', result.error);
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('💥 Server error:', error);
    res.status(500).json({
      success: false,
      error: 'Внутренняя ошибка сервера'
    });
  }
});

// Тестовый эндпоинт для проверки Telegram
app.post('/api/test-telegram', async (req, res) => {
  try {
    const success = await telegramService.sendTestMessage();
    
    if (success) {
      res.json({
        success: true,
        message: 'Тестовое сообщение отправлено в Telegram'
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Не удалось отправить тестовое сообщение'
      });
    }
  } catch (error) {
    console.error('Error sending test message:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка при отправке тестового сообщения'
    });
  }
});

// Получение статистики заявок
app.get('/api/consultation/stats', async (req, res) => {
  try {
    const stats = await consultationService.getConsultationStats();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error getting stats:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка при получении статистики'
    });
  }
});

// Получение заявок за дату
app.get('/api/consultation/by-date/:date', async (req, res) => {
  try {
    const { date } = req.params;
    const consultations = await consultationService.getConsultationsByDate(date);
    
    res.json({
      success: true,
      data: consultations
    });
  } catch (error) {
    console.error('Error getting consultations by date:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка при получении заявок'
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'consultation-system'
  });
});

// Обработка ошибок
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Внутренняя ошибка сервера'
  });
});

// Запуск сервера
app.listen(PORT, () => {
  console.log('🚀 Consultation System Server started');
  console.log(`📡 Server running on port ${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`📝 API endpoint: http://localhost:${PORT}/api/consultation`);
  console.log(`🧪 Test Telegram: http://localhost:${PORT}/api/test-telegram`);
});

export default app;
