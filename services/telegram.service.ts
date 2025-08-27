import { ConsultationRequest, TelegramConfig, TelegramNotification } from '../types/consultation';

/**
 * Сервис для отправки уведомлений в Telegram
 */
export class TelegramNotificationService {
  private config: TelegramConfig;

  constructor(config: TelegramConfig) {
    this.config = config;
  }

  /**
   * Отправка уведомления о новой заявке администратору
   */
  async sendConsultationNotification(request: ConsultationRequest): Promise<boolean> {
    try {
      const message = this.formatConsultationMessage(request);
      
      const notification: TelegramNotification = {
        chatId: this.config.adminChatId,
        message,
        parseMode: 'HTML'
      };

      return await this.sendMessage(notification);
    } catch (error) {
      console.error('Error sending Telegram notification:', error);
      return false;
    }
  }

  /**
   * Форматирование сообщения для Telegram
   */
  private formatConsultationMessage(request: ConsultationRequest): string {
    const timestamp = new Date().toLocaleString('ru-RU', {
      timeZone: 'Europe/Moscow',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });

    let message = `
🚀 <b>Новая заявка на консультацию!</b>

📅 <b>Дата:</b> ${timestamp}
👤 <b>Имя:</b> ${this.escapeHtml(request.name)}
📧 <b>Email:</b> ${this.escapeHtml(request.email)}`;

    if (request.phone) {
      message += `\n📞 <b>Телефон:</b> ${this.escapeHtml(request.phone)}`;
    }

    if (request.company) {
      message += `\n🏢 <b>Компания:</b> ${this.escapeHtml(request.company)}`;
    }

    message += `\n🎯 <b>Услуга:</b> ${this.escapeHtml(request.serviceType)}`;

    if (request.budget) {
      message += `\n💰 <b>Бюджет:</b> ${this.escapeHtml(request.budget)}`;
    }

    if (request.timeline) {
      message += `\n⏰ <b>Сроки:</b> ${this.escapeHtml(request.timeline)}`;
    }

    message += `\n📝 <b>Описание проекта:</b>\n${this.escapeHtml(request.projectDescription)}`;

    if (request.additionalInfo) {
      message += `\n\n💬 <b>Дополнительная информация:</b>\n${this.escapeHtml(request.additionalInfo)}`;
    }

    message += `\n\n#новая_заявка #консультация`;

    return message;
  }

  /**
   * Отправка сообщения в Telegram
   */
  private async sendMessage(notification: TelegramNotification): Promise<boolean> {
    const url = `https://api.telegram.org/bot${this.config.botToken}/sendMessage`;
    
    const payload = {
      chat_id: notification.chatId,
      text: notification.message,
      parse_mode: notification.parseMode || 'HTML',
      disable_web_page_preview: true
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Telegram API error:', errorData);
        return false;
      }

      const result = await response.json();
      console.log('Telegram message sent successfully:', result.message_id);
      return true;
    } catch (error) {
      console.error('Error sending message to Telegram:', error);
      return false;
    }
  }

  /**
   * Экранирование HTML для Telegram
   */
  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /**
   * Отправка тестового сообщения для проверки настроек
   */
  async sendTestMessage(): Promise<boolean> {
    const testNotification: TelegramNotification = {
      chatId: this.config.adminChatId,
      message: '🧪 <b>Тестовое сообщение</b>\n\nСистема уведомлений о заявках работает корректно!',
      parseMode: 'HTML'
    };

    return await this.sendMessage(testNotification);
  }
}
