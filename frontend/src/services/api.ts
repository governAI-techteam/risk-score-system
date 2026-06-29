import axios from 'axios';

const API_BASE = '/api';

export const securityAPI = {
  // ✅ FIXED: send JSON instead of FormData
  analyze: async (text) => {
    return axios.post(`${API_BASE}/analyze`, {
      input: text
    });
  },

  // ✅ keep file upload as FormData (correct)
  analyzeFile: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return axios.post(`${API_BASE}/analyze`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  transform: async (text) => {
    return axios.post(`${API_BASE}/transform`, { text });
  },

  chat: async (text, context = {}) => {
    return axios.post(`${API_BASE}/chat`, { text, context });
  },

  checkHallucination: async (text) => {
    return axios.post(`${API_BASE}/hallucination`, { text });
  },

  getHistory: async () => {
    return axios.get(`${API_BASE}/history`);
  },

  getStatus: async () => {
    return axios.get(`${API_BASE}/status`);
  },

  configure: async (openAIKey = null, enableOpenAI = null) => {
    return axios.post(`${API_BASE}/config`, { openAIKey, enableOpenAI });
  }
};

export default securityAPI;