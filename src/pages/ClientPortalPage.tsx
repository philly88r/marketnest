import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ProjectDashboard from '../components/ProjectDashboard';
import ServiceRequestForm from '../components/ServiceRequestForm';
import AnalyticsDashboard from '../components/AnalyticsDashboard';
import { sendMessageToAI, generateFallbackResponse } from '../utils/aiChatService';
import { uploadFile, formatFileSize, getRecentFiles } from '../utils/fileService';
import { supabase } from '../utils/supabaseClient';

const ClientPortalPage = (): React.ReactElement => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [activeSection, setActiveSection] = useState<'chat' | 'projects' | 'analytics' | 'requests'>('chat');
  const [activeChannel, setActiveChannel] = useState('general');
  const [message, setMessage] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<Array<{role: 'user' | 'assistant', content: string}>>([]);
  const [messages, setMessages] = useState<Record<string, Array<{id: string, sender: string, text: string, timestamp: Date, attachments?: string[]}>>>({
    'general': [
      {id: '1', sender: 'System', text: 'Welcome to your client portal! This is where you can communicate with our team, request work, and share files.', timestamp: new Date()},
      {id: '2', sender: 'Agency Team', text: 'How can we help you today?', timestamp: new Date()}
    ],
    'project-updates': [
      {id: '1', sender: 'System', text: 'This channel is for project updates and progress reports.', timestamp: new Date()}
    ],
    'file-sharing': [
      {id: '1', sender: 'System', text: 'Share files and documents with our team here.', timestamp: new Date()}
    ]
  });
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [recentFiles, setRecentFiles] = useState<Array<{name: string, url: string, size: number, uploadDate: Date}>>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [showFileList, setShowFileList] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      setIsLoggedIn(true);
    }
  };

  const handleSignUp = () => {
    if (!email || !password) return;
    alert('Sign up functionality will be implemented with backend integration.');
  };
  
  const handleLogout = () => {
    setIsLoggedIn(false);
  };
  
  // Function to generate AI response based on user message
  const generateAiResponse = async (userMessage: string) => {
    // Set AI to typing state
    setIsAiTyping(true);
    
    try {
      // Call the AI service
      const response = await sendMessageToAI({
        message: userMessage,
        userId: isLoggedIn ? 'client-user' : undefined,
        context: `Channel: ${activeChannel}`,
        conversationHistory: conversationHistory.slice(-6) // Send last 6 messages for context
      });
      
      // Create AI response message
      const aiMessage = {
        id: Date.now().toString(),
        sender: 'AI Assistant',
        text: response.error ? generateFallbackResponse(userMessage) : response.response,
        timestamp: new Date(),
        attachments: []
      };
      
      // Add AI response to messages
      setMessages(prev => ({
        ...prev,
        [activeChannel]: [...prev[activeChannel], aiMessage]
      }));
      
      // Update conversation history
      setConversationHistory(prevHistory => [
        ...prevHistory,
        { role: 'assistant', content: response.error ? generateFallbackResponse(userMessage) : response.response }
      ]);
    } catch (error) {
      console.error('Error generating AI response:', error);
      
      // Use fallback response if API call fails
      const fallbackMessage = {
        id: Date.now().toString(),
        sender: 'AI Assistant',
        text: generateFallbackResponse(userMessage),
        timestamp: new Date(),
        attachments: []
      };
      
      // Add fallback response to messages
      setMessages(prev => ({
        ...prev,
        [activeChannel]: [...prev[activeChannel], fallbackMessage]
      }));
    } finally {
      // Set AI to not typing
      setIsAiTyping(false);
    }
  };
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() && !selectedFile) return;
    
    const userMessage = message;
    
    const newMessage = {
      id: Date.now().toString(),
      sender: 'You',
      text: userMessage,
      timestamp: new Date(),
      attachments: selectedFile ? [selectedFile.name] : []
    };
    
    // Update messages for the active channel
    setMessages(prev => ({
      ...prev,
      [activeChannel]: [...prev[activeChannel], newMessage]
    }));
    
    // Update conversation history
    setConversationHistory(prevHistory => [
      ...prevHistory,
      { role: 'user', content: userMessage }
    ]);
    
    // In a production environment, you would save messages to your database here
    // This is simplified for the demo version
    
    setMessage('');
    setSelectedFile(null);
    
    // Generate AI response
    generateAiResponse(userMessage);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFile(file);
      
      // Auto-upload the file if it's in the file-sharing channel
      if (activeChannel === 'file-sharing') {
        handleFileUpload(file);
      }
    }
  };
  
  const handleFileUpload = async (file: File) => {
    if (!file) return;
    
    setIsUploading(true);
    try {
      // Upload the file and get the URL
      const fileUrl = await uploadFile(file, isLoggedIn ? 'client-user' : 'guest');
      
      // Add a system message about the file upload
      const fileMessage = {
        id: Date.now().toString(),
        sender: 'System',
        text: `File uploaded: ${file.name} (${formatFileSize(file.size)})`,
        timestamp: new Date(),
        attachments: [fileUrl]
      };
      
      // Update messages for the active channel
      setMessages(prev => ({
        ...prev,
        [activeChannel]: [...prev[activeChannel], fileMessage]
      }));
      
      // Update recent files
      setRecentFiles(prev => [
        { name: file.name, url: fileUrl, size: file.size, uploadDate: new Date() },
        ...prev.slice(0, 4) // Keep only the 5 most recent files
      ]);
      
      // Clear the selected file
      setSelectedFile(null);
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const formatDate = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      <Header />
      <PortalContainer>
        <PortalTitle
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Client Portal
        </PortalTitle>
        
        {isLoggedIn && (
          <PortalNavigation>
            <NavItem 
              $active={activeSection === 'chat'}
              onClick={() => setActiveSection('chat')}
            >
              <FiIcons.FiMessageSquare size={20} />
              <span>Messages</span>
            </NavItem>
            <NavItem 
              $active={activeSection === 'projects'}
              onClick={() => setActiveSection('projects')}
            >
              <FiIcons.FiFolder size={20} />
              <span>Projects</span>
            </NavItem>
            <NavItem 
              $active={activeSection === 'analytics'}
              onClick={() => setActiveSection('analytics')}
            >
              <FiIcons.FiBarChart2 size={20} />
              <span>Analytics</span>
            </NavItem>
            <NavItem 
              $active={activeSection === 'requests'}
              onClick={() => setActiveSection('requests')}
            >
              <FiIcons.FiPlusCircle size={20} />
              <span>New Request</span>
            </NavItem>
          </PortalNavigation>
        )}
        
        {!isLoggedIn ? (
          <LoginContainer
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <LoginForm onSubmit={handleLogin}>
              <LoginTitle>Login to Your Client Portal</LoginTitle>
              <FormGroup>
                <Label htmlFor="email">Email</Label>
                <Input 
                  type="email" 
                  id="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                />
              </FormGroup>
              <FormGroup>
                <Label htmlFor="password">Password</Label>
                <Input 
                  type="password" 
                  id="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                />
              </FormGroup>
              <ForgotPassword>Forgot password?</ForgotPassword>
              <SubmitButton type="submit">Login</SubmitButton>
              <RequestAccess>
                Don't have an account? <RequestLink>Request access</RequestLink>
              </RequestAccess>
            </LoginForm>
          </LoginContainer>
        ) : (
          activeSection === 'projects' ? (
            <ProjectDashboard clientId={isLoggedIn ? 'client-user' : undefined} />
          ) : activeSection === 'analytics' ? (
            <AnalyticsDashboard clientId={isLoggedIn ? 'client-user' : undefined} dateRange="month" />
          ) : activeSection === 'requests' ? (
            <ServiceRequestForm
              onSubmit={(data) => {
                // In a real app, this would submit to your backend
                console.log('Service request submitted:', data);
                // Show success message
                alert('Your service request has been submitted successfully!');
                // Switch to chat view
                setActiveSection('chat');
              }}
            />
          ) : (
            <PortalInterface
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
            <Sidebar>
              <ClientInfo>
                <ClientAvatar>
                  {FiIcons.FiUser({ size: 24 })}
                </ClientAvatar>
                <ClientName>Client Name</ClientName>
                <LogoutButton onClick={handleLogout}>
                  {FiIcons.FiLogOut({ size: 16 })}
                  <span>Logout</span>
                </LogoutButton>
              </ClientInfo>
              
              <ChannelList>
                <ChannelHeader>Channels</ChannelHeader>
                <Channel 
                  $active={activeChannel === 'general'} 
                  onClick={() => setActiveChannel('general')}
                >
                  {FiIcons.FiMessageSquare({ size: 16 })}
                  <span>General</span>
                </Channel>
                <Channel 
                  $active={activeChannel === 'project-updates'} 
                  onClick={() => setActiveChannel('project-updates')}
                >
                  {FiIcons.FiCalendar({ size: 16 })}
                  <span>Project Updates</span>
                </Channel>
                <Channel 
                  $active={activeChannel === 'file-sharing'} 
                  onClick={() => setActiveChannel('file-sharing')}
                >
                  {FiIcons.FiFolder({ size: 16 })}
                  <span>File Sharing</span>
                </Channel>
                <NewChannelButton>
                  {FiIcons.FiPlus({ size: 14 })}
                  <span>New Channel</span>
                </NewChannelButton>
              </ChannelList>
              
              <QuickLinks>
                <QuickLinksHeader>Quick Links</QuickLinksHeader>
                <QuickLink onClick={() => navigate('/services')}>Our Services</QuickLink>
                <QuickLink onClick={() => navigate('/contact')}>Contact Support</QuickLink>
                <QuickLink onClick={() => navigate('/blog')}>Resources</QuickLink>
              </QuickLinks>
            </Sidebar>
            
            <ChatArea>
              <ChannelHeader>
                # {activeChannel.replace(/-/g, ' ')}
              </ChannelHeader>
              
              <MessagesContainer>
                {activeChannel === 'file-sharing' && (
                  <FilesSummary>
                    <FilesSummaryTitle>
                      <FiIcons.FiFolder size={18} />
                      <span>Shared Files</span>
                      <FilesSummaryToggle onClick={() => setShowFileList(!showFileList)}>
                        {showFileList ? 'Hide' : 'Show'}
                      </FilesSummaryToggle>
                    </FilesSummaryTitle>
                    <AnimatePresence>
                      {showFileList && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <FilesList>
                            {recentFiles.length > 0 ? (
                              recentFiles.map((file, index) => (
                                <FileItem key={index}>
                                  <FiIcons.FiFile size={14} />
                                  <FileItemName>{file.name}</FileItemName>
                                  <FileItemSize>{formatFileSize(file.size)}</FileItemSize>
                                  <FileItemDate>{file.uploadDate.toLocaleDateString()}</FileItemDate>
                                </FileItem>
                              ))
                            ) : (
                              <EmptyFilesList>No files shared yet</EmptyFilesList>
                            )}
                          </FilesList>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </FilesSummary>
                )}
                
                {activeChannel && messages[activeChannel]?.map((msg) => (
                  <MessageBubble key={msg.id} $isClient={msg.sender === 'You'}>
                    <MessageSender>{msg.sender}</MessageSender>
                    <MessageText>{msg.text}</MessageText>
                    {msg.attachments && msg.attachments.length > 0 && (
                      <AttachmentList>
                        {msg.attachments.map((file, index) => (
                          <Attachment key={index}>
                            {FiIcons.FiPaperclip({ size: 14 })}
                            <span>{file}</span>
                          </Attachment>
                        ))}
                      </AttachmentList>
                    )}
                    <MessageTime>{formatDate(msg.timestamp)}</MessageTime>
                  </MessageBubble>
                ))}
                {isAiTyping && (
                  <TypingIndicator>
                    <TypingDot />
                    <TypingDot />
                    <TypingDot />
                    <TypingText>AI Assistant is typing</TypingText>
                  </TypingIndicator>
                )}
                <div ref={messagesEndRef} />
              </MessagesContainer>
              
              <MessageInputContainer onSubmit={handleSendMessage}>
                {selectedFile && (
                  <SelectedFile>
                    {FiIcons.FiPaperclip({ size: 14 })}
                    <span>{selectedFile.name}</span>
                    <RemoveFileButton onClick={() => setSelectedFile(null)}>×</RemoveFileButton>
                  </SelectedFile>
                )}
                <MessageInputWrapper>
                  <AttachButton type="button" onClick={triggerFileInput} disabled={isUploading}>
                    {isUploading ? (
                      <LoadingSpinner />
                    ) : (
                      FiIcons.FiPaperclip({ size: 20 })
                    )}
                  </AttachButton>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                  />
                  <MessageInput
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={activeChannel === 'file-sharing' 
                      ? "Add a message or drop files here..." 
                      : "Type your message here..."}
                    disabled={isUploading}
                  />
                  <SendButton type="submit" disabled={isUploading || (!message.trim() && !selectedFile)}>
                    {FiIcons.FiSend({ size: 20 })}
                  </SendButton>
                </MessageInputWrapper>
              </MessageInputContainer>
            </ChatArea>
          </PortalInterface>
          )
        )}
      </PortalContainer>
      <Footer />
    </>
  );
};

// Styled Components
const PortalContainer = styled.div`
  max-width: 1200px;
  margin: 80px auto;
  padding: 0 20px;
  min-height: calc(100vh - 300px);
`;

const PortalTitle = styled(motion.h1)`
  text-align: center;
  font-size: 2.5rem;
  margin-bottom: 40px;
  background: linear-gradient(90deg, #0df9b6 0%, #de681d 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const LoginContainer = styled(motion.div)`
  max-width: 500px;
  margin: 0 auto;
  padding: 40px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const LoginForm = styled.form`
  display: flex;
  flex-direction: column;
`;

const LoginTitle = styled.h2`
  margin-bottom: 24px;
  font-size: 1.8rem;
  text-align: center;
  color: white;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  color: white;
  font-size: 16px;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #0df9b6;
    box-shadow: 0 0 0 2px rgba(13, 249, 182, 0.2);
  }
`;

const ForgotPassword = styled.a`
  align-self: flex-end;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 24px;
  cursor: pointer;
  
  &:hover {
    color: #0df9b6;
  }
`;

const SubmitButton = styled.button`
  padding: 14px;
  background: linear-gradient(90deg, #0df9b6 0%, #de681d 100%);
  border: none;
  border-radius: 6px;
  color: white;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(13, 249, 182, 0.3);
  }
`;

const RequestAccess = styled.p`
  margin-top: 24px;
  text-align: center;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
`;

const RequestLink = styled.span`
  color: #0df9b6;
  cursor: pointer;
  
  &:hover {
    text-decoration: underline;
  }
`;

const PortalInterface = styled(motion.div)`
  display: flex;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  height: 700px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    height: auto;
  }
`;

const Sidebar = styled.div`
  width: 260px;
  background: rgba(0, 0, 0, 0.2);
  padding: 20px;
  display: flex;
  flex-direction: column;
  
  @media (max-width: 768px) {
    width: 100%;
    order: 2;
  }
`;

const ClientInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 20px;
`;

const ClientAvatar = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #0df9b6 0%, #de681d 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
  color: white;
`;

const ClientName = styled.h3`
  font-size: 16px;
  margin-bottom: 8px;
  color: white;
`;

const LogoutButton = styled.button`
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  
  &:hover {
    color: #0df9b6;
  }
  
  span {
    margin-left: 4px;
  }
`;

const ChannelList = styled.div`
  margin-bottom: 20px;
`;

const ChannelHeader = styled.h3`
  font-size: 14px;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 12px;
  letter-spacing: 1px;
`;

const Channel = styled.div<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  border-radius: 6px;
  cursor: pointer;
  color: ${props => props.$active ? 'white' : 'rgba(255, 255, 255, 0.6)'};
  background: ${props => props.$active ? 'rgba(13, 249, 182, 0.1)' : 'transparent'};
  transition: all 0.2s ease;
  margin-bottom: 4px;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: white;
  }
  
  span {
    margin-left: 4px;
  }
