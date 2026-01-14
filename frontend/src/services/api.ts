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
    role?: string;
  }) => {
    try {
      const response = await axios.post(`${API_URL}/auth/signup`, data);
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
  getProfile: async () => {
    try {
      const response = await axios.get(`${API_URL}/me/profile`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch profile');
    }
  },

  updateProfile: async (data: {
    name?: string;
    email?: string;
    phone?: string;
    city?: string;
  }) => {
    try {
      const response = await axios.put(`${API_URL}/me/profile`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update profile');
    }
  },

  getNotificationPreferences: async (notificationType: string) => {
    try {
      const response = await axios.get(`${API_URL}/me/notification-preferences/${notificationType}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch preferences');
    }
  },

  updateNotificationPreferences: async (notificationType: string, data: {
    email?: boolean;
    sms?: boolean;
    push?: boolean;
  }) => {
    try {
      const response = await axios.put(`${API_URL}/me/notification-preferences/${notificationType}`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update preferences');
    }
  },

  getAllNotificationPreferences: async () => {
    try {
      const response = await axios.get(`${API_URL}/me/notification-preferences`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch all preferences');
    }
  },

  getNewsletterSubscriptions: async () => {
    try {
      const response = await axios.get(`${API_URL}/me/newsletters`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch newsletter subscriptions');
    }
  },

  subscribeToNewsletter: async (newsletterId: string, data: {
    email?: boolean;
    sms?: boolean;
    push?: boolean;
  }) => {
    try {
      const response = await axios.post(`${API_URL}/me/newsletters/${newsletterId}/subscribe`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to subscribe to newsletter');
    }
  },

  unsubscribeFromNewsletter: async (newsletterId: string) => {
    try {
      const response = await axios.delete(`${API_URL}/me/newsletters/${newsletterId}/unsubscribe`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to unsubscribe from newsletter');
    }
  },

  // Admin APIs
  getAllUsersPreferences: async () => {
    try {
      const response = await axios.get(`${API_URL}/me/admin/users-preferences`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch users');
    }
  },

  updateUserNotificationPreference: async (userId: string, notificationType: string, data: {
    email?: boolean;
    sms?: boolean;
    push?: boolean;
  }) => {
    try {
      const response = await axios.patch(`${API_URL}/me/admin/users/${userId}/notification-preferences/${notificationType}`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update user preference');
    }
  },
};

export const orderService = {
  create: async (data: {
    orderNumber: string;
    userId: string;
  }) => {
    try {
      const response = await axios.post(`${API_URL}/orders`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create order');
    }
  },

  list: async () => {
    try {
      const response = await axios.get(`${API_URL}/orders`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch orders');
    }
  },

  get: async (orderId: string) => {
    try {
      const response = await axios.get(`${API_URL}/orders/${orderId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch order');
    }
  },

  getMyOrders: async () => {
    try {
      const response = await axios.get(`${API_URL}/orders/my-orders`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch your orders');
    }
  },

  updateStatus: async (orderId: string, status: string) => {
    try {
      const response = await axios.patch(`${API_URL}/orders/${orderId}/status`, { status });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update order status');
    }
  },

  delete: async (orderId: string) => {
    try {
      const response = await axios.delete(`${API_URL}/orders/${orderId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete order');
    }
  },
};

export const newsletterService = {
  list: async () => {
    try {
      const response = await axios.get(`${API_URL}/newsletters`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch newsletters');
    }
  },

  get: async (id: string) => {
    try {
      const response = await axios.get(`${API_URL}/newsletters/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch newsletter');
    }
  },

  create: async (data: {
    slug: string;
    title: string;
    description?: string;
    isActive?: boolean;
  }) => {
    try {
      const response = await axios.post(`${API_URL}/newsletters`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create newsletter');
    }
  },

  update: async (id: string, data: {
    title?: string;
    description?: string;
    isActive?: boolean;
  }) => {
    try {
      const response = await axios.patch(`${API_URL}/newsletters/${id}`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update newsletter');
    }
  },

  delete: async (id: string) => {
    try {
      const response = await axios.delete(`${API_URL}/newsletters/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete newsletter');
    }
  },

  publish: async (id: string) => {
    try {
      const response = await axios.post(`${API_URL}/newsletters/${id}/publish`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to publish newsletter');
    }
  },

  getSubscribers: async (id: string) => {
    try {
      const response = await axios.get(`${API_URL}/newsletters/${id}/subscribers`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch subscribers');
    }
  },

  getLogs: async (id: string) => {
    try {
      const response = await axios.get(`${API_URL}/newsletters/${id}/logs`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch newsletter logs');
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
    role?: string;
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
    role?: string;
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
      console.log(error);
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
