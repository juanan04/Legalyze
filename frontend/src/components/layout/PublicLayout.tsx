import React from 'react';
import { Outlet } from 'react-router-dom';
import PublicNavbar from './PublicNavbar';
import PublicFooter from './PublicFooter';

const PublicLayout: React.FC = () => {
    return (
        <div className="min-h-screen bg-[#0f172a] text-slate-100 font-sans selection:bg-blue-500/30 flex flex-col">
            <PublicNavbar />
            <main className="flex-grow w-full flex flex-col">
                <Outlet />
            </main>
            <PublicFooter />
        </div>
    );
};

export default PublicLayout;
