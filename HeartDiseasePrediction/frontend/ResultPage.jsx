import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { API } from '@/App';
import { Button } from '@/components/ui/button';
import { Heart, ArrowLeft, Calendar, User, Activity, Loader2, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';

const ResultPage = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const { predictionId } = useParams();
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPrediction();
  }, [predictionId]);

  const fetchPrediction = async () => {
    try {
      const response = await axios.get(`${API}/predictions/${predictionId}`);
      setPrediction(response.data);
    } catch (error) {
      console.error('Failed to fetch prediction:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRiskLevel = (assessment) => {
    const text = assessment.toLowerCase();
    if (text.includes('very high')) return { level: 'Very High Risk', className: 'risk-very-high' };
    if (text.includes('high')) return { level: 'High Risk', className: 'risk-high' };
    if (text.includes('moderate')) return { level: 'Moderate Risk', className: 'risk-moderate' };
    return { level: 'Low Risk', className: 'risk-low' };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-teal-50 flex items-center justify-center" data-testid="loading-result">
        <Loader2 className="w-8 h-8 text-cyan-600 animate-spin" />
      </div>
    );
  }

  if (!prediction) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-teal-50 flex items-center justify-center" data-testid="not-found">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-cyan-900 mb-4">Prediction Not Found</h2>
          <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  const risk = getRiskLevel(prediction.risk_assessment);

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-teal-50 py-8 px-4" data-testid="result-page">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            data-testid="back-to-history-button"
            onClick={() => navigate('/history')}
            variant="ghost"
            className="text-cyan-600 hover:text-cyan-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to History
          </Button>
          <div className="flex items-center gap-3 mb-2">
            <Heart className="w-10 h-10 text-cyan-600" fill="#0891b2" />
            <h1 className="text-4xl font-bold text-cyan-900" style={{ fontFamily: 'Playfair Display, serif' }}>
              Assessment Results
            </h1>
          </div>
          <div className="flex items-center gap-4 text-sm text-cyan-600">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{format(new Date(prediction.created_at), 'MMMM dd, yyyy')}</span>
            </div>
            <div className="flex items-center gap-1">
              <User className="w-4 h-4" />
              <span>{user?.full_name}</span>
            </div>
          </div>
        </div>

        {/* Risk Level Card */}
        <div className="bg-white rounded-2xl p-8 border border-cyan-100 shadow-xl mb-6" data-testid="risk-level-card">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-100 to-teal-100 flex items-center justify-center">
              <Activity className="w-8 h-8 text-cyan-600" />
            </div>
            <div>
              <h2 className="text-sm font-medium text-cyan-600 uppercase tracking-wide mb-1">Overall Assessment</h2>
              <span className={`text-2xl font-bold risk-badge ${risk.className}`}>{risk.level}</span>
            </div>
          </div>
        </div>

        {/* Health Data Summary */}
        <div className="bg-white rounded-2xl p-6 border border-cyan-100 shadow-lg mb-6" data-testid="health-data-summary">
          <h3 className="text-xl font-semibold text-cyan-900 mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
            Health Metrics
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-cyan-50 rounded-xl p-3">
              <p className="text-xs text-cyan-600 font-medium mb-1">Age</p>
              <p className="text-lg font-semibold text-cyan-900">{prediction.health_data.age} years</p>
            </div>
            <div className="bg-cyan-50 rounded-xl p-3">
              <p className="text-xs text-cyan-600 font-medium mb-1">Blood Pressure</p>
              <p className="text-lg font-semibold text-cyan-900">
                {prediction.health_data.blood_pressure_systolic}/{prediction.health_data.blood_pressure_diastolic}
              </p>
            </div>
            <div className="bg-cyan-50 rounded-xl p-3">
              <p className="text-xs text-cyan-600 font-medium mb-1">BMI</p>
              <p className="text-lg font-semibold text-cyan-900">{prediction.health_data.bmi}</p>
            </div>
            <div className="bg-cyan-50 rounded-xl p-3">
              <p className="text-xs text-cyan-600 font-medium mb-1">Cholesterol</p>
              <p className="text-lg font-semibold text-cyan-900">{prediction.health_data.cholesterol_total} mg/dL</p>
            </div>
            <div className="bg-cyan-50 rounded-xl p-3">
              <p className="text-xs text-cyan-600 font-medium mb-1">Smoking</p>
              <p className="text-lg font-semibold text-cyan-900">{prediction.health_data.smoking}</p>
            </div>
            <div className="bg-cyan-50 rounded-xl p-3">
              <p className="text-xs text-cyan-600 font-medium mb-1">Diabetes</p>
              <p className="text-lg font-semibold text-cyan-900">{prediction.health_data.diabetes}</p>
            </div>
            <div className="bg-cyan-50 rounded-xl p-3">
              <p className="text-xs text-cyan-600 font-medium mb-1">Exercise</p>
              <p className="text-lg font-semibold text-cyan-900">{prediction.health_data.exercise_frequency}</p>
            </div>
            <div className="bg-cyan-50 rounded-xl p-3">
              <p className="text-xs text-cyan-600 font-medium mb-1">Stress Level</p>
              <p className="text-lg font-semibold text-cyan-900">{prediction.health_data.stress_level}</p>
            </div>
          </div>
        </div>

        {/* Risk Assessment */}
        <div className="bg-white rounded-2xl p-6 border border-cyan-100 shadow-lg mb-6" data-testid="risk-assessment">
          <h3 className="text-xl font-semibold text-cyan-900 mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
            Detailed Risk Assessment
          </h3>
          <div className="prose prose-cyan max-w-none">
            <p className="text-base text-cyan-800 whitespace-pre-line leading-relaxed">{prediction.risk_assessment}</p>
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-white rounded-2xl p-6 border border-cyan-100 shadow-lg mb-6" data-testid="recommendations">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-6 h-6 text-cyan-600" />
            <h3 className="text-xl font-semibold text-cyan-900" style={{ fontFamily: 'Playfair Display, serif' }}>
              Personalized Recommendations
            </h3>
          </div>
          <div className="prose prose-cyan max-w-none">
            <p className="text-base text-cyan-800 whitespace-pre-line leading-relaxed">{prediction.recommendations}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <Button
            data-testid="new-assessment-button"
            onClick={() => navigate('/predict')}
            className="bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-700 hover:to-cyan-800 text-white rounded-full px-6 py-3"
          >
            New Assessment
          </Button>
          <Button
            data-testid="view-all-button"
            onClick={() => navigate('/history')}
            variant="outline"
            className="border-2 border-cyan-600 text-cyan-600 hover:bg-cyan-50 rounded-full px-6 py-3"
          >
            View All Assessments
          </Button>
        </div>

        {/* Disclaimer */}
        <div className="mt-8 bg-cyan-50 rounded-xl p-4 border border-cyan-200">
          <p className="text-xs text-cyan-700">
            <strong>Medical Disclaimer:</strong> This assessment is for informational purposes only and should not replace professional medical advice, diagnosis, or treatment. Always consult with qualified healthcare professionals regarding your health concerns.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResultPage;