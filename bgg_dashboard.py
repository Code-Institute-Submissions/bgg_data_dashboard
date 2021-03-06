import json
import os
from flask import Flask, render_template
from pymongo import MongoClient

app = Flask(__name__)

MONGO_URI = os.getenv('MONGODB_URI', 'mongodb://localhost:27017')
DBS_NAME = os.getenv('MONGO_DB_NAME', 'BGG')
COLLECTION_NAME = "game_info"

@app.route("/")
def index():
    """
    A Flask view to serve the main dashboard page.
    """
    return render_template("dashboard.html")

@app.route("/dashboard")
def dashboard():
    """
    The same view, reached from an internal link.
    """
    return render_template("dashboard.html")

@app.route("/faq")
def faq():
    """
    A Flask view to serve the FAQ page.
    """
    return render_template("faq.html")

@app.route("/BGG/game_info")
def game_data():
    """
    A Flask view to serve the project data from
    MongoDB in JSON format.
    """

    # A constant that defines the record fields that we wish to retrieve:
    FIELDS = {
        "_id": False, "mechanics": True, "categories": True,
        "publishers": True, "minplayers": True, "designers": True,
        "stats": True, "minplaytime": True, "maxplaytime": True,
        "id": True, "yearpublished": True, "maxplayers": True,
        "name": True
    }

    # Open a connection to MongoDB using a with statement such that the
    # connection will be closed as soon as we exit the with statement
    with MongoClient(MONGO_URI) as conn:
        # Define which collection we wish to access
        collection = conn[DBS_NAME][COLLECTION_NAME]
        # Retrieve a result set only with the fields defined in FIELDS
        projects = collection.find(projection=FIELDS, limit=10000)
        # Convert projects to a list in a JSON object and return the JSON data
        return json.dumps(list(projects))


if __name__ == "__main__":
    app.run()
