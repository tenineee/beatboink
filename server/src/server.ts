import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import authRoutes from './routes/authRoutes';
import trackRoutes from './routes/trackRoutes';


dotenv.config();

const app = express();

app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/auth', authRoutes);
app.use('/api/tracks', trackRoutes);  // Новое

const PORT = Number(process.env.PORT) || 5001;

app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
})