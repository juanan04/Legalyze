import React from 'react';
import { Outlet } from 'react-router-dom';
import PublicNavbar from './PublicNavbar';
import PublicFooter from './PublicFooter';
import BetaNotice from '../common/BetaNotice';

const LandingLayout: React.FC = () => {
    return (
        <div className="min-h-screen bg-[#0f172a] text-slate-100 font-sans selection:bg-indigo-500/30 flex flex-col">
            <PublicNavbar />
            <main className="grow w-full flex flex-col">
                <Outlet />
            </main>
            <PublicFooter />
            <BetaNotice />
        </div>
    );
};

export default LandingLayout;
