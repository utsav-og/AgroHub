import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Marketplace from './pages/Marketplace';
import AddProduct from './pages/AddProduct';
import Machinery from './pages/Machinery';
import AddMachinery from './pages/AddMachinery';
import Workers from './pages/Workers';
import AddWorker from './pages/AddWorker';
import Weather from './pages/Weather';
import ExpenseTracker from './pages/ExpenseTracker';
import Inventory from './pages/Inventory';
import Reports from './pages/Reports';
import AdminDashboard from './pages/AdminDashboard';
import FarmerDashboard from './pages/FarmerDashboard';
import BuyerDashboard from './pages/BuyerDashboard';
import NotFound from './pages/NotFound';

// Smart role-based dashboard router component
function RoleDashboardRedirect() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'admin') return <Navigate to="/admin" replace />;
  if (user.role === 'buyer') return <Navigate to="/buyer-dashboard" replace />;
  return <Navigate to="/farmer-dashboard" replace />;
}

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <ScrollToTop />
          <div className="app-shell">
            <Navbar />
            <main className="main-content">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/marketplace" element={<Marketplace />} />
                <Route path="/dashboard" element={<RoleDashboardRedirect />} />
                <Route path="/farmer-dashboard" element={<FarmerDashboard />} />
                <Route path="/buyer-dashboard" element={<BuyerDashboard />} />
                <Route path="/add-product" element={<AddProduct />} />
                <Route path="/machinery" element={<Machinery />} />
                <Route path="/add-machinery" element={<AddMachinery />} />
                <Route path="/workers" element={<Workers />} />
                <Route path="/add-worker" element={<AddWorker />} />
                <Route path="/weather" element={<Weather />} />
                <Route path="/expenses" element={<ExpenseTracker />} />
                <Route path="/inventory" element={<Inventory />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                {/* Wildcard 404 Route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
