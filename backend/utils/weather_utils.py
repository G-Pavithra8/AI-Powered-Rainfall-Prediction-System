import numpy as np
import logging
from datetime import datetime, timedelta
from dateutil.relativedelta import relativedelta

logger = logging.getLogger(__name__)

# Index of rainfall in the feature vector
RAINFALL_FEATURE_INDEX = 5  # [temperature, humidity, pressure, wind_speed, clouds, rainfall, is_monsoon, month_sin, month_cos]

def get_seasonal_features(date):
    """
    Create cyclical features for month to capture seasonality
    """
    month = date.month
    # Convert month to cyclical features using sine and cosine
    month_sin = np.sin(2 * np.pi * month/12)
    month_cos = np.cos(2 * np.pi * month/12)
    is_monsoon = 1 if 6 <= month <= 9 else 0
    
    return is_monsoon, month_sin, month_cos

def get_location_base_rainfall(lat, lon, month):
    """
    Get base rainfall values based on location and month
    """
    # Coastal check (rough approximation)
    is_coastal = False
    coastal_cities = {
        'Mumbai': (19.0760, 72.8777),
        'Chennai': (13.0827, 80.2707),
        'Kolkata': (22.5726, 88.3639),
        'Kochi': (9.9312, 76.2673)
    }
    
    # Check if location is near any coastal city
    for city_lat, city_lon in coastal_cities.values():
        if abs(lat - city_lat) < 1 and abs(lon - city_lon) < 1:
            is_coastal = True
            break
    
    # Base rainfall patterns (mm per month)
    if is_coastal:
        base_patterns = {
            1: 20,    # January
            2: 20,    # February
            3: 30,    # March
            4: 40,    # April
            5: 60,    # May
            6: 350,   # June
            7: 500,   # July
            8: 400,   # August
            9: 300,   # September
            10: 150,  # October
            11: 80,   # November
            12: 30    # December
        }
    else:
        base_patterns = {
            1: 15,    # January
            2: 15,    # February
            3: 20,    # March
            4: 30,    # April
            5: 40,    # May
            6: 150,   # June
            7: 250,   # July
            8: 200,   # August
            9: 150,   # September
            10: 80,   # October
            11: 40,   # November
            12: 20    # December
        }
    
    return base_patterns[month]

def validate_prediction(prediction, month, location_data, current_weather):
    """
    Basic validation to ensure predictions are non-negative
    """
    # Log the raw prediction for debugging
    logger.info(f"Raw prediction: {prediction:.2f}mm")
    logger.info(f"Location: {location_data['name']}, Month: {month}")
    logger.info(f"Current conditions: {current_weather}")
    
    # Only ensure prediction is non-negative, no other modifications
    validated_pred = max(0, prediction)
    
    return validated_pred

def process_weather_data(weather_data, scaler):
    """
    Process OpenWeather data to match model input format
    Features: [temperature, humidity, pressure, wind_speed, clouds, rainfall]
    """
    features = []
    actual_weather = {
        'max_temp': [],
        'min_temp': [],
        'humidity': [],
        'rainfall': [],
        'current_conditions': {}
    }
    
    if not weather_data.get('list'):
        raise ValueError("No weather data available")
    
    # Store current conditions without modification
    current = weather_data['list'][0]['main']
    actual_weather['current_conditions'] = {
        'temp': current['temp'],
        'humidity': current['humidity'],
        'pressure': current['pressure'],
        'clouds': weather_data['list'][0]['clouds']['all']
    }
    logger.info(f"Current weather conditions: {actual_weather['current_conditions']}")
    
    # Process each forecast entry
    for forecast in weather_data['list']:
        try:
            # Extract raw values from API without modification
            temperature = forecast['main']['temp']
            humidity = forecast['main']['humidity']
            pressure = forecast['main']['pressure']
            wind_speed = forecast['wind']['speed']
            clouds = forecast['clouds']['all']
            rain_value = forecast.get('rain', {}).get('3h', 0)
            
            feature_vector = [
                temperature, 
                humidity, 
                pressure, 
                wind_speed, 
                clouds, 
                rain_value
            ]
            
            features.append(feature_vector)
            actual_weather['max_temp'].append(forecast['main']['temp_max'])
            actual_weather['min_temp'].append(forecast['main']['temp_min'])
            actual_weather['humidity'].append(humidity)
            actual_weather['rainfall'].append(rain_value)
            
        except KeyError as e:
            logger.error(f"Missing weather data field: {e}")
            continue
    
    if not features:
        raise ValueError("No valid weather data processed")
    
    features = np.array(features)
    logger.info(f"Raw features shape before scaling: {features.shape}")
    logger.info(f"Feature ranges before scaling - Min: {features.min(axis=0)}, Max: {features.max(axis=0)}")
    
    # Handle timestep requirements
    if len(features) > 30:
        features = features[-30:]
        for key in ['max_temp', 'min_temp', 'humidity', 'rainfall']:
            actual_weather[key] = actual_weather[key][-30:]
    elif len(features) < 30:
        padding_needed = 30 - len(features)
        padding = np.tile(features[-1] if len(features) > 0 else np.zeros(6), (padding_needed, 1))
        features = np.vstack((padding, features))
        
        for key in ['max_temp', 'min_temp', 'humidity', 'rainfall']:
            last_value = actual_weather[key][-1] if actual_weather[key] else 0
            actual_weather[key] = [last_value] * padding_needed + actual_weather[key]
    
    # Scale features using the provided scaler without any manual adjustments
    try:
        features_scaled = scaler.transform(features)
        features_scaled = features_scaled.reshape(1, 30, 6)
        logger.info(f"Scaled features shape: {features_scaled.shape}")
        logger.info(f"Scaled feature ranges - Min: {features_scaled.min(axis=1)}, Max: {features_scaled.max(axis=1)}")
    except Exception as e:
        logger.error(f"Error in scaling features: {str(e)}")
        raise
    
    return features_scaled, actual_weather

