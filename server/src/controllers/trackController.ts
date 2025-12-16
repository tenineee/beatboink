import { Request, Response } from 'express';
import pool from '../config/database';
import { AuthRequest } from '../types/express';
import fs from 'fs';
import path from 'path';
import { parseFile } from 'music-metadata';

export const uploadTrack = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        console.log('📦 Upload request received');
        console.log('Body:', req.body);
        console.log('Files:', req.files);

        const files = req.files as { [fieldname: string]: Express.Multer.File[] };
        const audioFile = files?.audio?.[0];
        const coverFile = files?.cover?.[0];

        if (!audioFile) {
            console.error('❌ No audio file in request');
            res.status(400).json({ error: 'Аудио файл обязателен' });
            return;
        }

        console.log('✅ Audio file received:', audioFile.filename);
        if (coverFile) {
            console.log('✅ Cover file received:', coverFile.filename);
        }

        const { title, artist, album, genre } = req.body;

        if (!title || !artist) {
            // Удаляем загруженные файлы при ошибке
            if (audioFile && fs.existsSync(audioFile.path)) {
                fs.unlinkSync(audioFile.path);
                console.log('🗑️ Deleted audio file due to validation error');
            }
            if (coverFile && fs.existsSync(coverFile.path)) {
                fs.unlinkSync(coverFile.path);
                console.log('🗑️ Deleted cover file due to validation error');
            }

            res.status(400).json({ error: 'Название и исполнитель обязательны' });
            return;
        }

        // Извлекаем метаданные из аудио файла
        let duration = 0;
        try {
            const metadata = await parseFile(audioFile.path);
            duration = Math.floor(metadata.format.duration || 0);
            console.log(`⏱️ Track duration: ${duration}s`);
        } catch (err) {
            console.error('⚠️ Error parsing metadata:', err);
            // Продолжаем даже если не удалось получить метаданные
        }

        const audioUrl = `/uploads/tracks/${audioFile.filename}`;
        const coverUrl = coverFile ? `/uploads/covers/${coverFile.filename}` : null;

        console.log('💾 Saving to database...');
        console.log('Audio URL:', audioUrl);
        console.log('Cover URL:', coverUrl);

        // Сохраняем в БД
        const result = await pool.query(
            `INSERT INTO tracks (title, artist, album, genre, duration, audio_url, cover_url, user_id) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       RETURNING *`,
            [title, artist, album || null, genre || null, duration, audioUrl, coverUrl, req.user?.id]
        );

        console.log('✅ Track saved successfully:', result.rows[0].id);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('❌ Upload track error:', err);
        res.status(500).json({ error: 'Ошибка загрузки трека' });
    }
};


export const getTracks = async (req: Request, res: Response): Promise<void> => {
    try {
        const { page = 1, limit = 20, search, genre } = req.query;
        const offset = (Number(page) - 1) * Number(limit);

        let query = 'SELECT * FROM tracks';
        const params: any[] = [];
        const conditions: string[] = [];

        if (search) {
            conditions.push(`(title ILIKE $${params.length + 1} OR artist ILIKE $${params.length + 1})`);
            params.push(`%${search}%`);
        }

        if (genre) {
            conditions.push(`genre = $${params.length + 1}`);
            params.push(genre);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
        params.push(Number(limit), offset);

        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (err) {
        console.error('Get tracks error:', err);
        res.status(500).json({ error: 'Ошибка получения треков' });
    }
};

export const getTrackById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const result = await pool.query('SELECT * FROM tracks WHERE id = $1', [id]);

        if (result.rows.length === 0) {
            res.status(404).json({ error: 'Трек не найден' });
            return;
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error('Get track error:', err);
        res.status(500).json({ error: 'Ошибка получения трека' });
    }
};

export const streamTrack = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const result = await pool.query('SELECT audio_url FROM tracks WHERE id = $1', [id]);

        if (result.rows.length === 0) {
            res.status(404).json({ error: 'Трек не найден' });
            return;
        }

        const audioUrl = result.rows[0].audio_url;
        const filePath = path.join(__dirname, '../../', audioUrl);

        if (!fs.existsSync(filePath)) {
            res.status(404).json({ error: 'Аудио файл не найден' });
            return;
        }

        const stat = fs.statSync(filePath);
        const fileSize = stat.size;
        const range = req.headers.range;

        if (range) {
            const parts = range.replace(/bytes=/, '').split('-');
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
            const chunksize = (end - start) + 1;
            const file = fs.createReadStream(filePath, { start, end });
            const head = {
                'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': chunksize,
                'Content-Type': 'audio/mpeg',
            };

            res.writeHead(206, head);
            file.pipe(res);
        } else {
            const head = {
                'Content-Length': fileSize,
                'Content-Type': 'audio/mpeg',
            };
            res.writeHead(200, head);
            fs.createReadStream(filePath).pipe(res);
        }

        // Увеличиваем счетчик прослушиваний
        await pool.query('UPDATE tracks SET plays_count = plays_count + 1 WHERE id = $1', [id]);
    } catch (err) {
        console.error('Stream track error:', err);
        res.status(500).json({ error: 'Ошибка стриминга трека' });
    }
};

export const deleteTrack = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            'SELECT * FROM tracks WHERE id = $1 AND user_id = $2',
            [id, req.user?.id]
        );

        if (result.rows.length === 0) {
            res.status(404).json({ error: 'Трек не найден или у вас нет прав' });
            return;
        }

        const track = result.rows[0];

        // Удаляем файлы
        const audioPath = path.join(__dirname, '../../', track.audio_url);
        if (fs.existsSync(audioPath)) {
            fs.unlinkSync(audioPath);
        }

        if (track.cover_url) {
            const coverPath = path.join(__dirname, '../../', track.cover_url);
            if (fs.existsSync(coverPath)) {
                fs.unlinkSync(coverPath);
            }
        }

        // Удаляем из БД
        await pool.query('DELETE FROM tracks WHERE id = $1', [id]);

        res.json({ message: 'Трек удален' });
    } catch (err) {
        console.error('Delete track error:', err);
        res.status(500).json({ error: 'Ошибка удаления трека' });
    }
};