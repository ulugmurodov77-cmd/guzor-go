import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import HomePage from '../pages/HomePage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import TaxiPage from '../pages/TaxiPage';
import RideTrackingPage from '../pages/RideTrackingPage';
import PassengerDashboard from '../pages/PassengerDashboard';
import DriverDashboard from '../pages/DriverDashboard';
import AdminDashboard from '../pages/AdminDashboard';
import { AboutPage, ContactPage, BecomeDriverPage, NotFoundPage } from '../pages/SimplePages';
import { useAuth } from '../store/authStore';

const Protected = ({ children, roles }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/kirish" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" />;
  return children;
};

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/kirish" element={<LoginPage />} />
        <Route path="/royxatdan-otish" element={<RegisterPage />} />
        <Route path="/taksi" element={<TaxiPage />} />
        <Route path="/safar/:rideId" element={<Protected><RideTrackingPage /></Protected>} />
        <Route path="/kabinet" element={<Protected roles={['PASSENGER']}><PassengerDashboard /></Protected>} />
        <Route path="/haydovchi" element={<Protected roles={['DRIVER']}><DriverDashboard /></Protected>} />
        <Route path="/admin" element={<Protected roles={['ADMIN']}><AdminDashboard /></Protected>} />
        <Route path="/haydovchi-bolish" element={<BecomeDriverPage />} />
        <Route path="/biz-haqimizda" element={<AboutPage />} />
        <Route path="/aloqa" element={<ContactPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}