def get_feature_means_and_scales(scaler):
    """Get the mean and scale for the rainfall feature"""
    return (
        scaler.mean_[RAINFALL_FEATURE_INDEX],
        scaler.scale_[RAINFALL_FEATURE_INDEX]
    )

def inverse_transform_rainfall(scaler, scaled_predictions):
    """
    Manually inverse transform the scaled rainfall predictions
    """
    try:
        # Log input shape
        logger.info(f"Input predictions shape: {scaled_predictions.shape}")
        
        # Ensure predictions are 2D array with shape (1, 1)
        if scaled_predictions.ndim == 3:
            scaled_predictions = scaled_predictions.squeeze()
        if scaled_predictions.ndim == 1:
            scaled_predictions = scaled_predictions.reshape(1, -1)
            
        logger.info(f"Reshaped predictions shape: {scaled_predictions.shape}")
        
        # Create a dummy array with the same batch size as predictions
        batch_size = scaled_predictions.shape[0]
        dummy_features = np.zeros((batch_size, 9))
        
        # Fill in the rainfall predictions
        dummy_features[:, RAINFALL_FEATURE_INDEX] = scaled_predictions[:, 0]
        
        # Inverse transform
        logger.info(f"Dummy features shape: {dummy_features.shape}")
        inverse_transformed = scaler.inverse_transform(dummy_features)
        logger.info(f"Inverse transformed shape: {inverse_transformed.shape}")
        
        # Extract rainfall values and ensure non-negative
        rainfall_values = inverse_transformed[:, RAINFALL_FEATURE_INDEX]
        rainfall_values = np.maximum(rainfall_values, 0)
        
        return rainfall_values
        
    except Exception as e:
        logger.error(f"Error in inverse_transform_rainfall: {str(e)}")
        logger.error(f"Input shape was: {scaled_predictions.shape}")
        raise 

def get_ethical_explanations(rainfall_data, temperature_data, confidence_levels):
    """
    Generate ethical explanations and considerations for the predictions
    """
    explanations = {
        'reliability': {
            'title': 'Prediction Reliability',
            'description': f'These predictions are based on {len(rainfall_data)} months of projected data with an average confidence level of {max(set(confidence_levels), key=confidence_levels.count)}.',
            'considerations': [
                'Weather predictions become less certain as they extend further into the future',
                'Local microclimate conditions may cause variations',
                'Consider these predictions as guidance rather than absolute certainty'
            ]
        },
        'sustainability': {
            'title': 'Environmental Sustainability',
            'description': 'These recommendations prioritize sustainable farming practices.',
            'considerations': []
        },
        'economic': {
            'title': 'Economic Considerations',
            'description': 'Balance these predictions with your local market conditions and resources.',
            'considerations': []
        }
    }
    
    # Add sustainability considerations based on rainfall patterns
    avg_rainfall = np.mean(rainfall_data)
    if avg_rainfall < 50:
        explanations['sustainability']['considerations'].extend([
            'Consider water conservation techniques',
            'Implement rainwater harvesting systems',
            'Choose drought-resistant crop varieties to minimize water usage'
        ])
    elif avg_rainfall > 150:
        explanations['sustainability']['considerations'].extend([
            'Plan for proper drainage systems',
            'Consider soil erosion prevention measures',
            'Implement techniques to prevent nutrient leaching'
        ])
    
    # Add economic considerations based on predictions
    rainfall_stability = np.std(rainfall_data)
    if rainfall_stability > 20:
        explanations['economic']['considerations'].extend([
            'Consider crop insurance due to variable rainfall patterns',
            'Diversify crops to minimize risk',
            'Plan for supplementary irrigation systems'
        ])
    else:
        explanations['economic']['considerations'].extend([
            'Stable rainfall patterns suggest reliable crop yields',
            'Consider long-term storage solutions for harvest',
            'Plan for market fluctuations despite stable weather'
        ])
    
    return explanations

