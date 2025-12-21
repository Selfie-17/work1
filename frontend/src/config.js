const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000/api'
    : 'https://work1-lz0e.onrender.com/api';

export default API_BASE_URL;