`;

const NewChannelButton = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  border-radius: 6px;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.6);
  background: transparent;
  border: none;
  transition: all 0.2s ease;
  margin-top: 8px;
  font-size: 14px;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: white;
  }
  
  span {
    margin-left: 4px;
  }
`;

const QuickLinks = styled.div`
  margin-top: auto;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
`;

const QuickLinksHeader = styled.h3`
  font-size: 14px;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 12px;
  letter-spacing: 1px;
`;

const QuickLink = styled.a`
  display: block;
  padding: 8px 0;
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    color: #0df9b6;
  }
`;

const ChatArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  
  @media (max-width: 768px) {
    order: 1;
    min-height: 500px;
  }
`;

const MessagesContainer = styled.div`
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.1);
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 3px;
  }
`;

const MessageBubble = styled.div<{ $isClient: boolean }>`
  max-width: 80%;
  align-self: ${props => props.$isClient ? 'flex-end' : 'flex-start'};
  background: ${props => props.$isClient ? 'rgba(13, 249, 182, 0.1)' : 'rgba(255, 255, 255, 0.1)'};
  border-radius: 12px;
  padding: 12px 16px;
  position: relative;
  
  ${props => props.$isClient && `
    border-bottom-right-radius: 4px;
  `}
  
  ${props => !props.$isClient && `
    border-bottom-left-radius: 4px;
  `}
