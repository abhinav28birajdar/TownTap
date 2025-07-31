import { supabase } from '../lib/supabase';
import {
    Message
} from '../types';

// Enhanced communication interfaces
export interface VoiceMessage {
  id: string;
  conversationId: string;
  senderId: string;
  audioUrl: string;
  duration: number;
  transcript?: string;
  isPlaying?: boolean;
  created_at: string;
}

export interface VideoCall {
  id: string;
  conversationId: string;
  initiatorId: string;
  receiverId: string;
  status: 'initiated' | 'ringing' | 'active' | 'ended' | 'declined' | 'missed';
  startTime?: string;
  endTime?: string;
  duration?: number;
  callType: 'voice' | 'video';
}

export interface ScheduledMessage {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  scheduledFor: string;
  status: 'scheduled' | 'sent' | 'cancelled';
  messageType: 'text' | 'voice' | 'image' | 'video' | 'document';
}

export interface MessageTemplate {
  id: string;
  businessId: string;
  name: string;
  content: string;
  category: 'greeting' | 'booking_confirmation' | 'service_update' | 'payment_reminder' | 'custom';
  variables: string[]; // Array of variable names like ['customer_name', 'service_date']
  isActive: boolean;
}

export interface TypingIndicator {
  conversationId: string;
  userId: string;
  isTyping: boolean;
  lastTyping: string;
}

export interface MessageReaction {
  id: string;
  messageId: string;
  userId: string;
  reaction: '👍' | '👎' | '❤️' | '😊' | '😢' | '😡' | '🔥';
  created_at: string;
}

export class EnhancedMessagingService {
  private static typingTimeouts: Map<string, NodeJS.Timeout> = new Map();
  private static activeSubscriptions: Map<string, any> = new Map();

  // =====================================================
  // RICH MESSAGING FEATURES
  // =====================================================

