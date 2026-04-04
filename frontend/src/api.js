const BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000";

const request = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });
  } catch (error) {
    console.error("Network Error:", error);
    throw new Error('Network failure. Please check your connection.');
  }

  if (response.status === 401 || response.status === 403) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/auth';
    throw new Error('Session expired, please login again');
  }

  let data;
  try {
    data = await response.json();
  } catch (err) {
    throw new Error('Invalid response format');
  }

  if (!response.ok) {
    throw new Error(data.message || data.error || 'Something went wrong');
  }

  return data;
};

export const api = {
  login: (credentials) => request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  }),
  register: (userData) => request('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),
  getContacts: () => request('/api/contacts/'),
  addContact: (contactData) => request('/api/contacts/', {
    method: 'POST',
    body: JSON.stringify(contactData),
  }),
  triggerSOS: () => request('/api/sos/trigger', {
    method: 'POST',
  }),
  getSOSHistory: () => request('/api/sos/history'),
  cancelSOS: () => request('/api/sos/cancel', {
    method: 'POST',
  }),
  updateLocation: (coords) => request('/api/location/update', {
    method: 'POST',
    body: JSON.stringify(coords),
  }),
  removeContact: (id) => request(`/api/contacts/${id}`, {
    method: 'DELETE',
  }),
};
