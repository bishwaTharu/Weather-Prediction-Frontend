export interface WeatherPredictionRequest {
  Location?: string;
  MinTemp?: number;
  MaxTemp?: number;
  Rainfall?: number;
  Evaporation?: number;
  Sunshine?: number;
  WindGustDir?: string;
  WindGustSpeed?: number;
  WindDir9am?: string;
  WindDir3pm?: string;
  WindSpeed9am?: number;
  WindSpeed3pm?: number;
  Humidity9am?: number;
  Humidity3pm?: number;
  Pressure9am?: number;
  Pressure3pm?: number;
  Cloud9am?: number;
  Cloud3pm?: number;
  Temp9am?: number;
  Temp3pm?: number;
  RainToday?: string;
}

export interface WeatherPredictionResponse {
  prediction: string;
  probability: number;
  status: string;
}
