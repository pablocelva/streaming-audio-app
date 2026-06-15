import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "@/features/auth/model/auth-context";
import { LoginPage } from "@/features/auth/ui/LoginPage";
import { RegisterArtistPage } from "@/features/auth/ui/RegisterArtistPage";
import { DeclarationPage } from "@/features/artist-declaration/ui/DeclarationPage";
import { DashboardPage } from "@/features/artist-stats/ui/DashboardPage";
import { UploadMusicPage } from "@/features/upload-music/ui/UploadMusicPage";
import { AdminDashboardPage } from "@/features/admin-verification/ui/AdminDashboardPage";
import { VerificationPage } from "@/features/admin-verification/ui/VerificationPage";
import { ModerationPage } from "@/features/admin-verification/ui/ModerationPage";
import { AppLayout } from "@/app/layouts/AppLayout";
import { AdminLayout } from "@/app/layouts/AdminLayout";
import { ProtectedRoute } from "@/app/routes/ProtectedRoute";
import { ArtistRoute } from "@/app/routes/ArtistRoute";
import { AdminRoute } from "@/app/routes/AdminRoute";
import { HomeRedirect } from "@/app/routes/HomeRedirect";

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterArtistPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/declaration" element={<DeclarationPage />} />
            <Route element={<ArtistRoute />}>
              <Route element={<AppLayout />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/upload" element={<UploadMusicPage />} />
              </Route>
            </Route>
            <Route element={<AdminRoute />}>
              <Route element={<AdminLayout />}>
                <Route path="/admin" element={<AdminDashboardPage />} />
                <Route path="/admin/verification" element={<VerificationPage />} />
                <Route path="/admin/moderation" element={<ModerationPage />} />
              </Route>
            </Route>
          </Route>
          <Route path="*" element={<HomeRedirect />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
