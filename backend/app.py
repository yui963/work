from flask import Flask, request, jsonify, make_response
from flask_cors import CORS
from scraping import scraping

app = Flask(__name__)
CORS(app)


@app.route("/", methods=["GET"])
def hello_world():
    return "<p>Hello, World!</p>"


@app.route("/api/search", methods=["POST"])
def search():
    try:
        post_data = request.json
        year = post_data.get("year")
        name = post_data.get("name")
        url = scraping(name, year)
        response = {"URL": url}
        return make_response(jsonify(response))
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)})


if __name__ == "__main__":
    app.run()
