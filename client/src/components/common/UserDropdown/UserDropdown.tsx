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

                        Профиль
                    </Link>

                    <Link
                        to="/settings"
                        className="dropdown-item"
                        onClick={() => setIsOpen(false)}
                    >

                        Настройки
                    </Link>

                    {user?.is_artist && (
                        <Link
                            to="/artist-dashboard"
                            className="dropdown-item"
                            onClick={() => setIsOpen(false)}
                        >
                            Панель артиста
                        </Link>
                    )}

                    <div className="dropdown-divider" />

                    <button
                        className="dropdown-item dropdown-item-danger"
                        onClick={handleLogout}
                    >
                        Выйти из аккаунта
                    </button>
                </div>
            )}
        </div>
    );
};
