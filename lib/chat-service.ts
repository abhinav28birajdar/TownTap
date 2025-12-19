/**
 * Chat Service for TownTap
 * Handles real-time messaging functionality
 */

import { supabase } from './supabase';

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  type: 'text' | 'image' | 'file' | 'location';
  file_url?: string;
  file_name?: string;
  file_size?: number;
  read_at?: string;
  created_at: string;
  updated_at?: string;
}

export interface Conversation {
  id: string;
  customer_id: string;
  business_id: string;
  booking_id?: string;
  last_message?: string;
  last_message_at?: string;
  unread_count_customer: number;
  unread_count_business: number;
  created_at: string;
  updated_at?: string;
}

export interface TypingStatus {
  conversationId: string;
  userId: string;
  isTyping: boolean;
  timestamp: number;
}

type MessageCallback = (message: Message) => void;
type TypingCallback = (status: TypingStatus) => void;

class ChatService {
  private subscriptions: Map<string, any> = new Map();
  private typingTimers: Map<string, NodeJS.Timeout> = new Map();

  /**
   * Get all conversations for a user
   */
  async getConversations(userId: string, userType: 'customer' | 'business'): Promise<Conversation[]> {
    try {
      const column = userType === 'customer' ? 'customer_id' : 'business_id';
      
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq(column, userId)
        .order('last_message_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching conversations:', error);
      return [];
    }
  }

  /**
   * Get or create a conversation between customer and business
   */
  async getOrCreateConversation(
    customerId: string,
    businessId: string,
    bookingId?: string
  ): Promise<Conversation | null> {
    try {
      // Check if conversation exists
      const { data: existing, error: findError } = await supabase
        .from('conversations')
        .select('*')
        .eq('customer_id', customerId)
        .eq('business_id', businessId)
        .single();

      if (existing && !findError) {
        return existing;
      }

      // Create new conversation
      const { data: newConversation, error: createError } = await supabase
        .from('conversations')
        .insert({
          customer_id: customerId,
          business_id: businessId,
          booking_id: bookingId,
          unread_count_customer: 0,
          unread_count_business: 0,
        } as any)
        .select()
        .single();

      if (createError) throw createError;
      return newConversation;
    } catch (error) {
      console.error('Error getting/creating conversation:', error);
      return null;
    }
  }

  /**
   * Get messages for a conversation
   */
  async getMessages(
    conversationId: string,
    limit: number = 50,
    before?: string
  ): Promise<Message[]> {
    try {
      let query = supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })
        .limit(limit);

