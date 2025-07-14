from flask import Blueprint, request, jsonify
from pymongo import MongoClient
from werkzeug.security import generate_password_hash, check_password_hash
import os

auth_bp = Blueprint('auth', __name__)

# MongoDB setup (move this to app.py if you want a single client)
MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/')
client = MongoClient(MONGO_URI)
db = client['auth_db']
users_collection = db['users']

@auth_bp.route('/signup', methods=['POST'])
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

@auth_bp.route('/login', methods=['POST'])
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