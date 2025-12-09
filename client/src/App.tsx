import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Layout } from './components/layout/Layout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import './styles/global.css';

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Routes>
                    {/* Роуты с Layout и защитой */}
                    <Route path="/" element={<Layout />}>
                        <Route
                            index
                            element={
                                    <HomePage />
                            }
                        />
                    </Route>

                    {/* Публичные роуты без Layout */}
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />

                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
