import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Header } from './components/Header';
import LoadingSpinner from './components/LoadingSpinner';
import AdminRouteGuard from './components/AdminRouteGuard';

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
const AdminLayout = lazy(() => import('./components/AdminLayout'));
const TestSupabase = lazy(() => import('./pages/TestSupabase'));
const TestSimple = lazy(() => import('./pages/TestSimple'));
const PhotoTest = lazy(() => import('./pages/PhotoTest'));
const ThemeCustomizer = lazy(() => import('./pages/ThemeCustomizer'));
const Checkout = lazy(() => import('./pages/Checkout'));
const PaymentConfirmation = lazy(() => import('./pages/PaymentConfirmation'));
const WhatsAppTest = lazy(() => import('./pages/WhatsAppTest'));
const BanhoTosaSpa = lazy(() => import('./pages/BanhoTosaSpa'));

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-surface">
          <Header />
          <Suspense fallback={<LoadingSpinner fullScreen text="Carregando página..." />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/booking" element={<Booking />} />
              <Route path="/check-in/:appointmentId" element={<CheckIn />} />
              <Route path="/services" element={<Services />} />
              <Route path="/store" element={<Store />} />
              <Route path="/offers" element={<Offers />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/profile-new" element={<ProfileNew />} />
              <Route path="/pet-profile" element={<PetProfile />} />
              <Route path="/add-pet" element={<AddPet />} />
              <Route path="/subscription" element={<Subscription />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/payment-confirmation" element={<PaymentConfirmation />} />
              <Route path="/banho-tosa-spa" element={<BanhoTosaSpa />} />
            <Route path="/journey/:petId" element={<GrowthJourney />} />
            <Route path="/monitoring" element={<Monitoring />} />
            <Route path="/test-supabase" element={<TestSupabase />} />
            <Route path="/test-simple" element={<TestSimple />} />
            <Route path="/photo-test" element={<PhotoTest />} />
            <Route path="/whatsapp-test" element={<WhatsAppTest />} />
            <Route
              path="/theme-customizer"
              element={<ThemeCustomizer />}
            />
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
            </Route>
            </Routes>
          </Suspense>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
