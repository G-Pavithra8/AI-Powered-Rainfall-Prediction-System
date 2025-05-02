import axios from 'axios';

const API_ENDPOINT = 'http://127.0.0.1:5000/predict';

export const fetchPredictions = async (data) => {
  try {
    const response = await axios.post(API_ENDPOINT, data);
    return response.data;
  } catch (error) {
    console.error('Error fetching prediction data:', error);
    throw error;
  }
};

export const PredictionRequest = {
  location: '',
  months: 0,
};

export const LocationCoordinates = {
  latitude: 0,
  longitude: 0,
};

export const LocationInfo = {
  coordinates: LocationCoordinates,
  country: '',
  name: '',
};

export const Prediction = {
  confidence: '',
  date: '',
  month: '',
  rainfall_mm: 0,
};

export const EthicalExplanation = {
  considerations: [],
  description: '',
  title: '',
};

export const EthicalExplanations = {
  economic: EthicalExplanation,
  reliability: EthicalExplanation,
  sustainability: EthicalExplanation,
};

export const VisualizationData = {
  confidence: [],
  labels: [],
  max_temp: [],
  min_temp: [],
  rainfall: [],
  rh_evening: [],
  rh_morning: [],
  ethical_explanations: EthicalExplanations,
};