`;

const MessageSender = styled.div`
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 4px;
  color: #0df9b6;
`;

const MessageText = styled.div`
  font-size: 15px;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.5;
`;

const MessageTime = styled.div`
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  margin-top: 6px;
  text-align: right;
`;

const AttachmentList = styled.div`
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const Attachment = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
  background: rgba(0, 0, 0, 0.2);
  padding: 6px 10px;
  border-radius: 4px;
  cursor: pointer;
  
  &:hover {
    background: rgba(0, 0, 0, 0.3);
  }
  
  span {
    margin-left: 4px;
  }
`;

const MessageInputContainer = styled.form`
  padding: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
`;

const SelectedFile = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
  background: rgba(0, 0, 0, 0.2);
  padding: 6px 10px;
  border-radius: 4px;
  margin-bottom: 8px;
  
  span {
    margin-left: 4px;
  }
`;

const RemoveFileButton = styled.button`
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  margin-left: auto;
  cursor: pointer;
  font-size: 16px;
  
  &:hover {
    color: white;
  }
`;

const MessageInputWrapper = styled.div`
  display: flex;
  align-items: center;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  padding: 4px;
`;

const AttachButton = styled.button`
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 50%;
  transition: all 0.2s ease;
  
  &:hover {
    color: white;
    background: rgba(255, 255, 255, 0.1);
  }
`;

