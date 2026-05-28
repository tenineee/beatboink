export interface Track {
    id: number;
    title: string;
    artist: string;
    album?: string;
    duration: number;
    audio_url: string;
    cover_url?: string;
    user_id: number;
    plays_count: number;
    created_at: Date;
}

export interface TrackUploadData {
    title: string;
    artist: string;
    album?: string;
    genre?: string;
}