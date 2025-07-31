import { supabase } from '../lib/supabase';
import {
    Conversation,
    ConversationInsert,
    Message,
    MessageInsert,
    PaginatedResponse
} from '../types';

export class MessagingService {
  // =====================================================
  // CONVERSATION MANAGEMENT
  // =====================================================

  static async createConversation(conversationData: ConversationInsert): Promise<Conversation> {
    try {
      // Check if conversation already exists
      const { data: existing } = await supabase
        .from('conversations')
        .select('*')
        .eq('customer_id', conversationData.customer_id)
        .eq('business_id', conversationData.business_id)
        .eq('order_id', conversationData.order_id || 'NULL')
        .single();

      if (existing) {
        return existing as Conversation;
      }

      const { data, error } = await supabase
        .from('conversations')
        .insert(conversationData)
        .select()
        .single();

      if (error) throw error;
      return data as Conversation;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to create conversation');
    }
  }

  static async getConversation(conversationId: string): Promise<Conversation | null> {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          customer:profiles!customer_id(id, full_name, avatar_url),
          business:businesses(id, name, profile_image_url)
        `)
        .eq('id', conversationId)
        .single();

      if (error) throw error;
      return data as Conversation;
    } catch (error: any) {
      if (error.message.includes('No rows')) return null;
      throw new Error(error.message || 'Failed to fetch conversation');
    }
  }

  static async getUserConversations(userId: string): Promise<Conversation[]> {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          customer:profiles!customer_id(id, full_name, avatar_url),
          business:businesses(id, name, profile_image_url),
          last_message:messages(content, message_type, created_at)
        `)
        .or(`customer_id.eq.${userId},business_id.in.(select id from businesses where owner_id = '${userId}')`)
        .eq('is_active', true)
        .order('last_message_at', { ascending: false });

