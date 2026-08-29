import api from './api';

const register = async (payload) => {
  const { data } = await api.post('/auth/register', payload);
  return data.data; // { user, accessToken }
};

const login = async (payload) => {
  const { data } = await api.post('/auth/login', payload);
  return data.data; // { user, accessToken }
};

const logout = async () => {
  await api.post('/auth/logout');
};

const getMe = async () => {
  const { data } = await api.get('/auth/me');
  return data.data.user;
};

const forgotPassword = async (email) => {
  const { data } = await api.post('/auth/forgot-password', { email });
  return data.message;
};

const resetPassword = async (token, password) => {
  const { data } = await api.post('/auth/reset-password', { token, password });
  return data.message;
};

const refresh = async () => {
  const { data } = await api.post('/auth/refresh');
  return data.data.accessToken;
};

export default {
  register,
  login,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
  refresh,
};
