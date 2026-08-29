import api from './api';

const searchWorkers = async (params) => {
  const { data } = await api.get('/workers', { params });
  return data.data;
};

const getWorkerById = async (id) => {
  const { data } = await api.get(`/workers/${id}`);
  return data.data.worker;
};

const getMyProfile = async () => {
  const { data } = await api.get('/workers/me/profile');
  return data.data.worker;
};

const updateMyProfile = async (payload) => {
  const { data } = await api.patch('/workers/me/profile', payload);
  return data.data.worker;
};

const updateAvailability = async (availability) => {
  const { data } = await api.patch('/workers/me/availability', { availability });
  return data.data.worker;
};

const uploadAvatar = async (file) => {
  const formData = new FormData();
  formData.append('avatar', file);
  const { data } = await api.post('/workers/me/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.data.avatar;
};

const uploadWorkImages = async (files) => {
  const formData = new FormData();
  Array.from(files).forEach((f) => formData.append('images', f));
  const { data } = await api.post('/workers/me/work-images', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.data.workImages;
};

const deleteWorkImage = async (publicId) => {
  const { data } = await api.delete(`/workers/me/work-images/${encodeURIComponent(publicId)}`);
  return data.data.workImages;
};

const submitVerification = async (files) => {
  const formData = new FormData();
  Array.from(files).forEach((f) => formData.append('documents', f));
  const { data } = await api.post('/workers/me/verification', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.data.worker;
};

const getMyWallet = async () => {
  const { data } = await api.get('/workers/wallet');
  return data;
};


const createPaymentOrder = async () => {
  // Notice this matches your backend route perfectly now!
  const { data } = await api.post('/workers/payment/create-order'); 
  return data.order;
};

const verifyPayment = async (paymentData) => {
  // Matches your backend route perfectly!
  const { data } = await api.post('/workers/payment/verify', paymentData);
  return data;
};

export default {
  searchWorkers,
  getWorkerById,
  getMyProfile,
  updateMyProfile,
  updateAvailability,
  uploadAvatar,
  uploadWorkImages,
  deleteWorkImage,
  submitVerification,
  getMyWallet,
  createPaymentOrder,
  verifyPayment
};
