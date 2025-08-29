

🌦 **WeatherNow – Dynamic Weather App**

WeatherNow is a Flask-based web application that provides live weather updates using the OpenWeather API. It includes user authentication, a search history feature, and a full-screen animated user interface designed with glassmorphism styling.

🚀 **Features**

- **Live Weather Data**: Access real-time weather conditions for any city.
- **Authentication**: A secure system for user login, registration, and logout.
- **Search History**: Logged-in users can save and view their past searches.
- **Modern UI**: A full-screen canvas background with captivating animations.
- **SQLite Database**: Stores user information and weather history.
- **Responsive Design**: Compatible with both desktop and mobile devices.

📂 **Project Structure**

📂 Project Structure
WeatherNow/
│── app.py               # Flask routes and logic
│── helpers.py           # Authentication helpers
│── weather.db           # SQLite database
│── requirements.txt     # Dependencies
│
├── static/
│   ├── style.css        # Styling (glassmorphism)
│   └── script.js        # Background animations
│
└── templates/
    ├── layout.html       # Base template
    ├── index.html        # Search page
    ├── history.html      # User history
    ├── login.html        # Login form
    ├── register.html     # Register form


⚙️ **Installation**

1. **Clone the repository**:
  git clone https://github.com/sayeed14553/WeatherNow.git
  cd weathernow
  
2. **Set up a virtual environment**:
   python -m venv venv
   source venv/bin/activate   # For Mac/Linux
   venv\Scripts\activate      # For Windows

3. **Install dependencies**:
   pip install -r requirements.txt

4. **Initialize the Database**:
   flask shell
   >>> from app import init_db
   >>> init_db()
   >>> exit()

5. **Add your OpenWeather API Key**:
   Sign up at OpenWeather, create an API key, and set it as an environment variable:
   - For Linux/Mac:
    export OPENWEATHER_API_KEY="your_api_key"
   - For Windows:
    setx OPENWEATHER_API_KEY "your_api_key"

6. **Run the app**:
  flask run
  Visit: http://127.0.0.1:5000/

🗄 **Database Structure**
- **users**
  - id
  - username
  - hash

- **history**
  - id
  - user_id
  - city
  - temperature
  - timestamp

🎨 **UI & Styling**
  - Glassmorphism cards with gradient backgrounds.
  - Fullscreen canvas animations (script.js).
  - Responsive layout that works on all devices.

📌 **Future Improvements**
  - Graphs for temperature and humidity.
  - Location-based auto-detection.

🤝 **Contributing**
- Fork the repository.
- Create a feature branch.
- Commit and push your changes.
- Open a pull request.
