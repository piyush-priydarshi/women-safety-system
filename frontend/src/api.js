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

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

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
  cancelSOS: () => request('/api/sos/cancel', {
    method: 'POST',
  }),
  removeContact: (id) => request(`/api/contacts/${id}`, {
    method: 'DELETE',
  }),
};
