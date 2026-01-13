import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Configure axios defaults
axios.defaults.withCredentials = true;

export const authService = {
  login: async (email: string, password: string) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  },

  signup: async (data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    city?: string;
  }) => {
    try {
      const response = await axios.post(`${API_URL}/auth/signup/end-user`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Signup failed');
    }
  },

  logout: async () => {
    try {
      const response = await axios.post(`${API_URL}/auth/logout`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Logout failed');
    }
  },
};

export const campaignService = {
  list: async () => {
    try {
      const response = await axios.get(`${API_URL}/campaigns`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch campaigns');
    }
  },

  get: async (id: string) => {
    try {
      const response = await axios.get(`${API_URL}/campaigns/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch campaign');
    }
  },

  create: async (data: {
    campaignName: string;
    notificationType: string;
    cityFilter?: string;
  }) => {
    try {
      const response = await axios.post(`${API_URL}/campaigns`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create campaign');
    }
  },

  update: async (id: string, data: {
    campaignName?: string;
    notificationType?: string;
    cityFilter?: string;
  }) => {
    try {
      const response = await axios.patch(`${API_URL}/campaigns/${id}`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update campaign');
    }
  },

  preview: async (id: string) => {
    try {
      const response = await axios.post(`${API_URL}/campaigns/${id}/preview`);
      return response.data;
    } catch (error: any) {
      console.log(error);
      throw new Error(error.response?.data?.message || 'Failed to preview campaign');
    }
  },

  send: async (id: string) => {
    try {
      const response = await axios.post(`${API_URL}/campaigns/${id}/send`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to send campaign');
    }
  },

  getRecipients: async (id: string) => {
    try {
      const response = await axios.get(`${API_URL}/campaigns/${id}/recipients`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch recipients');
    }
  },
};

export const preferenceService = {
  get: async () => {
    try {
      const response = await axios.get(`${API_URL}/me/preferences`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch preferences');
    }
  },

  update: async (data: {
    offers?: boolean;
    order_updates?: boolean;
    newsletter?: boolean;
  }) => {
    try {
      const response = await axios.put(`${API_URL}/me/preferences`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update preferences');
    }
  },

  // Admin APIs
  getAllUsers: async () => {
    try {
      const response = await axios.get(`${API_URL}/me/admin/preferences`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch users');
    }
  },

  updateUserPreference: async (userId: string, data: {
    offers?: boolean;
    orderUpdates?: boolean;
    newsletter?: boolean;
  }) => {
    try {
      const response = await axios.patch(`${API_URL}/me/admin/preferences/${userId}`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update user preference');
    }
  },
};

export const userService = {
  list: async () => {
    try {
      const response = await axios.get(`${API_URL}/users`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch users');
    }
  },

  get: async (userId: string) => {
    try {
      const response = await axios.get(`${API_URL}/users/${userId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch user');
    }
  },

  create: async (data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    city?: string;
  }) => {
    try {
      const response = await axios.post(`${API_URL}/users`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create user');
    }
  },

  update: async (userId: string, data: {
    name?: string;
    email?: string;
    phone?: string;
    city?: string;
    isActive?: boolean;
  }) => {
    try {
      const response = await axios.patch(`${API_URL}/users/${userId}`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update user');
    }
  },

  delete: async (userId: string) => {
    try {
      const response = await axios.delete(`${API_URL}/users/${userId}`);
      return response.data;
    } catch (error: any) {
      console.log(error);
      throw new Error(error.response?.data?.message || 'Failed to delete user');
    }
  },
};

export const logService = {
  list: async (filters?: {
    campaignId?: string;
    userId?: string;
    status?: string;
  }) => {
    try {
      const params = new URLSearchParams();
      if (filters?.campaignId) params.append('campaignId', filters.campaignId);
      if (filters?.userId) params.append('userId', filters.userId);
      if (filters?.status) params.append('status', filters.status);

      const response = await axios.get(`${API_URL}/logs${params.toString() ? `?${params.toString()}` : ''}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch logs');
    }
  },
};

export const statsService = {
  getSummary: async () => {
    try {
      const response = await axios.get(`${API_URL}/stats/summary`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch summary stats');
    }
  },

  getActivity: async () => {
    try {
      const response = await axios.get(`${API_URL}/stats/activity`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch activity stats');
    }
  },

  getCampaignDistribution: async () => {
    try {
      const response = await axios.get(`${API_URL}/stats/campaign-distribution`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch campaign distribution');
    }
  },

  getRecentActivity: async () => {
    try {
      const response = await axios.get(`${API_URL}/stats/recent-activity`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch recent activity');
    }
  },
};

export const staffService = {
  create: async (data: {
    name: string;
    email: string;
    password: string;
    role: string;
  }) => {
    try {
      const response = await axios.post(`${API_URL}/staff`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create staff member');
    }
  },

  list: async () => {
    try {
      const response = await axios.get(`${API_URL}/staff`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch staff members');
    }
  },
};
