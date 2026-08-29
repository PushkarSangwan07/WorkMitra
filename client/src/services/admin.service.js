import api from './api';

const getAnalytics = async () => {
  const { data } = await api.get('/admin/analytics');
  return data.data;
};

const getAllUsers = async (params) => {
  const { data } = await api.get('/admin/users', { params });
  return data.data;
};

const getAllWorkers = async (params) => {
  const { data } = await api.get('/admin/workers', { params });
  return data.data;
};

const getAllBookings = async (params) => {
  const { data } = await api.get('/admin/bookings', { params });
  return data.data;
};

const suspendUser = async (id) => {
  const { data } = await api.patch(`/admin/users/${id}/suspend`);
  return data.data.user;
};

const unsuspendUser = async (id) => {
  const { data } = await api.patch(`/admin/users/${id}/unsuspend`);
  return data.data.user;
};

const deleteUser = async (id) => {
  await api.delete(`/admin/users/${id}`);
};

const getVerificationRequests = async (params) => {
  const { data } = await api.get('/admin/verification-requests', { params });
  return data.data;
};

const reviewVerification = async (id, decision, note) => {
  const { data } = await api.patch(`/admin/verification-requests/${id}`, { decision, note });
  return data.data.worker;
};


const getCategories = async () => {
  const { data } = await api.get('/admin/categories');
  return data.categories || [];
};

const createCategory = async (categoryData) => {
  const { data } = await api.post('/admin/categories', categoryData);
  return data;
};

const deleteCategory = async (id) => {
  const { data } = await api.delete(`/admin/categories/${id}`);
  return data;
};

// --- NEW REVIEWS FUNCTIONS ---
const getAllReviews = async () => {
  const response = await api.get('/admin/reviews');
  return response.data;
};

const deleteReview = async (id) => {
  const response = await api.delete(`/admin/reviews/${id}`);
  return response.data;
};

const getSettings = async () => {
  const response = await api.get('/admin/settings');
  return response.data.settings;
};

const updateSettings = async (settingsData) => {
  const response = await api.patch('/admin/settings', settingsData);
  return response.data.settings;
};

const adminService = {
  // Get all reports from the database
  getAllReports: async () => {
    const response = await api.get('/admin/reports');
    return response.data.reports;
  },

  // Update a report's status (e.g., 'resolved' or 'dismissed')
  updateReportStatus: async (reportId, status) => {
    const response = await api.patch(`/admin/reports/${reportId}`, { status });
    return response.data;
  },

  // (Optional) Ban a worker directly from the report screen
  banWorker: async (workerId) => {
    const response = await api.post(`/admin/workers/${workerId}/ban`);
    return response.data;
  },

  syncCategories: async () => {
    const { data } = await api.post('/admin/categories/sync');
    return data;
  }
};

// --- FINANCIALS ---
const getFinancials = async () => {
  const { data } = await api.get('/admin/financials');
  return data;
};

const getRevenueLedger = async () => {
  const { data } = await api.get('/admin/revenue');
  return data;
};



export default {
  getAnalytics,
  getAllUsers,
  getAllWorkers,
  getAllBookings,
  suspendUser,
  unsuspendUser,
  deleteUser,
  getVerificationRequests,
  reviewVerification,
  getAllReports: adminService.getAllReports,
  updateReportStatus: adminService.updateReportStatus,
  banWorker: adminService.banWorker,
  syncCategories: adminService.syncCategories,
  getAllReviews,
  deleteReview,
  getCategories,
  createCategory,
  deleteCategory,
  getSettings,
  updateSettings,
  getFinancials,
  getRevenueLedger

};
