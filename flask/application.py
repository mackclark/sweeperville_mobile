from flask import Flask, flash, redirect, render_template, request, session, url_for, g
from flask_session import Session
import sqlite3
from flask_sqlalchemy import SQLAlchemy

#i'm honestly not sure any of this is necessary...same error as when just using relative path.
#it came from here: http://stackoverflow.com/questions/12876172/flask-operationalerror-unable-to-open-database-file-using-sqlite3
# PROJECT_ROOT = os.path.dirname(os.path.realpath(__file__))

# DATABASE = os.path.join(PROJECT_ROOT, 'database', 'manager', 'sweeperville.db')
#from passlib.apps import custom_app_context as pwd_context
#from tempfile import gettempdir

app = Flask(__name__)

db = SQL("sqlite:///sweeperville.db")

# DATABASE = '../database/manager/sweeperville.db'

def get_db():
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = sqlite3.connect(DATABASE)
    return db

@app.route("/login", methods=["POST"])
def login():
    # forget any user_id
    session.clear()

    # if user reached route via POST (as by submitting a form via POST)
    if request.method == "POST":

        # db = get_db();
        # query database for username
        rows = db.execute("SELECT * FROM users WHERE email = :email", email=data.email)

        # ensure username exists and password is correct
        # if len(rows) != 1 or not pwd_context.verify(data.password, rows[0]["hash"]):
        #     return apology("invalid username and/or password")
        if len(rows):
            return 2

        # remember which user has logged in
        session["user_id"] = rows[0]["id"]

@app.route("/user", methods=["GET"])
def user():

    # if user reached route via GET 
    if request.method == "GET":

        db = get_db();
        # query database for username
        rows = db.execute("SELECT * FROM users")

        
        if len(rows):
            return rows


if __name__ == '__main__':
    app.run(debug=True)
