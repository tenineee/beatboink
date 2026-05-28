import { createBrowserRouter } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import UploadTrackPage from './pages/UploadTrackPage';
import TrackPage from "./pages/TrackPage";

export const router = createBrowserRouter([
    {
        path: '/',
        element: <Layout />,
        children: [
            {
                index: true,
                element: <HomePage />,
            },
            {
                path: 'login',
                element: <LoginPage />,
            },
            {
                path: 'register',
                element: <RegisterPage />,
            },
            {
                path: 'upload',
                element: <UploadTrackPage />,
            },
            {
                path: 'track/:trackId',
                element: <TrackPage />,
            },
        ],
    },
]);

