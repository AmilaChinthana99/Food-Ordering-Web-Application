import api from './client';

export const couponApi = {
  validate: (data: { code: string; subtotal: number }) => api.post('/coupons/validate', data),
  getCoupons: () => api.get('/coupons'),
  create: (data: any) => api.post('/coupons', data),
  delete: (id: string) => api.delete(`/coupons/${id}`),
};
