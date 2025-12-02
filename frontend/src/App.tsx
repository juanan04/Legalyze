import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import DashboardPage from "./pages/private/DashboardPage";
import LandingPage from "./pages/LandingPage";
import HistoryPage from "./pages/private/HistoryPage";
import ProfilePage from "./pages/private/ProfilePage";
import AnalyzeContractPage from "./pages/private/AnalyzeContractPage";
import GenerateContractPage from "./pages/private/GenerateContractPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/** Rutas privadas */}
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/history" element={<HistoryPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/contracts/analyze" element={<AnalyzeContractPage />} />
      <Route path="/contracts/generate" element={<GenerateContractPage />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
