import { supabase } from './supabaseClient';

export interface ChatMessage {
  id: string;
  client_id: string;
  admin_id: string | null;
  content: string;
  sender_type: 'client' | 'admin';
  created_at: string;
  read: boolean;
}

// Create a new message
export const sendMessage = async (message: Omit<ChatMessage, 'id' | 'created_at'>): Promise<ChatMessage | null> => {
  try {
    const { data, error } = await supabase
      .from('chat_messages')
      .insert(message)
      .select()
      .single();
    
    if (error) {
      console.error('Error sending message:', error);
      throw error;
    }
    return data;
  } catch (error) {
    console.error('Error sending message:', error);
    return null;
  }
};

// Get messages for a client
export const getClientMessages = async (clientId: string): Promise<ChatMessage[]> => {
  try {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: true });
    
    if (error) {
      console.error('Error fetching client messages:', error);
      throw error;
    }
    return data || [];
  } catch (error) {
    console.error('Error fetching client messages:', error);
    return [];
  }
};

// Get all unread messages for admin
export const getUnreadAdminMessages = async (): Promise<ChatMessage[]> => {
  try {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('sender_type', 'client')
      .eq('read', false)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching unread messages:', error);
      throw error;
    }
    return data || [];
  } catch (error) {
    console.error('Error fetching unread messages:', error);
    return [];
  }
};

// Mark messages as read
export const markMessagesAsRead = async (messageIds: string[]): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('chat_messages')
      .update({ read: true })
      .in('id', messageIds);
    
    if (error) {
      console.error('Error marking messages as read:', error);
      throw error;
    }
    return true;
  } catch (error) {
    console.error('Error marking messages as read:', error);
    return false;
  }
};

// Subscribe to new messages for a client
export const subscribeToClientMessages = (clientId: string, callback: (message: ChatMessage) => void) => {
  return supabase
    .channel(`client-messages-${clientId}`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'chat_messages',
      filter: `client_id=eq.${clientId}`
    }, (payload) => {
      callback(payload.new as ChatMessage);
    })
    .subscribe();
};
