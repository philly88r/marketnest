import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { FiSend, FiMessageCircle } from 'react-icons/fi';
import { renderIcon } from '../utils/iconUtils';
import { ChatMessage, getClientMessages, sendMessage, subscribeToClientMessages } from '../utils/chatService';
import { getCurrentUser } from '../utils/authService';

interface ClientChatProps {
  clientId: string;
}

const ClientChat: React.FC<ClientChatProps> = ({ clientId }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Fetch messages on component mount
  useEffect(() => {
    const fetchMessages = async () => {
      setIsLoading(true);
      try {
        const fetchedMessages = await getClientMessages(clientId);
        setMessages(fetchedMessages);
      } catch (err) {
        console.error('Error fetching messages:', err);
        setError('Failed to load chat messages');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMessages();
    
    // Subscribe to new messages
    const subscription = subscribeToClientMessages(clientId, (newMessage) => {
      setMessages(prev => [...prev, newMessage]);
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, [clientId]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    
    try {
      const user = getCurrentUser();
      const userId = user?.id || 'anonymous';
      
      const message = {
        client_id: clientId,
        admin_id: null,
        content: newMessage,
        sender_type: 'client' as const,
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
  
  return (
    <>
      <ChatButton onClick={toggleChat}>
        {renderIcon(FiMessageCircle)}
        <span>Chat</span>
      </ChatButton>
      
      {isChatOpen && (
        <ChatContainer>
          <ChatHeader>
            <h3>Chat with MarketNest</h3>
            <CloseButton onClick={toggleChat}>×</CloseButton>
          </ChatHeader>
          
          <MessagesContainer>
            {isLoading ? (
              <LoadingMessage>Loading messages...</LoadingMessage>
            ) : error ? (
              <ErrorMessage>{error}</ErrorMessage>
            ) : messages.length === 0 ? (
              <EmptyMessage>No messages yet. Start the conversation!</EmptyMessage>
            ) : (
              messages.map(message => (
                <MessageBubble 
                  key={message.id} 
                  $isClient={message.sender_type === 'client'}
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
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
  line-height: 1;
`;

const MessagesContainer = styled.div`
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const MessageBubble = styled.div<{ $isClient: boolean }>`
  max-width: 80%;
  padding: 12px 16px;
  border-radius: 16px;
  position: relative;
  word-wrap: break-word;
  
  ${props => props.$isClient ? `
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

export default ClientChat;
