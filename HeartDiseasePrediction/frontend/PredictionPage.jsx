import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API } from '@/App';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Heart, ArrowLeft, Loader2 } from 'lucide-react';

const PredictionPage = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    age: '',
    gender: '',
    blood_pressure_systolic: '',
    blood_pressure_diastolic: '',
    cholesterol_total: '',
    cholesterol_ldl: '',
    cholesterol_hdl: '',
    smoking: '',
    diabetes: '',
    family_history: '',
    bmi: '',
    exercise_frequency: '',
    stress_level: '',
    diet_quality: '',
    ecg_data: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const healthData = {
        ...formData,
        age: parseInt(formData.age),
        blood_pressure_systolic: parseInt(formData.blood_pressure_systolic),
        blood_pressure_diastolic: parseInt(formData.blood_pressure_diastolic),
        cholesterol_total: parseInt(formData.cholesterol_total),
        cholesterol_ldl: formData.cholesterol_ldl ? parseInt(formData.cholesterol_ldl) : null,
        cholesterol_hdl: formData.cholesterol_hdl ? parseInt(formData.cholesterol_hdl) : null,
        bmi: parseFloat(formData.bmi),
        ecg_data: formData.ecg_data || null
      };

      const response = await axios.post(`${API}/predict`, { health_data: healthData });
      toast.success('Analysis complete!');
      navigate(`/result/${response.data.id}`);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Prediction failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-teal-50 py-8 px-4" data-testid="prediction-page">
      <div className="max-w-4xl mx-auto">
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
              Heart Health Assessment
            </h1>
          </div>
          <p className="text-base text-cyan-700/70">Complete the form below for your personalized risk assessment</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="health-form" data-testid="prediction-form">
          {/* Basic Information */}
          <div className="form-section">
            <h2 className="form-section-title">Basic Information</h2>
            <div className="form-grid">
              <div>
                <Label htmlFor="age">Age *</Label>
                <Input
                  id="age"
                  data-testid="age-input"
                  type="number"
                  required
                  min="1"
                  max="120"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="gender">Gender *</Label>
                <Select value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value })} required>
                  <SelectTrigger data-testid="gender-select" className="mt-2">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="bmi">BMI *</Label>
                <Input
                  id="bmi"
                  data-testid="bmi-input"
                  type="number"
                  step="0.1"
                  required
                  value={formData.bmi}
                  onChange={(e) => setFormData({ ...formData, bmi: e.target.value })}
                  className="mt-2"
                />
              </div>
            </div>
          </div>

          {/* Vital Signs */}
          <div className="form-section">
            <h2 className="form-section-title">Vital Signs</h2>
            <div className="form-grid">
              <div>
                <Label htmlFor="bp_systolic">Systolic BP (mmHg) *</Label>
                <Input
                  id="bp_systolic"
                  data-testid="bp-systolic-input"
                  type="number"
                  required
                  value={formData.blood_pressure_systolic}
                  onChange={(e) => setFormData({ ...formData, blood_pressure_systolic: e.target.value })}
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="bp_diastolic">Diastolic BP (mmHg) *</Label>
                <Input
                  id="bp_diastolic"
                  data-testid="bp-diastolic-input"
                  type="number"
                  required
                  value={formData.blood_pressure_diastolic}
                  onChange={(e) => setFormData({ ...formData, blood_pressure_diastolic: e.target.value })}
                  className="mt-2"
                />
              </div>
            </div>
          </div>

          {/* Cholesterol */}
          <div className="form-section">
            <h2 className="form-section-title">Cholesterol Levels</h2>
            <div className="form-grid">
              <div>
                <Label htmlFor="chol_total">Total Cholesterol (mg/dL) *</Label>
                <Input
                  id="chol_total"
                  data-testid="cholesterol-total-input"
                  type="number"
                  required
                  value={formData.cholesterol_total}
                  onChange={(e) => setFormData({ ...formData, cholesterol_total: e.target.value })}
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="chol_ldl">LDL Cholesterol (mg/dL)</Label>
                <Input
                  id="chol_ldl"
                  data-testid="cholesterol-ldl-input"
                  type="number"
                  value={formData.cholesterol_ldl}
                  onChange={(e) => setFormData({ ...formData, cholesterol_ldl: e.target.value })}
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="chol_hdl">HDL Cholesterol (mg/dL)</Label>
                <Input
                  id="chol_hdl"
                  data-testid="cholesterol-hdl-input"
                  type="number"
                  value={formData.cholesterol_hdl}
                  onChange={(e) => setFormData({ ...formData, cholesterol_hdl: e.target.value })}
                  className="mt-2"
                />
              </div>
            </div>
          </div>

          {/* Health History */}
          <div className="form-section">
            <h2 className="form-section-title">Health History</h2>
            <div className="form-grid">
              <div>
                <Label htmlFor="smoking">Smoking Status *</Label>
                <Select value={formData.smoking} onValueChange={(value) => setFormData({ ...formData, smoking: value })} required>
                  <SelectTrigger data-testid="smoking-select" className="mt-2">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Never">Never</SelectItem>
                    <SelectItem value="Former">Former</SelectItem>
                    <SelectItem value="Current">Current</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="diabetes">Diabetes Status *</Label>
                <Select value={formData.diabetes} onValueChange={(value) => setFormData({ ...formData, diabetes: value })} required>
                  <SelectTrigger data-testid="diabetes-select" className="mt-2">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="No">No</SelectItem>
                    <SelectItem value="Pre-diabetic">Pre-diabetic</SelectItem>
                    <SelectItem value="Type 1">Type 1</SelectItem>
                    <SelectItem value="Type 2">Type 2</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="family_history">Family History *</Label>
                <Select value={formData.family_history} onValueChange={(value) => setFormData({ ...formData, family_history: value })} required>
                  <SelectTrigger data-testid="family-history-select" className="mt-2">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="No">No</SelectItem>
                    <SelectItem value="Yes">Yes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Lifestyle */}
          <div className="form-section">
            <h2 className="form-section-title">Lifestyle Factors</h2>
            <div className="form-grid">
              <div>
                <Label htmlFor="exercise">Exercise Frequency *</Label>
                <Select value={formData.exercise_frequency} onValueChange={(value) => setFormData({ ...formData, exercise_frequency: value })} required>
                  <SelectTrigger data-testid="exercise-select" className="mt-2">
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Sedentary">Sedentary</SelectItem>
                    <SelectItem value="1-2 days/week">1-2 days/week</SelectItem>
                    <SelectItem value="3-4 days/week">3-4 days/week</SelectItem>
                    <SelectItem value="5+ days/week">5+ days/week</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="stress">Stress Level *</Label>
                <Select value={formData.stress_level} onValueChange={(value) => setFormData({ ...formData, stress_level: value })} required>
                  <SelectTrigger data-testid="stress-select" className="mt-2">
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Moderate">Moderate</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="diet">Diet Quality *</Label>
                <Select value={formData.diet_quality} onValueChange={(value) => setFormData({ ...formData, diet_quality: value })} required>
                  <SelectTrigger data-testid="diet-select" className="mt-2">
                    <SelectValue placeholder="Select quality" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Poor">Poor</SelectItem>
                    <SelectItem value="Fair">Fair</SelectItem>
                    <SelectItem value="Good">Good</SelectItem>
                    <SelectItem value="Excellent">Excellent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* ECG Data */}
          <div className="form-section">
            <h2 className="form-section-title">Additional Information</h2>
            <div>
              <Label htmlFor="ecg">ECG Notes (Optional)</Label>
              <Textarea
                id="ecg"
                data-testid="ecg-input"
                value={formData.ecg_data}
                onChange={(e) => setFormData({ ...formData, ecg_data: e.target.value })}
                className="mt-2"
                rows={4}
                placeholder="Enter any ECG findings or notes..."
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4 mt-8">
            <Button
              data-testid="submit-prediction-button"
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-700 hover:to-cyan-800 text-white rounded-full py-6 text-lg font-semibold shadow-xl"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                'Get Risk Assessment'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PredictionPage;