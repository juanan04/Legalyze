import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";

const BetaNotice = () => {
    const { user, updateUser } = useAuth();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const localAck = localStorage.getItem("beta_notice_v1_ack");

        // If user is logged in, check backend flag
        if (user) {
            if (!user.betaNoticeAck && !localAck) {
                setIsVisible(true);
            }
        } else {
            // If anonymous, check local storage
            if (!localAck) {
                setIsVisible(true);
            }
        }
    }, [user]);

    const handleDismiss = async () => {
        setIsVisible(false);
        localStorage.setItem("beta_notice_v1_ack", "true");

        if (user) {
            try {
                await api.post("/api/users/beta-ack");
                // Update local user context to reflect change without reload
                updateUser({ ...user, betaNoticeAck: true });
            } catch (error) {
                console.error("Failed to ack beta notice on server", error);
            }
        }
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-indigo-900/95 text-white p-4 z-50 border-t border-indigo-700 backdrop-blur-sm shadow-lg">
            <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
                <div className="flex-1">
                    <p className="text-sm sm:text-base font-medium">
                        <span className="bg-indigo-500 text-xs uppercase px-2 py-0.5 rounded mr-2 font-bold tracking-wider">BETA</span>
                        Legalyze está en fase beta abierta. Los resultados pueden ser inexactos. No es asesoramiento legal. Recomendamos revisión humana.
                    </p>
                </div>
                <button
                    onClick={handleDismiss}
                    className="cursor-pointer whitespace-nowrap bg-white text-indigo-900 hover:bg-indigo-50 font-semibold py-2 px-6 rounded-lg transition-colors text-sm shadow-sm"
                >
                    Entendido
                </button>
            </div>
        </div>
    );
};

export default BetaNotice;
