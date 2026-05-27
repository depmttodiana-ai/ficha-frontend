import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const api = axios.create({
	baseURL: API_URL,
});

function readToken(): string | null {
	if (typeof window === 'undefined') return null;
	const t = localStorage.getItem('token');
	if (t) return t;
	return Cookies.get('token') ?? null;
}

api.interceptors.request.use((config) => {
	const token = readToken();
	if (token) {
		config.headers.Authorization = `Bearer ${token}`;
	}
	return config;
});

export function getErrorDetail(err: any): string {
	if (err.response?.data?.detail) {
		const d = err.response.data.detail;
		if (Array.isArray(d)) {
			return d.map((e: any) => e.msg || e.message || String(e)).join('; ');
		}
		return String(d);
	}
	return err.message || 'Error de conexión';
}

api.interceptors.response.use(
	(res) => res,
	(error) => {
		if (error.response?.status === 401) {
			localStorage.removeItem('token');
			localStorage.removeItem('currentUser');
			Cookies.remove('token');
			if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
				window.location.href = '/login';
			}
		}
		return Promise.reject(error);
	}
);

export default api;
