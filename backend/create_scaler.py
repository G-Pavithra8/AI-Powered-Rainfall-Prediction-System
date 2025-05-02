import numpy as np
from sklearn.preprocessing import StandardScaler
import pickle

# Create sample data similar to what we expect from OpenWeather API
# This should match the features we use in weather_utils.py
sample_data = np.array([
    # temperature, humidity, pressure, wind_speed, rain, feels_like
    [25.0, 80.0, 1013.0, 5.0, 0.0, 26.0],
    [27.0, 75.0, 1012.0, 6.0, 2.5, 28.0],
    [23.0, 85.0, 1014.0, 4.0, 5.0, 24.0],
    [26.0, 78.0, 1013.0, 7.0, 1.0, 27.0],
    [24.0, 82.0, 1015.0, 3.0, 3.0, 25.0],
])

# Create and fit the scaler
scaler = StandardScaler()
scaler.fit(sample_data)

# Save the scaler
with open('models/scaler_aggregated.pkl', 'wb') as f:
    pickle.dump(scaler, f)

print("New scaler created and saved successfully!")

# Verify the scaler works
test_data = np.array([[25.0, 80.0, 1013.0, 5.0, 0.0, 26.0]])
transformed = scaler.transform(test_data)
print("\nTest transformation successful!")
print("Original data:", test_data)
print("Transformed data:", transformed) 