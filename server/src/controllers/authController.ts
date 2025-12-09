import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import pool from '../config/database';
import { jwtGenerator } from '../utils/jwtGenerator';
import { AuthRequest } from '../types/express';
import {isValidPassword} from "../utils/validators";

const SALT_ROUNDS = 12;

export const register = async(req: Request, res: Response): Promise<void> => {
    try {
        const { username, email, password } = req.body;

        const existingUser = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );

        if (existingUser.rows.length > 0) {
            res.status(409).json({
                error: 'Эта почта уже используется',
            })
        }

        const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

        const newUser = await pool.query(
            'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id',
            [username, email, passwordHash]
        );

        const token = jwtGenerator(newUser.rows[0].id);
        res.status(200).json({ token});
    } catch (err) {
        console.error('Ошибка регистрации: ',err);
        res.status(500).json({error: 'Ошибка сервера во время регистрации.'})
    }
};

export const login = async(req: Request, res: Response): Promise<void> => {
    try {
        const {email, password} = req.body;

        const user = await pool.query(
            'SELECT id, password_hash FROM users WHERE email = $1',
            [email]
        );

        if (user.rows.length === 0) {
            res.status(401).json({error: 'Неверный email или пароль'})
            return;
        }

        const validPassword = await bcrypt.compare(password, user.rows[0].password_hash);

        if (!validPassword) {
            res.status(401).json({error: 'Неверный email или пароль'})
            return;
        }

        const token = jwtGenerator(user.rows[0].id);
        res.json({token});
    } catch (err) {
        console.error('Ошибка логина: ',err);
        res.status(500).json({error:'Ошибка сервера при логине'});
    }
};

export const verify = async (req: AuthRequest, res: Response): Promise<void> => {
    res.json({ valid: true, userId: req.user?.id });
};

export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const user = await pool.query(
            'SELECT id, username, email, avatar_url, is_artist, created_at FROM users WHERE id = $1',
            [req.user?.id]
        );

        if (user.rows.length === 0) {
            res.status(404).json({ error: 'Пользователь не найден' });
            return;
        }

        res.json(user.rows[0]);
    } catch (err) {
        console.error('Profile error:', err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
};