import axios from 'axios';
import { WeatherPredictionRequest, WeatherPredictionResponse } from './types';

const API_BASE_URL = 'https://soviet-kikelia-testorgainasation-d5560f2a.koyeb.app/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const predictWeather = async (data: WeatherPredictionRequest): Promise<WeatherPredictionResponse> => {
  const response = await apiClient.post<WeatherPredictionResponse>('/predict', data);
  return response.data;
};

export const checkHealth = async () => {
  const response = await apiClient.get('/health');
  return response.data;
};
