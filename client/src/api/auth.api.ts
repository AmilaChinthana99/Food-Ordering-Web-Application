import api from './client';

export const authApi = {
  login: (data: any) => api.post('/auth/login', data),
  register: (data: any) => api.post('/auth/register', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data: any) => api.put('/auth/profile', data),
  getAddresses: () => api.get('/auth/addresses'),
  addAddress: (data: any) => api.post('/auth/addresses', data),
  deleteAddress: (id: string) => api.delete(`/auth/addresses/${id}`),
};
