import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import { GuestRoute } from './components/GuestRoute';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AuthPage } from './routes/AuthPage';
import { BuilderPage } from './routes/BuilderPage';
import { ConsolePage } from './routes/ConsolePage';
import { GamePage } from './routes/GamePage';
import { LandingPage } from './routes/LandingPage';
import { LogsPage } from './routes/LogsPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<GuestRoute />}>
            <Route path="/auth" element={<AuthPage />} />
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route index element={<LandingPage />} />
              <Route path="builder" element={<BuilderPage />} />
              <Route path="console" element={<ConsolePage />} />
              <Route path="logs" element={<LogsPage />} />
              <Route path="play" element={<GamePage />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
