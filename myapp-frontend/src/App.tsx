import { HomePage } from './pages/Home';
import './App.css';

function App() {
  return (
    <div className="app-container">
      <header className="app-header">
        <h1 className="app-title">JBDH - Job Database Handler</h1>
      </header>
      <main className="main-content">
        <HomePage />
      </main>
    </div>
  );
}

export default App;
