// src/router/AppRouter.tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "../context/AuthContext";

import LoginPage from "../pages/auth/LoginPage";
import LandingPage from "../pages/LandingPage";
import RegisterPage from "../pages/auth/RegisterPage";

import VerifyEmailPage from "../pages/public/VerifyEmailPage";
import NotFoundPage from "../pages/public/NotFoundPage";

import DashboardPage from "../pages/private/DashboardPage";
import AnalyzeContractPage from "../pages/private/AnalyzeContractPage";
import GenerateContractPage from "../pages/private/GenerateContractPage";
import HistoryPage from "../pages/private/HistoryPage";
import ProfilePage from "../pages/private/ProfilePage";
import PricingPage from "../pages/private/PricingPage";
import PaymentStatusPage from "../pages/private/PaymentStatusPage";

import PrivacyPolicyPage from "../pages/public/legal/PrivacyPolicyPage";
import TermsPage from "../pages/public/legal/TermsPage";
import CookiesPolicyPage from "../pages/public/legal/CookiesPolicyPage";
import DisclaimerPage from "../pages/public/legal/DisclaimerPage";

import ProtectedRoute from "./ProtectedRoute";

import PublicLayout from "../components/layout/PublicLayout";

const AppRouter = () => (
    <BrowserRouter>
        <AuthProvider>
            <Routes>
                {/* Rutas Públicas con Layout */}
                <Route element={<PublicLayout />}>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/verify-email" element={<VerifyEmailPage />} />

                    {/* Legales */}
                    <Route path="/privacy" element={<PrivacyPolicyPage />} />
                    <Route path="/terms" element={<TermsPage />} />
                    <Route path="/cookies" element={<CookiesPolicyPage />} />
                    <Route path="/disclaimer" element={<DisclaimerPage />} />
                </Route>

                {/* Privadas */}
                <Route element={<ProtectedRoute />}>
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/contracts/analyze" element={<AnalyzeContractPage />} />
                    <Route path="/contracts/generate" element={<GenerateContractPage />} />
                    <Route path="/history" element={<HistoryPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/pricing" element={<PricingPage />} />
                    <Route path="/payment/success" element={<PaymentStatusPage />} />
                    <Route path="/payment/cancel" element={<PaymentStatusPage />} />
                </Route>

                {/* 404 */}
                <Route path="*" element={<NotFoundPage />} />
            </Routes>
        </AuthProvider>
    </BrowserRouter>
);

export default AppRouter;
