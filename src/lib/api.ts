import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api',
  withCredentials: true, // Send HttpOnly cookie with every request
  headers: { 'Content-Type': 'application/json' },
});

// Attach response interceptor to surface error messages cleanly
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message =
      err?.response?.data?.message ?? err?.message ?? 'Unknown error';
    return Promise.reject(new Error(Array.isArray(message) ? message.join(', ') : message));
  },
);

export default api;
