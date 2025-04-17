import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { FiSend, FiMessageCircle, FiUser, FiChevronLeft, FiBell } from 'react-icons/fi';
import { renderIcon } from '../utils/iconUtils';
import { ChatMessage, getClientMessages, sendMessage, getUnreadAdminMessages, markMessagesAsRead, subscribeToClientMessages } from '../utils/chatService';
import { getClients, Client } from '../utils/clientService';
import { getCurrentUser } from '../utils/authService';

const AdminChat: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unreadMessages, setUnreadMessages] = useState<{[clientId: string]: number}>({});
  const [isChatOpen, setIsChatOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Fetch clients on component mount
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const fetchedClients = await getClients();
        setClients(fetchedClients);
      } catch (err) {
        console.error('Error fetching clients:', err);
        setError('Failed to load clients');
      }
    };
    
    fetchClients();
  }, []);
  
  // Fetch unread messages count
  useEffect(() => {
    const fetchUnreadMessages = async () => {
      try {
        const unreadMsgs = await getUnreadAdminMessages();
        
        // Count unread messages by client
        const unreadCounts: {[clientId: string]: number} = {};
        unreadMsgs.forEach(msg => {
          if (!unreadCounts[msg.client_id]) {
            unreadCounts[msg.client_id] = 0;
          }
          unreadCounts[msg.client_id]++;
        });
        
        setUnreadMessages(unreadCounts);
      } catch (err) {
        console.error('Error fetching unread messages:', err);
      }
    };
    
    fetchUnreadMessages();
    
    // Refresh unread messages every 30 seconds
    const interval = setInterval(fetchUnreadMessages, 30000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Fetch messages when a client is selected
  useEffect(() => {
    if (!selectedClientId) {
      setMessages([]);
      return;
    }
    
    const fetchMessages = async () => {
      setIsLoading(true);
      try {
        const fetchedMessages = await getClientMessages(selectedClientId);
        setMessages(fetchedMessages);
        
        // Mark messages as read
        const unreadMessageIds = fetchedMessages
          .filter(msg => msg.sender_type === 'client' && !msg.read)
          .map(msg => msg.id);
        
        if (unreadMessageIds.length > 0) {
          await markMessagesAsRead(unreadMessageIds);
          
          // Update unread counts
          setUnreadMessages(prev => ({
            ...prev,
            [selectedClientId]: 0
          }));
        }
      } catch (err) {
        console.error('Error fetching messages:', err);
        setError('Failed to load chat messages');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMessages();
    
    // Subscribe to new messages
    const subscription = subscribeToClientMessages(selectedClientId, (newMessage) => {
      setMessages(prev => [...prev, newMessage]);
      
      // Mark new client messages as read immediately
      if (newMessage.sender_type === 'client') {
        markMessagesAsRead([newMessage.id]);
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, [selectedClientId]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedClientId) return;
    
    try {
      const user = getCurrentUser();
      const adminId = user?.id || 'admin';
      
      const message = {
        client_id: selectedClientId,
        admin_id: adminId,
        content: newMessage,
        sender_type: 'admin' as const,
        read: false
      };
      
      const sentMessage = await sendMessage(message);
      if (sentMessage) {
        setMessages(prev => [...prev, sentMessage]);
        setNewMessage('');
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message');
    }
  };
  
  const toggleChat = () => {
    setIsChatOpen(prev => !prev);
  };
  
  const selectClient = (clientId: string) => {
    setSelectedClientId(clientId);
  };
  
  const backToClientList = () => {
    setSelectedClientId(null);
  };
  
  const getTotalUnreadCount = () => {
    return Object.values(unreadMessages).reduce((sum, count) => sum + count, 0);
  };
  
  const getClientName = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    return client ? client.name : 'Unknown Client';
  };
  
  return (
    <>
      <ChatButton onClick={toggleChat}>
        {renderIcon(FiMessageCircle)}
        <span>Client Messages</span>
        {getTotalUnreadCount() > 0 && (
          <UnreadBadge>{getTotalUnreadCount()}</UnreadBadge>
        )}
      </ChatButton>
      
      {isChatOpen && (
        <ChatContainer>
          <ChatHeader>
            {selectedClientId ? (
              <>
                <BackButton onClick={backToClientList}>
                  {renderIcon(FiChevronLeft)}
                </BackButton>
                <h3>{getClientName(selectedClientId)}</h3>
              </>
            ) : (
              <h3>Client Messages</h3>
            )}
            <CloseButton onClick={toggleChat}>×</CloseButton>
          </ChatHeader>
          
          {selectedClientId ? (
            <>
              <MessagesContainer>
                {isLoading ? (
                  <LoadingMessage>Loading messages...</LoadingMessage>
                ) : error ? (
                  <ErrorMessage>{error}</ErrorMessage>
                ) : messages.length === 0 ? (
                  <EmptyMessage>No messages yet with this client.</EmptyMessage>
                ) : (
                  messages.map(message => (
                    <MessageBubble 
                      key={message.id} 
                      $isAdmin={message.sender_type === 'admin'}
                    >
                      {message.content}
                      <MessageTime>
                        {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </MessageTime>
                    </MessageBubble>
                  ))
                )}
                <div ref={messagesEndRef} />
              </MessagesContainer>
              
              <InputContainer>
                <MessageInput 
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <SendButton onClick={handleSendMessage}>
                  {renderIcon(FiSend)}
                </SendButton>
              </InputContainer>
            </>
          ) : (
            <ClientListContainer>
              {clients.length === 0 ? (
                <LoadingMessage>Loading clients...</LoadingMessage>
              ) : (
                clients.map(client => (
                  <ClientItem 
                    key={client.id} 
                    onClick={() => selectClient(client.id)}
                    $hasUnread={unreadMessages[client.id] > 0}
                  >
                    <ClientAvatar>
                      {renderIcon(FiUser)}
                    </ClientAvatar>
                    <ClientInfo>
                      <ClientName>{client.name}</ClientName>
                      <ClientEmail>{client.contactemail || client.contact_email}</ClientEmail>
                    </ClientInfo>
                    {unreadMessages[client.id] > 0 && (
                      <UnreadCount>
                        {unreadMessages[client.id]}
                        {renderIcon(FiBell, { style: { marginLeft: '4px' } })}
                      </UnreadCount>
                    )}
                  </ClientItem>
                ))
              )}
            </ClientListContainer>
          )}
        </ChatContainer>
      )}
    </>
  );
};

const ChatButton = styled.button`
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: linear-gradient(90deg, #1F53FF, #FF43A3);
  color: white;
  border: none;
  border-radius: 50px;
  padding: 12px 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  transition: all 0.2s ease;
  z-index: 1000;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3);
  }
`;

const UnreadBadge = styled.span`
  background: #ff3b5c;
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
  margin-left: 4px;
`;

const ChatContainer = styled.div`
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 350px;
  height: 500px;
  background: #1A1A2E;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  z-index: 1000;
  overflow: hidden;
`;

const ChatHeader = styled.div`
  padding: 16px;
  background: linear-gradient(90deg, #1F53FF, #FF43A3);
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 500;
    flex: 1;
    text-align: center;
  }
`;

const BackButton = styled.button`
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
  line-height: 1;
`;

const ClientListContainer = styled.div`
  flex: 1;
  overflow-y: auto;
`;

const ClientItem = styled.div<{ $hasUnread: boolean }>`
  display: flex;
  align-items: center;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  
  ${props => props.$hasUnread && `
    background: rgba(255, 59, 92, 0.1);
  `}
  
  &:hover {
    background: rgba(255, 255, 255, 0.05);
  }
`;

const ClientAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  color: white;
`;

const ClientInfo = styled.div`
  flex: 1;
`;

const ClientName = styled.div`
  font-weight: 500;
  color: white;
  margin-bottom: 4px;
`;

const ClientEmail = styled.div`
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
`;

const UnreadCount = styled.div`
  background: rgba(255, 59, 92, 0.2);
  color: #ff3b5c;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
  display: flex;
  align-items: center;
`;

const MessagesContainer = styled.div`
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const MessageBubble = styled.div<{ $isAdmin: boolean }>`
  max-width: 80%;
  padding: 12px 16px;
  border-radius: 16px;
  position: relative;
  word-wrap: break-word;
  
  ${props => props.$isAdmin ? `
    background: linear-gradient(90deg, #1F53FF, #FF43A3);
    color: white;
    align-self: flex-end;
    border-bottom-right-radius: 4px;
  ` : `
    background: rgba(255, 255, 255, 0.1);
    color: white;
    align-self: flex-start;
    border-bottom-left-radius: 4px;
  `}
`;

const MessageTime = styled.span`
  font-size: 10px;
  opacity: 0.7;
  position: absolute;
  bottom: -16px;
  right: 8px;
`;

const InputContainer = styled.div`
  padding: 16px;
  display: flex;
  gap: 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
`;

const MessageInput = styled.input`
  flex: 1;
  padding: 12px 16px;
  border-radius: 24px;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 14px;
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
  
  &:focus {
    outline: none;
    background: rgba(255, 255, 255, 0.15);
  }
`;

const SendButton = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: linear-gradient(90deg, #1F53FF, #FF43A3);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    transform: scale(1.05);
  }
`;

const LoadingMessage = styled.div`
  color: rgba(255, 255, 255, 0.5);
  text-align: center;
  padding: 20px;
`;

const ErrorMessage = styled.div`
  color: #ff4d4d;
  text-align: center;
  padding: 20px;
`;

const EmptyMessage = styled.div`
  color: rgba(255, 255, 255, 0.5);
  text-align: center;
  padding: 20px;
`;

export default AdminChat;
