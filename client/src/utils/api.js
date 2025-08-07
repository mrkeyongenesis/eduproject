import axios from 'axios';

// Create axios instance
export const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle common errors
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
      
      // Only redirect if not already on login page
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// API endpoints
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
  updateProfile: (updates) => api.put('/auth/profile', updates),
};

export const usersAPI = {
  browse: (params) => api.get('/users/browse', { params }),
  getProfile: (userId) => api.get(`/users/${userId}`),
  getAvailability: (userId, params) => api.get(`/users/${userId}/availability`, { params }),
  updateAvailability: (availability) => api.put('/users/availability', { availability }),
};

export const bookingsAPI = {
  getBookings: (params) => api.get('/bookings', { params }),
  getBooking: (bookingId) => api.get(`/bookings/${bookingId}`),
  confirmBooking: (bookingId, data) => api.put(`/bookings/${bookingId}/confirm`, data),
  rejectBooking: (bookingId, data) => api.put(`/bookings/${bookingId}/reject`, data),
  completeBooking: (bookingId) => api.put(`/bookings/${bookingId}/complete`),
  addReview: (bookingId, review) => api.post(`/bookings/${bookingId}/review`, review),
};

export const paymentsAPI = {
  createPaymentIntent: (bookingData) => api.post('/payments/create-payment-intent', bookingData),
  confirmPayment: (data) => api.post('/payments/confirm-payment', data),
  refund: (data) => api.post('/payments/refund', data),
};

export default api;