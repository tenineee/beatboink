import {usePlayer} from "../../context/PlayerContext";
import { useState, useRef, useEffect } from "react";
import { extractColorsFromImage, updateCSSVariables } from "../../utils/colorExtractor";
import "./BottomPlayer.css";

const BottomPlayer: React.FC = () => {
    const {
        currentTrack,
        isPlaying,
        currentTime,
        duration,
        volume,
        isRepeat,
        togglePlay,
        nextTrack,
        previousTrack,
        seekTo,
        setVolume,
        toggleRepeat,
        toggleFullscreen,
    } = usePlayer();

    const [showVolumePopover, setShowVolumePopover] = useState(false);
    const volumeRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (currentTrack?.cover_url) {
            const coverUrl = `${import.meta.env.VITE_API_URL ?? "http://localhost:5001"}${currentTrack.cover_url}`;
            extractColorsFromImage(coverUrl)
                .then((colors) => updateCSSVariables(colors))
                .catch((err) => console.error("Failed to extract colors", err));
        }
    }, [currentTrack]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (volumeRef.current && !volumeRef.current.contains(event.target as Node)) {
                setShowVolumePopover(false);
            }
        };

        if (showVolumePopover) document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [showVolumePopover]);

    if (!currentTrack) return null;

    const cover_url = currentTrack.cover_url
        ? `${import.meta.env.VITE_API_URL ?? "http://localhost:5001"}${currentTrack.cover_url}`
        : "";

    const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

    const formatTime = (seconds: number): string => {
        if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const t = Number(e.target.value);
        if (!Number.isNaN(t)) seekTo(t);
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setVolume(Number(e.target.value));
    };

    const progressBackground = `linear-gradient(to right,
    var(--accent-color) 0%,
    var(--accent-color-light) ${progressPercent}%,
    rgba(255,255,255,0.18) ${progressPercent}%,
    rgba(255,255,255,0.18) 100%)`;

    return (
        <div className="bottom-player">
            <div className="bottom-player_container">
                <div className="bp__row">
                    {/* LEFT: Controls */}
                    <div className="bp__controls" aria-label="Player controls">
                        <button className="bp__iconBtn" type="button" onClick={previousTrack} aria-label="Previous">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                                <path d="M6 6H8V18H6V6ZM9.5 12L18 6V18L9.5 12Z" fill="currentColor" />
                            </svg>
                        </button>

                        <button className="bp__playBtn" type="button" onClick={togglePlay} aria-label={isPlaying ? "Pause" : "Play"}>
                            {isPlaying ? (
                                <svg width="26" height="26" viewBox="0 0 24 24" fill="var(--light-color)">
                                    <path d="M6 4H10V20H6V4ZM14 4H18V20H14V4Z" fill="var(--light-color)" />
                                </svg>
                            ) : (
                                <svg width="26" height="26" viewBox="0 0 24 24" fill="var(--light-color)">
                                    <path d="M8 5V19L19 12L8 5Z" fill="var(--light-color)" />
                                </svg>
                            )}
                        </button>

                        <button className="bp__iconBtn" type="button" onClick={nextTrack} aria-label="Next">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                                <path d="M6 18L14.5 12L6 6V18ZM16 6H18V18H16V6Z" fill="currentColor" />
                            </svg>
                        </button>

                        <button className="bp__iconBtn bp__mutedBtn" type="button" aria-label="Shuffle">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <path
                                    d="M16 3h5v5h-2V6.41l-4.29 4.3-1.42-1.42L17.59 5H16V3ZM4 4h4.5c1.1 0 2.15.44 2.93 1.22L13 6.79l-1.42 1.42L10.01 6.64A2.12 2.12 0 0 0 8.5 6H4V4Zm0 16v-2h4.5c.57 0 1.11-.22 1.51-.62l1.57-1.57L13 17.21l-1.57 1.57A4.12 4.12 0 0 1 8.5 20H4Zm17-1.59V16h-2v5h5v-2h-2.59l-4.3-4.29 1.42-1.42 4.47 4.47Z"
                                    fill="currentColor"
                                />
                            </svg>
                        </button>

                        <button
                            className={`bp__iconBtn bp__mutedBtn ${isRepeat ? "isActive" : ""}`}
                            type="button"
                            onClick={toggleRepeat}
                            aria-label="Repeat"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <path
                                    d="M7 7H17V10L21 6L17 2V5H5V11H7V7ZM17 17H7V14L3 18L7 22V19H19V13H17V17Z"
                                    fill="currentColor"
                                />
                            </svg>
                        </button>
                    </div>

                    {/* CENTER: Progress bar with time */}
                    <div className="bp__progressRow">
                        <span className="bp__time">{formatTime(currentTime)}</span>

                        <input
                            type="range"
                            className="bp__progress"
                            min={0}
                            max={duration || 0}
                            value={currentTime || 0}
                            onChange={handleSeek}
                            style={{ background: progressBackground }}
                            aria-label="Seek"
                        />

                        <span className="bp__time">{formatTime(duration)}</span>
                    </div>

                    {/* RIGHT: Track + actions */}
                    <div className="bp__right">
                        <button className="bp__track" type="button" onClick={toggleFullscreen} aria-label="Open fullscreen player">
                <span className="bp__cover">
                  {cover_url ? (
                      <img src={cover_url} alt={currentTrack.title} />
                  ) : (
                      <span className="bp__coverPlaceholder" aria-hidden="true">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path
                            d="M12 3V13.55C11.41 13.21 10.73 13 10 13C7.79 13 6 14.79 6 17C6 19.21 7.79 21 10 21C12.21 21 14 19.21 14 17V7H18V3H12Z"
                            fill="currentColor"
                        />
                      </svg>
                    </span>
                  )}
                </span>

                            <span className="bp__meta">
                  <span className="bp__artist">{currentTrack.artist}</span>
                  <span className="bp__title">{currentTrack.title}</span>
                </span>
                        </button>

                        <div className="bp__actions">
                            <button className="bp__iconBtn" type="button" aria-label="Like">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                    <path
                                        d="M12 21.35L10.55 20.03C5.4 15.36 2 12.28 2 8.5C2 5.42 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.09C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.42 22 8.5C22 12.28 18.6 15.36 13.45 20.04L12 21.35Z"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                    />
                                </svg>
                            </button>

                            <div className="bp__volume" ref={volumeRef}>
                                <button
                                    className="bp__iconBtn bp__mutedBtn"
                                    type="button"
                                    onClick={() => setShowVolumePopover(!showVolumePopover)}
                                    aria-label="Volume"
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                        <path
                                            d="M3 9V15H7L12 20V4L7 9H3ZM16.5 12C16.5 10.23 15.48 8.71 14 7.97V16.02C15.48 15.29 16.5 13.77 16.5 12Z"
                                            fill="var(--light-color)"
                                        />
                                    </svg>
                                </button>

                                {showVolumePopover && (
                                    <div className="bp__volumePopover" role="dialog" aria-label="Volume control">
                                        <input
                                            className="bp__volumeRange"
                                            type="range"
                                            min={0}
                                            max={1}
                                            step={0.01}
                                            value={volume}
                                            onChange={handleVolumeChange}
                                            style={{
                                                background: `linear-gradient(to right,
                            var(--accent-color) 0%,
                            var(--accent-color-light) ${Math.round(volume * 100)}%,
                            rgba(255,255,255,0.2) ${Math.round(volume * 100)}%,
                            rgba(255,255,255,0.2) 100%)`,
                                            }}
                                            aria-label="Volume"
                                        />
                                        <span className="bp__volumeValue">{Math.round(volume * 100)}</span>
                                    </div>
                                )}
                            </div>

                            <button className="bp__iconBtn" type="button" onClick={toggleFullscreen} aria-label="Fullscreen">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                    <path
                                        d="M7 14H5V19H10V17H7V14ZM5 10H7V7H10V5H5V10ZM17 17H14V19H19V14H17V17ZM14 5V7H17V10H19V5H14Z"
                                        fill="currentColor"
                                    />
                                </svg>
                            </button>

                            <button className="bp__iconBtn bp__mutedBtn" type="button" aria-label="More">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                    <path
                                        d="M6 12a2 2 0 1 0 0 .01V12Zm6 0a2 2 0 1 0 0 .01V12Zm6 0a2 2 0 1 0 0 .01V12Z"
                                        fill="var(--light-color)"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BottomPlayer;
