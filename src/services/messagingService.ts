import { supabase } from '../lib/supabase';

export interface ChatMessage {
  id: string;
  order_id?: string;
  service_request_id?: string;
  sender_id: string;
  recipient_id: string;
  message_type: 'text' | 'image' | 'audio' | 'location' | 'file';
  content: string;
  media_url?: string;
  is_read: boolean;
  is_ai_suggestion: boolean;
  ai_confidence?: number;
  created_at: string;
}

export interface ChatMessageInsert {
  order_id?: string;
  service_request_id?: string;
  sender_id: string;
  recipient_id: string;
  message_type: 'text' | 'image' | 'audio' | 'location' | 'file';
  content: string;
  media_url?: string;
  is_read?: boolean;
  is_ai_suggestion?: boolean;
  ai_confidence?: number;
}

export class MessagingService {
  static async sendMessage(messageData: ChatMessageInsert): Promise<ChatMessage> {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .insert(messageData)
        .select()
        .single();

      if (error) throw error;
      return data as ChatMessage;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  static async sendTextMessage(
    content: string,
    senderId: string,
    recipientId: string,
    orderId?: string
  ): Promise<ChatMessage> {
    return this.sendMessage({
      content,
      sender_id: senderId,
      recipient_id: recipientId,
      message_type: 'text',
      order_id: orderId
    });
  }
}