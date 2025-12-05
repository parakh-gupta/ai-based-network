import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Frontend types matching backend response
export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export interface ChatRequest {
  message: string;
}

export interface ChatResponse {
  success: boolean;
  create_topology: boolean;
  message: string | null; // Rasa bot message
  data: {
    topology: string | null;
    devices: number | null;
  };
}

export interface HealthResponse {
  status: string;         // "healthy"
  rasa_healthy: boolean;  // true if Rasa server is healthy
}

export const chatAPI = {
  sendMessage: async (message: string): Promise<ChatResponse> => {
    try {
      const response = await apiClient.post<ChatResponse>('/chat', { message });
      return response.data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  checkHealth: async (): Promise<HealthResponse> => {
    try {
      const response = await apiClient.get<HealthResponse>('/health');
      return response.data;
    } catch (error) {
      console.error('Error checking health:', error);
      return { status: 'unhealthy', rasa_healthy: false };
    }
  },
};