def format_monthly_forecast(predictions, start_date, actual_weather=None):
    """
    Format monthly predictions into visualization-ready data
    Args:
        predictions: List of monthly prediction dictionaries
        start_date: datetime object for the start of predictions
        actual_weather: Dictionary containing actual weather data from OpenWeather
    Returns:
        dict: Formatted data for visualization
    """
    # Initialize data structure with empty lists
    forecast_data = {
        'labels': [],
        'max_temp': [],
        'min_temp': [],
        'rh_morning': [],
        'rh_evening': [],
        'rainfall': [],
        'confidence': []
    }
    
    # Process each month's prediction
    for i, pred in enumerate(predictions):
        # Calculate current month date
        current_date = start_date + relativedelta(months=i)
        
        # Add month label
        forecast_data['labels'].append(current_date.strftime('%B %Y'))
        
        # Add rainfall prediction
        forecast_data['rainfall'].append(round(pred['rainfall_mm'], 2))
        
        # Handle temperature data
        month = current_date.month
        rainfall = pred['rainfall_mm']
        
        if actual_weather and len(actual_weather['max_temp']) > i * 5:
            # Use actual weather data when available
            start_idx = i * 5
            end_idx = min((i + 1) * 5, len(actual_weather['max_temp']))
            
            max_temps = actual_weather['max_temp'][start_idx:end_idx]
            min_temps = actual_weather['min_temp'][start_idx:end_idx]
            
            if max_temps and min_temps:
                max_temp = round(np.mean(max_temps), 1)
                min_temp = round(np.mean(min_temps), 1)
                
                # Ensure max temp is always greater than min temp
                if max_temp <= min_temp:
                    avg = (max_temp + min_temp) / 2
                    max_temp = avg + 2
                    min_temp = avg - 2
            else:
                # Use seasonal estimates
                max_temp, min_temp = get_seasonal_temperatures(month, rainfall)
        else:
            # Use seasonal estimates
            max_temp, min_temp = get_seasonal_temperatures(month, rainfall)
        
        forecast_data['max_temp'].append(max_temp)
        forecast_data['min_temp'].append(min_temp)
        
        # Handle humidity data
        if actual_weather and len(actual_weather['humidity']) > i * 5:
            humidity_values = actual_weather['humidity'][start_idx:end_idx]
            if humidity_values:
                avg_humidity = round(np.mean(humidity_values), 1)
                forecast_data['rh_morning'].append(avg_humidity)
                forecast_data['rh_evening'].append(round(avg_humidity * 0.85, 1))
            else:
                forecast_data['rh_morning'].append(75)
                forecast_data['rh_evening'].append(65)
        else:
            forecast_data['rh_morning'].append(75)
            forecast_data['rh_evening'].append(65)
        
        forecast_data['confidence'].append(pred['confidence'])
    
    # Generate ethical explanations
    forecast_data['ethical_explanations'] = get_ethical_explanations(
        rainfall_data=forecast_data['rainfall'],
        temperature_data=forecast_data['max_temp'],
        confidence_levels=forecast_data['confidence']
    )
    
    return forecast_data

