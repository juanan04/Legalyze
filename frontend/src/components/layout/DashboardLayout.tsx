import type { ReactNode } from "react";
import Sidebar from "./Sidebar";

type DashboardLayoutProps = {
    children: ReactNode;
};

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
    return (
        <div className="min-h-screen bg-[#0f172a] text-slate-100 flex">
            <Sidebar />
            <main className="flex-1 overflow-y-auto">
                <div className="max-w-6xl mx-auto px-6 py-8">{children}</div>
            </main>
        </div>
    );
};

export default DashboardLayout;
