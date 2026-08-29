import api from './api';

const getMyNotifications = async (params) => {
  const { data } = await api.get('/notifications/me', { params });
  return data.data;
};

const markAsRead = async (id) => {
  const { data } = await api.patch(`/notifications/${id}/read`);
  return data.data.notification;
};

const markAllAsRead = async () => {
  await api.patch('/notifications/read-all');
};

export default { getMyNotifications, markAsRead, markAllAsRead };
