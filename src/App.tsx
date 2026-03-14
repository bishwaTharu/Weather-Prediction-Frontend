import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CloudRain, Sun, Wind, Thermometer, Droplets, Gauge, Loader2, RefreshCcw, Info, MapPin, Zap } from 'lucide-react';
import { predictWeather } from './api';
import { fetchLiveWeather } from './weatherService';
import { WeatherPredictionRequest, WeatherPredictionResponse } from './types';

const AUSTRALIAN_LOCATIONS = [
  'Adelaide', 'Albany', 'Albury', 'AliceSprings', 'BadgerysCreek', 'Ballarat',
  'Bendigo', 'Brisbane', 'Cairns', 'Canberra', 'Cobar', 'CoffsHarbour',
  'Dartmoor', 'Darwin', 'GoldCoast', 'Hobart', 'Katherine', 'Launceston',
  'Melbourne', 'MelbourneAirport', 'Mildura', 'Moree', 'MountGambier',
  'MountGinini', 'Newcastle', 'Nhil', 'NorahHead', 'NorfolkIsland', 'Nuriootpa',
  'PearceRAAF', 'Penrith', 'Perth', 'PerthAirport', 'Portland', 'Richmond',
  'Sale', 'SalmonGums', 'Sydney', 'SydneyAirport', 'Townsville', 'Tuggeranong',
  'Uluru', 'WaggaWagga', 'Walpole', 'Watsonia', 'Williamtown',
  'Witchcliffe', 'Wollongong', 'Woomera'
];

