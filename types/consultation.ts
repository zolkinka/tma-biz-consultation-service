/**
 * Типы для системы обработки заявок на консультацию
 */

export interface ConsultationRequest {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  projectDescription: string;
  serviceType: string;
  budget?: string;
  timeline?: string;
  additionalInfo?: string;
  createdAt?: Date;
  status?: ConsultationStatus;
}

export enum ConsultationStatus {
  NEW = 'new',
  CONTACTED = 'contacted',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export interface TelegramNotification {
  chatId: string;
  message: string;
  parseMode?: 'HTML' | 'Markdown';
}

export interface ConsultationFormData {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  projectDescription: string;
  serviceType: string;
  budget?: string;
  timeline?: string;
  additionalInfo?: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface TelegramConfig {
  botToken: string;
  adminChatId: string;
  webhookUrl?: string;
}
