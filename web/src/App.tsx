import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/Landing';
import PrivacyPage from './pages/Privacy';
import TermsPage from './pages/Terms';
import AdminLoginPage from './pages/admin/Login';
import AdminDashboardPage from './pages/admin/Dashboard';
import AdminApplicationsPage from './pages/admin/Applications';
import AdminBusinessesPage from './pages/admin/Businesses';
import AdminSettingsPage from './pages/admin/Settings';
import { AdminAuthProvider } from './lib/adminAuth';

function App() {
  return (
    <AdminAuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/admin" element={<AdminLoginPage />} />
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          <Route path="/admin/applications" element={<AdminApplicationsPage />} />
          <Route path="/admin/businesses" element={<AdminBusinessesPage />} />
          <Route path="/admin/settings" element={<AdminSettingsPage />} />
        </Routes>
      </BrowserRouter>
    </AdminAuthProvider>
  );
}

export default App;
