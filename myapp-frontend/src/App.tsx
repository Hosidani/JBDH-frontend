import { useState, useEffect } from 'react';
import jbdhLogoImg from './assets/img/JBDH_64X64.png';
import { useTranslation } from './hooks/TranslationProvider';
import { LoginModal, UserIndicator, HamburgerMenu, ErrorBoundary, RequireAuth, Footer, FeedbackButton } from './components/common';
import { Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { HomePage } from './features/home';
import { lazy, Suspense } from 'react';
const AboutPage = lazy(() => import('./features/about/AboutPage'));
import { CompareCvToJobAdPage } from './features/compare-cv-to-job-ad';
import { SavedJobsPage } from './features/saved-jobs';
import { RegisterPage } from './features/auth';
import { SearchJobsPage, MatchAdToCvsPage } from './features/search';
import { ProfilePage } from './features/profile';
import { AccountPage } from './features/account';
import { AddJobAdPage } from './features/boards';
import { MatchingProfilePage } from './features/matching';
import { JobsAndCvsPage, JobsAndCvsTblPage } from './features/jobs-and-cvs';
import { AtsResultsPage } from './features/ats';
import { AiAnalysisResultPage } from './features/ai-analysis-result';
import { JobDetailPage } from './features/jobs';
import { MessagesPage } from './features/messages';
import ServiceMessageModal from './components/common/ServiceMessageModal';
import { useServiceMessages } from './hooks/useServiceMessages';
import { ContactPage } from './features/contact';
import { TermsPage } from './features/terms';
import { PrivacyPage } from './features/privacy';
import { EulaPage } from './features/eula';
import './App.css';


function App() {
  const { user, sessionExpired, clearSessionExpired } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [loginRedirectTo, setLoginRedirectTo] = useState<string | null>(null);
  const { currentMessage, acknowledge } = useServiceMessages(user?.email);
  const [sessionDismissed, setSessionDismissed] = useState<string[]>([]);

  useEffect(() => {
    const handler = (e: Event) => {
      const redirectTo = (e as CustomEvent).detail?.redirectTo ?? null;
      setLoginRedirectTo(redirectTo);
      setLoginModalOpen(true);
    };
    window.addEventListener('requireLogin', handler);
    return () => window.removeEventListener('requireLogin', handler);
  }, []);

  useEffect(() => {
    if (user) setSessionDismissed([]);
  }, [user?.email]);
  const { language, changeLanguage, tSync } = useTranslation();

  return (
    <div className="min-h-screen flex flex-col bg-orange-50">
      {/* Header with hamburger and language switcher */}
      <header className="sticky top-0 w-full flex items-center justify-between px-8 py-6 bg-white border-b border-slate-200 z-20">
        <div className="flex items-center gap-3">
          <Link to="/">
            <img src={jbdhLogoImg} alt="JBDH logo" style={{ width: 40, height: 40, cursor: 'pointer' }} />
          </Link>
          <span className="font-bold text-xl tracking-tight">JBDH</span>
          <span className="hidden sm:inline text-slate-500 text-sm ml-2 whitespace-nowrap">{tSync('app_tagline')}</span>
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
        <LoginModal
          onClose={() => setLoginModalOpen(false)}
          onSuccess={() => {
            if (loginRedirectTo) {
              navigate(loginRedirectTo);
              setLoginRedirectTo(null);
            }
          }}
        />
      )}
      {/* Service message modal — requires acknowledgement before using the app */}
      {user && currentMessage && !sessionDismissed.includes(currentMessage.id) && (
        <ServiceMessageModal
          message={currentMessage}
          onAcknowledge={acknowledge}
          onDismiss={() => setSessionDismissed(prev => [...prev, currentMessage.id])}
        />
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
      <FeedbackButton />
      <main className="flex-1 flex flex-col items-center justify-start py-8">
        <Routes>
          {/* Public */}
          <Route path="/" element={<HomePage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/search" element={<RequireAuth><SearchJobsPage /></RequireAuth>} />
          <Route path="/compare-cv-jobad" element={<CompareCvToJobAdPage />} />
          <Route path="/about" element={<Suspense fallback={null}><AboutPage /></Suspense>} />
          <Route path="/messages" element={<MessagesPage />} />

          {/* Requires login */}
          <Route path="/profile"    element={<RequireAuth roles={['User']}><ProfilePage /></RequireAuth>} />
          <Route path="/account"    element={<RequireAuth><AccountPage /></RequireAuth>} />
          <Route path="/saved-jobs" element={<RequireAuth roles={['User']}><SavedJobsPage /></RequireAuth>} />
          <Route path="/job/:id"    element={<RequireAuth roles={['User']}><JobDetailPage /></RequireAuth>} />
          <Route path="/matching"   element={<RequireAuth><MatchingProfilePage /></RequireAuth>} />

          {/* Requires Recruiter role */}
          <Route path="/add-job-ad"   element={<RequireAuth roles={['Recruiter']}><AddJobAdPage /></RequireAuth>} />
          <Route path="/match-ad-cvs" element={<RequireAuth roles={['Recruiter']}><MatchAdToCvsPage /></RequireAuth>} />
          <Route path="/jobs-and-cvs"     element={<RequireAuth roles={['Recruiter', 'Manager']}><JobsAndCvsPage /></RequireAuth>} />
          <Route path="/jobs-and-cvs-tbl" element={<RequireAuth roles={['Recruiter', 'Manager']}><JobsAndCvsTblPage /></RequireAuth>} />
          <Route path="/ats-results"      element={<RequireAuth roles={['Recruiter', 'Manager']}><AtsResultsPage /></RequireAuth>} />
          <Route path="/ai-analysis-result" element={<RequireAuth><AiAnalysisResultPage /></RequireAuth>} />

          {/* Footer pages */}
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/terms"   element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/eula"    element={<EulaPage />} />

          {/* 404 / unknown → root */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
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

