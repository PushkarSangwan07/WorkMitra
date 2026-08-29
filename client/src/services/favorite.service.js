import api from './api';

const getMyFavorites = async () => {
  const { data } = await api.get('/favorites/me');
  return data.data.favorites;
};

const addFavorite = async (workerId) => {
  const { data } = await api.post(`/favorites/${workerId}`);
  return data.data.favorite;
};

const removeFavorite = async (workerId) => {
  await api.delete(`/favorites/${workerId}`);
};

export default { getMyFavorites, addFavorite, removeFavorite };
