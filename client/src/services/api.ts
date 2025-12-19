import axios from 'axios';
import { type Track } from '../types'; // Импортируйте ваш тип Track

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Автоматически добавляем токен к запросам
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Обработка ошибок
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authService = {
    register: (data: { username: string; email: string; password: string }) =>
        api.post('/auth/register', data),
    login: (data: { email: string; password: string }) =>
        api.post('/auth/login', data),
    getProfile: () =>
        api.get('/auth/profile'),
    verify: () =>
        api.get('/auth/verify'),
};

// Track API
export const trackService = {
    uploadTrack: (formData: FormData) =>
        api.post('/api/tracks/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        }),

    getTracks: (params?: { page?: number; limit?: number; search?: string; genre?: string }) =>
        api.get('/api/tracks', { params }),

    getTrackById: async (id: number | string): Promise<Track> => {
        const response = await api.get(`/api/tracks/${id}`);
        return response.data;
    },

    deleteTrack: (id: number) =>
        api.delete(`/api/tracks/${id}`),

    getStreamUrl: (id: number | string) =>
        `${API_BASE_URL}/api/tracks/${id}/stream`,

    // Новые методы для страницы трека
    getCoverUrl: (coverUrl: string | null | undefined): string => {
        if (!coverUrl) return '';
        return `${API_BASE_URL}${coverUrl}`;
    },

    // Получить треки пользователя (для статистики артиста)
    getUserTracks: async (userId: number): Promise<Track[]> => {
        const response = await api.get('/api/tracks', {
            params: { userId, limit: 100 }
        });
        return response.data;
    },
};

// User/Artist API
export const userService = {
    // Получить информацию о пользователе/артисте
    getUserById: async (userId: number) => {
        try {
            const response = await api.get(`/api/users/${userId}`);
            return response.data;
        } catch (error) {
            // Если endpoint еще не реализован, возвращаем базовую структуру
            console.warn('User endpoint not implemented, using fallback');
            return {
                id: userId,
                name: 'Unknown Artist',
                avatarUrl: null,
                followers: 0,
                tracksCount: 0,
                isFollowing: false,
            };
        }
    },

    // Подписаться/отписаться от артиста
    toggleFollow: async (userId: number) => {
        return api.post(`/api/users/${userId}/follow`);
    },
};

// Likes API
export const likeService = {
    // Лайкнуть трек
    likeTrack: async (trackId: number) => {
        return api.post(`/api/tracks/${trackId}/like`);
    },

    // Убрать лайк
    unlikeTrack: async (trackId: number) => {
        return api.delete(`/api/tracks/${trackId}/like`);
    },

    // Проверить, лайкнут ли трек
    isTrackLiked: async (trackId: number): Promise<boolean> => {
        try {
            const response = await api.get(`/api/tracks/${trackId}/is-liked`);
            return response.data.isLiked;
        } catch {
            return false;
        }
    },
};
