import { createBrowserRouter } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import UploadTrackPage from './pages/UploadTrackPage';
import TrackPlayerPage from './pages/TrackPlayerPage';

export const router = createBrowserRouter([
    {
        path: '/',
        element: <Layout />,
        children: [
            {
                path: '', // Изменил с index: true
                element: <HomePage />
            },
            {
                path: 'upload', // Убрал слэш в начале
                element: <UploadTrackPage />
            },
            {
                path: 'library',
                element: <div style={{ padding: '100px', color: 'white' }}>Library Page</div>
            },
        ]
    },
    {
        path: '/login',
        element: <LoginPage />,
    },
    {
        path: '/register',
        element: <RegisterPage />,
    },
    {
        path: '/track/:id',
        element: <TrackPlayerPage />,
    },
]);
