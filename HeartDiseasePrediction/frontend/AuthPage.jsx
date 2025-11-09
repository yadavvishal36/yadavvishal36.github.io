import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API } from '@/App';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Heart, Mail, Lock, User } from 'lucide-react';

const AuthPage = ({ onLogin }) => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const response = await axios.post(`${API}${endpoint}`, formData);
      
      onLogin(response.data.token, response.data.user);
      toast.success(isLogin ? 'Welcome back!' : 'Account created successfully!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-teal-50 flex items-center justify-center p-4" data-testid="auth-page">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Heart className="w-10 h-10 text-cyan-600" fill="#0891b2" />
            <span className="text-3xl font-bold text-cyan-900" style={{ fontFamily: 'Playfair Display, serif' }}>
              CardioPredict AI
            </span>
          </div>
          <p className="text-sm text-cyan-700/70">AI-Powered Heart Health Assessment</p>
        </div>

        {/* Auth Form */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-cyan-100">
          <h2 className="text-2xl font-bold text-cyan-900 mb-6 text-center" style={{ fontFamily: 'Playfair Display, serif' }}>
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5" data-testid="auth-form">
            {!isLogin && (
              <div>
                <Label htmlFor="full_name" className="text-cyan-900 font-medium">Full Name</Label>
                <div className="relative mt-2">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-cyan-400" />
                  <Input
                    id="full_name"
                    data-testid="full-name-input"
                    type="text"
                    required
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="pl-11 border-cyan-200 focus:border-cyan-400 focus:ring-cyan-400 rounded-xl"
                    placeholder="John Doe"
                  />
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="email" className="text-cyan-900 font-medium">Email</Label>
              <div className="relative mt-2">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-cyan-400" />
                <Input
                  id="email"
                  data-testid="email-input"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="pl-11 border-cyan-200 focus:border-cyan-400 focus:ring-cyan-400 rounded-xl"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password" className="text-cyan-900 font-medium">Password</Label>
              <div className="relative mt-2">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-cyan-400" />
                <Input
                  id="password"
                  data-testid="password-input"
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="pl-11 border-cyan-200 focus:border-cyan-400 focus:ring-cyan-400 rounded-xl"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <Button
              data-testid="submit-button"
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-700 hover:to-cyan-800 text-white rounded-full py-6 font-semibold shadow-lg"
            >
              {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              data-testid="toggle-auth-mode"
              onClick={() => setIsLogin(!isLogin)}
              className="text-cyan-600 hover:text-cyan-700 font-medium text-sm"
            >
              {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
            </button>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <button
            data-testid="back-home-button"
            onClick={() => navigate('/')}
            className="text-cyan-600 hover:text-cyan-700 text-sm font-medium"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;