def get_seasonal_temperatures(month, rainfall):
    """Helper function to get seasonal temperature estimates based on month and rainfall"""
    # Base temperatures for different seasons in India (typical ranges)
    if month in [12, 1, 2]:  # Winter
        base_max = 25
        base_min = 15
        rain_effect = 0.1  # Rainfall has less effect in winter
    elif month in [3, 4, 5]:  # Summer
        base_max = 38
        base_min = 28
        rain_effect = -0.2  # Rainfall has more cooling effect in summer
    else:  # Monsoon/other seasons
        base_max = 32
        base_min = 24
        rain_effect = -0.15  # Moderate cooling effect
    
    # Adjust temperatures based on rainfall
    rain_adjustment = rainfall * rain_effect
    
    # Add some random variation (±2°C) to make predictions more realistic
    random_variation_max = np.random.uniform(-2, 2)
    random_variation_min = np.random.uniform(-1, 1)
    
    max_temp = round(base_max + rain_adjustment + random_variation_max, 1)
    min_temp = round(base_min + rain_adjustment + random_variation_min, 1)
    
    # Ensure min temp is always less than max temp
    if min_temp >= max_temp:
        avg = (max_temp + min_temp) / 2
        max_temp = avg + 2
        min_temp = avg - 2
    
    # Ensure temperatures stay within realistic bounds
    max_temp = min(max(max_temp, 20), 45)  # Cap between 20°C and 45°C
    min_temp = min(max(min_temp, 10), max_temp - 3)  # Cap between 10°C and (max_temp - 3)
    
    return max_temp, min_temp

def get_crop_recommendations(rainfall_data, temperature_data):
    """
    Get dynamic crop recommendations based on predicted weather conditions
    """
    avg_rainfall = np.mean(rainfall_data)
    avg_temp = np.mean(temperature_data)
    max_temp = max(temperature_data)
    min_temp = min(temperature_data)
    
    logger.info(f"Generating recommendations for - Avg Rainfall: {avg_rainfall:.2f}mm, Avg Temp: {avg_temp:.2f}°C")
    logger.info(f"Temperature Range: {min_temp:.2f}°C to {max_temp:.2f}°C")
    
    recommendations = []
    techniques = []
    
    # Crop recommendations based on rainfall patterns
    if avg_rainfall < 30:  # Very low rainfall
        recommendations.extend([
            "Pearl Millet",
            "Cluster Beans",
            "Moth Beans"
        ])
        techniques.extend([
            "Implement drip irrigation",
            "Use drought-resistant varieties",
            "Consider mulching techniques"
        ])
        
    elif 30 <= avg_rainfall < 70:  # Low rainfall
        recommendations.extend([
            "Sorghum",
            "Groundnut",
            "Green Gram"
        ])
        techniques.extend([
            "Implement mulching techniques",
            "Consider intercropping",
            "Use soil moisture conservation"
        ])
        
    elif 70 <= avg_rainfall < 150:  # Moderate rainfall
        recommendations.extend([
            "Maize",
            "Cotton",
            "Soybean"
        ])
        techniques.extend([
            "Regular weeding recommended",
            "Consider row spacing optimization"
        ])
        
    elif 150 <= avg_rainfall < 300:  # High rainfall
        recommendations.extend([
            "Rice",
            "Sugarcane",
            "Turmeric"
        ])
        techniques.extend([
            "Ensure good drainage",
            "Watch for pest management"
        ])
        
    else:  # Very high rainfall (>300mm)
        recommendations.extend([
            "Rice",
            "Jute",
            "Tea"
        ])
        techniques.extend([
            "Strong drainage system required",
            "Disease management crucial",
            "Consider raised bed cultivation"
        ])
    
    # Temperature-based adjustments
    if max_temp > 35:
        recommendations.extend([
            "Heat-tolerant varieties recommended",
            "Consider shade cultivation"
        ])
        techniques.extend([
            "Provide afternoon shade",
            "Increase irrigation frequency"
        ])
    elif min_temp < 15:
        recommendations.extend([
            "Cold-tolerant varieties needed",
            "Consider greenhouse cultivation"
        ])
        techniques.extend([
            "Protect from frost",
            "Use row covers when needed"
        ])
    
    # Filter and prioritize recommendations
    final_recommendations = []
    
    # Add main crop recommendations first
    for crop in recommendations[:3]:  # Top 3 crops
        if crop not in final_recommendations:
            final_recommendations.append(crop)
    
    # Add important techniques
    for technique in techniques[:2]:  # Top 2 techniques
        if technique not in final_recommendations:
            final_recommendations.append(technique)
    
    # Add additional crops if space allows
    for crop in recommendations[3:]:
        if len(final_recommendations) < 7 and crop not in final_recommendations:
            final_recommendations.append(crop)
    
    # Add remaining important techniques
    for technique in techniques[2:]:
        if len(final_recommendations) < 7 and technique not in final_recommendations:
            final_recommendations.append(technique)
    
    logger.info(f"Generated recommendations: {final_recommendations}")
    return final_recommendations 