import os
import requests
import sqlite3
from flask import Flask, render_template, request, redirect, session, flash
from flask_session import Session
from cs50 import SQL
from werkzeug.security import generate_password_hash, check_password_hash

# Configure app
app = Flask(__name__)
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
Session(app)

# Configure CS50 SQL (SQLite database)
db = SQL("sqlite:///weather.db")

# OpenWeather API Key
API_KEY = "your_api_key" 


@app.route("/", methods=["GET", "POST"])
def index():
    weather = None
    if request.method == "POST":
        city = request.form.get("city")
        if not city:
            flash("Please enter a city name")
            return redirect("/")

        # API request
        url = f"http://api.openweathermap.org/data/2.5/weather?q={city}&appid={API_KEY}&units=metric"
        response = requests.get(url).json()

        if response.get("cod") != 200:
            flash("City not found")
            return redirect("/")

        weather = {
            "city": response["name"],
            "country": response["sys"]["country"],
            "temp": response["main"]["temp"],
            "humidity": response["main"]["humidity"],
            "wind": response["wind"]["speed"],
            "description": response["weather"][0]["description"].title(),
            "icon": response["weather"][0]["icon"]
        }

        # Save history if logged in
        if session.get("user_id"):
            db.execute(
                "INSERT INTO history (user_id, city, weather_json) VALUES (?, ?, ?)",
                session["user_id"], city, str(response)
            )

    return render_template("index.html", weather=weather)


@app.route("/history")
def history():
    if not session.get("user_id"):
        flash("Please log in to see history")
        return redirect("/")
    rows = db.execute("SELECT * FROM history WHERE user_id = ? ORDER BY timestamp DESC", session["user_id"])
    return render_template("history.html", rows=rows)


@app.route("/register", methods=["GET", "POST"])
def register():
    if request.method == "POST":
        username = request.form.get("username")
        password = request.form.get("password")

        if not username or not password:
            flash("Must provide username and password")
            return redirect("/register")

        hash_pw = generate_password_hash(password)
        try:
            db.execute("INSERT INTO users (username, hash) VALUES (?, ?)", username, hash_pw)
        except:
            flash("Username already taken")
            return redirect("/register")

        flash("Registered! Please log in")
        return redirect("/login")

    return render_template("register.html")


@app.route("/login", methods=["GET", "POST"])
def login():
    session.clear()
    if request.method == "POST":
        username = request.form.get("username")
        password = request.form.get("password")
        rows = db.execute("SELECT * FROM users WHERE username = ?", username)

        if len(rows) != 1 or not check_password_hash(rows[0]["hash"], password):
            flash("Invalid username or password")
            return redirect("/login")

        session["user_id"] = rows[0]["id"]
        return redirect("/")

    return render_template("login.html")


@app.route("/logout")
def logout():
    session.clear()
    flash("Logged out")
    return redirect("/")