const MessageInput = styled.input`
  flex: 1;
  background: transparent;
  border: none;
  padding: 10px;
  color: white;
  font-size: 15px;
  
  &:focus {
    outline: none;
  }
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }
`;

const SendButton = styled.button`
  background: linear-gradient(90deg, #0df9b6 0%, #de681d 100%);
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  transition: all 0.2s ease;
  
  &:hover {
    transform: scale(1.05);
    box-shadow: 0 0 10px rgba(13, 249, 182, 0.3);
  }
`;

const EmptyMessage = styled.div`
  padding: 20px;
  text-align: center;
  color: rgba(255, 255, 255, 0.6);
  font-style: italic;
`;

const TypingIndicator = styled.div`
  display: flex;
  align-items: center;
  margin: 10px 0;
  padding: 10px 15px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  max-width: 200px;
`;

const TypingDot = styled.div`
  width: 8px;
  height: 8px;
  margin-right: 4px;
  background: #0df9b6;
  border-radius: 50%;
  opacity: 0.7;
  animation: typingAnimation 1s infinite ease-in-out alternate;
  
  &:nth-child(1) {
    animation-delay: 0s;
  }
  
  &:nth-child(2) {
    animation-delay: 0.2s;
  }
  
  &:nth-child(3) {
    animation-delay: 0.4s;
  }
  
  @keyframes typingAnimation {
    from {
      opacity: 0.7;
      transform: scale(1);
    }
    to {
      opacity: 1;
      transform: scale(1.2);
    }
  }
`;

