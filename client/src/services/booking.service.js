import api from './api';

const createBooking = async (payload) => {
  const { data } = await api.post('/bookings', payload);
  return data.data.booking;
};

const getMyBookings = async (params) => {
  const { data } = await api.get('/bookings/me', { params });
  return data.data;
};

const getBookingById = async (id) => {
  const { data } = await api.get(`/bookings/${id}`);
  return data.data.booking;
};

const updateBookingStatus = async (id, status, cancellationReason) => {
  const { data } = await api.patch(`/bookings/${id}/status`, { status, cancellationReason });
  return data.data.booking;
};

export default { createBooking, getMyBookings, getBookingById, updateBookingStatus };
