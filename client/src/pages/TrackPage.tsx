import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { usePlayer } from "../context/PlayerContext";
import { type Track, type Artist } from "../types/index";
import { trackService, userService, likeService } from "../services/api";
import { extractColorsFromImage, updateCSSVariables } from "../utils/colorExtractor";
import "../styles/TrackPage.css";

const TrackPage: React.FC = () => {
    const { trackId } = useParams<{ trackId: string }>();
    const navigate = useNavigate();
    const { currentTrack, isPlaying, playPlaylist, togglePlay } = usePlayer();

    const [track, setTrackData] = useState<Track | null>(null);
    const [artist, setArtist] = useState<Artist | null>(null);
    const [isLiked, setIsLiked] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchTrackData();
    }, [trackId]);

    useEffect(() => {
        if (track?.cover_url) {
            const coverUrl = trackService.getCoverUrl(track.cover_url);
            extractColorsFromImage(coverUrl)
                .then((colors) => updateCSSVariables(colors))
                .catch((err) => console.error("Failed to extract colors", err));
        }
    }, [track]);

    const fetchTrackData = async () => {
        if (!trackId) return;

        try {
            setLoading(true);
            setError(null);

            // Загружаем трек
            const trackData = await trackService.getTrackById(trackId);
            setTrackData(trackData);

            // Загружаем информацию об артисте
            const artistData = await userService.getUserById(trackData.user_id);

            // Получаем количество треков артиста
            const userTracks = await trackService.getUserTracks(trackData.user_id);

            setArtist({
                id: trackData.user_id,
                name: trackData.artist,
                avatarUrl: artistData.avatarUrl || null,
                followers: artistData.followers || 0,
                tracksCount: userTracks.length,
                isFollowing: artistData.isFollowing || false,
            });

            // Проверяем, лайкнут ли трек
            const liked = await likeService.isTrackLiked(Number(trackId));
            setIsLiked(liked);
        } catch (err) {
            console.error("Error fetching track:", err);
            setError("Не удалось загрузить трек");
        } finally {
            setLoading(false);
        }
    };

    const handlePlay = () => {
        if (!track) return;

        const isCurrentTrack = currentTrack && String(currentTrack.id) === String(track.id);

        if (isCurrentTrack) {
            togglePlay();
        } else {
            playPlaylist([track], 0);
        }
    };



    const handleLike = async () => {
        if (!track) return;

        try {
            if (isLiked) {
                await likeService.unlikeTrack(Number(track.id));
            } else {
                await likeService.likeTrack(Number(track.id));
            }
            setIsLiked(!isLiked);
        } catch (err) {
            console.error("Error toggling like:", err);
        }
    };

    const handleFollow = async () => {
        if (!artist) return;

        try {
            await userService.toggleFollow(artist.id);
            setArtist({ ...artist, isFollowing: !artist.isFollowing });
        } catch (err) {
            console.error("Error toggling follow:", err);
        }
    };

    const handleShare = async () => {
        const shareUrl = `${window.location.origin}/track/${track?.id}`;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: track?.title,
                    text: `Слушайте ${track?.title} от ${track?.artist}`,
                    url: shareUrl,
                });
            } catch (err) {
                console.log("Share cancelled");
            }
        } else {
            // Копируем в буфер обмена
            navigator.clipboard.writeText(shareUrl);
            alert("Ссылка скопирована в буфер обмена!");
        }
    };

    const formatPlays = (plays: number): string => {
        if (plays >= 1000000) return `${(plays / 1000000).toFixed(1)}M`;
        if (plays >= 1000) return `${(plays / 1000).toFixed(1)}K`;
        return plays.toString();
    };

    const getTimeAgo = (date: Date | string): string => {
        const now = new Date();
        const published = new Date(date);
        const diffDays = Math.floor((now.getTime() - published.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return "сегодня";
        if (diffDays === 1) return "вчера";
        if (diffDays < 7) return `${diffDays} дня назад`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} недели назад`;
        return `${Math.floor(diffDays / 30)} месяца назад`;
    };

    if (loading) {
        return <div className="track-page-loading">Загрузка...</div>;
    }

    if (error || !track || !artist) {
        return (
            <div className="track-page-error">
                <p>{error || "Трек не найден"}</p>
                <button onClick={() => navigate("/")}>Вернуться на главную</button>
            </div>
        );
    }

    const coverUrl = trackService.getCoverUrl(track.cover_url);
    const artistAvatarUrl = artist.avatarUrl ? trackService.getCoverUrl(artist.avatarUrl) : null;
    const isCurrentTrack = currentTrack && String(currentTrack.id) === String(track.id);

    return (
        <div className="track-page">
            <div className="track-header">
                <div className="track-header-container">
                    <div className="track-header-content">
                        <button
                            className="track-play-btn"
                            onClick={handlePlay}
                            aria-label={isPlaying && isCurrentTrack ? "Pause" : "Play"}
                        >
                            {isPlaying && isCurrentTrack ? (
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                                    <path d="M6 4H10V20H6V4ZM14 4H18V20H14V4Z" fill="currentColor" />
                                </svg>
                            ) : (
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                                    <path d="M8 5V19L19 12L8 5Z" fill="currentColor" />
                                </svg>
                            )}
                        </button>

                        <div className="track-info">
                            <div className="track-text-box">
                                <h1 className="track-title">{track.title}</h1>
                                <button
                                    className="track-artist-link"
                                    onClick={() => navigate(`/artist/${track.user_id}`)}
                                >
                                    {track.artist}
                                </button>
                            </div>

                            <div className="track-meta">
                              <span className="track-stats">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                  <path d="M8 5V19L19 12L8 5Z" fill="currentColor" />
                                </svg>
                                  {formatPlays(track.plays_count)}
                              </span>
                            </div>
                        </div>

                        <span className="track-published">Опубликовано {getTimeAgo(track.created_at)}</span>

                        {coverUrl && (
                            <div className="track-cover">
                                <img src={coverUrl} alt={track.title} />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="track-actions">
                <div className="track-actions-container">
                    <button
                        className={`action-btn ${isLiked ? "active" : ""}`}
                        onClick={handleLike}
                        aria-label="Like"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path
                                d="M12 21.35L10.55 20.03C5.4 15.36 2 12.28 2 8.5C2 5.42 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.09C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.42 22 8.5C22 12.28 18.6 15.36 13.45 20.04L12 21.35Z"
                                fill={isLiked ? "currentColor" : "none"}
                                stroke="currentColor"
                                strokeWidth="2"
                            />
                        </svg>
                    </button>

                    <button className="action-btn" aria-label="Repost">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path
                                d="M7 7H17V10L21 6L17 2V5H5V11H7V7ZM17 17H7V14L3 18L7 22V19H19V13H17V17Z"
                                fill="currentColor"
                            />
                        </svg>
                    </button>

                    <button className="action-btn" onClick={handleShare} aria-label="Share">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path
                                d="M18 16.08C17.24 16.08 16.56 16.38 16.04 16.85L8.91 12.7C8.96 12.47 9 12.24 9 12C9 11.76 8.96 11.53 8.91 11.3L15.96 7.19C16.5 7.69 17.21 8 18 8C19.66 8 21 6.66 21 5C21 3.34 19.66 2 18 2C16.34 2 15 3.34 15 5C15 5.24 15.04 5.47 15.09 5.7L8.04 9.81C7.5 9.31 6.79 9 6 9C4.34 9 3 10.34 3 12C3 13.66 4.34 15 6 15C6.79 15 7.5 14.69 8.04 14.19L15.16 18.35C15.11 18.56 15.08 18.78 15.08 19C15.08 20.61 16.39 21.92 18 21.92C19.61 21.92 20.92 20.61 20.92 19C20.92 17.39 19.61 16.08 18 16.08Z"
                                fill="currentColor"
                            />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="track-content">
                {/* Left Sidebar */}
                <aside className="track-sidebar">
                    <button
                        className="artist-avatar"
                        onClick={() => navigate(`/artist/${track.user_id}`)}
                    >
                        {artistAvatarUrl ? (
                            <img src={artistAvatarUrl} alt={artist.name} />
                        ) : (
                            <div className="artist-avatar-placeholder">
                                {artist.name.charAt(0).toUpperCase()}
                            </div>
                        )}
                    </button>

                    <div className="artist-stats">
                        <div className="stat-item">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <path
                                    d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z"
                                    fill="currentColor"
                                />
                            </svg>
                            <span>{artist.followers}</span>
                        </div>
                        <div className="stat-item">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <path
                                    d="M12 3V13.55C11.41 13.21 10.73 13 10 13C7.79 13 6 14.79 6 17C6 19.21 7.79 21 10 21C12.21 21 14 19.21 14 17V7H18V3H12Z"
                                    fill="currentColor"
                                />
                            </svg>
                            <span>{artist.tracksCount}</span>
                        </div>
                    </div>

                    <button
                        className={`follow-btn ${artist.isFollowing ? "following" : ""}`}
                        onClick={handleFollow}
                    >
                        {artist.isFollowing ? "Отписаться" : "Подписаться"}
                    </button>
                </aside>

                {/* Comments Section */}
                <section className="track-comments">
                    <div className="comments-placeholder">*БЛОК КОММЕНТАРИЕВ*</div>
                </section>
            </div>
        </div>
    );
};

export default TrackPage;
