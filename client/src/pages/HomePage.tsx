import { useAuth } from '../context/AuthContext';
import '../styles/HomePage.css';


const HomePage: React.FC = () => {
    const { user, isAuthenticated, isLoading } = useAuth();

    // Показываем загрузку пока проверяется токен
    if (isLoading) {
        return (
            <div className="home-page">
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: 'calc(100vh - var(--header-height))',
                    color: 'var(--light-color)'
                }}>
                    Загрузка...
                </div>
            </div>
        );
    }

    // Лендинг для неавторизованных
    if (!isAuthenticated) {
        return (
            <div className="home-page">
                <div className="home-hero">
                    <div className="hero-content">
                        <h1 className="hero-title">
                            Слушай музыку. <br />
                            Делись треками. <br />
                            <span className="hero-highlight">Открывай новое.</span>
                        </h1>
                        <p className="hero-subtitle">
                            Присоединяйся к сообществу музыкантов и слушателей
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // Дашборд для авторизованных
    return (
        <div className="home-page">
            <div className="home-header">
                <h1>Привет, {user?.username}! 👋</h1>
                <p className="home-subtitle">Добро пожаловать обратно</p>
            </div>

            <div className="profile-section">
                <div className="profile-card">
                    <div className="profile-avatar">
                        {user?.avatar_url ? (
                            <img src={user.avatar_url} alt={user.username} />
                        ) : (
                            <div className="profile-avatar-placeholder">
                                {user?.username?.charAt(0).toUpperCase()}
                            </div>
                        )}
                    </div>

                    <div className="profile-info">
                        <h2>{user?.username}</h2>
                        <p className="profile-email">{user?.email}</p>

                        <div className="profile-badges">
                            {user?.is_artist && (
                                <span className="badge badge-artist">
                  🎵 Артист
                </span>
                            )}
                            <span className="badge badge-member">
                Участник с {new Date(user?.created_at || '').toLocaleDateString('ru-RU', {
                                year: 'numeric',
                                month: 'long'
                            })}
              </span>
                        </div>
                    </div>
                </div>

                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon">🎵</div>
                        <div className="stat-value">0</div>
                        <div className="stat-label">Треков в библиотеке</div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">📝</div>
                        <div className="stat-value">0</div>
                        <div className="stat-label">Плейлистов</div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">⏱️</div>
                        <div className="stat-value">0ч</div>
                        <div className="stat-label">Прослушано</div>
                    </div>
                </div>
            </div>

            <div className="content-section">
                <h3>Рекомендации для вас</h3>
                <p className="content-placeholder">
                    Здесь будут отображаться рекомендованные треки и плейлисты
                </p>
            </div>
        </div>
    );
};

export default HomePage;
