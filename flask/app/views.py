from app import app, db, models
from models import User, Post

@app.route('/')
@app.route('/index')
def index():
	user =  User.query.all()
	return user