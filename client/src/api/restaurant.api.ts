import api from './client';

export const restaurantApi = {
  getRestaurants: (params?: any) => api.get('/restaurants', { params }),
  getBySlugOrId: (identifier: string) => api.get(`/restaurants/${identifier}`),
  create: (data: any) => api.post('/restaurants', data),
  update: (id: string, data: any) => api.put(`/restaurants/${id}`, data),
  delete: (id: string) => api.delete(`/restaurants/${id}`),
};
