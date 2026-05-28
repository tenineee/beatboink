import { type Track } from '../../types';
import './TrackRow.css';

interface TrackRowProps {
    track: Track;
    onClick: () => void;
}

export const TrackRow: React.FC<TrackRowProps> = ({ track, onClick }) => {
    const coverUrl = track.cover_url
        ? `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}${track.cover_url}`
        : '';

    return (
        <div className="track-row" onClick={onClick}>
            <div className="track-row-cover">
                {coverUrl ? (
                    <img src={coverUrl} alt={track.title} />
                ) : (
                    <div className="track-row-placeholder">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path
                                d="M12 3V13.55C11.41 13.21 10.73 13 10 13C7.79 13 6 14.79 6 17C6 19.21 7.79 21 10 21C12.21 21 14 19.21 14 17V7H18V3H12Z"
                                fill="currentColor"
                            />
                        </svg>
                    </div>
                )}
                <div className="track-row-play">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M8 5V19L19 12L8 5Z" fill="currentColor" />
                    </svg>
                </div>
            </div>
            <div className="track-row-info">
                <div className="track-row-title">{track.title}</div>
                <div className="track-row-artist">{track.artist}</div>
            </div>
        </div>
    );
};
