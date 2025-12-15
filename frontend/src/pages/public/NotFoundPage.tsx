import { Link } from "react-router-dom";
import { CopyX } from "lucide-react";

export default function NotFoundPage() {
    return (
        <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4">
            <div className="max-w-md w-full text-center space-y-8">
                <div className="flex justify-center">
                    <div className="p-4 bg-red-500/10 rounded-full">
                        <CopyX className="w-16 h-16 text-red-500" />
                    </div>
                </div>

                <div className="space-y-4">
                    <h1 className="text-4xl font-bold text-white tracking-tight">
                        404
                        <span className="text-gray-500 ml-2 text-2xl font-medium">Página no encontrada</span>
                    </h1>
                    <p className="text-gray-400 text-lg">
                        Lo sentimos, la página que estás buscando no existe o ha sido movida.
                    </p>
                </div>

                <div className="pt-4">
                    <Link
                        to="/"
                        className="inline-flex items-center justify-center px-8 py-3 text-base font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors duration-200"
                    >
                        Volver al inicio
                    </Link>
                </div>
            </div>

            {/* Background elements */}
            <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px]" />
                <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-purple-600/10 rounded-full blur-[80px]" />
            </div>
        </div>
    );
}
