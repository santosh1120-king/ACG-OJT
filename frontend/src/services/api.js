import axios from 'axios';

// The backend server address used while developing this project locally.
const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add the saved login token to every request that goes to the backend.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// If a token has expired, clear the old login and return the user to the sign-in screen.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Small named functions make authentication requests easy for components to reuse.
export const authAPI = {
  googleLogin: (token) => api.post('/auth/google', null, { params: { token } }),
  getMe: () => api.get('/auth/me'),
};

// This group contains every request used by the AI-workflow screen.
export const agentRunsAPI = {
  start: (payload) => api.post('/agent-runs', payload),
  get: (runId) => api.get(`/agent-runs/${runId}`),
  approve: (runId, approved, notes) => api.post(`/agent-runs/${runId}/approval`, { approved, notes }),
  connectEvents: (runId, onEvent) => {
    const token = localStorage.getItem('access_token');
    const socket = new WebSocket(`ws://localhost:8000/agent-runs/${runId}/events?token=${encodeURIComponent(token || '')}`);
    socket.onmessage = (message) => onEvent(JSON.parse(message.data));
    return socket;
  },
};

export default api;
