import api from './client';

export const menuApi = {
  getMenuItems: (params?: any) => api.get('/menu-items', { params }),
  getById: (id: string) => api.get(`/menu-items/${id}`),
  create: (data: any) => api.post('/menu-items', data),
  update: (id: string, data: any) => api.put(`/menu-items/${id}`, data),
  toggleAvailability: (id: string) => api.patch(`/menu-items/${id}/toggle-availability`),
  delete: (id: string) => api.delete(`/menu-items/${id}`),
};