const App: React.FC = () => {
  const [formData, setFormData] = useState<WeatherPredictionRequest>({
    Location: 'Sydney',
    MinTemp: 15,
    MaxTemp: 25,
    Rainfall: 0,
    WindGustSpeed: 40,
    Humidity9am: 70,
    Humidity3pm: 50,
    Pressure9am: 1015,
    Pressure3pm: 1012,
    RainToday: 'No'
  });

  const [loading, setLoading] = useState(false);
  const [liveLoading, setLiveLoading] = useState(false);
  const [liveError, setLiveError] = useState<string | null>(null);
  const [result, setResult] = useState<WeatherPredictionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAutoFill = async () => {
    if (!formData.Location || formData.Location === '') return;
    setLiveLoading(true);
    setLiveError(null);
    try {
      const live = await fetchLiveWeather(formData.Location);
      setFormData((prev: WeatherPredictionRequest) => ({ ...prev, ...live }));
    } catch (e: any) {
      setLiveError('Could not fetch live weather. Check your connection.');
    } finally {
      setLiveLoading(false);
    }
  };

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // If location is being changed, fetch live weather data
    if (name === 'Location' && value && value !== '') {
      setLiveLoading(true);
      setLiveError(null);
      try {
        const live = await fetchLiveWeather(value);
        setFormData((prev: WeatherPredictionRequest) => ({ 
          ...prev, 
          [name]: value,
          ...live 
        }));
      } catch (e: any) {
        setLiveError('Could not fetch live weather. Check your connection.');
        // Still update the location even if API fails
        setFormData((prev: WeatherPredictionRequest) => ({
          ...prev,
          [name]: value
        }));
      } finally {
        setLiveLoading(false);
      }
    } else {
      // Handle other input changes normally
      setFormData((prev: WeatherPredictionRequest) => ({
        ...prev,
        [name]: (name === 'RainToday' || name === 'Location' || name.includes('Dir')) ? value : parseFloat(value) || 0
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = await predictWeather(formData);
      setResult(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to get prediction from server. Please ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8 w-full flex flex-col gap-8 animate-fade-in bg-white">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
            AeroWeather
          </h1>
          <p className="text-slate-600 mt-1">Intelligent Australian Weather Forecasting</p>
        </div>
        <div className="flex gap-4">
          <div className="glass-card px-4 py-2 rounded-full flex items-center gap-2 text-sm text-green-600">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            System Live
          </div>
        </div>
      </header>

      <main className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Input Form Section */}
        <section className="lg:col-span-2">
          <div className="glass-card p-6 md:p-8 rounded-3xl h-full">
            <div className="flex items-center justify-between gap-3 mb-8 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-2xl text-blue-600">
                  <Gauge size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-slate-800">Conditions Input</h2>
                  <p className="text-slate-600 text-sm">Fill in the local weather details</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <button
                  type="button"
                  onClick={handleAutoFill}
                  disabled={liveLoading || !formData.Location || formData.Location === ''}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-slate-300"
                >
                  {liveLoading ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
                  {liveLoading ? 'Fetching...' : 'Refresh'}
                </button>
                {liveError && <p className="text-red-400 text-xs">{liveError}</p>}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Location — full width */}
              <div>
                <InputGroup label="Location" icon={<MapPin size={18} />}>
                  <select name="Location" value={formData.Location} onChange={handleInputChange} className="glass-input w-full appearance-none cursor-pointer">
                    <option value="" className="bg-white text-slate-900">Select a location...</option>
                    {AUSTRALIAN_LOCATIONS.map(loc => (
                      <option key={loc} value={loc} className="bg-white text-slate-900">{loc}</option>
                    ))}
                  </select>
                </InputGroup>
              </div>

              {/* Show other fields only after location is selected */}
              {formData.Location && formData.Location !== '' && (
                <div className="space-y-6 animate-fade-in">
                  {liveLoading && (
                    <div className="flex items-center gap-2 text-slate-500 text-sm">
                      <Loader2 size={16} className="animate-spin" />
                      <span>Fetching current weather data...</span>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <InputGroup label="Min Temperature (°C)" icon={<Thermometer size={18} />}>
                    <input type="number" name="MinTemp" value={formData.MinTemp} onChange={handleInputChange} className="glass-input w-full" step="0.1" />
                  </InputGroup>

                  <InputGroup label="Max Temperature (°C)" icon={<Thermometer size={18} />}>
                    <input type="number" name="MaxTemp" value={formData.MaxTemp} onChange={handleInputChange} className="glass-input w-full" step="0.1" />
                  </InputGroup>

                  <InputGroup label="Rainfall (mm)" icon={<Droplets size={18} />}>
                    <input type="number" name="Rainfall" value={formData.Rainfall} onChange={handleInputChange} className="glass-input w-full" step="0.1" />
                  </InputGroup>

                  <InputGroup label="Humidity 9am (%)" icon={<Droplets size={18} />}>
                    <input type="number" name="Humidity9am" value={formData.Humidity9am} onChange={handleInputChange} className="glass-input w-full" />
                  </InputGroup>

                  <InputGroup label="Humidity 3pm (%)" icon={<Droplets size={18} />}>
                    <input type="number" name="Humidity3pm" value={formData.Humidity3pm} onChange={handleInputChange} className="glass-input w-full" />
                  </InputGroup>

                  <InputGroup label="Wind Speed Gust (km/h)" icon={<Wind size={18} />}>
                    <input type="number" name="WindGustSpeed" value={formData.WindGustSpeed} onChange={handleInputChange} className="glass-input w-full" />
                  </InputGroup>

                  <InputGroup label="Pressure 9am (hPa)" icon={<Gauge size={18} />}>
                    <input type="number" name="Pressure9am" value={formData.Pressure9am} onChange={handleInputChange} className="glass-input w-full" step="0.1" />
                  </InputGroup>

                  <InputGroup label="Pressure 3pm (hPa)" icon={<Gauge size={18} />}>
                    <input type="number" name="Pressure3pm" value={formData.Pressure3pm} onChange={handleInputChange} className="glass-input w-full" step="0.1" />
                  </InputGroup>

                  <InputGroup label="Rain Today?" icon={<CloudRain size={18} />}>
                    <select name="RainToday" value={formData.RainToday} onChange={handleInputChange} className="glass-input w-full appearance-none cursor-pointer">
                      <option value="No" className="bg-white text-slate-900">No</option>
                      <option value="Yes" className="bg-white text-slate-900">Yes</option>
                    </select>
                  </InputGroup>

                  <div className="md:col-span-2 lg:col-span-3 pt-4 border-t border-slate-700/50 flex justify-end">
                    <button type="submit" disabled={loading} className="primary-button w-full md:w-auto min-w-[200px] flex items-center justify-center gap-2">
                      {loading ? <Loader2 className="animate-spin" size={20} /> : <RefreshCcw size={20} />}
                      {loading ? 'Processing...' : 'Run Prediction'}
                    </button>
                  </div>
                </div>
                </div>
              )}
            </form>
          </div>
        </section>

        {/* Results Sidebar Section */}
        <section className="lg:col-span-1 flex flex-col gap-6">
          <AnimatePresence mode="wait">
            {!result && !error && !loading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="glass-card p-12 rounded-3xl flex flex-col items-center justify-center text-center h-full border-dashed border-slate-300">
                <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mb-6">
                  <Sun size={40} className="text-slate-400" />
                </div>
                <h3 className="text-lg font-medium text-slate-600">Awaiting Data</h3>
                <p className="text-slate-500 text-sm mt-2 max-w-[200px]">Fill the form to generate a weather forecast</p>
              </motion.div>
            )}

            {loading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="glass-card p-12 rounded-3xl flex flex-col items-center justify-center text-center h-full">
                <div className="relative w-24 h-24 mb-6">
                  <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full" />
                  <div className="absolute inset-0 border-4 border-t-blue-500 rounded-full animate-spin" />
                  <CloudRain size={40} className="absolute inset-0 m-auto text-blue-500 animate-pulse" />
                </div>
                <p className="text-blue-600 font-medium animate-pulse">Running ML Core...</p>
              </motion.div>
            )}

            {error && (
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-card p-8 rounded-3xl border-red-200 bg-red-50">
                <div className="text-red-600 mb-4 flex items-center gap-2 font-semibold">
                  <Info size={20} />
                  Prediction Failed
                </div>
                <p className="text-slate-600 text-sm leading-relaxed">{error}</p>
                <button onClick={() => setError(null)} className="mt-6 text-sm text-slate-500 hover:text-slate-700 transition-colors">Dismiss</button>
              </motion.div>
            )}

            {result && (
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col gap-6 h-full">
                <div className={`glass-card p-8 rounded-3xl relative overflow-hidden h-full flex flex-col justify-between border-2 ${result.prediction === 'Yes' ? 'border-blue-200 bg-blue-50' : 'border-amber-200 bg-amber-50'}`}>
                  {/* Background decoration */}
                  <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/50 rounded-full blur-3xl pointer-events-none" />
                  
                  <div>
                    <span className="px-3 py-1 bg-white rounded-full text-xs font-medium uppercase tracking-wider text-slate-600 border border-slate-200">
                      Forecast for Tomorrow
                    </span>
                    <h2 className={`text-5xl font-bold mt-6 mb-2 ${result.prediction === 'Yes' ? 'text-blue-700' : 'text-amber-700'}`}>
                      {result.prediction === 'Yes' ? 'Rain Expected' : 'Clear Skies'}
                    </h2>
                    <p className="text-slate-600">
                      The model predicts <span className={`font-bold ${result.prediction === 'Yes' ? 'text-blue-800' : 'text-amber-800'}`}>{result.prediction === 'Yes' ? 'precipitation' : 'no rain'}</span> in the next 24 hours.
                    </p>
                  </div>

                  <div className="mt-12">
                    <div className="flex justify-between items-end mb-2">
                      <span className="text-slate-500 text-sm font-medium uppercase tracking-tight">Certainty</span>
                      <span className={`text-2xl font-bold ${result.prediction === 'Yes' ? 'text-blue-600' : 'text-amber-600'}`}>{(result.probability * 100).toFixed(2)}%</span>
                    </div>
                    <div className="h-4 bg-slate-200 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${result.probability * 100}%` }} transition={{ duration: 1, ease: 'easeOut' }} className={`h-full rounded-full ${result.prediction === 'Yes' ? 'bg-blue-500' : 'bg-amber-500'}`} />
                    </div>
                  </div>
                </div>

                <div className="glass-card p-6 rounded-3xl flex items-center gap-6">
                  <div className={`p-4 rounded-2xl ${result.prediction === 'Yes' ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-600'}`}>
                    {result.prediction === 'Yes' ? <CloudRain size={32} /> : <Sun size={32} />}
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg text-slate-800">{result.prediction === 'Yes' ? 'Travel Tip' : 'Great Weather'}</h4>
                    <p className="text-slate-600 text-sm">{result.prediction === 'Yes' ? 'Better carry an umbrella tomorrow!' : 'Perfect day for outdoor activities.'}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </main>

      <footer className="mt-auto pt-12 border-t border-slate-200 flex flex-col md:flex-row justify-between gap-6 text-slate-600 text-sm pb-8">
        <p>© 2026 AeroWeather Analytics. Built for Australia.</p>
      </footer>
    </div>
  );
};

const InputGroup: React.FC<{ label: string; icon: React.ReactNode; children: React.ReactNode }> = ({ label, icon, children }) => (
  <div className="space-y-2 group">
    <label className="text-sm font-medium text-slate-600 group-focus-within:text-blue-600 transition-colors flex items-center gap-2">
      <span className="opacity-70">{icon}</span>
      {label}
    </label>
    {children}
  </div>
);

export default App;
