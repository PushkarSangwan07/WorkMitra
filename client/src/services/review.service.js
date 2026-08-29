import api from './api';

const createReview = async (payload) => {
  const { data } = await api.post('/reviews', payload);
  return data.data.review;
};

const getWorkerReviews = async (workerId, params) => {
  const { data } = await api.get(`/reviews/worker/${workerId}`, { params });
  return data.data;
};

const updateReview = async (id, payload) => {
  const { data } = await api.patch(`/reviews/${id}`, payload);
  return data.data.review;
};

const deleteReview = async (id) => {
  await api.delete(`/reviews/${id}`);
};

export default { createReview, getWorkerReviews, updateReview, deleteReview };
