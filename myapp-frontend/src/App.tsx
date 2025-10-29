
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import IconHome from './components/icon_library/IconHome';
import IconSearchJobs from './components/icon_library/IconSearchJobs';
import IconUserLogin from './components/icon_library/IconUserLogin';
import IconUserRegister from './components/icon_library/IconUserRegister';
import { HomePage } from './features/home';
import LoginPage from './features/auth/LoginPage';
import RegisterPage from './features/auth/RegisterPage';
import SearchJobsPage from './features/search/SearchJobsPage';
import './App.css';


function App() {
  // Use the AuthContext to get the user and logout function
  const { user, logout } = useAuth();

  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-slate-50">
        <header className="w-full bg-gradient-to-r from-blue-700 via-blue-600 to-blue-500 py-8 shadow-lg flex justify-center items-center border-b-4 border-blue-400">
          <h1 className="text-4xl font-extrabold text-white tracking-wide drop-shadow-lg">JBDH - Job Database Handler</h1>
        </header>
        <nav className="w-full bg-white shadow flex justify-center border-b border-slate-200">
          <ul className="flex flex-row gap-4 py-3 px-2">
            <li className="inline-flex">
              <Link to="/" className="px-5 py-2 rounded-t-lg font-semibold text-blue-700 bg-white hover:bg-blue-100 hover:text-blue-900 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm flex items-center">
                <IconHome className="inline-block mr-2 w-6 h-6 text-blue-700" />
                Home
              </Link>
            </li>
            <li className="inline-flex">
              <Link to="/search" className="px-5 py-2 rounded-t-lg font-semibold text-blue-700 bg-white hover:bg-blue-100 hover:text-blue-900 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm flex items-center">
                <IconSearchJobs className="inline-block mr-2 w-6 h-6 text-blue-700" />
                Search
              </Link>
            </li>
            {!user && (
              <li className="inline-flex">
                <Link to="/register" className="px-5 py-2 rounded-t-lg font-semibold text-blue-700 bg-white hover:bg-blue-100 hover:text-blue-900 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm flex items-center">
                  <IconUserRegister className="inline-block mr-2 w-6 h-6 text-blue-700" />
                  Register
                </Link>
              </li>
            )}
            {!user && (
              <li className="inline-flex">
                <Link to="/login" className="px-5 py-2 rounded-t-lg font-semibold text-blue-700 bg-white hover:bg-blue-100 hover:text-blue-900 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm flex items-center">
                  <IconUserLogin className="inline-block mr-2 w-6 h-6 text-blue-700" />
                  Login
                </Link>
              </li>
            )}
            {user && (
              <>
                <li className="inline-flex"><Link to="/profile" className="px-5 py-2 rounded-t-lg font-semibold text-blue-700 bg-white hover:bg-blue-100 hover:text-blue-900 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm">Profile</Link></li>
                <li className="inline-flex"><Link to="/boards" className="px-5 py-2 rounded-t-lg font-semibold text-blue-700 bg-white hover:bg-blue-100 hover:text-blue-900 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm">Boards</Link></li>
                <li className="inline-flex"><Link to="/inbox" className="px-5 py-2 rounded-t-lg font-semibold text-blue-700 bg-white hover:bg-blue-100 hover:text-blue-900 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm">Inbox</Link></li>
                <li className="inline-flex"><Link to="/settings" className="px-5 py-2 rounded-t-lg font-semibold text-blue-700 bg-white hover:bg-blue-100 hover:text-blue-900 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm">Settings</Link></li>
                <li className="inline-flex"><button onClick={logout} className="px-5 py-2 rounded-t-lg font-semibold text-blue-700 bg-white hover:bg-blue-100 hover:text-blue-900 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm bg-transparent border-none cursor-pointer">Logout</button></li>
              </>
            )}
          </ul>
        </nav>
        <main className="flex-1 flex flex-col items-center justify-start py-8">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/search" element={<SearchJobsPage />} />
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
