from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
from tensorflow.keras.models import load_model
import tensorflow as tf
from tensorflow.keras import losses, metrics
import pickle
from datetime import datetime, timedelta
import requests
import logging
from dotenv import load_dotenv
import os
import traceback
from utils.weather_utils import (
    process_weather_data, 
    inverse_transform_rainfall,
    format_monthly_forecast,
    get_crop_recommendations,
    RAINFALL_FEATURE_INDEX,
    validate_prediction,
    get_seasonal_features
)
from dateutil.relativedelta import relativedelta

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Define custom objects for model loading
custom_objects = {
    'MeanSquaredError': metrics.MeanSquaredError,
    'MeanAbsoluteError': metrics.MeanAbsoluteError,
    'mean_squared_error': losses.MeanSquaredError(),
    'mean_absolute_error': losses.MeanAbsoluteError(),
    'mse': losses.MeanSquaredError(),
    'mae': losses.MeanAbsoluteError()
}

# OpenWeather API Config
OPENWEATHER_API_KEY = os.getenv('OPENWEATHER_API_KEY')
if not OPENWEATHER_API_KEY:
    raise ValueError("OpenWeather API key not configured")
BASE_WEATHER_URL = "https://api.openweathermap.org/data/2.5/forecast"
GEOCODING_URL = "https://api.openweathermap.org/geo/1.0/direct"

def get_coordinates(location):
    """Get coordinates for a given location name using OpenWeather Geocoding API"""
    try:
        # Add common Indian cities for states/regions
        state_to_city = {
            'meghalaya': 'Shillong',
            'kerala': 'Thiruvananthapuram',
            'tamil nadu': 'Chennai',
            'karnataka': 'Bangalore',
            'theni': 'Theni',  # Added Theni explicitly
            # Add more state-city mappings as needed
        }
        
        # If the location is a state/city, use its mapping
        search_location = location.lower()
        if search_location in state_to_city:
            search_location = f"{state_to_city[search_location]},IN"
        elif not ',' in location:
            # If no comma, assume it's an Indian location
            search_location = f"{location},IN"
            
        params = {
            'q': search_location,
            'limit': 1,
            'appid': OPENWEATHER_API_KEY
        }
        
        logger.info(f"Attempting to get coordinates for location: {search_location}")
        response = requests.get(GEOCODING_URL, params=params, verify=True)
        response.raise_for_status()
        data = response.json()
        
        if not data:
            # Try without country code if first attempt fails
            params['q'] = location
            response = requests.get(GEOCODING_URL, params=params, verify=True)
            response.raise_for_status()
            data = response.json()
            
        if not data:
            raise ValueError(f"Location '{location}' not found")
            
        logger.info(f"Successfully found coordinates for {location}")
        return {
            'latitude': data[0]['lat'],
            'longitude': data[0]['lon'],
            'name': data[0]['name'],
            'country': data[0].get('country', 'IN')
        }
    except requests.exceptions.RequestException as e:
        logger.error(f"Geocoding API error: {str(e)}")
        raise ValueError(f"Failed to get location coordinates: {str(e)}")

try:
    # Load model and scaler
    model_path = os.path.join('models', 'rainfall_model_aggregated.h5')
    scaler_path = os.path.join('models', 'scaler_aggregated.pkl')
    
    model = load_model(model_path, custom_objects=custom_objects)
    with open(scaler_path, 'rb') as f:
        scaler = pickle.load(f)
    logger.info("Model and scaler loaded successfully")
except Exception as e:
    logger.error(f"Error loading models: {str(e)}")
    logger.error(f"Full traceback: {traceback.format_exc()}")
    raise RuntimeError("Could not load prediction models. Service unavailable.")

