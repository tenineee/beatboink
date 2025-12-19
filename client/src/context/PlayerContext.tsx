import React, { createContext, useContext, useState, useRef, useEffect, type ReactNode} from 'react';
import { type Track } from '../types';

interface PlayerContextType {
    currentTrack: Track | null;
    isPlaying: boolean;
    currentTime: number;
    duration: number;
    volume: number;
    isRepeat: boolean;
    isFullscreen: boolean;
    playlist: Track[];
    playTrack: (track: Track) => void;
    playPlaylist: (tracks: Track[], startIndex: number) => void;
    togglePlay: () => void;
    nextTrack: () => void;
    previousTrack: () => void;
    seekTo: (time: number) => void;
    setVolume: (volume: number) => void;
    toggleRepeat: () => void;
    toggleFullscreen: () => void;
    audioRef: React.RefObject<HTMLAudioElement | null>;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const PlayerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
    const [playlist, setPlaylist] = useState<Track[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolumeState] = useState(1);
    const [isRepeat, setIsRepeat] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);

    // Ссылка для блокировки множественных вызовов play
    const isPlayingRef = useRef(false);

    // Плавное обновление прогресса
    useEffect(() => {
        let animationFrameId: number;
        const updateProgress = () => {
            if (audioRef.current && !audioRef.current.paused) {
                setCurrentTime(audioRef.current.currentTime);
                animationFrameId = requestAnimationFrame(updateProgress);
            }
        };

        if (isPlaying) {
            animationFrameId = requestAnimationFrame(updateProgress);
        }
        return () => cancelAnimationFrame(animationFrameId);
    }, [isPlaying]);

    // Синхронизация громкости
    useEffect(() => {
        if (audioRef.current) audioRef.current.volume = volume;
    }, [volume]);

    // Синхронизация повтора
    useEffect(() => {
        if (audioRef.current) audioRef.current.loop = isRepeat;
    }, [isRepeat]);

    const getStreamUrl = (trackId: number): string => {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
        return `${API_URL}/api/tracks/${trackId}/stream`; // <-- важно: /:id/stream
    };

    const playAudio = async () => {
        if (!audioRef.current) return;
        try {
            await audioRef.current.play();
            setIsPlaying(true);
            isPlayingRef.current = true;
        } catch (err) {
                console.error('Play error:', err);
                setIsPlaying(false);
                isPlayingRef.current = false;

        }
    };

    const playTrack = async (track: Track) => {
        if (!audioRef.current) return;

        // Если этот трек уже играет - просто возобновляем
        if (currentTrack?.id === track.id) {
            togglePlay();
            return;
        }

        setCurrentTrack(track);
        setPlaylist([track]);
        setCurrentIndex(0);
        setCurrentTime(0);

        audioRef.current.src = getStreamUrl(track.id);
        await playAudio();
    };

    const playPlaylist = async (tracks: Track[], startIndex: number = 0) => {
        if (tracks.length === 0 || !audioRef.current) return;

        const track = tracks[startIndex];

        // Если тот же трек - не перезагружаем src
        if (currentTrack?.id === track.id) {
            if (!isPlaying) playAudio();
            return;
        }

        setPlaylist(tracks);
        setCurrentIndex(startIndex);
        setCurrentTrack(track);
        setCurrentTime(0);

        audioRef.current.src = getStreamUrl(track.id);
        await playAudio();
    };

    const togglePlay = () => {
        if (!audioRef.current || !currentTrack) return;

        if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
        } else {
            playAudio();
        }
    };

    const nextTrack = () => {
        if (playlist.length === 0) return;
        const nextIndex = (currentIndex + 1) % playlist.length;
        playPlaylist(playlist, nextIndex);
    };

    const previousTrack = () => {
        if (playlist.length === 0) return;
        if (currentTime > 3) {
            seekTo(0);
            return;
        }
        const prevIndex = currentIndex === 0 ? playlist.length - 1 : currentIndex - 1;
        playPlaylist(playlist, prevIndex);
    };

    const seekTo = (time: number) => {
        if (audioRef.current && !isNaN(time)) {
            audioRef.current.currentTime = time;
            setCurrentTime(time);
        }
    };

    const setVolume = (newVolume: number) => setVolumeState(newVolume);
    const toggleRepeat = () => setIsRepeat(!isRepeat);
    const toggleFullscreen = () => setIsFullscreen(!isFullscreen);

    // Обработчики событий audio
    const handleLoadedMetadata = () => {
        if (audioRef.current) setDuration(audioRef.current.duration);
    };

    const handleEnded = () => {
        if (!isRepeat && playlist.length > 1) {
            nextTrack();
        } else if (!isRepeat) {
            setIsPlaying(false);
        }
    };

    const handleError = (e: React.SyntheticEvent<HTMLAudioElement, Event>) => {
        console.error('Audio Error:', e);
        setIsPlaying(false);
    };

    // Важно: onTimeUpdate для синхронизации, если requestAnimationFrame пропустил кадры
    const handleTimeUpdate = () => {
        if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
    };

    return (
        <PlayerContext.Provider
            value={{
                currentTrack,
                isPlaying,
                currentTime,
                duration,
                volume,
                isRepeat,
                isFullscreen,
                playlist,
                playTrack,
                playPlaylist,
                togglePlay,
                nextTrack,
                previousTrack,
                seekTo,
                setVolume,
                toggleRepeat,
                toggleFullscreen,
                audioRef,
            }}
        >
            {children}
            {/* Скрытый аудио элемент, который всегда отрендерен */}
            <audio
                ref={audioRef}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={handleEnded}
                onError={handleError}
                onTimeUpdate={handleTimeUpdate}
                preload="auto"
            />
        </PlayerContext.Provider>
    );
};

export const usePlayer = () => {
    const context = useContext(PlayerContext);
    if (context === undefined) {
        throw new Error('usePlayer must be used within a PlayerProvider');
    }
    return context;
};
