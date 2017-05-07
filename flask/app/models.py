from app import db
#The User class that we just created contains several fields, defined as class variables. Fields are created as instances of the db.Column class, which takes the field type as an argument, plus other optional arguments that allow us, for example, to indicate which fields are unique and indexed.
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nickname = db.Column(db.String(64), index=True, unique=True)
    email = db.Column(db.String(120), index=True, unique=True)
    posts = db.relationship('Post', backref='author', lazy='dynamic')
#The __repr__ method tells Python how to print objects of this class. We will use this for debugging.
    def __repr__(self):
        return '<User %r>' % (self.nickname)
class Post(db.Model):
    id = db.Column(db.Integer, primary_key = True)
    body = db.Column(db.String(140))
    timestamp = db.Column(db.DateTime)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))

    def __repr__(self):
        return '<Post %r>' % (self.body)