import {useState, type FormEvent, useRef, useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import { trackService } from '../services/api';
import { useAuth} from "../context/AuthContext.tsx";
import '../styles/UploadTrackPage.css';

const UploadTrackPage: React.FC = () => {
    const navigate = useNavigate();
    const coverInputRef = useRef<HTMLInputElement>(null);
    const audioInputRef = useRef<HTMLInputElement>(null);
    const { user } = useAuth();

    const [formData, setFormData] = useState({
        title: '',
        artist: '',
        genre: 'hip-hop',
        privacy: 'public',
    });

    useEffect(() => {
        if (user?.username) {
            setFormData(prev => ({ ...prev, artist: user.username }));
        }
    }, [user]);

    const [audioFile, setAudioFile] = useState<File | null>(null);
    const [coverFile, setCoverFile] = useState<File | null>(null);
    const [coverPreview, setCoverPreview] = useState<string>('');
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState('');

    const handleCoverClick = () => {
        coverInputRef.current?.click();
    };

    const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setCoverFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setCoverPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setAudioFile(file);
            setError('');
            // Автоматически заполняем название трека из имени файла
            if (!formData.title) {
                const fileName = file.name.replace(/\.[^/.]+$/, '');
                setFormData({ ...formData, title: fileName });
            }
        }
    };

    const handleAudioInputClick = () => {
        audioInputRef.current?.click();
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');

        // Кастомная валидация
        if (!audioFile) {
            setError('Выберите аудио файл');
            audioInputRef.current?.focus();
            return;
        }

        if (!formData.title.trim()) {
            setError('Введите название трека');
            return;
        }

        if (!formData.artist.trim()) {
            setError('Введите имя артиста');
            return;
        }

        setIsUploading(true);

        const data = new FormData();
        data.append('audio', audioFile);
        if (coverFile) {
            data.append('cover', coverFile);
        }
        data.append('title', formData.title.trim());
        data.append('artist', formData.artist.trim());
        data.append('genre', formData.genre);

        try {
            const response = await trackService.uploadTrack(data);
            console.log('Track uploaded successfully:', response.data);
            navigate(`/track/${response.data.id}`);
        } catch (err: any) {
            setIsUploading(false);
            console.error('Upload error:', err);
            const errorMessage = err.response?.data?.error || 'Ошибка загрузки трека';
            setError(errorMessage);
        }
    };

    return (
        <div className="upload-track-page">
            <div className="upload-track-container">
                <form onSubmit={handleSubmit} className="upload-track-form" noValidate>
                    {/* Left side - Cover upload */}
                    <div className="upload-cover-section">
                        <div className="cover-upload-area" onClick={handleCoverClick}>
                            {coverPreview ? (
                                <img src={coverPreview} alt="Cover" className="cover-preview" />
                            ) : (
                                <div className="cover-placeholder">
                                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                                        <path
                                            d="M21 19V5C21 3.9 20.1 3 19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19ZM8.5 13.5L11 16.51L14.5 12L19 18H5L8.5 13.5Z"
                                            fill="currentColor"
                                        />
                                    </svg>
                                    <p>Добавить обложку трека</p>
                                </div>
                            )}
                        </div>
                        <input
                            ref={coverInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleCoverChange}
                            style={{ display: 'none' }}
                            tabIndex={-1}
                        />
                    </div>

                    {/* Right side - Track info */}
                    <div className="upload-info-section">
                        {error && <div className="upload-error">{error}</div>}

                        <div className="upload-form-group">
                            <label htmlFor="title">Название трека *</label>
                            <input
                                id="title"
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                disabled={isUploading}
                                placeholder="Введите название трека"
                            />
                        </div>

                        <div className="upload-form-group">
                            <label htmlFor="trackLink">Аудио-файл трека *</label>
                            <div className="track-link-wrapper">
                                <input
                                    ref={audioInputRef}
                                    type="file"
                                    accept="audio/*"
                                    onChange={handleAudioChange}
                                    style={{ display: 'none' }}
                                    tabIndex={-1}
                                />
                                <input
                                    id="trackLink"
                                    type="text"
                                    value={audioFile?.name || ''}
                                    placeholder="Выберите аудио файл"
                                    readOnly
                                    onClick={handleAudioInputClick}
                                    disabled={isUploading}
                                    className="track-link-input"
                                />
                            </div>
                        </div>

                        <div className="upload-form-group">
                            <label htmlFor="artist">Основной артист(ы) *</label>
                            <input
                                id="artist"
                                type="text"
                                value={formData.artist}
                                onChange={(e) => setFormData({ ...formData, artist: e.target.value })}
                                disabled={isUploading}
                                placeholder="Введите имя артиста"
                            />
                        </div>

                        <div className="upload-form-row">
                            <div className="upload-form-group">
                                <label htmlFor="genre">Жанр</label>
                                <select
                                    id="genre"
                                    value={formData.genre}
                                    onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                                    disabled={isUploading}
                                >
                                    <option value="hip-hop">Hip-hop</option>
                                    <option value="rock">Rock</option>
                                    <option value="pop">Pop</option>
                                    <option value="electronic">Electronic</option>
                                    <option value="jazz">Jazz</option>
                                    <option value="classical">Classical</option>
                                    <option value="indie">Indie</option>
                                    <option value="rnb">R&B</option>
                                </select>
                            </div>

                            <div className="upload-form-group">
                                <label htmlFor="privacy">Приватность</label>
                                <select
                                    id="privacy"
                                    value={formData.privacy}
                                    onChange={(e) => setFormData({ ...formData, privacy: e.target.value })}
                                    disabled={isUploading}
                                >
                                    <option value="public">Доступный</option>
                                    <option value="private">Приватный</option>
                                    <option value="unlisted">По ссылке</option>
                                </select>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="upload-submit-btn"
                            disabled={isUploading}
                        >
                            {isUploading ? 'Загрузка...' : 'Загрузить'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UploadTrackPage;
