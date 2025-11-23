'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Paper,
  IconButton,
  TextField,
  Typography,
  Fab,
  Collapse,
  Avatar,
  CircularProgress,
  Tooltip,
  Badge,
  Chip,
} from '@mui/material';
import {
  Chat as ChatIcon,
  Close as CloseIcon,
  Send as SendIcon,
  SmartToy as BotIcon,
  Person as PersonIcon,
  Minimize as MinimizeIcon,
  DeleteOutline as ClearIcon,
  ContentCopy as CopyIcon,
} from '@mui/icons-material';
import { openRouterService, ChatMessage } from '@/services/openrouter.service';
import { CHATBOT_SYSTEM_CONTEXT } from '@/config/chatbot-context';
import { useAuth } from '@/hooks/useAuth';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  // Load messages from localStorage on mount
  useEffect(() => {
    const savedMessages = localStorage.getItem('chatbot-messages');
    if (savedMessages) {
      try {
        const parsed = JSON.parse(savedMessages);
        setMessages(parsed.map((msg: Message) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        })));
      } catch (error) {
        console.error('Error loading saved messages:', error);
      }
    } else {
      // Welcome message
      const welcomeMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `Hello${user?.full_name ? ` ${user.full_name}` : ''}! 👋 I'm your CredApp AI assistant. I can help you with:

• Understanding platform features
• Navigating the dashboard
• Credential management
• Troubleshooting issues
• API integration guidance
• Best practices

How can I assist you today?`,
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    }
  }, [user?.full_name]);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('chatbot-messages', JSON.stringify(messages));
    }
  }, [messages]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current && !isMinimized) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isMinimized]);

  // Track unread messages
  useEffect(() => {
    if (!isOpen && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === 'assistant') {
        setUnreadCount(prev => prev + 1);
      }
    } else {
      setUnreadCount(0);
    }
  }, [messages, isOpen]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Build conversation history for API
      const conversationHistory: ChatMessage[] = messages.map(msg => ({
        role: msg.role,
        content: msg.content,
      }));

      // Add user context to system prompt
      const userContext = user ? `\n\nCurrent user: ${user.full_name} (Role: ${user.role})` : '';
      const enhancedContext = CHATBOT_SYSTEM_CONTEXT + userContext;

      // Get AI response
      const aiResponse = await openRouterService.sendMessage(
        input.trim(),
        conversationHistory,
        enhancedContext
      );

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '❌ Sorry, I encountered an error. Please make sure the OpenRouter API key is configured. You can try again or rephrase your question.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
    localStorage.removeItem('chatbot-messages');
    const welcomeMessage: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content: `Chat cleared! How can I help you?`,
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
  };

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  const toggleOpen = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setIsMinimized(false);
      setUnreadCount(0);
    }
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  return (
    <>
      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="chat"
        onClick={toggleOpen}
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 90, // Moved left to avoid overlapping accessibility button
          zIndex: 1200,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #5568d3 0%, #6a4193 100%)',
          },
        }}
      >
        <Badge badgeContent={unreadCount} color="error">
          {isOpen ? <CloseIcon /> : <ChatIcon />}
        </Badge>
      </Fab>

      {/* Chat Window */}
      <Collapse in={isOpen}>
        <Paper
          elevation={8}
          sx={{
            position: 'fixed',
            bottom: 100,
            right: 90, // Aligned with chat button
            width: { xs: 'calc(100% - 48px)', sm: 400 },
            maxWidth: 400,
            height: isMinimized ? 'auto' : 600,
            maxHeight: isMinimized ? 'auto' : '80vh',
            zIndex: 1200,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          }}
        >
          {/* Header */}
          <Box
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              p: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
                <BotIcon />
              </Avatar>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>
                  CredApp AI Assistant
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.9 }}>
                  {isLoading ? 'Typing...' : 'Online'}
                </Typography>
              </Box>
            </Box>
            <Box>
              <Tooltip title="Clear chat">
                <IconButton size="small" onClick={clearChat} sx={{ color: 'white' }}>
                  <ClearIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title={isMinimized ? 'Expand' : 'Minimize'}>
                <IconButton size="small" onClick={toggleMinimize} sx={{ color: 'white' }}>
                  <MinimizeIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Close">
                <IconButton size="small" onClick={toggleOpen} sx={{ color: 'white' }}>
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {!isMinimized && (
            <>
              {/* Messages Area */}
              <Box
                sx={{
                  flex: 1,
                  overflow: 'auto',
                  p: 2,
                  backgroundColor: '#f5f5f5',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                }}
              >
                {messages.map((message) => (
                  <Box
                    key={message.id}
                    sx={{
                      display: 'flex',
                      gap: 1,
                      alignItems: 'flex-start',
                      flexDirection: message.role === 'user' ? 'row-reverse' : 'row',
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 32,
                        height: 32,
                        bgcolor: message.role === 'user' ? '#667eea' : '#764ba2',
                      }}
                    >
                      {message.role === 'user' ? (
                        <PersonIcon sx={{ fontSize: 20 }} />
                      ) : (
                        <BotIcon sx={{ fontSize: 20 }} />
                      )}
                    </Avatar>
                    <Box sx={{ maxWidth: '75%' }}>
                      <Paper
                        elevation={1}
                        sx={{
                          p: 1.5,
                          backgroundColor: message.role === 'user' ? '#667eea' : 'white',
                          color: message.role === 'user' ? 'white' : 'text.primary',
                          borderRadius: 2,
                          position: 'relative',
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word',
                          }}
                        >
                          {message.content}
                        </Typography>
                        {message.role === 'assistant' && (
                          <Tooltip title="Copy">
                            <IconButton
                              size="small"
                              onClick={() => copyMessage(message.content)}
                              sx={{
                                position: 'absolute',
                                top: 4,
                                right: 4,
                                opacity: 0.6,
                                '&:hover': { opacity: 1 },
                              }}
                            >
                              <CopyIcon sx={{ fontSize: 14 }} />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Paper>
                      <Typography
                        variant="caption"
                        sx={{
                          mt: 0.5,
                          opacity: 0.6,
                          display: 'block',
                          textAlign: message.role === 'user' ? 'right' : 'left',
                        }}
                      >
                        {message.timestamp.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Typography>
                    </Box>
                  </Box>
                ))}
                {isLoading && (
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: '#764ba2' }}>
                      <BotIcon sx={{ fontSize: 20 }} />
                    </Avatar>
                    <Paper elevation={1} sx={{ p: 1.5, borderRadius: 2 }}>
                      <CircularProgress size={20} />
                    </Paper>
                  </Box>
                )}
                <div ref={messagesEndRef} />
              </Box>

              {/* Input Area */}
              <Box
                sx={{
                  p: 2,
                  backgroundColor: 'white',
                  borderTop: '1px solid #e0e0e0',
                }}
              >
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Ask me anything about CredApp..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={isLoading}
                    multiline
                    maxRows={3}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      },
                    }}
                  />
                  <IconButton
                    color="primary"
                    onClick={handleSendMessage}
                    disabled={!input.trim() || isLoading}
                    sx={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #5568d3 0%, #6a4193 100%)',
                      },
                      '&.Mui-disabled': {
                        background: '#e0e0e0',
                        color: '#9e9e9e',
                      },
                    }}
                  >
                    <SendIcon />
                  </IconButton>
                </Box>
                <Typography variant="caption" sx={{ mt: 1, opacity: 0.6, display: 'block' }}>
                  Powered by Credhub.AI
                </Typography>
              </Box>
            </>
          )}
        </Paper>
      </Collapse>
    </>
  );
}

