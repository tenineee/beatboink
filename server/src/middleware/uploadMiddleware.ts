import multer from 'multer';
import path from 'path';
import fs from 'fs';

// ВАЖНО: Путь относительно корня проекта server/
const uploadDir = path.join(process.cwd(), 'uploads');
const tracksDir = path.join(uploadDir, 'tracks');
const coversDir = path.join(uploadDir, 'covers');

// Создаём папки при запуске
const createDirs = () => {
    [uploadDir, tracksDir, coversDir].forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
            console.log(`📁 Created directory: ${dir}`);
        } else {
            console.log(`✅ Directory exists: ${dir}`);
        }
    });
};

createDirs();

// Настройка хранилища
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let targetDir;

        if (file.fieldname === 'audio') {
            targetDir = tracksDir;
        } else if (file.fieldname === 'cover') {
            targetDir = coversDir;
        } else {
            targetDir = uploadDir;
        }

        console.log(`📤 Uploading ${file.fieldname} to: ${targetDir}`);
        cb(null, targetDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        const prefix = file.fieldname === 'audio' ? 'track' : 'cover';
        const filename = `${prefix}-${uniqueSuffix}${ext}`;

        console.log(`📝 Saving file as: ${filename}`);
        cb(null, filename);
    }
});

// Фильтры
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    console.log(`🔍 Checking file: ${file.fieldname} - ${file.originalname} (${file.mimetype})`);

    if (file.fieldname === 'audio') {
        const allowedMimes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/x-wav', 'audio/flac'];
        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Разрешены только аудио файлы (MP3, WAV, OGG)'));
        }
    } else if (file.fieldname === 'cover') {
        const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Разрешены только изображения (JPG, PNG, WEBP)'));
        }
    } else {
        cb(null, true);
    }
};

// Middleware для одновременной загрузки аудио и обложки
export const uploadTrackWithCover = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB
    }
}).fields([
    { name: 'audio', maxCount: 1 },
    { name: 'cover', maxCount: 1 }
]);
