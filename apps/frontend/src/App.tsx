import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AppLayout } from "./components/layout/AppLayout";
import {
  Index,
  UsersPage,
  FormPage,
  SelfDeclarationPage,
  FormDefinitions,
  FormSubmissions,
  SelfDeclarationSubmissions,
} from "./pages";
import { ProfilePage } from "./pages/ProfilePage";
import { FormBuilder } from "./pages/FormBuilder";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import MaintenancePage from "./pages/MaintenancePage";
import { Toaster } from "./components/ui/sonner";
import { LoadingSpinner } from "./components/LoadingSpinner";

// Google OAuth Client ID (should be in env variable)
const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

function App() {
  const [maintenance, setMaintenance] = useState<boolean | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch(API_BASE_URL, { signal: controller.signal })
      .then((res) => {
        if (res.status === 503) setMaintenance(true);
        else setMaintenance(false);
      })
      .catch(() => setMaintenance(false));
    return () => controller.abort();
  }, []);

  if (maintenance === null) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (maintenance) {
    return <MaintenancePage />;
  }

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected routes with layout */}
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<AppLayout />}>
                <Route index element={<Index />} />
                <Route path="users" element={<UsersPage />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route
                  path="forms/self-declaration"
                  element={<SelfDeclarationPage />}
                />
                <Route path="forms/:formSlug" element={<FormPage />} />
                <Route path="admin/forms" element={<FormDefinitions />} />
                <Route path="admin/forms/new" element={<FormBuilder />} />
                <Route path="admin/forms/:id/edit" element={<FormBuilder />} />
                <Route
                  path="admin/form-submissions"
                  element={<FormSubmissions />}
                />
                <Route
                  path="admin/self-declarations"
                  element={<SelfDeclarationSubmissions />}
                />
              </Route>
            </Route>
          </Routes>
          <Toaster />
        </AuthProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}

export default App;
