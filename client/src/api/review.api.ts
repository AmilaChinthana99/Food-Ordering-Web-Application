import api from './client';

export const reviewApi = {
  create: (data: any) => api.post('/reviews', data),
  reply: (reviewId: string, reply: string) => api.post(`/reviews/${reviewId}/reply`, { reply }),
};

export const favoriteApi = {
  toggle: (data: { restaurantId?: string; menuItemId?: string }) => api.post('/favorites/toggle', data),
  getFavorites: () => api.get('/favorites'),
};
