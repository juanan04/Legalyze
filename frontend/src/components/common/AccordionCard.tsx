import { type ReactNode, useState } from "react";

interface AccordionCardProps {
    title: string;
    icon: ReactNode;
    colorVariant: "success" | "warning" | "danger";
    defaultOpen?: boolean;
    children?: ReactNode;
}

const AccordionCard: React.FC<AccordionCardProps> = ({
    title,
    icon,
    colorVariant,
    defaultOpen = false,
    children,
}) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    const containerClasses =
        colorVariant === "danger"
            ? "bg-red-900/20 border border-red-500/40"
            : "bg-slate-900/80 border border-slate-800";

    const titleColor =
        colorVariant === "danger"
            ? "text-red-300"
            : "text-white";

    return (
        <div className={`${containerClasses} rounded-xl p-5`}>
            <button
                type="button"
                onClick={() => setIsOpen((prev) => !prev)}
                className="w-full flex items-center justify-between cursor-pointer"
            >
                <div className="flex items-center gap-3">
                    {/* Icon wrapper que ya trae el color desde fuera */}
                    {icon}
                    <h3 className={`font-semibold text-sm sm:text-base ${titleColor}`}>
                        {title}
                    </h3>
                </div>
                <span
                    className={
                        colorVariant === "danger"
                            ? "text-red-300 text-sm"
                            : "text-slate-400 text-sm"
                    }
                >
                    {isOpen ? "▲" : "▼"}
                </span>
            </button>

            {isOpen && children && (
                <div
                    className={
                        colorVariant === "danger"
                            ? "mt-4 text-sm text-red-200 pl-11"
                            : "mt-4 text-sm text-slate-300 pl-11"
                    }
                >
                    {children}
                </div>
            )}
        </div>
    );
};

export default AccordionCard;
