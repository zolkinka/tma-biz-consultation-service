import { ConsultationRequest, ConsultationFormData, ApiResponse, ConsultationStatus } from '../types/consultation';
import { TelegramNotificationService } from './telegram.service';
import fs from 'fs/promises';
import path from 'path';

/**
 * Сервис для обработки заявок на консультацию
 */
export class ConsultationService {
  private telegramService: TelegramNotificationService;
  private dataDir: string;

  constructor(telegramService: TelegramNotificationService) {
    this.telegramService = telegramService;
    this.dataDir = path.join(process.cwd(), 'src', 'consultation-system', 'data');
  }

  /**
   * Обработка новой заявки
   */
  async processConsultationRequest(formData: ConsultationFormData): Promise<ApiResponse<ConsultationRequest>> {
    try {
      // Валидация данных
      const validationResult = this.validateFormData(formData);
      if (!validationResult.success) {
        return {
          success: false,
          error: validationResult.error
        };
      }

      // Создание объекта заявки
      const consultationRequest: ConsultationRequest = {
        id: this.generateId(),
        ...formData,
        createdAt: new Date(),
        status: ConsultationStatus.NEW
      };

      // Сохранение заявки в файл
      await this.saveConsultationRequest(consultationRequest);

      // Отправка уведомления в Telegram
      const telegramSent = await this.telegramService.sendConsultationNotification(consultationRequest);
      
      if (!telegramSent) {
        console.warn('Failed to send Telegram notification, but request was saved');
      }

      return {
        success: true,
        data: consultationRequest,
        message: 'Заявка успешно отправлена! Мы свяжемся с вами в ближайшее время.'
      };

    } catch (error) {
      console.error('Error processing consultation request:', error);
      return {
        success: false,
        error: 'Произошла ошибка при обработке заявки. Попробуйте позже.'
      };
    }
  }

  /**
   * Валидация данных формы
   */
  private validateFormData(formData: ConsultationFormData): ApiResponse {
    const errors: string[] = [];

    // Проверка обязательных полей
    if (!formData.name || formData.name.trim().length < 2) {
      errors.push('Имя должно содержать минимум 2 символа');
    }

    if (!formData.email || !this.isValidEmail(formData.email)) {
      errors.push('Некорректный email адрес');
    }

    if (!formData.projectDescription || formData.projectDescription.trim().length < 10) {
      errors.push('Описание проекта должно содержать минимум 10 символов');
    }

    if (!formData.serviceType) {
      errors.push('Необходимо выбрать тип услуги');
    }

    // Проверка телефона (если указан)
    if (formData.phone && !this.isValidPhone(formData.phone)) {
      errors.push('Некорректный номер телефона');
    }

    if (errors.length > 0) {
      return {
        success: false,
        error: errors.join('; ')
      };
    }

    return { success: true };
  }

  /**
   * Валидация email
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Валидация телефона
   */
  private isValidPhone(phone: string): boolean {
    // Простая проверка российских номеров
    const phoneRegex = /^(\+7|7|8)?[\s\-]?\(?[489][0-9]{2}\)?[\s\-]?[0-9]{3}[\s\-]?[0-9]{2}[\s\-]?[0-9]{2}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  }

  /**
   * Генерация уникального ID
   */
  private generateId(): string {
    const timestamp = Date.now().toString(36);
    const randomPart = Math.random().toString(36).substring(2, 8);
    return `cons_${timestamp}_${randomPart}`;
  }

  /**
   * Сохранение заявки в файл
   */
  private async saveConsultationRequest(request: ConsultationRequest): Promise<void> {
    try {
      // Создаем папку data если её нет
      await fs.mkdir(this.dataDir, { recursive: true });

      // Формируем имя файла с датой
      const date = new Date().toISOString().split('T')[0];
      const filename = `consultations_${date}.json`;
      const filepath = path.join(this.dataDir, filename);

      // Читаем существующие заявки или создаем пустой массив
      let existingRequests: ConsultationRequest[] = [];
      try {
        const fileContent = await fs.readFile(filepath, 'utf8');
        existingRequests = JSON.parse(fileContent);
      } catch {
        // Файл не существует, начинаем с пустого массива
      }

      // Добавляем новую заявку
      existingRequests.push(request);

      // Сохраняем обновленные данные
      await fs.writeFile(filepath, JSON.stringify(existingRequests, null, 2), 'utf8');

      console.log(`Consultation request saved: ${request.id}`);
    } catch (error) {
      console.error('Error saving consultation request:', error);
      throw error;
    }
  }

  /**
   * Получение всех заявок за день
   */
  async getConsultationsByDate(date: string): Promise<ConsultationRequest[]> {
    try {
      const filename = `consultations_${date}.json`;
      const filepath = path.join(this.dataDir, filename);
      
      const fileContent = await fs.readFile(filepath, 'utf8');
      return JSON.parse(fileContent);
    } catch {
      return [];
    }
  }

  /**
   * Получение статистики заявок
   */
  async getConsultationStats(): Promise<{
    total: number;
    today: number;
    thisWeek: number;
    thisMonth: number;
  }> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const todayRequests = await this.getConsultationsByDate(today);

      // Простая статистика для примера
      return {
        total: todayRequests.length,
        today: todayRequests.length,
        thisWeek: todayRequests.length,
        thisMonth: todayRequests.length
      };
    } catch {
      return {
        total: 0,
        today: 0,
        thisWeek: 0,
        thisMonth: 0
      };
    }
  }
}
