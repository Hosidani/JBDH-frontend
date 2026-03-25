import { useState, useEffect } from 'react';
import { useTranslation } from './hooks/TranslationProvider';
import { LoginModal, UserIndicator, HamburgerMenu, ErrorBoundary } from './components/common';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { HomePage } from './features/home';
import { AboutPage } from './features/about';
import { CompareCvToJobAdPage } from './features/compare-cv-to-job-ad';
import { SavedJobsPage } from './features/saved-jobs';
import { LoginPage, RegisterPage } from './features/auth';
import { SearchJobsPage, MatchAdToCvsPage } from './features/search';
import { ProfilePage } from './features/profile';
import { AccountPage } from './features/account';
import { AddJobAdPage } from './features/boards';
import { MatchingProfilePage } from './features/matching';
import { JobDetailPage } from './features/jobs';
import './App.css';

type LogoutRedirectProps = { user: any; setMenuOpen: (v: boolean) => void };
function LogoutRedirect(props: LogoutRedirectProps) {
  const navigate = useNavigate();
  useEffect(() => {
    if (!props.user) {
      props.setMenuOpen(false);
      navigate('/');
    }
  }, [props.user, navigate, props.setMenuOpen]);
  return null;
}

function App() {
  const { user, sessionExpired, clearSessionExpired } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  useEffect(() => {
    const handler = () => setLoginModalOpen(true);
    window.addEventListener('requireLogin', handler);
    return () => window.removeEventListener('requireLogin', handler);
  }, []);
  const { language, changeLanguage, tSync } = useTranslation();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Header with hamburger and language switcher */}
      <header className="sticky top-0 w-full flex items-center justify-between px-8 py-6 bg-white border-b border-slate-200 z-20">
        <div className="flex items-center gap-3">
          <Link to="/">
            <img src="/JBDH_64X64.png" alt="JBDH logo" style={{ width: 40, height: 40, cursor: 'pointer' }} />
          </Link>
          <span className="font-bold text-xl tracking-tight">JBDH</span>
          <span className="text-slate-500 text-sm ml-2">{tSync('app_tagline')}</span>
        </div>
        <div className="flex items-center gap-4">
          {user && <UserIndicator />}
          {/* Language Switcher */}
          <select
            className="border border-slate-300 rounded px-3 py-1 text-sm bg-white text-slate-700 shadow-sm focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition-colors duration-150"
            value={language}
            onChange={e => changeLanguage(e.target.value)}
            style={{ minWidth: 60 }}
            aria-label="Välj språk"
          >
            <option value="sv">SV</option>
            <option value="en">EN</option>
          </select>
          <button className="p-2 rounded hover:bg-slate-100 focus:outline-none" onClick={() => setMenuOpen(true)}>
            <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </header>
      {/* Hamburger Menu Modal */}
      <HamburgerMenu 
        isOpen={menuOpen} 
        onClose={() => setMenuOpen(false)} 
        onOpenLogin={() => setLoginModalOpen(true)} 
      />
      {/* Login Modal */}
      {loginModalOpen && (
        <LoginModal onClose={() => setLoginModalOpen(false)} />
      )}
      {/* Session expired dialog */}
      {sessionExpired && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full mx-4 flex flex-col gap-4">
            <h2 className="text-lg font-bold text-slate-800">Du har blivit utloggad</h2>
            <p className="text-sm text-slate-600">Din session har gått ut. Logga in igen för att fortsätta.</p>
            <button
              onClick={() => { clearSessionExpired(); navigate('/'); }}
              className="w-full py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              OK
            </button>
          </div>
        </div>
      )}
      <main className="flex-1 flex flex-col items-center justify-start py-8">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/search" element={<SearchJobsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/compare-cv-jobad" element={<CompareCvToJobAdPage />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/matching" element={<MatchingProfilePage />} />
          <Route path="/match-ad-cvs" element={<MatchAdToCvsPage />} />
          <Route path="/add-job-ad" element={<AddJobAdPage />} />
          <Route path="/saved-jobs" element={<SavedJobsPage />} />
          <Route path="/job/:id" element={<JobDetailPage />} />
          <Route path="/about" element={<AboutPage />} />
          {/* Add a route for logout redirect */}
          <Route path="*" element={<LogoutRedirect user={user} setMenuOpen={setMenuOpen} />} />
        </Routes>
      </main>
    </div>
  );
}

// Wrap the app in AuthProvider

import { TranslationProvider } from './hooks/TranslationProvider';

export default function AppWithProvider() {
  return (
    <AuthProvider>
      <TranslationProvider>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </TranslationProvider>
    </AuthProvider>
  );
}

