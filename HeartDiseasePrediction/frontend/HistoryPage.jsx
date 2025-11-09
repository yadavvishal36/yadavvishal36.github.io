import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API } from '@/App';
import { Button } from '@/components/ui/button';
import { Heart, ArrowLeft, Calendar, ChevronRight, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

const HistoryPage = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPredictions();
  }, []);

  const fetchPredictions = async () => {
    try {
      const response = await axios.get(`${API}/predictions`);
      setPredictions(response.data);
    } catch (error) {
      console.error('Failed to fetch predictions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRiskLevel = (assessment) => {
    const text = assessment.toLowerCase();
    if (text.includes('very high')) return { level: 'Very High', className: 'risk-very-high' };
    if (text.includes('high')) return { level: 'High', className: 'risk-high' };
    if (text.includes('moderate')) return { level: 'Moderate', className: 'risk-moderate' };
    return { level: 'Low', className: 'risk-low' };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-teal-50 py-8 px-4" data-testid="history-page">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            data-testid="back-button"
            onClick={() => navigate('/dashboard')}
            variant="ghost"
            className="text-cyan-600 hover:text-cyan-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <div className="flex items-center gap-3 mb-2">
            <Heart className="w-10 h-10 text-cyan-600" fill="#0891b2" />
            <h1 className="text-4xl font-bold text-cyan-900" style={{ fontFamily: 'Playfair Display, serif' }}>
              Assessment History
            </h1>
          </div>
          <p className="text-base text-cyan-700/70">View and track your previous heart health assessments</p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20" data-testid="loading-state">
            <Loader2 className="w-8 h-8 text-cyan-600 animate-spin" />
          </div>
        )}

        {/* Empty State */}
        {!loading && predictions.length === 0 && (
          <div className="bg-white rounded-2xl p-12 text-center border border-cyan-100" data-testid="empty-state">
            <Heart className="w-16 h-16 text-cyan-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-cyan-900 mb-2">No Assessments Yet</h3>
            <p className="text-base text-cyan-700/70 mb-6">Start your first heart health assessment to see your history here</p>
            <Button
              data-testid="start-first-assessment-button"
              onClick={() => navigate('/predict')}
              className="bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-700 hover:to-cyan-800 text-white rounded-full px-6 py-3"
            >
              Start Assessment
            </Button>
          </div>
        )}

        {/* Predictions List */}
        {!loading && predictions.length > 0 && (
          <div className="space-y-4" data-testid="predictions-list">
            {predictions.map((prediction) => {
              const risk = getRiskLevel(prediction.risk_assessment);
              return (
                <div
                  key={prediction.id}
                  data-testid={`prediction-item-${prediction.id}`}
                  onClick={() => navigate(`/result/${prediction.id}`)}
                  className="prediction-card cursor-pointer group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className={`risk-badge ${risk.className}`}>{risk.level} Risk</span>
                        <div className="flex items-center gap-1 text-sm text-cyan-600">
                          <Calendar className="w-4 h-4" />
                          <span>{format(new Date(prediction.created_at), 'MMM dd, yyyy')}</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div>
                          <span className="text-cyan-600 font-medium">Age:</span>
                          <span className="ml-1 text-cyan-900">{prediction.health_data.age}</span>
                        </div>
                        <div>
                          <span className="text-cyan-600 font-medium">BP:</span>
                          <span className="ml-1 text-cyan-900">
                            {prediction.health_data.blood_pressure_systolic}/{prediction.health_data.blood_pressure_diastolic}
                          </span>
                        </div>
                        <div>
                          <span className="text-cyan-600 font-medium">BMI:</span>
                          <span className="ml-1 text-cyan-900">{prediction.health_data.bmi}</span>
                        </div>
                        <div>
                          <span className="text-cyan-600 font-medium">Cholesterol:</span>
                          <span className="ml-1 text-cyan-900">{prediction.health_data.cholesterol_total}</span>
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-cyan-400 group-hover:text-cyan-600 transition-colors" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryPage;