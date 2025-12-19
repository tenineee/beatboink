import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { PlayerProvider } from './context/PlayerContext';
import { router } from './router';
import './styles/global.css';

function App() {
    return (
        <AuthProvider>
            <PlayerProvider> {/* ← Оборачиваем в PlayerProvider */}
                <RouterProvider router={router} />
            </PlayerProvider>
        </AuthProvider>
    );
}

export default App;
