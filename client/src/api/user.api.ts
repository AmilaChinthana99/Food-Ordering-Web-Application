import api from './client';

export const userApi = {
  getUsers: (params?: any) => api.get('/users', { params }),
  updateStatus: (id: string, data: any) => api.patch(`/users/${id}/status`, data),
};

export const analyticsApi = {
  getPlatformAnalytics: () => api.get('/analytics'),
  exportCSV: () => {
    window.open('/api/v1/analytics/export-orders', '_blank');
  },
};

export const uploadApi = {
  uploadImage: async (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    return api.post('/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};
