import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import DailyEntryPage from './pages/DailyEntryPage';
import DashboardPage from './pages/DashboardPage';
import ExpenseDetailPage from './pages/ExpenseDetailPage';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <nav style={{ 
          backgroundColor: '#333', 
          padding: '1rem', 
          marginBottom: '2rem',
          position: 'sticky',
          top: 0,
          zIndex: 1000
        }}>
          <div style={{ 
            maxWidth: '1200px', 
            margin: '0 auto', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center' 
          }}>
            <h1 style={{ color: 'white', margin: 0 }}>Expense Tracker</h1>
            <div>
              <Link to="/" style={{ 
                color: 'white', 
                textDecoration: 'none', 
                marginRight: '2rem',
                padding: '0.5rem 1rem',
                borderRadius: '4px',
                backgroundColor: '#555'
              }}>
                Dashboard
              </Link>
              <Link to="/add-expense" style={{ 
                color: 'white', 
                textDecoration: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '4px',
                backgroundColor: '#007bff'
              }}>
                Add Expense
              </Link>
            </div>
          </div>
        </nav>

        <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/add-expense" element={<DailyEntryPage />} />
            <Route path="/details/:type" element={<ExpenseDetailPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
