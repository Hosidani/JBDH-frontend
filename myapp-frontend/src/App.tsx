import { HomePage } from './pages/Home';
import './App.css';


function App() {
  const isAuthenticated = false; // Set to true to simulate logged-in state

  return (
    <div className="app-container">
      <header className="app-header">
        <h1 className="app-title">JBDH - Job Database Handler</h1>
      </header>
      <nav className="app-navbar">
        <ul className="app-navbar-list">
          <li><a href="/" className="app-navbar-link">Home</a></li>
          <li><a href="/search" className="app-navbar-link">Search</a></li>
          <li><a href="/register" className="app-navbar-link">Register</a></li>
          {!isAuthenticated && (
            <li><a href="/login" className="app-navbar-link">Login</a></li>
          )}
          {isAuthenticated && (
            <>
              <li><a href="/profile" className="app-navbar-link">Profile</a></li>
              <li><a href="/boards" className="app-navbar-link">Boards</a></li>
              <li><a href="/inbox" className="app-navbar-link">Inbox</a></li>
              <li><a href="/settings" className="app-navbar-link">Settings</a></li>
              <li><a href="/login" className="app-navbar-link">Logout</a></li>
            </>
          )}
        </ul>
      </nav>
      <main className="main-content">
        <HomePage />
      </main>
    </div>
  );
}

export default App;
