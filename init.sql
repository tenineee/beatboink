-- Удаляем таблицы если есть (чтобы пересоздать чисто)
DROP TABLE IF EXISTS listening_history, track_comments, track_likes, playlist_tracks, tracks, playlists, users CASCADE;

-- 1. Пользователи
CREATE TABLE users (
                       id SERIAL PRIMARY KEY,
                       username VARCHAR(50) UNIQUE NOT NULL,
                       email VARCHAR(255) UNIQUE NOT NULL,
                       password_hash VARCHAR(255) NOT NULL,
                       avatar_url VARCHAR(255),
                       is_artist BOOLEAN DEFAULT FALSE,
                       created_at TIMESTAMP DEFAULT NOW()
);

-- 2. Треки
CREATE TABLE tracks (
                        id SERIAL PRIMARY KEY,
                        author_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                        title VARCHAR(255) NOT NULL,
                        audio_url VARCHAR(255) NOT NULL, -- Путь к файлу
                        image_url VARCHAR(255),          -- Обложка
                        duration INTEGER,                -- В секундах
                        plays_count INTEGER DEFAULT 0,
                        created_at TIMESTAMP DEFAULT NOW()
);

-- 3. Плейлисты (опционально для старта, но пригодится)
CREATE TABLE playlists (
                           id SERIAL PRIMARY KEY,
                           author_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                           title VARCHAR(120) NOT NULL,
                           image_url VARCHAR(255),
                           created_at TIMESTAMP DEFAULT NOW()
);
