import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/api';  // Импортируем API
import '../styles/AuthPages.css';
import { useAuth } from '../context/AuthContext';

const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await authService.login(formData);
            await login(response.data.token);
            navigate('/');
        } catch (err: any) {
            setIsLoading(false);
            const errorMessage = err.response?.data?.error || 'Ошибка входа';
            setError(errorMessage);
        }
    };

    return (
        <div className="auth-page-centered">
            <div className="auth-form-minimal">
                <h1 className="auth-title-minimal">Авторизация</h1>

                <form onSubmit={handleSubmit} className="auth-form-fields">
                    {error && (
                        <div className="auth-error-minimal">
                            {error}
                        </div>
                    )}

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
                            autoComplete="current-password"
                            disabled={isLoading}
                        />
                    </div>

                    <button
                        type="submit"
                        className="auth-button-minimal"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Вход...' : 'Войти'}
                    </button>

                    <p className="auth-footer-minimal">
                        Ещё не с нами? - <Link to="/register" className="auth-link-minimal">Регистрация</Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;