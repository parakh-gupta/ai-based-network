import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Paper,
  Typography,
  CircularProgress,
  Divider,
  Stack,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { chatAPI, type ChatMessage } from '../services/api';
interface ChatBotProps {
  onCreateTopology?: (topology: string, devices: number) => void;
}

const ChatBot: React.FC<ChatBotProps> = ({ onCreateTopology }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim()) return;

    // Add user message to chat
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Call Flask backend
      const response = await chatAPI.sendMessage(input);

      if (response.success) {
        const botMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          text: response.message || 'Could not understand your request.',
          sender: 'bot',
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botMessage]);

        if (response.data.topology && response.data.devices && onCreateTopology) {
          onCreateTopology(response.data.topology, response.data.devices);
        }
      }
    } catch {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: 'Error: Failed to get response from server',
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e)
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: '#f5f5f5',
      }}
    >
      {/* Header */}
      <Box sx={{ p: 2, backgroundColor: '#1976d2', color: 'white' }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          AI Assistant
        </Typography>
      </Box>

      {/* Messages Container */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
        }}
      >
        {messages.length === 0 ? (
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Typography color="textSecondary">
              Start a conversation...
            </Typography>
          </Box>
        ) : (
          messages.map((message) => (
            <Box
              key={message.id}
              sx={{
                display: 'flex',
                justifyContent:
                  message.sender === 'user' ? 'flex-end' : 'flex-start',
              }}
            >
              <Paper
                sx={{
                  p: 1.5,
                  maxWidth: '80%',
                  backgroundColor:
                    message.sender === 'user' ? '#1976d2' : '#e0e0e0',
                  color: message.sender === 'user' ? 'white' : 'black',
                  borderRadius: 2,
                  wordWrap: 'break-word',
                }}
              >
                <Typography variant="body2">{message.text}</Typography>
              </Paper>
            </Box>
          ))
        )}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
            <CircularProgress size={24} />
          </Box>
        )}
        <div ref={messagesEndRef} />
      </Box>

      <Divider />

      {/* Input Area */}
      <Box sx={{ p: 2 }}>
        <form onSubmit={handleSendMessage}>
          <Stack direction="row" spacing={1}>
            <TextField
              fullWidth
              size="small"
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              multiline
              maxRows={3}
              variant="outlined"
            />
            <Button
              type="submit"
              variant="contained"
              endIcon={<SendIcon />}
              disabled={loading || !input.trim()}
              sx={{ mt: 0.5 }}
            >
              Send
            </Button>
          </Stack>
        </form>
      </Box>
    </Box>
  );
};

export default ChatBot;
