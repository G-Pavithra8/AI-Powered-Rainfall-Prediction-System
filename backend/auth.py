from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from werkzeug.security import generate_password_hash, check_password_hash
import os

app = Flask(__name__)
CORS(app)

# MongoDB setup
MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/')
client = MongoClient(MONGO_URI)
db = client['auth_db']
users_collection = db['users']

@app.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    if not email or not password:
        return jsonify({'success': False, 'message': 'Email and password required.'}), 400
    if users_collection.find_one({'email': email}):
        return jsonify({'success': False, 'message': 'User already exists.'}), 409
    hashed_password = generate_password_hash(password)
    users_collection.insert_one({'email': email, 'password': hashed_password})
    return jsonify({'success': True, 'message': 'User registered successfully.'})

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    if not email or not password:
        return jsonify({'success': False, 'message': 'Email and password required.'}), 400
    user = users_collection.find_one({'email': email})
    if not user:
        return jsonify({'success': False, 'message': 'User does not exist. Please sign up first.'}), 401
    if check_password_hash(user['password'], password):
        return jsonify({'success': True, 'message': 'Login successful.', 'email': email})
    else:
        return jsonify({'success': False, 'message': 'Invalid password.'}), 401

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True) 