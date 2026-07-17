import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import TechCardForm from './pages/TechCards/TechCardForm';
import TechCardsPage from './pages/TechCards/TechCardsPage';
import TechCardEdit from './pages/TechCards/TechCardEdit';
import TechCardStats from './pages/Activities/TechCardStats';
import MeetingForm from './pages/Meetings/MeetingForm';
import MeetingsPage from './pages/Meetings/MeetingsPage';
import AttendancePortal from './pages/Attendance/AttendancePortal';
import ManagersPage from './pages/Managers/ManagersPage';
import ArchivePage from './pages/Archive/ArchivePage';
import AttendancePredictor from './pages/Archive/AttendancePredictor';
import EbeccoDocuments from './pages/Ebecco/EbeccoDocuments';
import EbeccoChat from './components/EbeccoChat';
import CheckInPage from './pages/CheckInPage';
import EmailVerification from './pages/EmailVerification';
import './styles/app.css';

function AppRoutes() {
  const { user, profile, loading, isVP, signOut } = useAuth();

  if (loading) {
    return (
      <div className="auth-container">
        <div className="auth-card fade-in">
          <h1>EBEC Admin Hub</h1>
          <p className="auth-subtext">Loading workspace...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="apple-bg">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/verify-email" element={<EmailVerification />} />
          <Route path="/dashboard" element={<Navigate to="/" replace />} />
          <Route path="/meetings" element={<Navigate to="/" replace />} />
          <Route path="/checkin/:meetingId/:token" element={<CheckInPage />} />
          <Route path="/techcards" element={<Navigate to="/" replace />} />
          <Route path="/activities" element={<Navigate to="/" replace />} />
          <Route path="/attendance" element={<Navigate to="/" replace />} />
          <Route path="/archive" element={<Navigate to="/" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    );
  }

  if (!isVP) {
    return (
      <div className="apple-bg">
        <Navbar />
        <EbeccoChat />
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/meetings" element={<MeetingsPage />} />
          <Route path="/meetings/new" element={<MeetingForm />} />
          <Route path="/meetings/:id/edit" element={<MeetingForm />} />
          <Route path="/techcards" element={<TechCardsPage />} />
          <Route path="/activities" element={<TechCardStats />} />
          <Route path="/attendance" element={<AttendancePortal />} />
          <Route path="/archive" element={<ArchivePage />} />
          <Route path="/checkin/:meetingId/:token" element={<CheckInPage />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
        <Footer />
      </div>
    );
  }

  return (
    <div className="apple-bg">
      <Navbar />
      <EbeccoChat />
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/meetings" element={<MeetingsPage />} />
        <Route path="/meetings/new" element={<MeetingForm />} />
        <Route path="/meetings/:id/edit" element={<MeetingForm />} />
        <Route path="/techcards" element={<TechCardsPage />} />
        <Route path="/techcards/new" element={<TechCardForm />} />
        <Route path="/techcards/:id/edit" element={<TechCardEdit />} />
        <Route path="/activities" element={<TechCardStats />} />
        <Route path="/attendance" element={<AttendancePortal />} />
        <Route path="/managers" element={<ManagersPage />} />
        <Route path="/archive" element={<ArchivePage />} />
        <Route path="/ebecco" element={<EbeccoDocuments />} />
        <Route path="/predictor" element={<AttendancePredictor />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}
