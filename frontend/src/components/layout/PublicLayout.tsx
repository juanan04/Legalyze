import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import MinimalNavbar from './MinimalNavbar';
import PublicFooter from './PublicFooter';
import BetaNotice from '../common/BetaNotice';

const PublicLayout: React.FC = () => {
    const location = useLocation();
    const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

    return (
        <div className={`min-h-screen bg-[#0f172a] text-slate-100 font-sans selection:bg-indigo-500/30 flex flex-col`}>
            {/* The Navbar absolute positions itself if auth page */}
            <MinimalNavbar />
            <main className={`grow w-full flex flex-col ${isAuthPage ? 'justify-center items-center' : ''}`}>
                <Outlet />
            </main>
            {/* Omit the footer for login and register to leave the full screen for the split view */}
            {!isAuthPage && <PublicFooter />}
            <BetaNotice />
        </div>
    );
};

export default PublicLayout;
