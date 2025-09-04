import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-surface">
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/booking" element={<Booking />} />
          <Route path="/check-in/:appointmentId" element={<CheckIn />} />
          <Route path="/services" element={<Services />} />
          <Route path="/store" element={<Store />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/pet-profile" element={<PetProfile />} />
          <Route path="/subscription" element={<Subscription />} />
          <Route path="/journey/:petId" element={<GrowthJourney />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
