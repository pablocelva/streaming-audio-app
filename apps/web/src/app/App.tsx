import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "@/features/auth/model/auth-context";
import { LoginPage } from "@/features/auth/ui/LoginPage";
import { RegisterArtistPage } from "@/features/auth/ui/RegisterArtistPage";
import { DashboardPage } from "@/features/artist-stats/ui/DashboardPage";
import { UploadMusicPage } from "@/features/upload-music/ui/UploadMusicPage";
import { AppLayout } from "@/app/layouts/AppLayout";
import { ProtectedRoute } from "@/app/routes/ProtectedRoute";

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterArtistPage />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/upload" element={<UploadMusicPage />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
