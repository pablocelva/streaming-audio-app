import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "@/features/auth/model/auth-context";
import { PlayerProvider } from "@/features/player/model/player-context";
import { ListenerLayout } from "@/app/layouts/ListenerLayout";
import { HomePage } from "@/features/discover/ui/HomePage";
import { SearchPage } from "@/features/search/ui/SearchPage";
import { LibraryPage } from "@/features/library/ui/LibraryPage";
import { LoginPage } from "@/features/auth/ui/LoginPage";
import { RegisterPage } from "@/features/auth/ui/RegisterPage";
import { PremiumPage } from "@/features/auth/ui/PremiumPage";

export function App() {
  return (
    <AuthProvider>
      <PlayerProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<ListenerLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/library" element={<LibraryPage />} />
              <Route path="/premium" element={<PremiumPage />} />
            </Route>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Routes>
        </BrowserRouter>
      </PlayerProvider>
    </AuthProvider>
  );
}
