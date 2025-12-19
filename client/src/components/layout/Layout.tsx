import { Outlet } from 'react-router-dom';
import Header  from '../common/Header/Header';
import BottomPlayer from '../player/BottomPlayer';
import FullscreenPlayer from '../player/FullscreenPlayer';
import './Layout.css';

export const Layout: React.FC = () => {
    return (
        <div className="app-layout">
            <Header />
            <main className="main-content">
                <Outlet />
            </main>
            <BottomPlayer />
            <FullscreenPlayer />
        </div>
    );
};
