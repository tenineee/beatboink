import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { trackService } from '../services/api';
import { type Track } from '../types';
import { extractColorsFromImage, updateCSSVariables } from '../utils/colorExtractor';
import '../styles/TrackPlayerPage.css';


const TrackPlayerPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const audioRef = useRef<HTMLAudioElement>(null);
    const coverGlowRef = useRef<HTMLDivElement>(null);
    const animationFrameRef = useRef<number | null>(null); // ← Новое

    const [track, setTrack] = useState<Track | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [coverColors, setCoverColors] = useState({
        vibrant: '#FDA026',
        light: '#FFB84D',
        dark: '#C67D1F'
    });

    // Плавное обновление прогресс-бара через requestAnimationFrame
    const updateProgress = () => {
        if (audioRef.current && isPlaying) {
            setCurrentTime(audioRef.current.currentTime);
            animationFrameRef.current = requestAnimationFrame(updateProgress);
        }
    };

    // Запуск/остановка анимации при изменении isPlaying
    useEffect(() => {
        if (isPlaying) {
            animationFrameRef.current = requestAnimationFrame(updateProgress);
        } else {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        }

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [isPlaying]);

    useEffect(() => {
        loadTrack();
        return () => {
            // Очистка при размонтировании
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
            // Восстанавливаем дефолтные цвета при выходе
            document.documentElement.style.setProperty('--accent-color', '#FDA026');
            document.documentElement.style.setProperty('--accent-color-light', '#FFB84D');
            document.documentElement.style.setProperty('--accent-color-dark', '#FFB84D');
        };
    }, [id]);

    const loadTrack = async () => {
        try {
            const response = await trackService.getTrackById(id!);
            setTrack(response.data);
            setIsLoading(false);

            // Извлекаем цвета из обложки
            if (response.data.cover_url) {
                const coverUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}${response.data.cover_url}`;
                try {
                    const colors = await extractColorsFromImage(coverUrl);
                    setCoverColors(colors);
                    updateCSSVariables(colors);
                } catch (err) {
                    console.error('Failed to extract colors:', err);
                }
            }
        } catch (err) {
            console.error('Error loading track:', err);
            setIsLoading(false);
        }
    };

    const togglePlay = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const handleLoadedMetadata = () => {
        if (audioRef.current) {
            setDuration(audioRef.current.duration);
        }
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const time = Number(e.target.value);
        setCurrentTime(time);
        if (audioRef.current) {
            audioRef.current.currentTime = time;
        }
    };

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handlePrevious = () => {
        console.log('Previous track');
    };

    const handleNext = () => {
        console.log('Next track');
    };

    const toggleRepeat = () => {
        if (audioRef.current) {
            audioRef.current.loop = !audioRef.current.loop;
        }
    };

    const toggleLike = () => {
        console.log('Toggle like');
    };

    const handleFullscreenExit = () => {
        navigate(-1);
    };

    const handleEnded = () => {
        setIsPlaying(false);
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
        }
    };

    if (isLoading) {
        return (
            <div className="track-player-page">
                <div className="player-loading">Загрузка...</div>
            </div>
        );
    }

    if (!track) {
        return (
            <div className="track-player-page">
                <div className="player-loading">Трек не найден</div>
            </div>
        );
    }

    const streamUrl = trackService.getStreamUrl(track.id);
    const coverUrl = track.cover_url
        ? `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}${track.cover_url}`
        : '';

    const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

    return (
        <div className="track-player-page">
            {/* Exit fullscreen button */}
            <button className="player-exit-btn" onClick={handleFullscreenExit}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path
                        d="M5 16H8V19H10V14H5V16ZM8 8H5V10H10V5H8V8ZM14 19H16V16H19V14H14V19ZM16 8V5H14V10H19V8H16Z"
                        fill="currentColor"
                    />
                </svg>
            </button>

            {/* Player content */}
            <div className="player-content">
                {/* Cover with glow */}
                <div className="player-cover-wrapper">
                    {/* Glow effect behind cover */}
                    <div
                        className="player-cover-glow"
                        ref={coverGlowRef}
                        style={{
                            background: coverUrl
                                ? `url(${coverUrl})`
                                : `radial-gradient(circle, ${coverColors.vibrant}80, transparent)`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                        }}
                    />

                    <div className="player-cover">
                        {coverUrl ? (
                            <img src={coverUrl} alt={track.title} />
                        ) : (
                            <div className="player-cover-placeholder">
                                <svg width="120" height="120" viewBox="0 0 24 24" fill="none">
                                    <path
                                        d="M12 3V13.55C11.41 13.21 10.73 13 10 13C7.79 13 6 14.79 6 17C6 19.21 7.79 21 10 21C12.21 21 14 19.21 14 17V7H18V3H12Z"
                                        fill="currentColor"
                                    />
                                </svg>
                            </div>
                        )}
                    </div>
                </div>

                {/* Track info */}
                <div className="player-info">
                    <h1 className="player-title">{track.title}</h1>
                    <p className="player-artist">{track.artist}</p>
                </div>

                {/* Progress bar */}
                <div className="player-progress-section">
                    <input
                        type="range"
                        min="0"
                        max={duration || 0}
                        value={currentTime}
                        onChange={handleSeek}
                        className="player-progress-bar"
                        style={{
                            background: `linear-gradient(to right, ${coverColors.vibrant} 0%, ${coverColors.light} ${progressPercent}%, rgba(255, 255, 255, 0.1) ${progressPercent}%, rgba(255, 255, 255, 0.1) 100%)`
                        }}
                    />
                    <div className="player-time">
                        <span>{formatTime(currentTime)}</span>
                        <span>{formatTime(duration)}</span>
                    </div>
                </div>

                {/* Controls */}
                <div className="player-controls">
                    <button className="player-btn player-btn-secondary">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M19 13H13V19H11V13H5V11H11V5H13V11H19V13Z" fill="currentColor" />
                        </svg>
                    </button>

                    <button className="player-btn player-btn-secondary" onClick={toggleRepeat}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path
                                d="M7 7H17V10L21 6L17 2V5H5V11H7V7ZM17 17H7V14L3 18L7 22V19H19V13H17V17Z"
                                fill="currentColor"
                            />
                        </svg>
                    </button>

                    <button className="player-btn player-btn-secondary" onClick={handlePrevious}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M6 6H8V18H6V6ZM9.5 12L18 6V18L9.5 12Z" fill="currentColor" />
                        </svg>
                    </button>

                    <button className="player-btn player-btn-primary" onClick={togglePlay}>
                        {isPlaying ? (
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                                <path d="M6 4H10V20H6V4ZM14 4H18V20H14V4Z" fill="currentColor" />
                            </svg>
                        ) : (
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                                <path d="M8 5V19L19 12L8 5Z" fill="currentColor" />
                            </svg>
                        )}
                    </button>

                    <button className="player-btn player-btn-secondary" onClick={handleNext}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M6 18L14.5 12L6 6V18ZM16 6H18V18H16V6Z" fill="currentColor" />
                        </svg>
                    </button>

                    <button className="player-btn player-btn-secondary" onClick={toggleLike}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path
                                d="M12 21.35L10.55 20.03C5.4 15.36 2 12.28 2 8.5C2 5.42 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.09C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.42 22 8.5C22 12.28 18.6 15.36 13.45 20.04L12 21.35Z"
                                fill="currentColor"
                            />
                        </svg>
                    </button>

                    <button className="player-btn player-btn-secondary">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path
                                d="M12 8C13.1 8 14 7.1 14 6C14 4.9 13.1 4 12 4C10.9 4 10 4.9 10 6C10 7.1 10.9 8 12 8ZM12 10C10.9 10 10 10.9 10 12C10 13.1 10.9 14 12 14C13.1 14 14 13.1 14 12C14 10.9 13.1 10 12 10ZM12 16C10.9 16 10 16.9 10 18C10 19.1 10.9 20 12 20C13.1 20 14 19.1 14 18C14 16.9 13.1 16 12 16Z"
                                fill="currentColor"
                            />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Audio element */}
            <audio
                ref={audioRef}
                src={streamUrl}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={handleEnded}
            />
        </div>
    );
};

export default TrackPlayerPage;
