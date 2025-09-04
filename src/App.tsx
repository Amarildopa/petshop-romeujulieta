import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { PrivateRoute } from './components/PrivateRoute';
import { AdminRoute } from './components/AdminRoute';
import { Header } from './components/Header';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Booking } from './pages/Booking';
import { Services } from './pages/Services';
import { Store } from './pages/Store';
import { Profile } from './pages/Profile';
import { PetProfile } from './pages/PetProfile';
import { Subscription } from './pages/Subscription';
import { GrowthJourney } from './pages/GrowthJourney';
import { CheckIn } from './pages/CheckIn';
import { AdminAgenda } from './pages/AdminAgenda';
import { AdminService } from './pages/AdminService';
import { AdminDashboard } from './pages/AdminDashboard'; // Importa o novo AdminDashboard

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-surface">
          <Header />
          <Routes>
            {/* Rotas Públicas */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/services" element={<Services />} />
            <Route path="/store" element={<Store />} />

            {/* Rotas Privadas (Cliente) */}
            <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/booking" element={<PrivateRoute><Booking /></PrivateRoute>} />
            <Route path="/check-in/:appointmentId" element={<PrivateRoute><CheckIn /></PrivateRoute>} />
            <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
            <Route path="/pet-profile" element={<PrivateRoute><PetProfile /></PrivateRoute>} />
            <Route path="/pet-profile/:petId" element={<PrivateRoute><PetProfile /></PrivateRoute>} />
            <Route path="/subscription" element={<PrivateRoute><Subscription /></PrivateRoute>} />
            <Route path="/journey/:petId" element={<PrivateRoute><GrowthJourney /></PrivateRoute>} />

            {/* Rotas Privadas (Admin) */}
            <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/admin/agenda" element={<AdminRoute><AdminAgenda /></AdminRoute>} />
            <Route path="/admin/servico/:appointmentId" element={<AdminRoute><AdminService /></AdminRoute>} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
