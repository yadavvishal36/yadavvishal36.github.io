import { useNavigate } from 'react-router-dom';
import { Heart, Activity, TrendingUp, Shield, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const LandingPage = ({ isAuthenticated }) => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Activity className="w-8 h-8" />,
      title: "AI-Powered Analysis",
      description: "Advanced GPT-5 technology analyzes your health data for accurate risk assessment"
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: "Comprehensive Evaluation",
      description: "Complete health metrics including ECG, lifestyle, and medical history"
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Personalized Recommendations",
      description: "Tailored lifestyle and medical advice based on your unique profile"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Track Your Progress",
      description: "Monitor your health journey with detailed history and insights"
    }
  ];

  return (
    <div className="hero-section" data-testid="landing-page">
      {/* Navigation */}
      <nav className="relative z-10 px-6 py-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2" data-testid="logo">
            <Heart className="w-8 h-8 text-cyan-600" fill="#0891b2" />
            <span className="text-2xl font-bold text-cyan-900" style={{ fontFamily: 'Playfair Display, serif' }}>
              CardioPredict AI
            </span>
          </div>
          <div>
            {isAuthenticated ? (
              <Button
                data-testid="dashboard-nav-button"
                onClick={() => navigate('/dashboard')}
                className="bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-700 hover:to-cyan-800 text-white rounded-full px-6 py-2 shadow-lg"
              >
                Dashboard
              </Button>
            ) : (
              <Button
                data-testid="signin-nav-button"
                onClick={() => navigate('/auth')}
                variant="outline"
                className="border-2 border-cyan-600 text-cyan-600 hover:bg-cyan-600 hover:text-white rounded-full px-6 py-2"
              >
                Sign In
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 lg:py-32">
        <div className="text-center">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-cyan-900 mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>
            Predict Your Heart Health
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-teal-600">
              With AI Precision
            </span>
          </h1>
          <p className="text-base sm:text-lg text-cyan-800/80 max-w-2xl mx-auto mb-10">
            Advanced AI-powered cardiovascular risk assessment using comprehensive health metrics.
            Get personalized insights and recommendations to protect your heart health.
          </p>
          <div className="flex gap-4 justify-center">
            <Button
              data-testid="get-started-button"
              onClick={() => navigate(isAuthenticated ? '/predict' : '/auth')}
              className="bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-700 hover:to-cyan-800 text-white rounded-full px-8 py-6 text-lg shadow-xl hover:shadow-2xl transition-all"
            >
              Get Started
              <ChevronRight className="ml-2 w-5 h-5" />
            </Button>
            {!isAuthenticated && (
              <Button
                data-testid="learn-more-button"
                onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}
                variant="outline"
                className="border-2 border-cyan-600 text-cyan-600 hover:bg-cyan-50 rounded-full px-8 py-6 text-lg"
              >
                Learn More
              </Button>
            )}
          </div>
        </div>

        {/* Features Section */}
        <div id="features" className="mt-32">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-cyan-900 mb-16" style={{ fontFamily: 'Playfair Display, serif' }}>
            Why Choose CardioPredict AI?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                data-testid={`feature-card-${index}`}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-cyan-200 hover:border-cyan-400 transition-all hover:shadow-xl"
              >
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-cyan-100 to-teal-100 flex items-center justify-center text-cyan-600 mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-cyan-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-cyan-700/70">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-32 bg-white/60 backdrop-blur-sm rounded-3xl p-12 border border-cyan-200 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-cyan-900 mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
            Ready to Take Control of Your Heart Health?
          </h2>
          <p className="text-base text-cyan-800/80 mb-8 max-w-2xl mx-auto">
            Join thousands of users who trust CardioPredict AI for their cardiovascular health monitoring
          </p>
          <Button
            data-testid="cta-get-started-button"
            onClick={() => navigate(isAuthenticated ? '/predict' : '/auth')}
            className="bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-700 hover:to-cyan-800 text-white rounded-full px-8 py-6 text-lg shadow-xl"
          >
            Start Your Assessment
            <ChevronRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;