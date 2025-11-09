import { useNavigate } from 'react-router-dom';
import { Heart, Activity, History, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

const DashboardPage = ({ user, onLogout }) => {
  const navigate = useNavigate();

  const menuItems = [
    { icon: <Activity className="w-5 h-5" />, label: 'New Assessment', path: '/predict', testId: 'nav-predict' },
    { icon: <History className="w-5 h-5" />, label: 'History', path: '/history', testId: 'nav-history' },
  ];

  return (
    <div className="dashboard-layout" data-testid="dashboard-page">
      {/* Sidebar */}
      <div className="dashboard-sidebar">
        <div className="px-6 mb-8">
          <div className="flex items-center gap-2" data-testid="sidebar-logo">
            <Heart className="w-8 h-8 text-cyan-600" fill="#0891b2" />
            <span className="text-xl font-bold text-cyan-900" style={{ fontFamily: 'Playfair Display, serif' }}>
              CardioPredict AI
            </span>
          </div>
        </div>

        <nav className="px-4">
          {menuItems.map((item, index) => (
            <button
              key={index}
              data-testid={item.testId}
              onClick={() => navigate(item.path)}
              className="w-full flex items-center gap-3 px-4 py-3 text-cyan-700 hover:bg-cyan-50 rounded-xl transition-colors mb-2"
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="absolute bottom-8 left-0 right-0 px-4">
          <div className="bg-cyan-50 rounded-xl p-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-cyan-600 flex items-center justify-center text-white font-semibold">
                {user?.full_name?.charAt(0)}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="font-semibold text-cyan-900 text-sm truncate">{user?.full_name}</p>
                <p className="text-xs text-cyan-600 truncate">{user?.email}</p>
              </div>
            </div>
          </div>
          <Button
            data-testid="logout-button"
            onClick={onLogout}
            variant="outline"
            className="w-full border-2 border-red-300 text-red-600 hover:bg-red-50 rounded-xl"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="dashboard-content">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-cyan-900 mb-2" style={{ fontFamily: 'Playfair Display, serif' }} data-testid="welcome-title">
            Welcome back, {user?.full_name?.split(' ')[0]}!
          </h1>
          <p className="text-base text-cyan-700/70 mb-12">Monitor your heart health with AI-powered insights</p>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <div
              data-testid="quick-action-assessment"
              onClick={() => navigate('/predict')}
              className="prediction-card cursor-pointer group"
            >
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-100 to-cyan-200 flex items-center justify-center text-cyan-600 group-hover:scale-110 transition-transform">
                  <Activity className="w-7 h-7" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-cyan-900 mb-2">Start New Assessment</h3>
                  <p className="text-sm text-cyan-700/70">Get your heart health risk assessment with AI analysis</p>
                </div>
              </div>
            </div>

            <div
              data-testid="quick-action-history"
              onClick={() => navigate('/history')}
              className="prediction-card cursor-pointer group"
            >
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-100 to-teal-200 flex items-center justify-center text-teal-600 group-hover:scale-110 transition-transform">
                  <History className="w-7 h-7" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-cyan-900 mb-2">View History</h3>
                  <p className="text-sm text-cyan-700/70">Track your previous assessments and progress</p>
                </div>
              </div>
            </div>
          </div>

          {/* Info Section */}
          <div className="bg-white rounded-2xl p-8 border border-cyan-100 shadow-lg">
            <h2 className="text-2xl font-bold text-cyan-900 mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
              About CardioPredict AI
            </h2>
            <p className="text-base text-cyan-700/80 mb-4">
              Our AI-powered platform analyzes comprehensive health metrics including blood pressure, cholesterol, lifestyle factors, and more to provide personalized heart attack risk assessments.
            </p>
            <p className="text-base text-cyan-700/80">
              <strong>Note:</strong> This tool is for informational purposes only and should not replace professional medical advice. Always consult with healthcare professionals for medical decisions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;