      if (before) {
        query = query.lt('created_at', before);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching messages:', error);
      return [];
    }
  }

  /**
   * Send a message
   */
  async sendMessage(
    conversationId: string,
    senderId: string,
    recipientId: string,
    content: string,
    type: 'text' | 'image' | 'file' | 'location' = 'text',
    fileUrl?: string,
    fileName?: string,
    fileSize?: number
  ): Promise<Message | null> {
    try {
      const messageData: Partial<Message> = {
        conversation_id: conversationId,
        sender_id: senderId,
        recipient_id: recipientId,
        content,
        type,
      };

      if (fileUrl) messageData.file_url = fileUrl;
      if (fileName) messageData.file_name = fileName;
      if (fileSize) messageData.file_size = fileSize;

      const { data, error } = await supabase
        .from('messages')
        .insert(messageData as any)
        .select()
        .single();

      if (error) throw error;

      // Update conversation's last message
      await (supabase
        .from('conversations') as any)
        .update({
          last_message: content,
          last_message_at: new Date().toISOString(),
        })
        .eq('id', conversationId);

      return data;
    } catch (error) {
      console.error('Error sending message:', error);
      return null;
    }
  }

  /**
   * Mark messages as read
   */
  async markMessagesAsRead(conversationId: string, userId: string): Promise<void> {
    try {
      await (supabase
        .from('messages') as any)
        .update({ read_at: new Date().toISOString() })
        .eq('conversation_id', conversationId)
        .neq('sender_id', userId)
        .is('read_at', null);
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  }

  /**
   * Subscribe to new messages in a conversation
   */
  subscribeToMessages(conversationId: string, callback: MessageCallback): any {
    const channelKey = `messages-${conversationId}`;
    
    // Unsubscribe from existing subscription if any
    this.unsubscribe(channelKey);

    const channel = supabase
      .channel(channelKey)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          callback(payload.new as Message);
        }
      )
      .subscribe();

    this.subscriptions.set(channelKey, channel);
    return channel;
  }

  /**
   * Subscribe to typing indicators
   */
  subscribeToTyping(conversationId: string, callback: TypingCallback): any {
    const channelKey = `typing-${conversationId}`;
    
    // Unsubscribe from existing subscription if any
    this.unsubscribe(channelKey);

    const channel = supabase
      .channel(channelKey)
      .on('broadcast', { event: 'typing' }, (payload) => {
        callback(payload.payload as TypingStatus);
      })
      .subscribe();

    this.subscriptions.set(channelKey, channel);
    return channel;
  }

  /**
   * Send typing indicator
   */
  async sendTyping(
    conversationId: string,
    userId: string,
    isTyping: boolean
  ): Promise<void> {
    const channelKey = `typing-${conversationId}`;
    const channel = this.subscriptions.get(channelKey);

    if (channel) {
      await channel.send({
        type: 'broadcast',
        event: 'typing',
        payload: {
          conversationId,
          userId,
          isTyping,
          timestamp: Date.now(),
        } as TypingStatus,
      });
    }
  }

  /**
   * Unsubscribe from a channel
   */
  unsubscribe(channelKey: string): void {
    const channel = this.subscriptions.get(channelKey);
    if (channel) {
      supabase.removeChannel(channel);
      this.subscriptions.delete(channelKey);
    }
  }

  /**
   * Unsubscribe from all channels
   */
  unsubscribeAll(): void {
    this.subscriptions.forEach((channel, key) => {
      supabase.removeChannel(channel);
    });
    this.subscriptions.clear();
  }

  /**
   * Delete a message (soft delete)
   */
  async deleteMessage(messageId: string, userId: string): Promise<boolean> {
    try {
      const { error } = await (supabase
        .from('messages') as any)
        .update({ 
          content: 'This message was deleted',
          type: 'text',
          file_url: null,
          file_name: null,
        })
        .eq('id', messageId)
        .eq('sender_id', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting message:', error);
      return false;
    }
  }

  /**
   * Upload a file and send as message
   */
  async uploadAndSendFile(
    conversationId: string,
    senderId: string,
    recipientId: string,
    fileUri: string,
    fileName: string,
    fileType: 'image' | 'file'
  ): Promise<Message | null> {
    try {
      // Generate unique file name
      const extension = fileName.split('.').pop();
      const uniqueName = `${conversationId}/${Date.now()}.${extension}`;

      // Upload to Supabase Storage
      const response = await fetch(fileUri);
      const blob = await response.blob();
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('chat-files')
        .upload(uniqueName, blob);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('chat-files')
        .getPublicUrl(uniqueName);

      // Send message with file
      return this.sendMessage(
        conversationId,
        senderId,
        recipientId,
        fileName,
        fileType,
        urlData.publicUrl,
        fileName,
        blob.size
      );
    } catch (error) {
      console.error('Error uploading file:', error);
      return null;
    }
  }

  /**
   * Get unread message count
   */
  async getUnreadCount(userId: string, userType: 'customer' | 'business'): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('id', { count: 'exact' })
        .eq('recipient_id', userId)
        .is('read_at', null);

      if (error) throw error;
      return data?.length || 0;
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  }
}

// Export singleton instance
export const chatService = new ChatService();
export default chatService;

// Re-export types
export type { Conversation, Message, TypingStatus };

