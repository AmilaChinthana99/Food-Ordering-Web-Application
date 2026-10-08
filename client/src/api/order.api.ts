import api from './client';

export const orderApi = {
  create: (data: any) => api.post('/orders', data),
  getOrders: (params?: any) => api.get('/orders', { params }),
  getById: (id: string) => api.get(`/orders/${id}`),
  updateStatus: (id: string, data: any) => api.patch(`/orders/${id}/status`, data),
  cancelOrder: (id: string, data?: any) => api.post(`/orders/${id}/cancel`, data),
};
