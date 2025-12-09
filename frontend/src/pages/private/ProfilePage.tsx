import { useState, useRef } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { useAuth } from "../../context/AuthContext";
import {
    Edit2,
    ChevronRight,
    Camera,
    Save,
    X
} from "lucide-react";
import { api } from "../../lib/api";

const ProfilePage = () => {
    const { user, updateUser, logout } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.name || "",
        email: user?.email || "",
    });
    const [previewImage, setPreviewImage] = useState<string | null>(user?.profileImage || null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Password change state
    const [passwordData, setPasswordData] = useState({
        oldPassword: "",
        newPassword: "",
        confirmPassword: ""
    });
    const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    // Fallback por si no hay usuario (aunque debería haber si es ruta protegida)
    if (!user) return null;

    const displayUser = {
        name: user.name,
        email: user.email,
        memberSince: "Reciente", // Dato no disponible en User type aún
        planName: "Plan Gratuito", // Dato no disponible
        planRenewal: "-", // Dato no disponible
    };

    const handleEditToggle = () => {
        if (isEditing) {
            // Cancelar edición: restaurar datos
            setFormData({
                name: user.name,
                email: user.email,
            });
            setPreviewImage(user.profileImage || null);
        }
        setIsEditing(!isEditing);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageClick = () => {
        if (isEditing && fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async () => {
        try {
            const payload = {
                name: formData.name,
                email: formData.email,
                profileImage: previewImage
            };

            const response = await api.put("/api/users/me", payload);
            updateUser(response.data);
            setIsEditing(false);
        } catch (error) {
            console.error("Error updating profile:", error);
            // Aquí podrías añadir una notificación de error
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordMessage(null);

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setPasswordMessage({ type: 'error', text: 'Las contraseñas nuevas no coinciden' });
            return;
        }

        if (passwordData.newPassword.length < 6) {
            setPasswordMessage({ type: 'error', text: 'La contraseña debe tener al menos 6 caracteres' });
            return;
        }

        try {
            setIsChangingPassword(true);
            await api.put("/api/users/me/password", {
                oldPassword: passwordData.oldPassword,
                newPassword: passwordData.newPassword
            });

            setPasswordMessage({ type: 'success', text: 'Contraseña actualizada correctamente' });
            setPasswordData({ oldPassword: "", newPassword: "", confirmPassword: "" });
        } catch (error) {
            console.error("Error changing password:", error);
            if (error && typeof error === 'object' && 'response' in error) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const axiosError = error as any;
                if (axiosError.response?.status === 400 || axiosError.response?.status === 401) {
                    setPasswordMessage({ type: 'error', text: 'La contraseña actual es incorrecta' });
                } else {
                    setPasswordMessage({ type: 'error', text: 'Error al actualizar la contraseña' });
                }
            } else {
                setPasswordMessage({ type: 'error', text: 'Error al actualizar la contraseña' });
            }
        } finally {
            setIsChangingPassword(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <header className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold text-white">Perfil</h1>
                    <button
                        type="button"
                        onClick={isEditing ? handleSave : handleEditToggle}
                        className={`${isEditing ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-[#2563EB] hover:bg-[#1D4ED8]'} text-white text-sm font-semibold py-2 px-5 rounded-lg transition-colors flex items-center gap-2`}
                    >
                        {isEditing ? (
                            <>
                                <Save className="w-4 h-4" />
                                Guardar cambios
                            </>
                        ) : (
                            <>
                                <Edit2 className="w-4 h-4" />
                                Editar perfil
                            </>
                        )}
                    </button>
                    {isEditing && (
                        <button
                            type="button"
                            onClick={handleEditToggle}
                            className="ml-2 bg-slate-700 text-white text-sm font-semibold py-2 px-3 rounded-lg hover:bg-slate-600 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </header>

                {/* Card principal con avatar */}
                <div className="bg-slate-900/80 border border-slate-800 p-8 rounded-2xl mb-8 flex flex-col items-center">
                    <div className="relative mb-4 group">
                        <div
                            className={`w-28 h-28 rounded-full overflow-hidden border-4 border-slate-900 bg-slate-800 flex items-center justify-center ${isEditing ? 'cursor-pointer ring-2 ring-offset-2 ring-offset-slate-900 ring-blue-500' : ''}`}
                            onClick={handleImageClick}
                        >
                            {previewImage ? (
                                <img
                                    src={previewImage}
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <span className="text-3xl font-semibold text-white">
                                    {displayUser.name.charAt(0).toUpperCase()}
                                </span>
                            )}

                            {isEditing && (
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                                    <Camera className="w-8 h-8 text-white" />
                                </div>
                            )}
                        </div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleImageChange}
                        />
                    </div>

                    <h2 className="text-2xl font-bold text-white">
                        {displayUser.name}
                    </h2>
                    <p className="text-sm text-slate-400 mt-1">
                        Miembro desde {displayUser.memberSince}
                    </p>
                </div>

                <div className="space-y-8">
                    {/* Información personal */}
                    <section>
                        <h3 className="text-xl font-semibold mb-4 text-white">
                            Información personal
                        </h3>
                        <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl space-y-4">
                            <div className="grid grid-cols-1 gap-6">
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1">
                                        Nombre completo
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    ) : (
                                        <p className="text-sm text-slate-100">{displayUser.name}</p>
                                    )}
                                </div>
                            </div>

                            <div className="border-t border-slate-800 pt-4">
                                <label className="block text-xs font-medium text-slate-400 mb-1">
                                    Correo electrónico
                                </label>
                                {isEditing ? (
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                ) : (
                                    <p className="text-sm text-slate-100">{displayUser.email}</p>
                                )}
                            </div>
                        </div>
                    </section>

                    {/* Plan actual */}
                    <section>
                        <h3 className="text-xl font-semibold mb-4 text-white">Mi plan</h3>
                        <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                                <h4 className="text-lg font-semibold text-white">
                                    {displayUser.planName}
                                </h4>
                                <p className="text-sm text-slate-400">
                                    Se renueva el {displayUser.planRenewal}
                                </p>
                            </div>
                            <button
                                type="button"
                                className="bg-[#2563EB] text-white text-sm font-semibold py-2 px-5 rounded-lg hover:bg-[#1D4ED8] transition-colors"
                            >
                                Gestionar plan
                            </button>
                        </div>
                    </section>

                    {/* Legal y soporte */}
                    <section>
                        <h3 className="text-xl font-semibold mb-4 text-white">
                            Legal y soporte
                        </h3>
                        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden">
                            <ul className="divide-y divide-slate-800">
                                <li>
                                    <button
                                        type="button"
                                        className="w-full flex justify-between items-center px-4 py-3 text-sm hover:bg-slate-800/70 transition-colors"
                                    >
                                        <span>Términos de servicio</span>
                                        <ChevronRight className="w-4 h-4 text-slate-500" />
                                    </button>
                                </li>
                                <li>
                                    <button
                                        type="button"
                                        className="w-full flex justify-between items-center px-4 py-3 text-sm hover:bg-slate-800/70 transition-colors"
                                    >
                                        <span>Política de privacidad</span>
                                        <ChevronRight className="w-4 h-4 text-slate-500" />
                                    </button>
                                </li>
                                <li>
                                    <button
                                        type="button"
                                        className="w-full flex justify-between items-center px-4 py-3 text-sm hover:bg-slate-800/70 transition-colors"
                                    >
                                        <span>Ayuda y soporte</span>
                                        <ChevronRight className="w-4 h-4 text-slate-500" />
                                    </button>
                                </li>
                            </ul>
                        </div>
                    </section>

                    {/* Cuenta */}
                    <section>
                        <h3 className="text-xl font-semibold mb-4 text-white">Cuenta</h3>
                        <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl space-y-6">
                            {/* Change Password Form */}
                            <div className="border-b border-slate-800 pb-6">
                                <h4 className="text-lg font-medium text-white mb-4">Cambiar contraseña</h4>
                                <form onSubmit={handlePasswordChange} className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-slate-400 mb-1">
                                                Contraseña actual
                                            </label>
                                            <input
                                                type="password"
                                                value={passwordData.oldPassword}
                                                onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-400 mb-1">
                                                Nueva contraseña
                                            </label>
                                            <input
                                                type="password"
                                                value={passwordData.newPassword}
                                                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                required
                                                minLength={6}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-400 mb-1">
                                                Confirmar contraseña
                                            </label>
                                            <input
                                                type="password"
                                                value={passwordData.confirmPassword}
                                                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                required
                                                minLength={6}
                                            />
                                        </div>
                                    </div>

                                    {passwordMessage && (
                                        <div className={`text-sm ${passwordMessage.type === 'error' ? 'text-red-400' : 'text-green-400'}`}>
                                            {passwordMessage.text}
                                        </div>
                                    )}

                                    <div className="flex justify-end">
                                        <button
                                            type="submit"
                                            disabled={isChangingPassword}
                                            className="bg-slate-700 text-white text-sm font-semibold py-2 px-4 rounded-lg hover:bg-slate-600 transition-colors disabled:opacity-50"
                                        >
                                            {isChangingPassword ? 'Actualizando...' : 'Actualizar contraseña'}
                                        </button>
                                    </div>
                                </form>
                            </div>

                            <button
                                type="button"
                                onClick={logout}
                                className="w-full sm:w-auto text-red-500 font-semibold py-2 px-5 rounded-lg hover:bg-red-500/10 transition-colors"
                            >
                                Cerrar sesión
                            </button>
                        </div>
                    </section>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default ProfilePage;