const TypingText = styled.span`
  margin-left: 8px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
`;

// File sharing styled components
const FilesSummary = styled.div`
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  margin-bottom: 16px;
  overflow: hidden;
`;

const FilesSummaryTitle = styled.div`
  display: flex;
  align-items: center;
  padding: 12px 16px;
  font-weight: 500;
  
  span {
    margin-left: 8px;
  }
`;

const FilesSummaryToggle = styled.button`
  margin-left: auto;
  background: none;
  border: none;
  color: #0df9b6;
  font-size: 12px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  
  &:hover {
    background: rgba(13, 249, 182, 0.1);
  }
`;

const FilesList = styled.div`
  padding: 0 16px 16px;
`;

const FileItem = styled.div`
  display: flex;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 14px;
  
  &:last-child {
    border-bottom: none;
  }
`;

const FileItemName = styled.div`
  margin-left: 8px;
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const FileItemSize = styled.div`
  color: rgba(255, 255, 255, 0.6);
  margin: 0 12px;
  font-size: 12px;
`;

const FileItemDate = styled.div`
  color: rgba(255, 255, 255, 0.6);
  font-size: 12px;
`;

const EmptyFilesList = styled.div`
  padding: 12px 0;
  text-align: center;
  color: rgba(255, 255, 255, 0.6);
  font-style: italic;
  font-size: 14px;
`;

const LoadingSpinner = styled.div`
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid #0df9b6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

// Portal navigation styled components
const PortalNavigation = styled.div`
  display: flex;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  padding: 12px;
  margin-bottom: 24px;
  justify-content: center;
  gap: 8px;
  
  @media (max-width: 768px) {
    flex-wrap: wrap;
  }
`;

const NavItem = styled.button<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: ${props => props.$active ? 'rgba(13, 249, 182, 0.1)' : 'transparent'};
  border: none;
  border-radius: 8px;
  color: ${props => props.$active ? '#0df9b6' : '#fff'};
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(13, 249, 182, 0.05);
  }
  
  @media (max-width: 768px) {
    flex: 1;
    min-width: 120px;
    justify-content: center;
  }
  
  @media (max-width: 480px) {
    padding: 10px;
    
    span {
      display: none;
    }
  }
`;

export default ClientPortalPage;