      if (error) throw error;
      return data as Conversation[];
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch conversations');
    }
  }

  static async getBusinessConversations(businessId: string): Promise<Conversation[]> {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          customer:profiles!customer_id(id, full_name, avatar_url),
          last_message:messages(content, message_type, created_at)
        `)
        .eq('business_id', businessId)
        .eq('is_active', true)
        .order('last_message_at', { ascending: false });

      if (error) throw error;
      return data as Conversation[];
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch business conversations');
    }
  }

  // =====================================================
  // MESSAGE MANAGEMENT
  // =====================================================

  static async sendMessage(messageData: MessageInsert): Promise<Message> {
    try {
      const { data: message, error: messageError } = await supabase
        .from('messages')
        .insert(messageData)
        .select()
        .single();

      if (messageError) throw messageError;

      // Update conversation's last_message_at
      const { error: conversationError } = await supabase
        .from('conversations')
        .update({ 
          last_message_at: new Date().toISOString(),
          is_active: true
        })
        .eq('id', messageData.conversation_id);

      if (conversationError) throw conversationError;

      return message as Message;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to send message');
    }
  }

  static async getMessages(
    conversationId: string,
    page: number = 1,
    limit: number = 50
  ): Promise<PaginatedResponse<Message>> {
    try {
      const from = (page - 1) * limit;
      
      const { data, error, count } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!sender_id(id, full_name, avatar_url)
        `, { count: 'exact' })
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: false })
        .range(from, from + limit - 1);

      if (error) throw error;

      return {
        data: (data as Message[]).reverse(), // Reverse to show oldest first
        count: count || 0,
        hasMore: (count || 0) > from + limit,
        nextCursor: (count || 0) > from + limit ? (page + 1).toString() : undefined
      };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch messages');
    }
  }

  static async markMessagesAsRead(conversationId: string, userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ 
          is_read: true,
          read_at: new Date().toISOString()
        })
        .eq('conversation_id', conversationId)
        .neq('sender_id', userId)
        .eq('is_read', false);

      if (error) throw error;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to mark messages as read');
    }
  }

  static async getUnreadMessageCount(userId: string): Promise<number> {
    try {
      // Get conversations where user is participant
      const { data: conversations } = await supabase
        .from('conversations')
        .select('id')
        .or(`customer_id.eq.${userId},business_id.in.(select id from businesses where owner_id = '${userId}')`);

      if (!conversations || conversations.length === 0) return 0;

      const conversationIds = conversations.map(c => c.id);

      const { data, error } = await supabase
        .from('messages')
        .select('id', { count: 'exact' })
        .in('conversation_id', conversationIds)
        .neq('sender_id', userId)
        .eq('is_read', false);

      if (error) throw error;
      return data?.length || 0;
    } catch (error: any) {
      console.error('Failed to get unread message count:', error);
      return 0;
    }
  }

  // =====================================================
  // MESSAGE ATTACHMENTS
  // =====================================================

  static async uploadMessageAttachment(file: File, conversationId: string): Promise<string> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${conversationId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('message-attachments')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('message-attachments')
        .getPublicUrl(fileName);

      return data.publicUrl;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to upload attachment');
    }
  }

  static async sendImageMessage(
    conversationId: string,
    senderId: string,
    imageFile: File,
    caption?: string
  ): Promise<Message> {
    try {
      const imageUrl = await this.uploadMessageAttachment(imageFile, conversationId);

      const messageData: MessageInsert = {
        conversation_id: conversationId,
        sender_id: senderId,
        content: caption || 'Image',
        message_type: 'image',
        attachment_url: imageUrl
      };

      return await this.sendMessage(messageData);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to send image message');
    }
  }

  static async sendLocationMessage(
    conversationId: string,
    senderId: string,
    latitude: number,
    longitude: number,
    address?: string
  ): Promise<Message> {
    try {
      const messageData: MessageInsert = {
        conversation_id: conversationId,
        sender_id: senderId,
        content: address || `Location: ${latitude}, ${longitude}`,
        message_type: 'location',
        attachment_url: JSON.stringify({ latitude, longitude, address })
      };

      return await this.sendMessage(messageData);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to send location message');
    }
  }

  // =====================================================
  // ORDER-RELATED MESSAGING
  // =====================================================

  static async sendOrderUpdateMessage(
    conversationId: string,
    senderId: string,
    orderStatus: string,
    message: string
  ): Promise<Message> {
    try {
      const messageData: MessageInsert = {
        conversation_id: conversationId,
        sender_id: senderId,
        content: message,
        message_type: 'order_update'
      };

      return await this.sendMessage(messageData);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to send order update message');
    }
  }

  static async getOrCreateOrderConversation(
    customerId: string,
    businessId: string,
    orderId: string
  ): Promise<Conversation> {
    try {
      // Try to find existing conversation for this order
      const { data: existing } = await supabase
        .from('conversations')
        .select('*')
        .eq('customer_id', customerId)
        .eq('business_id', businessId)
        .eq('order_id', orderId)
        .single();

      if (existing) {
        return existing as Conversation;
      }

      // Create new conversation
      return await this.createConversation({
        customer_id: customerId,
        business_id: businessId,
        order_id: orderId
      });
    } catch (error: any) {
      throw new Error(error.message || 'Failed to get or create order conversation');
    }
  }

  // =====================================================
  // BUSINESS SUPPORT MESSAGING
  // =====================================================

  static async startSupportConversation(
    customerId: string,
    businessId: string,
    subject: string,
    initialMessage: string
  ): Promise<{ conversation: Conversation; message: Message }> {
    try {
      // Create conversation
      const conversation = await this.createConversation({
        customer_id: customerId,
        business_id: businessId
      });

      // Send initial message
      const message = await this.sendMessage({
        conversation_id: conversation.id,
        sender_id: customerId,
        content: `Subject: ${subject}\n\n${initialMessage}`,
        message_type: 'text'
      });

      return { conversation, message };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to start support conversation');
    }
  }

  // =====================================================
  // CONVERSATION SEARCH
  // =====================================================

  static async searchConversations(userId: string, query: string): Promise<Conversation[]> {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          customer:profiles!customer_id(id, full_name, avatar_url),
          business:businesses(id, name, profile_image_url),
          messages!inner(content)
        `)
        .or(`customer_id.eq.${userId},business_id.in.(select id from businesses where owner_id = '${userId}')`)
        .ilike('messages.content', `%${query}%`)
        .eq('is_active', true)
        .order('last_message_at', { ascending: false });

      if (error) throw error;
      return data as Conversation[];
    } catch (error: any) {
      throw new Error(error.message || 'Failed to search conversations');
    }
  }

  static async searchMessages(conversationId: string, query: string): Promise<Message[]> {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!sender_id(id, full_name, avatar_url)
        `)
        .eq('conversation_id', conversationId)
        .ilike('content', `%${query}%`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Message[];
    } catch (error: any) {
      throw new Error(error.message || 'Failed to search messages');
    }
  }

  // =====================================================
  // CONVERSATION MANAGEMENT
  // =====================================================

  static async archiveConversation(conversationId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('conversations')
        .update({ is_active: false })
        .eq('id', conversationId);

      if (error) throw error;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to archive conversation');
    }
  }

  static async deleteConversation(conversationId: string): Promise<void> {
    try {
      // Delete messages first
      const { error: messagesError } = await supabase
        .from('messages')
        .delete()
        .eq('conversation_id', conversationId);

      if (messagesError) throw messagesError;

      // Delete conversation
      const { error: conversationError } = await supabase
        .from('conversations')
        .delete()
        .eq('id', conversationId);

      if (conversationError) throw conversationError;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to delete conversation');
    }
  }

  // =====================================================
  // REAL-TIME SUBSCRIPTIONS
  // =====================================================

  static subscribeToConversation(conversationId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`conversation_${conversationId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`
      }, callback)
      .subscribe();
  }

  static subscribeToUserConversations(userId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`user_conversations_${userId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'conversations'
      }, (payload) => {
        // Filter conversations for this user
        const conversation = payload.new || payload.old;
        if (conversation && (
          conversation.customer_id === userId || 
          conversation.business_id === userId
        )) {
          callback(payload);
        }
      })
      .subscribe();
  }

  // =====================================================
  // MESSAGE TEMPLATES & AUTO-RESPONSES
  // =====================================================

  static async getMessageTemplates(businessId: string) {
    // This could be implemented to store common message templates
    // for businesses to quickly respond to customers
    const templates = [
      {
        id: 'greeting',
        title: 'Greeting',
        content: 'Hello! Thank you for contacting us. How can we help you today?'
      },
      {
        id: 'order_confirmation',
        title: 'Order Confirmation',
        content: 'Your order has been confirmed. We will start working on it shortly.'
      },
      {
        id: 'completion',
        title: 'Service Completion',
        content: 'Your service has been completed. Please check and let us know if everything is satisfactory.'
      },
      {
        id: 'follow_up',
        title: 'Follow Up',
        content: 'Hi! How was our service? We would appreciate your feedback.'
      }
    ];

    return templates;
  }

  static async sendTemplateMessage(
    conversationId: string,
    senderId: string,
    templateId: string,
    customContent?: string
  ): Promise<Message> {
    try {
      const templates = await this.getMessageTemplates('');
      const template = templates.find(t => t.id === templateId);
      
      if (!template) {
        throw new Error('Template not found');
      }

      const messageData: MessageInsert = {
        conversation_id: conversationId,
        sender_id: senderId,
        content: customContent || template.content,
        message_type: 'text'
      };

      return await this.sendMessage(messageData);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to send template message');
    }
  }
}

export default MessagingService;
