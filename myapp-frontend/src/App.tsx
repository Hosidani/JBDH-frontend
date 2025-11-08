import { useState } from 'react';
import LoginModal from './components/LoginModal';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { HomePage } from './features/home';
import LoginPage from './features/auth/LoginPage';
import RegisterPage from './features/auth/RegisterPage';
import SearchJobsPage from './features/search/SearchJobsPage';
import ProfilePage from './features/profile/ProfilePage';
import './App.css';



function App() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-slate-50">
        {/* Header with hamburger */}
  <header className="w-full flex items-center justify-between px-8 py-6 bg-white border-b border-slate-200">
          <div className="flex items-center gap-3">
            <img src="/logo192.png" alt="SMATCH logo" style={{ width: 40, height: 40 }} />
            <span className="font-bold text-xl tracking-tight">SMATCH</span>
            <span className="text-slate-500 text-sm ml-2">Onödigt enkelt</span>
          </div>
          <button className="p-2 rounded hover:bg-slate-100 focus:outline-none" onClick={() => setMenuOpen(true)}>
            <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </header>

        {/* Hamburger Menu Modal */}
        {menuOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-end bg-black bg-opacity-30" onClick={() => setMenuOpen(false)}>
            <div className="bg-white rounded-lg shadow-lg mt-8 mr-8 p-6 w-64 relative" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-4">
                <span className="font-semibold text-lg">Meny</span>
                <button onClick={() => setMenuOpen(false)} className="text-2xl leading-none">&times;</button>
              </div>
              <nav className="flex flex-col gap-3">
                {!user && <button className="text-left hover:underline" onClick={() => { setMenuOpen(false); setLoginModalOpen(true); }}>Logga in</button>}
                {user && <Link to="/profile" className="text-left hover:underline" onClick={() => setMenuOpen(false)}>Min Profil</Link>}
                <Link to="/boards" className="text-left hover:underline" onClick={() => setMenuOpen(false)}>Lägg in annons</Link>
                <Link to="/search" className="text-left hover:underline" onClick={() => setMenuOpen(false)}>Matcha CV mot annonser</Link>
                <Link to="/search" className="text-left hover:underline" onClick={() => setMenuOpen(false)}>Matcha annonser mot CV</Link>
                <Link to="/about" className="text-left hover:underline" onClick={() => setMenuOpen(false)}>Hur funkar det?</Link>
                {user && (
                  <button className="text-left text-red-600 mt-2 flex items-center gap-2 hover:underline" onClick={() => { logout(); setMenuOpen(false); }}>
                    Logga ut <span style={{ fontSize: 18 }}>&#8594;</span>
                  </button>
                )}
              </nav>
            </div>
          </div>
        )}

        {/* Login Modal */}
        {loginModalOpen && (
          <LoginModal onClose={() => setLoginModalOpen(false)} />
        )}


        <main className="flex-1 flex flex-col items-center justify-start py-8">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/search" element={<SearchJobsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            {/* Add more routes as needed */}
          </Routes>
        </main>
      </div>
    </Router>
  );
}

// Wrap the app in AuthProvider

export default function AppWithProvider() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}

