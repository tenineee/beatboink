import { Link } from 'react-router-dom';
import { type Track } from '../../types';
import './TrackCard.css';

interface TrackCardProps {
    track: Track;
}

export const TrackCard: React.FC<TrackCardProps> = ({ track }) => {
    const coverUrl = track.cover_url
        ? `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}${track.cover_url}`
        : '';

    const formatDuration = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <Link to={`/track/${track.id}`} className="track-card">
            <div className="track-card-cover">
                {coverUrl ? (
                    <img src={coverUrl} alt={track.title} />
                ) : (
                    <div className="track-card-cover-placeholder">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                            <path
                                d="M12 3V13.55C11.41 13.21 10.73 13 10 13C7.79 13 6 14.79 6 17C6 19.21 7.79 21 10 21C12.21 21 14 19.21 14 17V7H18V3H12Z"
                                fill="var(--accent-color)"
                            />
                        </svg>
                    </div>
                )}
                <div className="track-card-play-overlay">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                        <path d="M8 5V19L19 12L8 5Z" fill="var(--accent-color)" />
                    </svg>
                </div>
            </div>
            <div className="track-card-info">
                <h3 className="track-card-title">{track.title}</h3>
                <p className="track-card-artist">{track.artist}</p>
                <div className="track-card-meta">
          <span className="track-card-plays">
            ▶ {track.plays_count.toLocaleString()}
          </span>
                    <span className="track-card-duration">
            {formatDuration(track.duration)}
          </span>
                </div>
            </div>
        </Link>
    );
};
