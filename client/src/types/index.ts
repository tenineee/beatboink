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