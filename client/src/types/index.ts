export interface User {
    id: number;
    username: string;
    email: string;
    avatar_url?: string;
    is_artist?: boolean;
    created_at?: string;
}

export interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (token: string) => Promise<void>;
    logout: () => void;
    updateUser: (user: User) => void;
}

export interface AuthResponse {
    token: string;
}

export interface Track {
    id: number;
    title: string;
    artist: string;
    album?: string;
    genre?: string;
    duration: number;
    audio_url: string;
    cover_url?: string;
    user_id: number;
    plays_count: number;
    created_at: string;
}
