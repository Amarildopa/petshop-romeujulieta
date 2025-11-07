import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/Header';
import LoadingSpinner from './components/LoadingSpinner';
import AdminRouteGuard from './components/AdminRouteGuard';
import { useSimpleTheme } from './hooks/useSimpleTheme';
import { FEATURES } from './config/features';

// Lazy loading para todas as páginas
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Booking = lazy(() => import('./pages/Booking'));
const Services = lazy(() => import('./pages/Services'));
const Store = lazy(() => import('./pages/Store'));
const Offers = lazy(() => import('./pages/Offers'));
const Profile = lazy(() => import('./pages/Profile'));
const ProfileNew = lazy(() => import('./pages/ProfileNew'));
const PetProfile = lazy(() => import('./pages/PetProfile'));
const AddPet = lazy(() => import('./pages/AddPet'));
const Subscription = lazy(() => import('./pages/Subscription'));
const GrowthJourney = lazy(() => import('./pages/GrowthJourney'));
const CheckIn = lazy(() => import('./pages/CheckIn'));
const Monitoring = lazy(() => import('./pages/Monitoring'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AdminUsers = lazy(() => import('./pages/AdminUsers'));
const AdminReports = lazy(() => import('./pages/AdminReports'));
const AdminTickets = lazy(() => import('./pages/AdminTickets'));
const AdminNotifications = lazy(() => import('./pages/AdminNotifications'));
const AdminLogs = lazy(() => import('./pages/AdminLogs'));
const AdminSettings = lazy(() => import('./pages/AdminSettings'));
const AdminSecurity = lazy(() => import('./pages/AdminSecurity'));
const AdminProducts = lazy(() => import('./pages/AdminProducts'));
const AdminOrders = lazy(() => import('./pages/AdminOrders'));
const AdminSlots = lazy(() => import('./pages/AdminSlots'));
const AdminLayout = lazy(() => import('./components/AdminLayout'));
// const AdminThemeCustomizer = lazy(() => import('./components/AdminThemeCustomizer'));
const AdminThemeSimple = lazy(() => import('./components/AdminThemeSimple'));
const WeeklyBathsCuration = lazy(() => import('./components/WeeklyBathsCurationV2'));
const TestSupabase = lazy(() => import('./pages/TestSupabase'));
const TestSimple = lazy(() => import('./pages/TestSimple'));
const PhotoTest = lazy(() => import('./pages/PhotoTest'));

const Checkout = lazy(() => import('./pages/Checkout'));
const ProductCheckout = lazy(() => import('./pages/ProductCheckout'));
const PaymentConfirmation = lazy(() => import('./pages/PaymentConfirmation'));
const Orders = lazy(() => import('./pages/Orders'));
const Reviews = lazy(() => import('./pages/Reviews'));
const Wishlist = lazy(() => import('./pages/Wishlist'));
const ProductComparison = lazy(() => import('./pages/ProductComparison'));
const WhatsAppTest = lazy(() => import('./pages/WhatsAppTest'));
const BanhoTosaSpa = lazy(() => import('./pages/BanhoTosaSpa'));
const BemEstarSensorial = lazy(() => import('./pages/BemEstarSensorial'));
const RTSPStreaming = lazy(() => import('./pages/RTSPStreaming'));
const Loyalty = lazy(() => import('./pages/Loyalty'));
const Affiliates = lazy(() => import('./pages/Affiliates'));
const Analytics = lazy(() => import('./pages/Analytics'));
const LiveChat = lazy(() => import('./pages/LiveChat'));
const Marketplace = lazy(() => import('./pages/Marketplace'));
const SocialIntegration = lazy(() => import('./pages/SocialIntegration'));
const Subscriptions = lazy(() => import('./pages/Subscriptions'));
const SharedJourney = lazy(() => import('./pages/SharedJourney'));

function App() {
  // Inicializar tema simples
  const { applyColors } = useSimpleTheme();
  
  // Aplicar cores na inicialização
  React.useEffect(() => {
    applyColors();
  }, [applyColors]);

  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-surface">
          <Header />
          <Suspense fallback={<LoadingSpinner fullScreen text="Carregando página..." />}>
            <Routes>
              {/* Rotas públicas */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/booking" element={<Booking />} />
              <Route path="/services" element={<Services />} />
              {FEATURES.enableEcommerce && <Route path="/store" element={<Store />} />}
              {FEATURES.enableOffers && <Route path="/offers" element={<Offers />} />}
              <Route path="/banho-tosa-spa" element={<BanhoTosaSpa />} />
              <Route path="/bem-estar-sensorial" element={<BemEstarSensorial />} />
              {FEATURES.enableSubscriptions && <Route path="/checkout" element={<Checkout />} />}
              {FEATURES.enableProductCheckout && <Route path="/product-checkout" element={<ProductCheckout />} />}
              {FEATURES.enablePaymentConfirmation && <Route path="/payment-confirmation" element={<PaymentConfirmation />} />}
              {FEATURES.enableOrders && <Route path="/orders" element={<Orders />} />}
              {FEATURES.enableReviews && <Route path="/reviews" element={<Reviews />} />}
              {FEATURES.enableWishlist && <Route path="/wishlist" element={<Wishlist />} />}
              {FEATURES.enableComparison && <Route path="/comparison" element={<ProductComparison />} />}
              {FEATURES.enableLoyalty && <Route path="/loyalty" element={<Loyalty />} />}
              <Route path="/affiliates" element={<Affiliates />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/live-chat" element={<LiveChat />} />
              {FEATURES.enableMarketplace && <Route path="/marketplace" element={<Marketplace />} />}
              <Route path="/social-integration" element={<SocialIntegration />} />
              {FEATURES.enableSubscriptions && <Route path="/subscriptions" element={<Subscriptions />} />}
              <Route path="/whatsapp-test" element={<WhatsAppTest />} />
              <Route path="/rtsp-test" element={<RTSPStreaming />} />
              <Route path="/shared/:shareToken" element={<SharedJourney />} />
              
              {/* Rotas protegidas */}
              <Route path="/profile" element={<Profile />} />
              <Route path="/profile-new" element={<ProfileNew />} />
              <Route path="/pet-profile" element={<PetProfile />} />
              <Route path="/add-pet" element={<AddPet />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/subscription" element={<Subscription />} />
              <Route path="/check-in/:appointmentId" element={<CheckIn />} />
              <Route path="/journey/:petId" element={<GrowthJourney />} />
              <Route path="/monitoring" element={<Monitoring />} />
              <Route path="/test-supabase" element={<TestSupabase />} />
              <Route path="/test-simple" element={<TestSimple />} />
              <Route path="/photo-test" element={<PhotoTest />} />

              
              {/* Rotas de administração */}
              <Route path="/admin" element={<AdminLayout />}> 
                <Route index element={<AdminDashboard />} />
                <Route path="users" element={
                  <AdminRouteGuard requiredPermission="users">
                    <AdminUsers />
                  </AdminRouteGuard>
                } />
                <Route path="reports" element={
                  <AdminRouteGuard requiredPermission="reports">
                    <AdminReports />
                  </AdminRouteGuard>
                } />
                <Route path="tickets" element={
                  <AdminRouteGuard requiredPermission="tickets">
                    <AdminTickets />
                  </AdminRouteGuard>
                } />
                <Route path="notifications" element={
                  <AdminRouteGuard requiredPermission="notifications">
                    <AdminNotifications />
                  </AdminRouteGuard>
                } />
                <Route path="logs" element={
                  <AdminRouteGuard requiredPermission="logs">
                    <AdminLogs />
                  </AdminRouteGuard>
                } />
                <Route path="settings" element={
                  <AdminRouteGuard requiredPermission="settings">
                    <AdminSettings />
                  </AdminRouteGuard>
                } />
                <Route path="security" element={
                  <AdminRouteGuard requiredPermission="security">
                    <AdminSecurity />
                  </AdminRouteGuard>
                } />
                {FEATURES.enableAdminProducts && (
                  <Route path="products" element={
                    <AdminRouteGuard requiredPermission="products">
                      <AdminProducts />
                    </AdminRouteGuard>
                  } />
                )}
                {FEATURES.enableAdminOrders && (
                  <Route path="orders" element={
                    <AdminRouteGuard requiredPermission="orders">
                      <AdminOrders />
                    </AdminRouteGuard>
                  } />
                )}
                <Route path="slots" element={
                  <AdminRouteGuard requiredPermission="appointments">
                    <AdminSlots />
                  </AdminRouteGuard>
                } />
                <Route path="theme-simple" element={
                  <AdminRouteGuard requiredPermission="settings">
                    <AdminThemeSimple />
                  </AdminRouteGuard>
                } />
                <Route path="weekly-baths" element={
                  <AdminRouteGuard requiredPermission="settings">
                    <WeeklyBathsCuration />
                  </AdminRouteGuard>
                } />
              </Route>
            </Routes>
          </Suspense>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
