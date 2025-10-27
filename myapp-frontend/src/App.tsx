
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { HomePage } from './pages/Home';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import SearchJobsPage from './pages/SearchJobsPage';
import './App.css';

function App() {
  const isAuthenticated = false; // Set to true to simulate logged-in state

  return (
    <Router>
      <div className="app-container">
        <header className="app-header">
          <h1 className="app-title">JBDH - Job Database Handler</h1>
        </header>
        <nav className="app-navbar">
          <ul className="app-navbar-list">
            <li><Link to="/" className="app-navbar-link">Home</Link></li>
            <li><Link to="/search" className="app-navbar-link">Search</Link></li>
            <li><Link to="/register" className="app-navbar-link">Register</Link></li>
            {!isAuthenticated && (
              <li><Link to="/login" className="app-navbar-link">Login</Link></li>
            )}
            {isAuthenticated && (
              <>
                <li><Link to="/profile" className="app-navbar-link">Profile</Link></li>
                <li><Link to="/boards" className="app-navbar-link">Boards</Link></li>
                <li><Link to="/inbox" className="app-navbar-link">Inbox</Link></li>
                <li><Link to="/settings" className="app-navbar-link">Settings</Link></li>
                <li><Link to="/login" className="app-navbar-link">Logout</Link></li>
              </>
            )}
          </ul>
        </nav>
        <main className="main-content">
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

export default App;
