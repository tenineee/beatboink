import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import './UserDropdown.css';

export const UserDropdown: React.FC = () => {
    const { user, logout } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Закрытие dropdown при клике вне его области
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    const handleLogout = () => {
        setIsOpen(false);
        logout();
    };

    return (
        <div className="user-dropdown" ref={dropdownRef}>
            <button
                className="header__userNavButton"
                onClick={toggleDropdown}
                aria-expanded={isOpen}
            >
                <div className="header__userNavAvatar">
                    {user?.avatar_url ? (
                        <img src={user.avatar_url} alt={user.username} />
                    ) : (
                        user?.username?.charAt(0).toUpperCase() || 'U'
                    )}
                </div>
                <div>{user?.username || 'Пользователь'}</div>
                <div className={`header__userNavUsernameButtonIcon ${isOpen ? 'open' : ''}`}>
                    <svg viewBox="0 0 24 24" fill="none">
                        <path
                            d="M19 9l-7 7-7-7"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                        />
                    </svg>
                </div>
            </button>

            {isOpen && (
                <div className="dropdown-menu">
                    <div className="dropdown-header">
                        <div className="dropdown-user-info">
                            <div className="dropdown-username">{user?.username}</div>
                            <div className="dropdown-email">{user?.email}</div>
                        </div>
                    </div>

                    <div className="dropdown-divider" />

                    <Link
                        to="/profile"
                        className="dropdown-item"
                        onClick={() => setIsOpen(false)}
                    >
                        <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
                            <path
                                d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
                                fill="currentColor"
                            />
                        </svg>
                        Профиль
                    </Link>

                    <Link
                        to="/settings"
                        className="dropdown-item"
                        onClick={() => setIsOpen(false)}
                    >
                        <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
                            <path
                                d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94L14.4 2.81c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"
                                fill="currentColor"
                            />
                        </svg>
                        Настройки
                    </Link>

                    {user?.is_artist && (
                        <Link
                            to="/artist-dashboard"
                            className="dropdown-item"
                            onClick={() => setIsOpen(false)}
                        >
                            <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
                                <path
                                    d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"
                                    fill="currentColor"
                                />
                            </svg>
                            Панель артиста
                        </Link>
                    )}

                    <div className="dropdown-divider" />

                    <button
                        className="dropdown-item dropdown-item-danger"
                        onClick={handleLogout}
                    >
                        <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
                            <path
                                d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"
                                fill="currentColor"
                            />
                        </svg>
                        Выйти из аккаунта
                    </button>
                </div>
            )}
        </div>
    );
};
