import { Routes, Route, Navigate } from 'react-router-dom';
import { TenantPage } from './pages/public/TenantPage';
import { VoucherPurchasePage } from './pages/public/VoucherPurchasePage';
import { VoucherRedeemPage } from './pages/public/VoucherRedeemPage';
import { ConfirmationPage } from './pages/public/ConfirmationPage';
import { Dashboard } from './pages/app/Dashboard';
import { Login } from './pages/auth/Login';
import { TrainerRoute } from './components/guards/TrainerRoute';
import { HomePage } from './pages/public/HomePage';

export function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<Login />} />

      {/* Public tenant pages */}
      <Route path="/b/:tenantSlug" element={<TenantPage />} />
      <Route path="/b/:tenantSlug/voucher" element={<VoucherPurchasePage />} />
      <Route
        path="/b/:tenantSlug/confirmation/:bookingId"
        element={<ConfirmationPage />}
      />
      <Route path="/v/:voucherCode" element={<VoucherRedeemPage />} />

      {/* Trainer dashboard (auth) */}
      <Route
        path="/app/*"
        element={
          <TrainerRoute>
            <Dashboard />
          </TrainerRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
