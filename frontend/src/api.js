import axios from 'axios';

const api = axios.create({
<<<<<<< HEAD
    baseURL: 'http://127.0.0.1:5000/api',
});

api.interceptors.request.use((config) => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
        const { token } = JSON.parse(userInfo);
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
=======
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
>>>>>>> origin/nashwa
});

export default api;
