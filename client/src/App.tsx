import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { useAuth } from './context/AuthContext';

// Customer Pages
import { HomePage } from './pages/HomePage';
import { RestaurantListPage } from './pages/RestaurantListPage';
import { RestaurantDetailPage } from './pages/RestaurantDetailPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderTrackingPage } from './pages/OrderTrackingPage';
import { OrderHistoryPage } from './pages/OrderHistoryPage';
import { FavoritesPage } from './pages/FavoritesPage';
import { ProfilePage } from './pages/ProfilePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';

// Restaurant Admin Pages
import { AdminSidebar } from './components/admin/AdminSidebar';
import { AdminDashboard } from './pages/RestaurantAdmin/AdminDashboard';
import { OrderManagement } from './pages/RestaurantAdmin/OrderManagement';
import { MenuManagement } from './pages/RestaurantAdmin/MenuManagement';
import { ProfileManagement } from './pages/RestaurantAdmin/ProfileManagement';
import { ReviewsManagement } from './pages/RestaurantAdmin/ReviewsManagement';

// Super Admin Pages
import { SuperDashboard } from './pages/SuperAdmin/SuperDashboard';
import { UserManagement } from './pages/SuperAdmin/UserManagement';
import { RestaurantManagement } from './pages/SuperAdmin/RestaurantManagement';
import { CategoryManagement } from './pages/SuperAdmin/CategoryManagement';
import { CouponManagement } from './pages/SuperAdmin/CouponManagement';
import { AllOrdersManagement } from './pages/SuperAdmin/AllOrdersManagement';

// Auth Route Guards
const RequireAuth: React.FC = () => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />;
};

const RequireRole: React.FC<{ roles: string[] }> = ({ roles }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user || !roles.includes(user.role)) return <Navigate to="/" replace />;
  return <Outlet />;
};

// Admin Layout Shell
const AdminLayout: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row gap-8">
      <AdminSidebar />
      <main className="flex-1 min-w-0">
        <Outlet />
      </main>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col justify-between">
      <div>
        <Navbar />
        <main>
          <Routes>
            {/* Public Customer Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/restaurants" element={<RestaurantListPage />} />
            <Route path="/restaurants/:slug" element={<RestaurantDetailPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Authenticated Customer Routes */}
            <Route element={<RequireAuth />}>
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/orders" element={<OrderHistoryPage />} />
              <Route path="/orders/:id/track" element={<OrderTrackingPage />} />
              <Route path="/favorites" element={<FavoritesPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>

            {/* Restaurant Admin Portal */}
            <Route element={<RequireRole roles={['RESTAURANT_ADMIN', 'SUPER_ADMIN']} />}>
              <Route element={<AdminLayout />}>
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/orders" element={<OrderManagement />} />
                <Route path="/admin/menu" element={<MenuManagement />} />
                <Route path="/admin/profile" element={<ProfileManagement />} />
                <Route path="/admin/reviews" element={<ReviewsManagement />} />
              </Route>
            </Route>

            {/* Super Admin Console */}
            <Route element={<RequireRole roles={['SUPER_ADMIN']} />}>
              <Route element={<AdminLayout />}>
                <Route path="/super-admin" element={<SuperDashboard />} />
                <Route path="/super-admin/users" element={<UserManagement />} />
                <Route path="/super-admin/restaurants" element={<RestaurantManagement />} />
                <Route path="/super-admin/categories" element={<CategoryManagement />} />
                <Route path="/super-admin/coupons" element={<CouponManagement />} />
                <Route path="/super-admin/orders" element={<AllOrdersManagement />} />
              </Route>
            </Route>

            {/* Catch All */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default App;
