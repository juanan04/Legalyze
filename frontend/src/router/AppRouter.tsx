// src/router/AppRouter.tsx
import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "../context/AuthContext";
import ProtectedRoute from "./ProtectedRoute";
import PublicLayout from "../components/layout/PublicLayout";

// Lazy Loading de páginas
const LoginPage = lazy(() => import("../pages/auth/LoginPage"));
const LandingPage = lazy(() => import("../pages/LandingPage"));
const RegisterPage = lazy(() => import("../pages/auth/RegisterPage"));
const VerifyEmailPage = lazy(() => import("../pages/public/VerifyEmailPage"));
const NotFoundPage = lazy(() => import("../pages/public/NotFoundPage"));

const DashboardPage = lazy(() => import("../pages/private/DashboardPage"));
const AnalyzeContractPage = lazy(() => import("../pages/private/AnalyzeContractPage"));
// const GenerateContractPage = lazy(() => import("../pages/private/GenerateContractPage"));
const HistoryPage = lazy(() => import("../pages/private/HistoryPage"));
const ProfilePage = lazy(() => import("../pages/private/ProfilePage"));
const PricingPage = lazy(() => import("../pages/private/PricingPage"));
const PaymentStatusPage = lazy(() => import("../pages/private/PaymentStatusPage"));

const PrivacyPolicyPage = lazy(() => import("../pages/public/legal/PrivacyPolicyPage"));
const TermsPage = lazy(() => import("../pages/public/legal/TermsPage"));
const CookiesPolicyPage = lazy(() => import("../pages/public/legal/CookiesPolicyPage"));
const DisclaimerPage = lazy(() => import("../pages/public/legal/DisclaimerPage"));

// Componente de carga
const PageLoader = () => (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
);

const AppRouter = () => (
    <BrowserRouter>
        <AuthProvider>
            <Suspense fallback={<PageLoader />}>
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
                        {/* <Route path="/contracts/generate" element={<GenerateContractPage />} /> */}
                        <Route path="/history" element={<HistoryPage />} />
                        <Route path="/profile" element={<ProfilePage />} />
                        <Route path="/pricing" element={<PricingPage />} />
                        <Route path="/payment/success" element={<PaymentStatusPage />} />
                        <Route path="/payment/cancel" element={<PaymentStatusPage />} />
                    </Route>

                    {/* 404 */}
                    <Route path="*" element={<NotFoundPage />} />
                </Routes>
            </Suspense>
        </AuthProvider>
    </BrowserRouter>
);

export default AppRouter;
