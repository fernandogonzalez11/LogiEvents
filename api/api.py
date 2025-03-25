from flask import Flask, render_template

app = Flask(__name__)

@app.route("/")
def home():
    return render_template("../html/login/index.html")

@app.route("/test/")
def test():
    return "works"

if __name__ == "__main__":
    app.run()