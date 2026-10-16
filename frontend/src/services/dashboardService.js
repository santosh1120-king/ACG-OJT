import api from './api';

// Keep dashboard network calls outside visual components so pages stay easier to read.
export const dashboardService = {
  getProjects: async () => {
    try {
      const response = await api.get('/api/projects');
      return response.data || [];
    } catch {
      return [];
    }
  },

  getActiveRuns: async () => {
    try {
      const response = await api.get('/api/runs/active');
      return response.data || [];
    } catch {
      return [];
    }
  },

  getPendingApprovals: async () => {
    try {
      const response = await api.get('/api/approvals/pending');
      return response.data || [];
    } catch {
      return [];
    }
  },

  getRecentActivity: async () => {
    try {
      const response = await api.get('/api/activity/recent');
      return response.data || [];
    } catch {
      return [];
    }
  },

  getErrors: async () => {
    try {
      const response = await api.get('/api/errors/recent');
      return response.data || [];
    } catch {
      return [];
    }
  },

  connectDashboardEvents: (onEvent) => {
    // Open a live connection so the dashboard can refresh when the backend sends an event.
    try {
      const token = localStorage.getItem('access_token');
      const socket = new WebSocket(`ws://localhost:8000/ws/dashboard/events?token=${encodeURIComponent(token || '')}`);
      socket.onmessage = (message) => {
        try {
          onEvent(JSON.parse(message.data));
        } catch (e) {
          console.warn('Dashboard event parse error', e);
        }
      };
      return socket;
    } catch (e) {
      console.warn('WebSocket connection error', e);
      return null;
    }
  }
};
