import axios from 'axios';

// Base API instance pointing to the Express backend server
const API = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 8000,
});

// Request interceptor: Attach JWT token from localStorage if logged in
API.interceptors.request.use(
  (config) => {
    const userInfo = localStorage.getItem('agrohub_user');
    if (userInfo) {
      try {
        const parsed = JSON.parse(userInfo);
        if (parsed.token) {
          config.headers.Authorization = `Bearer ${parsed.token}`;
        }
      } catch (e) {
        console.error('Error parsing agrohub_user token', e);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Server & Health APIs
export const checkServerHealth = async () => {
  const response = await API.get('/health');
  return response.data;
};

// Authentication APIs
export const registerUserApi = async (userData) => {
  const response = await API.post('/auth/register', userData);
  return response.data;
};

export const loginUserApi = async (credentials) => {
  const response = await API.post('/auth/login', credentials);
  return response.data;
};

export const getUserProfileApi = async () => {
  const response = await API.get('/auth/profile');
  return response.data;
};

export const updateUserProfileApi = async (profileData) => {
  const response = await API.put('/auth/profile', profileData);
  return response.data;
};

// Product APIs
export const getProductsApi = async (category = '') => {
  const url = category ? `/products?category=${encodeURIComponent(category)}` : '/products';
  const response = await API.get(url);
  return response.data;
};

export const getProductByIdApi = async (id) => {
  const response = await API.get(`/products/${id}`);
  return response.data;
};

export const createProductApi = async (productData) => {
  const response = await API.post('/products', productData);
  return response.data;
};

export const updateProductApi = async (id, productData) => {
  const response = await API.put(`/products/${id}`, productData);
  return response.data;
};

export const deleteProductApi = async (id) => {
  const response = await API.delete(`/products/${id}`);
  return response.data;
};

// Machinery APIs
export const getMachineryApi = async (category = '', search = '') => {
  const params = new URLSearchParams();
  if (category && category !== 'All') params.append('category', category);
  if (search && search.trim() !== '') params.append('search', search.trim());
  const queryString = params.toString() ? `?${params.toString()}` : '';
  const response = await API.get(`/machinery${queryString}`);
  return response.data;
};

export const getMachineryByIdApi = async (id) => {
  const response = await API.get(`/machinery/${id}`);
  return response.data;
};

export const createMachineryApi = async (machineryData) => {
  const response = await API.post('/machinery', machineryData);
  return response.data;
};

export const updateMachineryApi = async (id, machineryData) => {
  const response = await API.put(`/machinery/${id}`, machineryData);
  return response.data;
};

export const deleteMachineryApi = async (id) => {
  const response = await API.delete(`/machinery/${id}`);
  return response.data;
};

// Worker APIs
export const getWorkersApi = async (skill = '', search = '', location = '') => {
  const params = new URLSearchParams();
  if (skill && skill !== 'All') params.append('skill', skill);
  if (search && search.trim() !== '') params.append('search', search.trim());
  if (location && location.trim() !== '') params.append('location', location.trim());
  const queryString = params.toString() ? `?${params.toString()}` : '';
  const response = await API.get(`/workers${queryString}`);
  return response.data;
};

export const getWorkerByIdApi = async (id) => {
  const response = await API.get(`/workers/${id}`);
  return response.data;
};

export const createWorkerApi = async (workerData) => {
  const response = await API.post('/workers', workerData);
  return response.data;
};

export const deleteWorkerApi = async (id) => {
  const response = await API.delete(`/workers/${id}`);
  return response.data;
};

// Expense Tracker APIs
export const getExpensesApi = async (category = '', search = '', startDate = '', endDate = '') => {
  const params = new URLSearchParams();
  if (category && category !== 'All') params.append('category', category);
  if (search && search.trim() !== '') params.append('search', search.trim());
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  const queryString = params.toString() ? `?${params.toString()}` : '';
  const response = await API.get(`/expenses${queryString}`);
  return response.data;
};

export const getExpenseSummaryApi = async () => {
  const response = await API.get('/expenses/summary');
  return response.data;
};

export const createExpenseApi = async (expenseData) => {
  const response = await API.post('/expenses', expenseData);
  return response.data;
};

export const updateExpenseApi = async (id, expenseData) => {
  const response = await API.put(`/expenses/${id}`, expenseData);
  return response.data;
};

export const deleteExpenseApi = async (id) => {
  const response = await API.delete(`/expenses/${id}`);
  return response.data;
};

// Farm Inventory APIs
export const getInventoryApi = async (category = '', search = '', lowStock = false) => {
  const params = new URLSearchParams();
  if (category && category !== 'All') params.append('category', category);
  if (search && search.trim() !== '') params.append('search', search.trim());
  if (lowStock) params.append('lowStock', 'true');
  const queryString = params.toString() ? `?${params.toString()}` : '';
  const response = await API.get(`/inventory${queryString}`);
  return response.data;
};

export const getInventorySummaryApi = async () => {
  const response = await API.get('/inventory/summary');
  return response.data;
};

export const createInventoryApi = async (inventoryData) => {
  const response = await API.post('/inventory', inventoryData);
  return response.data;
};

export const updateInventoryApi = async (id, inventoryData) => {
  const response = await API.put(`/inventory/${id}`, inventoryData);
  return response.data;
};

export const deleteInventoryApi = async (id) => {
  const response = await API.delete(`/inventory/${id}`);
  return response.data;
};

// Weather API
export const getWeatherApi = async (city = 'Ludhiana') => {
  const response = await API.get(`/weather?city=${encodeURIComponent(city)}`);
  return response.data;
};

// Crop Sales & Income APIs
export const getIncomesApi = async (search = '', startDate = '', endDate = '') => {
  const params = new URLSearchParams();
  if (search && search.trim() !== '') params.append('search', search.trim());
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  const queryString = params.toString() ? `?${params.toString()}` : '';
  const response = await API.get(`/income${queryString}`);
  return response.data;
};

export const getFinancialReportApi = async () => {
  const response = await API.get('/income/financial-report');
  return response.data;
};

export const createIncomeApi = async (incomeData) => {
  const response = await API.post('/income', incomeData);
  return response.data;
};

export const updateIncomeApi = async (id, incomeData) => {
  const response = await API.put(`/income/${id}`, incomeData);
  return response.data;
};

export const deleteIncomeApi = async (id) => {
  const response = await API.delete(`/income/${id}`);
  return response.data;
};

// Admin Dashboard APIs
export const getAdminStatsApi = async () => {
  const response = await API.get('/admin/stats');
  return response.data;
};

export const getAdminUsersApi = async () => {
  const response = await API.get('/admin/users');
  return response.data;
};

export const deleteAdminUserApi = async (id) => {
  const response = await API.delete(`/admin/users/${id}`);
  return response.data;
};

export const getAdminListingsApi = async () => {
  const response = await API.get('/admin/listings');
  return response.data;
};

export const deleteAdminProductApi = async (id) => {
  const response = await API.delete(`/admin/products/${id}`);
  return response.data;
};

export const deleteAdminMachineryApi = async (id) => {
  const response = await API.delete(`/admin/machinery/${id}`);
  return response.data;
};

export const deleteAdminWorkerApi = async (id) => {
  const response = await API.delete(`/admin/workers/${id}`);
  return response.data;
};

// Image Upload API
export const uploadImageApi = async (file) => {
  const formData = new FormData();
  formData.append('image', file);

  const response = await API.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export default API;