  static async sendRichMessage(messageData: {
    conversationId: string;
    senderId: string;
    content?: string;
    messageType: 'text' | 'voice' | 'image' | 'video' | 'document' | 'location' | 'contact';
    attachments?: Array<{
      type: 'image' | 'video' | 'audio' | 'document';
      url: string;
      fileName?: string;
      fileSize?: number;
      duration?: number; // For audio/video
      thumbnail?: string; // For video
    }>;
    metadata?: {
      location?: { latitude: number; longitude: number; address?: string };
      contact?: { name: string; phone: string; email?: string };
      replyToMessageId?: string;
      isForwarded?: boolean;
    };
  }): Promise<Message> {
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: messageData.conversationId,
          sender_id: messageData.senderId,
          content: messageData.content || '',
          message_type: messageData.messageType,
          attachments: messageData.attachments || [],
          metadata: messageData.metadata || {}
        })
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey (
            id,
            name,
            avatar_url
          ),
          reactions:message_reactions (
            id,
            user_id,
            reaction,
            created_at
          )
        `)
        .single();

      if (error) throw error;

      // Update conversation's last message
      await supabase
        .from('conversations')
        .update({
          last_message: messageData.content || `Sent a ${messageData.messageType}`,
          last_message_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', messageData.conversationId);

      // Send real-time notification
      await this.sendRealTimeUpdate('new_message', {
        conversationId: messageData.conversationId,
        message: data
      });

      return data as Message;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to send rich message');
    }
  }

  // =====================================================
  // VOICE MESSAGES
  // =====================================================

  static async sendVoiceMessage(
    conversationId: string,
    senderId: string,
    audioBlob: Blob,
    duration: number
  ): Promise<VoiceMessage> {
    try {
      // Upload audio to Supabase storage
      const fileName = `voice_${Date.now()}.m4a`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('voice-messages')
        .upload(fileName, audioBlob);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('voice-messages')
        .getPublicUrl(fileName);

      // Create voice message record
      const { data, error } = await supabase
        .from('voice_messages')
        .insert({
          conversation_id: conversationId,
          sender_id: senderId,
          audio_url: urlData.publicUrl,
          duration,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      // Send as rich message
      await this.sendRichMessage({
        conversationId,
        senderId,
        messageType: 'voice',
        attachments: [{
          type: 'audio',
          url: urlData.publicUrl,
          duration
        }]
      });

      return data as VoiceMessage;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to send voice message');
    }
  }

  static async transcribeVoiceMessage(voiceMessageId: string): Promise<string> {
    try {
      // In production, integrate with speech-to-text service
      // For now, return placeholder
      const transcript = "Voice message transcription would appear here";
      
      await supabase
        .from('voice_messages')
        .update({ transcript })
        .eq('id', voiceMessageId);

      return transcript;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to transcribe voice message');
    }
  }

  // =====================================================
  // VIDEO CALLING
  // =====================================================

  static async initiateVideoCall(
    conversationId: string,
    initiatorId: string,
    receiverId: string,
    callType: 'voice' | 'video' = 'video'
  ): Promise<VideoCall> {
    try {
      const { data, error } = await supabase
        .from('video_calls')
        .insert({
          conversation_id: conversationId,
          initiator_id: initiatorId,
          receiver_id: receiverId,
          status: 'initiated',
          call_type: callType,
          start_time: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      // Send real-time call notification
      await this.sendRealTimeUpdate('incoming_call', {
        conversationId,
        call: data,
        initiator: initiatorId
      });

      // Auto-update to ringing after 1 second
      setTimeout(async () => {
        await this.updateCallStatus(data.id, 'ringing');
      }, 1000);

      return data as VideoCall;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to initiate video call');
    }
  }

  static async updateCallStatus(
    callId: string, 
    status: VideoCall['status'],
    endReason?: string
  ): Promise<VideoCall> {
    try {
      const updateData: any = { status };
      
      if (status === 'ended' || status === 'declined' || status === 'missed') {
        updateData.end_time = new Date().toISOString();
        
        // Calculate duration if call was active
        if (status === 'ended') {
          const { data: call } = await supabase
            .from('video_calls')
            .select('start_time')
            .eq('id', callId)
            .single();
          
          if (call?.start_time) {
            const startTime = new Date(call.start_time);
            const endTime = new Date();
            updateData.duration = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);
          }
        }
      }

      const { data, error } = await supabase
        .from('video_calls')
        .update(updateData)
        .eq('id', callId)
        .select()
        .single();

      if (error) throw error;

      // Send real-time update
      await this.sendRealTimeUpdate('call_status_update', {
        callId,
        status,
        call: data
      });

      return data as VideoCall;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to update call status');
    }
  }

  // =====================================================
  // SCHEDULED MESSAGES
  // =====================================================

  static async scheduleMessage(messageData: {
    conversationId: string;
    senderId: string;
    content: string;
    scheduledFor: string;
    messageType?: ScheduledMessage['messageType'];
  }): Promise<ScheduledMessage> {
    try {
      const { data, error } = await supabase
        .from('scheduled_messages')
        .insert({
          conversation_id: messageData.conversationId,
          sender_id: messageData.senderId,
          content: messageData.content,
          scheduled_for: messageData.scheduledFor,
          message_type: messageData.messageType || 'text',
          status: 'scheduled'
        })
        .select()
        .single();

      if (error) throw error;
      return data as ScheduledMessage;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to schedule message');
    }
  }

  static async processScheduledMessages(): Promise<void> {
    try {
      const now = new Date().toISOString();
      
      const { data: scheduledMessages, error } = await supabase
        .from('scheduled_messages')
        .select('*')
        .eq('status', 'scheduled')
        .lte('scheduled_for', now);

      if (error) throw error;

      for (const message of scheduledMessages || []) {
        try {
          // Send the message
          await this.sendRichMessage({
            conversationId: message.conversation_id,
            senderId: message.sender_id,
            content: message.content,
            messageType: message.message_type as any
          });

          // Update status
          await supabase
            .from('scheduled_messages')
            .update({ status: 'sent' })
            .eq('id', message.id);
        } catch (error) {
          console.error(`Failed to send scheduled message ${message.id}:`, error);
        }
      }
    } catch (error: any) {
      console.error('Failed to process scheduled messages:', error);
    }
  }

  // =====================================================
  // MESSAGE TEMPLATES
  // =====================================================

  static async createMessageTemplate(templateData: {
    businessId: string;
    name: string;
    content: string;
    category: MessageTemplate['category'];
    variables?: string[];
  }): Promise<MessageTemplate> {
    try {
      // Extract variables from content (e.g., {{customer_name}}, {{service_date}})
      const variableMatches = templateData.content.match(/\{\{([^}]+)\}\}/g);
      const extractedVariables = variableMatches?.map(match => 
        match.replace(/[{}]/g, '')
      ) || [];

      const variables = templateData.variables || extractedVariables;

      const { data, error } = await supabase
        .from('message_templates')
        .insert({
          business_id: templateData.businessId,
          name: templateData.name,
          content: templateData.content,
          category: templateData.category,
          variables,
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;
      return data as MessageTemplate;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to create message template');
    }
  }

  static async getBusinessTemplates(businessId: string): Promise<MessageTemplate[]> {
    try {
      const { data, error } = await supabase
        .from('message_templates')
        .select('*')
        .eq('business_id', businessId)
        .eq('is_active', true)
        .order('category')
        .order('name');

      if (error) throw error;
      return data as MessageTemplate[];
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch message templates');
    }
  }

  static async sendTemplateMessage(
    templateId: string,
    conversationId: string,
    senderId: string,
    variables: Record<string, string>
  ): Promise<Message> {
    try {
      // Get template
      const { data: template, error } = await supabase
        .from('message_templates')
        .select('*')
        .eq('id', templateId)
        .single();

      if (error) throw error;
      if (!template) throw new Error('Template not found');

      // Replace variables in content
      let content = template.content;
      for (const [key, value] of Object.entries(variables)) {
        content = content.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
      }

      // Send message
      return await this.sendRichMessage({
        conversationId,
        senderId,
        content,
        messageType: 'text'
      });
    } catch (error: any) {
      throw new Error(error.message || 'Failed to send template message');
    }
  }

  // =====================================================
  // TYPING INDICATORS
  // =====================================================

  static async updateTypingStatus(
    conversationId: string,
    userId: string,
    isTyping: boolean
  ): Promise<void> {
    try {
      if (isTyping) {
        // Set typing
        await this.sendRealTimeUpdate('typing_start', {
          conversationId,
          userId,
          timestamp: new Date().toISOString()
        });

        // Clear existing timeout
        const existingTimeout = this.typingTimeouts.get(`${conversationId}_${userId}`);
        if (existingTimeout) {
          clearTimeout(existingTimeout);
        }

        // Set auto-stop after 3 seconds
        const timeout = setTimeout(() => {
          this.updateTypingStatus(conversationId, userId, false);
        }, 3000);

        this.typingTimeouts.set(`${conversationId}_${userId}`, timeout);
      } else {
        // Stop typing
        await this.sendRealTimeUpdate('typing_stop', {
          conversationId,
          userId,
          timestamp: new Date().toISOString()
        });

        // Clear timeout
        const timeout = this.typingTimeouts.get(`${conversationId}_${userId}`);
        if (timeout) {
          clearTimeout(timeout);
          this.typingTimeouts.delete(`${conversationId}_${userId}`);
        }
      }
    } catch (error: any) {
      console.error('Failed to update typing status:', error);
    }
  }

  // =====================================================
  // MESSAGE REACTIONS
  // =====================================================

  static async addMessageReaction(
    messageId: string,
    userId: string,
    reaction: MessageReaction['reaction']
  ): Promise<MessageReaction> {
    try {
      // Remove existing reaction from this user
      await supabase
        .from('message_reactions')
        .delete()
        .eq('message_id', messageId)
        .eq('user_id', userId);

      // Add new reaction
      const { data, error } = await supabase
        .from('message_reactions')
        .insert({
          message_id: messageId,
          user_id: userId,
          reaction,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      // Send real-time update
      await this.sendRealTimeUpdate('message_reaction', {
        messageId,
        reaction: data
      });

      return data as MessageReaction;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to add message reaction');
    }
  }

  static async removeMessageReaction(messageId: string, userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('message_reactions')
        .delete()
        .eq('message_id', messageId)
        .eq('user_id', userId);

      if (error) throw error;

      // Send real-time update
      await this.sendRealTimeUpdate('message_reaction_removed', {
        messageId,
        userId
      });
    } catch (error: any) {
      throw new Error(error.message || 'Failed to remove message reaction');
    }
  }

  // =====================================================
  // REAL-TIME UPDATES
  // =====================================================

  private static async sendRealTimeUpdate(event: string, payload: any): Promise<void> {
    try {
      // Send real-time update via Supabase channels
      await supabase.channel('messaging').send({
        type: 'broadcast',
        event,
        payload
      });
    } catch (error) {
      console.error('Failed to send real-time update:', error);
    }
  }

  static subscribeToEnhancedConversation(
    conversationId: string,
    callbacks: {
      onNewMessage?: (message: Message) => void;
      onTypingStart?: (userId: string) => void;
      onTypingStop?: (userId: string) => void;
      onMessageReaction?: (reaction: MessageReaction) => void;
      onIncomingCall?: (call: VideoCall) => void;
      onCallStatusUpdate?: (call: VideoCall) => void;
    }
  ) {
    const channel = supabase.channel(`enhanced_conversation_${conversationId}`);

    // Subscribe to message updates
    channel.on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
      filter: `conversation_id=eq.${conversationId}`
    }, (payload) => {
      callbacks.onNewMessage?.(payload.new as Message);
    });

    // Subscribe to reaction updates
    channel.on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'message_reactions'
    }, (payload) => {
      callbacks.onMessageReaction?.(payload.new as MessageReaction);
    });

    // Subscribe to call updates
    channel.on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'video_calls',
      filter: `conversation_id=eq.${conversationId}`
    }, (payload) => {
      if (payload.eventType === 'INSERT') {
        callbacks.onIncomingCall?.(payload.new as VideoCall);
      } else if (payload.eventType === 'UPDATE') {
        callbacks.onCallStatusUpdate?.(payload.new as VideoCall);
      }
    });

    // Subscribe to broadcast events
    channel.on('broadcast', { event: 'typing_start' }, (payload) => {
      if (payload.payload.conversationId === conversationId) {
        callbacks.onTypingStart?.(payload.payload.userId);
      }
    });

    channel.on('broadcast', { event: 'typing_stop' }, (payload) => {
      if (payload.payload.conversationId === conversationId) {
        callbacks.onTypingStop?.(payload.payload.userId);
      }
    });

    const subscription = channel.subscribe();
    this.activeSubscriptions.set(conversationId, subscription);
    
    return subscription;
  }

  static unsubscribeFromConversation(conversationId: string): void {
    const subscription = this.activeSubscriptions.get(conversationId);
    if (subscription) {
      supabase.removeChannel(subscription);
      this.activeSubscriptions.delete(conversationId);
    }
  }

  // =====================================================
  // FILE SHARING ENHANCEMENTS
  // =====================================================

  static async uploadAndShareFile(
    conversationId: string,
    senderId: string,
    file: File,
    fileType: 'image' | 'video' | 'document' | 'audio'
  ): Promise<Message> {
    try {
      // Generate unique filename
      const fileExtension = file.name.split('.').pop();
      const fileName = `${fileType}_${Date.now()}.${fileExtension}`;
      
      // Upload to appropriate bucket
      const bucketName = `${fileType}s`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(fileName);

      // Generate thumbnail for videos
      let thumbnail: string | undefined;
      if (fileType === 'video') {
        thumbnail = await this.generateVideoThumbnail(file);
      }

      // Send rich message with attachment
      return await this.sendRichMessage({
        conversationId,
        senderId,
        messageType: fileType,
        attachments: [{
          type: fileType,
          url: urlData.publicUrl,
          fileName: file.name,
          fileSize: file.size,
          thumbnail
        }]
      });
    } catch (error: any) {
      throw new Error(error.message || 'Failed to upload and share file');
    }
  }

  private static async generateVideoThumbnail(videoFile: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      video.onloadedmetadata = () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        video.currentTime = 1; // Seek to 1 second
      };

      video.onseeked = () => {
        ctx?.drawImage(video, 0, 0);
        const thumbnailDataUrl = canvas.toDataURL('image/jpeg', 0.8);
        resolve(thumbnailDataUrl);
      };

      video.onerror = () => reject(new Error('Failed to generate thumbnail'));
      
      video.src = URL.createObjectURL(videoFile);
    });
  }

  // =====================================================
  // MESSAGE SEARCH & HISTORY
  // =====================================================

  static async searchMessages(
    conversationId: string,
    searchQuery: string,
    messageType?: string,
    dateRange?: { from: string; to: string }
  ): Promise<Message[]> {
    try {
      let query = supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey (
            id,
            name,
            avatar_url
          )
        `)
        .eq('conversation_id', conversationId);

      // Text search
      if (searchQuery) {
        query = query.or(`content.ilike.%${searchQuery}%`);
      }

      // Filter by message type
      if (messageType) {
        query = query.eq('message_type', messageType);
      }

      // Filter by date range
      if (dateRange) {
        query = query
          .gte('created_at', dateRange.from)
          .lte('created_at', dateRange.to);
      }

      const { data, error } = await query
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as Message[];
    } catch (error: any) {
      throw new Error(error.message || 'Failed to search messages');
    }
  }
}

export default EnhancedMessagingService;
