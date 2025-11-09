import { useState, useEffect } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import axios from "axios";
import LandingPage from "@/pages/LandingPage";
import AuthPage from "@/pages/AuthPage";
import DashboardPage from "@/pages/DashboardPage";
import PredictionPage from "@/pages/PredictionPage";
import HistoryPage from "@/pages/HistoryPage";
import ResultPage from "@/pages/ResultPage";
import { Toaster } from "@/components/ui/sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

// Auth Context
export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchUser = async () => {
    try {
      const response = await axios.get(`${API}/auth/me`);
      setUser(response.data);
    } catch (error) {
      console.error('Failed to fetch user:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = (newToken, userData) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(userData);
    axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
  };

  return { user, loading, login, logout, isAuthenticated: !!user };
};

const PrivateRoute = ({ children, isAuthenticated, loading }) => {
  if (loading) return <div className="loading-container">Loading...</div>;
  return isAuthenticated ? children : <Navigate to="/auth" />;
};

function App() {
  const auth = useAuth();

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage isAuthenticated={auth.isAuthenticated} />} />
          <Route path="/auth" element={
            auth.isAuthenticated ? <Navigate to="/dashboard" /> : <AuthPage onLogin={auth.login} />
          } />
          <Route path="/dashboard" element={
            <PrivateRoute isAuthenticated={auth.isAuthenticated} loading={auth.loading}>
              <DashboardPage user={auth.user} onLogout={auth.logout} />
            </PrivateRoute>
          } />
          <Route path="/predict" element={
            <PrivateRoute isAuthenticated={auth.isAuthenticated} loading={auth.loading}>
              <PredictionPage user={auth.user} onLogout={auth.logout} />
            </PrivateRoute>
          } />
          <Route path="/history" element={
            <PrivateRoute isAuthenticated={auth.isAuthenticated} loading={auth.loading}>
              <HistoryPage user={auth.user} onLogout={auth.logout} />
            </PrivateRoute>
          } />
          <Route path="/result/:predictionId" element={
            <PrivateRoute isAuthenticated={auth.isAuthenticated} loading={auth.loading}>
              <ResultPage user={auth.user} onLogout={auth.logout} />
            </PrivateRoute>
          } />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" richColors />
    </div>
  );
}

export default App;