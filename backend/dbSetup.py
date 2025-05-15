import os
from flask import Flask
from dbConfig import db, User, Court, Finances

app = Flask(__name__, instance_path=os.path.join(os.getcwd(), "backend", "instance"))  # Ensure instance is inside backend
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///tennis_club.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db.init_app(app)

# Ensure the instance folder exists inside backend/
os.makedirs(app.instance_path, exist_ok=True)

# Delete existing database file before recreation
db_path = os.path.join(app.instance_path, "tennis_club.db")
if os.path.exists(db_path):
    os.remove(db_path)
    print("Existing database deleted.")

with app.app_context():
    db.create_all()
    print("Database initialized successfully!")
    if not User.query.filter_by(email="admin@gmail.com").first():
        default_admin = User(
            first_name="Addison",
            last_name="Ministrator",
            email="admin@gmail.com",
            phone_number="8607771111",
            password="admin123",
            guest_count=4,
            role="admin",
            visibility=True
        )
        
        default_admin_finances = Finances(
            user_id=1,
            balance=0.0
        )

        db.session.add(default_admin)
        db.session.add(default_admin_finances)
        db.session.commit()
        print("Default admin created: Email: admin@gmail.com   Password: admin123")
    else:
        print("Default admin already exists.")
    
    if not Court.query.filter_by(court_id="1").first():
        court1 = Court(
            court_id="1",
            availability=True
        )
        court2 = Court(
            court_id="2",
            availability=True
        )
        court3 = Court(
            court_id="3",
            availability=True
        )
        court4 = Court(
            court_id="4",
            availability=True
        )
        court5 = Court(
            court_id="5",
            availability=True
        )
        court6 = Court(
            court_id="6",
            availability=True
        )
        court7 = Court(
            court_id="7",
            availability=True
        )
        court8 = Court(
            court_id="8",
            availability=True
        )
        court9 = Court(
            court_id="9",
            availability=True
        )
        court10 = Court(
            court_id="10",
            availability=True
        )
        court11 = Court(
            court_id="11",
            availability=True
        )
        court12 = Court(
            court_id="12",
            availability=True
        )
        
        db.session.add(court1)
        db.session.add(court2)
        db.session.add(court3)
        db.session.add(court4)
        db.session.add(court5)
        db.session.add(court6)
        db.session.add(court7)
        db.session.add(court8)
        db.session.add(court9)
        db.session.add(court10)
        db.session.add(court11)
        db.session.add(court12)
        db.session.commit()
        print("Default courts created: court_id 1, 2, 3, 4, ..., 12")
    else:
        print("Default courts already exist.")
