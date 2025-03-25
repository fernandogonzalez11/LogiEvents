from flask import Flask, render_template

app = Flask(__name__, template_folder="html")

@app.route("/")
def home():
    return render_template("login/index.html")

@app.route("/test/")
def test():
    return "works"

if __name__ == "__main__":
    app.run()