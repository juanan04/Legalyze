import type { ReactNode } from "react";
import Sidebar from "./Sidebar";
import MobileNavbar from "./MobileNavbar";

type DashboardLayoutProps = {
    children: ReactNode;
};

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
    return (
        <div className="min-h-screen bg-[#0f172a] text-slate-100 flex flex-col lg:flex-row">
            <Sidebar />
            <MobileNavbar />
            <main className="flex-1 overflow-y-auto h-[calc(100vh-65px)] lg:h-screen">
                <div className="max-w-6xl mx-auto px-4 py-6 lg:px-6 lg:py-8">{children}</div>
            </main>
        </div>
    );
};

export default DashboardLayout;
