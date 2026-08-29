import api from './api';

const getConversations = async () => {
  const { data } = await api.get('/chat/conversations');
  return data.data.conversations;
};

const getMessages = async (otherUserId, params) => {
  const { data } = await api.get(`/chat/messages/${otherUserId}`, { params });
  return data.data;
};

const sendMessage = async (receiverId, text) => {
  const { data } = await api.post('/chat/messages', { receiverId, text });
  return data.data.message;
};

export default { getConversations, getMessages,sendMessage };