@app.route('/predict', methods=['POST'])
def predict_rainfall():
    try:
        # Get location and months from request
        data = request.get_json()
        logger.info(f"Received request data: {data}")
        location = data.get('location')
        months = data.get('months', 3)
        
        logger.info(f"Processing request for location: {location}, months: {months}")
        
        if not location:
            logger.error("Location parameter missing")
            return jsonify({'error': 'Location is required'}), 400
        
        # Validate months input
        if months not in [3, 5]:
            logger.error(f"Invalid months parameter: {months}")
            return jsonify({'error': 'Invalid months parameter. Must be either 3 or 5 months'}), 400
        
        try:
            # Get coordinates
            location_data = get_coordinates(location)
            logger.info(f"Location found: {location_data['name']}, {location_data['country']}")
            
            # Get weather data
            weather_params = {
                'lat': location_data['latitude'],
                'lon': location_data['longitude'],
                'appid': OPENWEATHER_API_KEY,
                'units': 'metric',
                'cnt': 40  # Get maximum available forecast days
            }
            
            logger.info(f"Fetching weather data for coordinates: {location_data['latitude']}, {location_data['longitude']}")
            response = requests.get(BASE_WEATHER_URL, params=weather_params, verify=True)
            response.raise_for_status()
            weather_data = response.json()
            
            if 'list' not in weather_data or not weather_data['list']:
                logger.error("No weather data available in API response")
                raise ValueError("No weather data available for this location")
                
            logger.info(f"Successfully retrieved weather data with {len(weather_data['list'])} entries")
            
            # Process data and make predictions
            try:
                processed_data, actual_weather = process_weather_data(weather_data, scaler)
                logger.info(f"Successfully processed weather data. Model input shape: {processed_data.shape}")
            except Exception as e:
                logger.error(f"Error processing weather data: {str(e)}")
                logger.error(traceback.format_exc())
                raise ValueError(f"Error processing weather data: {str(e)}")

            # Make predictions for multiple months
            predictions = []
            start_date = datetime.now().replace(day=1)  # Start from first day of current month
            
            # Initialize the sequence with first processed data
            current_sequence = processed_data.copy()
            
            for month in range(months):
                try:
                    current_date = start_date + relativedelta(months=month)
                    logger.info(f"Making prediction for month: {current_date.strftime('%B %Y')}")
                    
                    # Make prediction for current month
                    month_pred = model.predict(current_sequence)
                    logger.info(f"Raw model output for {current_date.strftime('%B %Y')}: {month_pred[0][0]}")
                    
                    # Get the raw prediction from the model using the scaler
                    rainfall_mean = scaler.mean_[RAINFALL_FEATURE_INDEX]
                    rainfall_scale = scaler.scale_[RAINFALL_FEATURE_INDEX]
                    rainfall_pred = float(month_pred[0][0] * rainfall_scale + rainfall_mean)
                    logger.info(f"Unscaled prediction: {rainfall_pred}")
                    
                    # Only validate to ensure non-negative values
                    rainfall_pred = validate_prediction(
                        rainfall_pred, 
                        current_date.month,
                        location_data,
                        actual_weather['current_conditions']
                    )
                    
                    # Round to 2 decimal places
                    rainfall_pred = round(rainfall_pred, 2)
                    
                    logger.info(f"Final prediction for {current_date.strftime('%B %Y')}: {rainfall_pred}mm")
                    
                    # Calculate prediction date
                    pred_date = current_date.strftime('%Y-%m-%d')
                    
                    # Add prediction with confidence based on time distance
                    confidence = 'high' if month < 2 else ('medium' if month < 4 else 'low')
                    predictions.append({
                        'date': pred_date,
                        'rainfall_mm': rainfall_pred,
                        'confidence': confidence,
                        'month': current_date.strftime('%B %Y')
                    })
                    
                    # Update sequence for next prediction
                    current_sequence = current_sequence.copy()
                    current_sequence[0, :-1, :] = current_sequence[0, 1:, :]  # Shift data back
                    
                    # Create new feature vector for the prediction
                    new_feature = np.zeros((1, 1, 6))  # Updated for 6 features
                    new_feature[0, 0, RAINFALL_FEATURE_INDEX] = month_pred[0][0]  # Add predicted rainfall
                    
                    # Update other features based on actual weather data
                    if 'list' in weather_data and len(weather_data['list']) > 0:
                        latest_weather = weather_data['list'][-1]
                        new_feature[0, 0, 0] = latest_weather['main']['temp']  # Temperature
                        new_feature[0, 0, 1] = latest_weather['main']['humidity']  # Humidity
                        new_feature[0, 0, 2] = latest_weather['main']['pressure']  # Pressure
                        new_feature[0, 0, 3] = latest_weather['wind']['speed']  # Wind speed
                        new_feature[0, 0, 4] = latest_weather['clouds']['all']  # Clouds
                    
                    # Add new feature vector to sequence
                    current_sequence[0, -1:, :] = new_feature
                    
                except Exception as e:
                    logger.error(f"Error making prediction for month {month}: {str(e)}")
                    logger.error(traceback.format_exc())
                    raise ValueError(f"Error making prediction for month {month}: {str(e)}")

            # Format data for visualization using actual weather data
            try:
                visualization_data = format_monthly_forecast(
                    predictions, 
                    start_date,
                    actual_weather
                )
                logger.info("Successfully formatted forecast data for visualization")
            except Exception as e:
                logger.error(f"Error formatting forecast data: {str(e)}")
                logger.error(traceback.format_exc())
                raise ValueError(f"Error formatting forecast data: {str(e)}")

            # Get crop recommendations
            try:
                crop_recommendations = get_crop_recommendations(
                    rainfall_data=visualization_data['rainfall'],
                    temperature_data=visualization_data['max_temp']
                )
                logger.info("Successfully generated crop recommendations")
            except Exception as e:
                logger.error(f"Error generating crop recommendations: {str(e)}")
                logger.error(traceback.format_exc())
                raise ValueError(f"Error generating crop recommendations: {str(e)}")

            return jsonify({
                'status': 'success',
                'predictions': predictions,
                'visualization_data': visualization_data,
                'crop_recommendations': crop_recommendations,
                'location': {
                    'name': location_data['name'],
                    'country': location_data['country'],
                    'coordinates': {
                        'latitude': location_data['latitude'],
                        'longitude': location_data['longitude']
                    }
                },
                'forecast_period': f"{months} months"
            })
            
        except ValueError as e:
            logger.error(f"ValueError in prediction process: {str(e)}")
            return jsonify({'error': str(e)}), 400
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Weather API error: {str(e)}")
            return jsonify({'error': 'Failed to fetch weather data'}), 503
        
    except Exception as e:
        logger.error(f"Unexpected error in predict_rainfall: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'model_loaded': True,
        'service': 'Rainfall Prediction API'
    })

