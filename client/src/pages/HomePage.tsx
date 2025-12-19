import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { trackService } from '../services/api';
import { type Track } from '../types';
import '../styles/HomePage.css';


import { usePlayer } from '../context/PlayerContext';
import { TrackRow } from '../components/track/TrackRow';

const HomePage: React.FC = () => {
    const { isAuthenticated } = useAuth();
    const { playPlaylist } = usePlayer();
    const [recentTracks, setRecentTracks] = useState<Track[]>([]);
    const [editorTracks, setEditorTracks] = useState<Track[]>([]);
    const [favoriteTracks, setFavoriteTracks] = useState<Track[]>([]);
    const [historyTracks, setHistoryTracks] = useState<Track[]>([]);
    const [loading, setLoading] = useState(true);

    const recentScrollRef = useRef<HTMLDivElement>(null);
    const editorScrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        loadTracks();
    }, []);

    const loadTracks = async () => {
        try {
            const response = await trackService.getTracks({ limit: 20 });
            const tracks = response.data;

            // Разделяем треки на разные категории
            setRecentTracks(tracks.slice(0, 10));
            setEditorTracks(tracks.slice(5, 15));
            setFavoriteTracks(tracks.slice(2, 8));
            setHistoryTracks(tracks.slice(0, 5));
        } catch (err) {
            console.error('Error loading tracks:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleTrackClick = (tracks: Track[], index: number) => {
        playPlaylist(tracks, index);
    };

    const scroll = (ref: React.RefObject<HTMLDivElement | null>, direction: 'left' | 'right') => {
        if (ref.current) {
            const scrollAmount = direction === 'left' ? -400 : 400;
            ref.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    if (loading) {
        return (
            <div className="home-page">
                <div className="loading">Загрузка...</div>
            </div>
        );
    }

    return (
        <div className="home-page">
            {/* Прослушано недавно */}
            <section className="track-section">
                <div className="section-header">
                    <h2 className="section-title">Прослушано недавно</h2>
                    <div className="section-controls">
                        <button
                            className="scroll-btn"
                            onClick={() => scroll(recentScrollRef, 'left')}
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <path d="M15.41 7.41L14 6L8 12L14 18L15.41 16.59L10.83 12L15.41 7.41Z" fill="currentColor" />
                            </svg>
                        </button>
                        <button
                            className="scroll-btn"
                            onClick={() => scroll(recentScrollRef, 'right')}
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <path d="M8.59 16.59L10 18L16 12L10 6L8.59 7.41L13.17 12L8.59 16.59Z" fill="currentColor" />
                            </svg>
                        </button>
                    </div>
                </div>
                <div className="tracks-scroll" ref={recentScrollRef}>
                    {recentTracks.map((track, index) => (
                        <TrackRow
                            key={track.id}
                            track={track}
                            onClick={() => handleTrackClick(recentTracks, index)}
                        />
                    ))}
                </div>
            </section>

            {/* Выбор редакции */}
            <section className="track-section">
                <div className="section-header">
                    <h2 className="section-title">Выбор редакции</h2>
                    <div className="section-controls">
                        <button
                            className="scroll-btn"
                            onClick={() => scroll(editorScrollRef, 'left')}
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <path d="M15.41 7.41L14 6L8 12L14 18L15.41 16.59L10.83 12L15.41 7.41Z" fill="currentColor" />
                            </svg>
                        </button>
                        <button
                            className="scroll-btn"
                            onClick={() => scroll(editorScrollRef, 'right')}
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <path d="M8.59 16.59L10 18L16 12L10 6L8.59 7.41L13.17 12L8.59 16.59Z" fill="currentColor" />
                            </svg>
                        </button>
                    </div>
                </div>
                <div className="tracks-scroll" ref={editorScrollRef}>
                    {editorTracks.map((track, index) => (
                        <TrackRow
                            key={track.id}
                            track={track}
                            onClick={() => handleTrackClick(editorTracks, index)}
                        />
                    ))}
                </div>
            </section>

            {/* Боковая панель с избранным и историей (только для авторизованных) */}
            {isAuthenticated && (
                <aside className="sidebar-sections">
                    {/* Любимые треки */}
                    <section className="sidebar-section">
                        <h3 className="sidebar-title">Любимые треки</h3>
                        <div className="sidebar-tracks">
                            {favoriteTracks.map((track, index) => (
                                <div
                                    key={track.id}
                                    className="sidebar-track"
                                    onClick={() => handleTrackClick(favoriteTracks, index)}
                                >
                                    <div className="sidebar-track-cover">
                                        {track.cover_url ? (
                                            <img
                                                src={`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}${track.cover_url}`}
                                                alt={track.title}
                                            />
                                        ) : (
                                            <div className="sidebar-track-placeholder">
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                                    <path
                                                        d="M12 3V13.55C11.41 13.21 10.73 13 10 13C7.79 13 6 14.79 6 17C6 19.21 7.79 21 10 21C12.21 21 14 19.21 14 17V7H18V3H12Z"
                                                        fill="currentColor"
                                                    />
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                    <div className="sidebar-track-info">
                                        <div className="sidebar-track-title">{track.title}</div>
                                        <div className="sidebar-track-artist">{track.artist}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Любимые артисты */}
                    <section className="sidebar-section">
                        <h3 className="sidebar-title">Любимые артисты</h3>
                        <div className="sidebar-tracks">
                            {favoriteTracks.slice(0, 3).map((track) => (
                                <div key={track.id} className="sidebar-artist">
                                    <div className="sidebar-artist-avatar">
                                        {track.cover_url ? (
                                            <img
                                                src={`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}${track.cover_url}`}
                                                alt={track.artist}
                                            />
                                        ) : (
                                            <div className="sidebar-artist-placeholder">
                                                {track.artist.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                    <div className="sidebar-artist-info">
                                        <div className="sidebar-artist-name">{track.artist}</div>
                                        <div className="sidebar-artist-meta">🎵 Артист</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* История прослушиваний */}
                    <section className="sidebar-section">
                        <h3 className="sidebar-title">История прослушиваний</h3>
                        <div className="sidebar-tracks">
                            {historyTracks.map((track, index) => (
                                <div
                                    key={track.id}
                                    className="sidebar-track"
                                    onClick={() => handleTrackClick(historyTracks, index)}
                                >
                                    <div className="sidebar-track-cover">
                                        {track.cover_url ? (
                                            <img
                                                src={`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}${track.cover_url}`}
                                                alt={track.title}
                                            />
                                        ) : (
                                            <div className="sidebar-track-placeholder">
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                                    <path
                                                        d="M12 3V13.55C11.41 13.21 10.73 13 10 13C7.79 13 6 14.79 6 17C6 19.21 7.79 21 10 21C12.21 21 14 19.21 14 17V7H18V3H12Z"
                                                        fill="currentColor"
                                                    />
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                    <div className="sidebar-track-info">
                                        <div className="sidebar-track-title">{track.title}</div>
                                        <div className="sidebar-track-artist">{track.artist}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </aside>
            )}
        </div>
    );
};

export default HomePage;
