import DashboardLayout from "../../components/layout/DashboardLayout";

const ProfilePage = () => {
    return (
        <DashboardLayout>
            <h1 className="text-2xl font-bold mb-4">Mi perfil</h1>
            <p className="text-slate-400">Datos del usuario, preferencias, etc.</p>
        </DashboardLayout>
    );
};

export default ProfilePage;