@app.route('/test-api', methods=['GET'])
def test_api():
    """Test route to verify OpenWeather API connectivity"""
    try:
        # 1. Test Geocoding API
        test_location = "Theni,IN"
        geo_params = {
            'q': test_location,
            'limit': 1,
            'appid': OPENWEATHER_API_KEY
        }
        
        logger.info("Testing Geocoding API...")
        geo_response = requests.get(GEOCODING_URL, params=geo_params, verify=True)
        geo_response.raise_for_status()
        geo_data = geo_response.json()
        
        if not geo_data:
            return jsonify({
                'status': 'error',
                'message': 'Geocoding API returned no data',
                'api_key_status': 'API key might be invalid'
            }), 400
            
        # 2. Test Weather API
        weather_params = {
            'lat': geo_data[0]['lat'],
            'lon': geo_data[0]['lon'],
            'appid': OPENWEATHER_API_KEY,
            'units': 'metric',
            'cnt': 1  # Just get one data point for testing
        }
        
        logger.info("Testing Weather Forecast API...")
        weather_response = requests.get(BASE_WEATHER_URL, params=weather_params, verify=True)
        weather_response.raise_for_status()
        weather_data = weather_response.json()
        
        if 'list' not in weather_data or not weather_data['list']:
            return jsonify({
                'status': 'error',
                'message': 'Weather API returned no data',
                'api_key_status': 'API key might be invalid'
            }), 400
            
        # If we get here, both APIs are working
        return jsonify({
            'status': 'success',
            'message': 'OpenWeather APIs are working correctly',
            'api_key_status': 'valid',
            'geocoding_response': {
                'location': test_location,
                'coordinates': {
                    'lat': geo_data[0]['lat'],
                    'lon': geo_data[0]['lon']
                }
            },
            'weather_sample': {
                'temperature': weather_data['list'][0]['main']['temp'],
                'humidity': weather_data['list'][0]['main']['humidity'],
                'description': weather_data['list'][0]['weather'][0]['description']
            }
        })
        
    except requests.exceptions.SSLError as e:
        return jsonify({
            'status': 'error',
            'message': 'SSL Certificate verification failed. Try updating your SSL certificates.',
            'error': str(e)
        }), 500
        
    except requests.exceptions.ConnectionError as e:
        return jsonify({
            'status': 'error',
            'message': 'Failed to connect to OpenWeather API. Check your internet connection.',
            'error': str(e)
        }), 500
        
    except requests.exceptions.RequestException as e:
        return jsonify({
            'status': 'error',
            'message': 'API request failed',
            'error': str(e)
        }), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False) 