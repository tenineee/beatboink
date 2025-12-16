import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { trackService } from '../services/api';
import { type Track } from '../types';
import { TrackCard } from '../components/track/TrackCard';
import '../styles/HomePage.css';

const HomePage: React.FC = () => {
    const { user, isAuthenticated, isLoading } = useAuth();
    const [tracks, setTracks] = useState<Track[]>([]);
    const [tracksLoading, setTracksLoading] = useState(true);

    useEffect(() => {
        loadTracks();
    }, []);

    const loadTracks = async () => {
        try {
            const response = await trackService.getTracks({ limit: 12 });
            setTracks(response.data);
        } catch (err) {
            console.error('Error loading tracks:', err);
        } finally {
            setTracksLoading(false);
        }
    };

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
                        <div className="hero-actions">
                            <Link to="/register" className="btn-hero-primary">
                                Начать бесплатно
                            </Link>
                            <Link to="/login" className="btn-hero-secondary">
                                Войти
                            </Link>
                        </div>
                    </div>
                    <div className="hero-illustration">
                        <div className="floating-card card-1">🎵</div>
                        <div className="floating-card card-2">🎸</div>
                        <div className="floating-card card-3">🎹</div>
                        <div className="floating-card card-4">🎧</div>
                    </div>
                </div>

                <div className="features-section">
                    <h2 className="section-title">Почему beat.boink?</h2>
                    <div className="features-grid">
                        <div className="feature-card">
                            <div className="feature-icon">🎵</div>
                            <h3>Безлимитная библиотека</h3>
                            <p>Загружай и слушай музыку без ограничений</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">👥</div>
                            <h3>Сообщество</h3>
                            <p>Находи единомышленников и делись музыкой</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">🎨</div>
                            <h3>Для артистов</h3>
                            <p>Загружай свои треки и развивай аудиторию</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">📱</div>
                            <h3>Везде с тобой</h3>
                            <p>Слушай музыку на любых устройствах</p>
                        </div>
                    </div>
                </div>

                {/* Последние треки для всех */}
                {tracks.length > 0 && (
                    <div className="tracks-section">
                        <h2 className="section-title">Популярные треки</h2>
                        <div className="tracks-grid">
                            {tracks.map((track) => (
                                <TrackCard key={track.id} track={track} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="home-page">
            <div className="home-header">
                <h1>Привет, {user?.username}! 👋</h1>
                <p className="home-subtitle">Добро пожаловать обратно</p>
            </div>

            {/* Последние треки */}
            <div className="content-section">
                <div className="section-header">
                    <h3>Последние загрузки</h3>
                    <Link to="/tracks" className="section-link">
                        Показать все
                    </Link>
                </div>

                {tracksLoading ? (
                    <div className="tracks-loading">Загрузка треков...</div>
                ) : tracks.length > 0 ? (
                    <div className="tracks-grid">
                        {tracks.map((track) => (
                            <TrackCard key={track.id} track={track} />
                        ))}
                    </div>
                ) : (
                    <div className="tracks-empty">
                        <p>Пока нет загруженных треков</p>
                        <Link to="/upload" className="btn-upload">
                            Загрузить первый трек
                        </Link>
                    </div>
                )}
            </div>

            {/* Статистика профиля */}
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
                        <div className="stat-value">{tracks.filter(t => t.user_id === user?.id).length}</div>
                        <div className="stat-label">Моих треков</div>
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
        </div>
    );
};

export default HomePage;
