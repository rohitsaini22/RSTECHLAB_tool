import React, { useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { User, UserRole } from './types';
import { getCurrentUser, logout } from './services/mockBackend';
import { Layout } from './components/Layout';
import ScrollToTop from './components/ScrollToTop';

// Pages
import LandingPage from './pages/LandingPage';
import Products from './pages/Products';
import Services from './pages/Services';
import Contact from './pages/Contact';
import Electronics from './pages/Electronics';
import About from './pages/About';
import Pricing from './pages/Pricing';
import Careers from './pages/Careers';
import LoginPage from './pages/Login';
import Tools from './pages/Tools';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageTools from './pages/admin/ManageTools';
import UserManagement from './pages/admin/UserManagement';
import AdminMessages from './pages/admin/AdminMessages';
import ManageCareers from './pages/admin/ManageCareers';
import ManageUpdates from './pages/admin/ManageUpdates';
import ClientOverview from './pages/client/ClientOverview';
import ClientMarketplace from './pages/client/ClientDashboard';
import MySoftware from './pages/client/MySoftware';
import Downloads from './pages/client/Downloads';
import BillingHistory from './pages/client/BillingHistory';
import Profile from './pages/Profile';
import Settings from './pages/Settings';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const u = getCurrentUser();
    setUser(u);
    setLoading(false);
  }, []);

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
  };

  const handleLogout = () => {
    logout(); // Clear local storage
    setUser(null); // Clear state
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-gray-900 text-white">Loading...</div>;

  // Helper for Public Pages that need Navbar props
  const PublicProps = { user, onLogout: handleLogout };

  return (
    <Router>
      <ScrollToTop />
      <Routes>
        {/* Public Website Routes - Now passing User props to update Navbar */}
        <Route path="/" element={<LandingPage {...PublicProps} />} />
        <Route path="/electronics" element={<Electronics {...PublicProps} />} />
        <Route path="/products" element={<Products {...PublicProps} />} />
        <Route path="/tools" element={<Tools {...PublicProps} />} />
        <Route path="/services" element={<Services {...PublicProps} />} />
        <Route path="/about" element={<About {...PublicProps} />} />
        <Route path="/contact" element={<Contact {...PublicProps} />} />
        <Route path="/pricing" element={<Pricing {...PublicProps} />} />
        <Route path="/careers" element={<Careers {...PublicProps} />} />
        
        {/* Auth Route - Modified to show success message instead of redirecting immediately */}
        <Route path="/login" element={
          <LoginPage onLogin={handleLogin} currentUser={user} onLogout={handleLogout} />
        } />
        
        {/* Profile Route - Accessible by both roles */}
        <Route path="/profile" element={
          user ? (
             <Layout user={user} onLogout={handleLogout}><Profile /></Layout>
          ) : <Navigate to="/login" />
        } />

        {/* Admin Routes */}
        <Route path="/admin" element={
          user?.role === UserRole.ADMIN ? (
            <Layout user={user} onLogout={handleLogout}><AdminDashboard /></Layout>
          ) : <Navigate to="/login" />
        } />
        <Route path="/admin/tools" element={
          user?.role === UserRole.ADMIN ? (
            <Layout user={user} onLogout={handleLogout}><ManageTools /></Layout>
          ) : <Navigate to="/login" />
        } />
        <Route path="/admin/users" element={
           user?.role === UserRole.ADMIN ? (
            <Layout user={user} onLogout={handleLogout}><UserManagement /></Layout>
          ) : <Navigate to="/login" />
        } />
        <Route path="/admin/messages" element={
           user?.role === UserRole.ADMIN ? (
            <Layout user={user} onLogout={handleLogout}><AdminMessages /></Layout>
          ) : <Navigate to="/login" />
        } />
        <Route path="/admin/careers" element={
           user?.role === UserRole.ADMIN ? (
            <Layout user={user} onLogout={handleLogout}><ManageCareers /></Layout>
          ) : <Navigate to="/login" />
        } />
        <Route path="/admin/updates" element={
           user?.role === UserRole.ADMIN ? (
            <Layout user={user} onLogout={handleLogout}><ManageUpdates /></Layout>
          ) : <Navigate to="/login" />
        } />
        <Route path="/admin/settings" element={
           user?.role === UserRole.ADMIN ? (
            <Layout user={user} onLogout={handleLogout}><Settings /></Layout>
          ) : <Navigate to="/login" />
        } />

        {/* Client Routes */}
        <Route path="/client" element={
          user?.role === UserRole.CLIENT ? (
            <Layout user={user} onLogout={handleLogout}><ClientOverview /></Layout>
          ) : <Navigate to="/login" />
        } />
        <Route path="/client/marketplace" element={
          user?.role === UserRole.CLIENT ? (
            <Layout user={user} onLogout={handleLogout}><ClientMarketplace /></Layout>
          ) : <Navigate to="/login" />
        } />
        <Route path="/client/my-software" element={
           user?.role === UserRole.CLIENT ? (
            <Layout user={user} onLogout={handleLogout}><MySoftware /></Layout>
          ) : <Navigate to="/login" />
        } />
        <Route path="/client/downloads" element={
           user?.role === UserRole.CLIENT ? (
            <Layout user={user} onLogout={handleLogout}><Downloads /></Layout>
          ) : <Navigate to="/login" />
        } />
        <Route path="/client/history" element={
           user?.role === UserRole.CLIENT ? (
            <Layout user={user} onLogout={handleLogout}><BillingHistory /></Layout>
          ) : <Navigate to="/login" />
        } />
        <Route path="/client/settings" element={
           user?.role === UserRole.CLIENT ? (
            <Layout user={user} onLogout={handleLogout}><Settings /></Layout>
          ) : <Navigate to="/login" />
        } />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

export default App;
