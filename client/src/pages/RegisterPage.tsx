import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/api';
import '../styles/AuthPages.css';

const RegisterPage: React.FC = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Пароли не совпадают');
            return;
        }

        if (formData.password.length < 8) {
            setError('Пароль должен содержать минимум 8 символов');
            return;
        }

        setIsLoading(true);

        try {
            const response = await authService.register({
                username: formData.username,
                email: formData.email,
                password: formData.password,
            });
            await login(response.data.token);
            navigate('/');
        } catch (err: any) {
            setIsLoading(false);
            const errorMessage = err.response?.data?.error || 'Ошибка регистрации';
            setError(errorMessage);
        }
    };

    return (
        <div className="auth-page-centered">
            <div className="auth-form-minimal">
                <h1 className="auth-title-minimal">Регистрация</h1>

                <form onSubmit={handleSubmit} className="auth-form-fields">
                    {error && (
                        <div className="auth-error-minimal">
                            {error}
                        </div>
                    )}

                    <div className="form-field-minimal">
                        <label htmlFor="username" className="form-label-minimal">
                            Имя пользователя
                        </label>
                        <input
                            id="username"
                            type="text"
                            className="form-input-minimal"
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            required
                            autoComplete="username"
                            minLength={3}
                            disabled={isLoading}
                        />
                    </div>

                    <div className="form-field-minimal">
                        <label htmlFor="email" className="form-label-minimal">
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            className="form-input-minimal"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                            autoComplete="email"
                            disabled={isLoading}
                        />
                    </div>

                    <div className="form-field-minimal">
                        <label htmlFor="password" className="form-label-minimal">
                            Пароль
                        </label>
                        <input
                            id="password"
                            type="password"
                            className="form-input-minimal"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                            autoComplete="new-password"
                            minLength={8}
                            disabled={isLoading}
                        />
                    </div>

                    <div className="form-field-minimal">
                        <label htmlFor="confirmPassword" className="form-label-minimal">
                            Подтвердите пароль
                        </label>
                        <input
                            id="confirmPassword"
                            type="password"
                            className="form-input-minimal"
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                            required
                            autoComplete="new-password"
                            disabled={isLoading}
                        />
                    </div>

                    <button
                        type="submit"
                        className="auth-button-minimal"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
                    </button>

                    <p className="auth-footer-minimal">
                        Уже есть аккаунт? - <Link to="/login" className="auth-link-minimal">Войти</Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default RegisterPage;
