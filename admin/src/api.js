const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const SERVER_URL = process.env.REACT_APP_SERVER_URL || 'http://localhost:5000';

export const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${SERVER_URL}${path}`;  
};

export const fetchGems = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${BASE_URL}/gems${query ? '?' + query : ''}`);
  const data = await res.json();

  return Array.isArray(data) ? data : (data.gems || []);
};

export const fetchGem = (id) =>
  fetch(`${BASE_URL}/gems/${id}`).then(r => r.json());

export const fetchGemsByType = (gemType) =>
  fetch(`${BASE_URL}/gems/type/${encodeURIComponent(gemType)}`).then(r => r.json());

export const fetchStats = (token) =>
  fetch(`${BASE_URL}/gems/admin/stats`, {
    headers: { Authorization: `Bearer ${token}` }
  }).then(r => r.json());

export const createGem = (formData, token) =>
  fetch(`${BASE_URL}/gems`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData
  }).then(r => r.json());

export const updateGem = (id, formData, token) =>
  fetch(`${BASE_URL}/gems/${id}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: formData
  }).then(r => r.json());

export const deleteGem = (id, token) =>
  fetch(`${BASE_URL}/gems/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  }).then(r => r.json());



export const loginUser = (email, password) =>
  fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  }).then(r => r.json());

export const registerUser = (name, email, password) =>
  fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password })
  }).then(r => r.json());

export const getMe = (token) =>
  fetch(`${BASE_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` }
  }).then(r => r.json());

export const updateProfile = (data, token) =>
  fetch(`${BASE_URL}/auth/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(data)
  }).then(r => r.json());

