import type { ReactNode } from "react";
import Sidebar from "./Sidebar";
import MobileNavbar from "./MobileNavbar";
import BetaNotice from "../common/BetaNotice";

type DashboardLayoutProps = {
    children: ReactNode;
};

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col lg:flex-row font-['Plus_Jakarta_Sans',sans-serif]">
            <Sidebar />
            <MobileNavbar />
            <main className="flex-1 overflow-y-auto h-[calc(100vh-65px)] lg:h-screen">
                <div className="max-w-6xl mx-auto px-4 py-6 lg:px-6 lg:py-8">{children}</div>
            </main>
            <BetaNotice />
        </div>
    );
};

export default DashboardLayout;
