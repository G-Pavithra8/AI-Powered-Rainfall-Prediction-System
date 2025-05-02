
---

## ⚡ Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/YOUR-USERNAME/YOUR-REPO-NAME.git
cd YOUR-REPO-NAME
```

### 2. Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

### 3. Frontend Setup

Open a new terminal:

```bash
cd frontend
npm install
npm start
```

- The frontend will run at [http://localhost:3000](http://localhost:3000)
- The backend will run at [http://localhost:5000](http://localhost:5000)

---

## 📊 Screenshots

![RainPredict Dashboard](./screenshots/dashboard.png)
![RainPredict About](./screenshots/about.png)

---

## 🧠 How It Works

- **User signs up or logs in.**
- **Enters a location and forecast period.**
- **Frontend fetches real-time weather data from OpenWeather API.**
- **Backend uses an LSTM model to predict rainfall.**
- **App displays predictions and crop recommendations.**

---

## ✨ Credits

- Built with ❤️ by [Your Name]
- Powered by [OpenWeather](https://openweathermap.org/) and open-source technologies

---

## 📄 License

This project is licensed under the MIT License.
