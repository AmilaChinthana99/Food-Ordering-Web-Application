import api from './client';

export const analyticsApi = {
  getPlatformAnalytics: () => api.get('/analytics'),
  exportCSV: () => {
    window.open('/api/v1/analytics/export-orders', '_blank');
  },
};
