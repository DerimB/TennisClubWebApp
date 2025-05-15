from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from sqlalchemy.dialects.sqlite import JSON  # Import JSON type for SQLite


db = SQLAlchemy()

# Users Table
class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    phone_number = db.Column(db.String(15), nullable=False)
    password = db.Column(db.String(255), nullable=False)  # Store hashed passwords
    role = db.Column(db.String(20), nullable=False)
    guest_count = db.Column(db.Integer, default=4)  # Number of guests allowed
    visibility = db.Column(db.Boolean, default=True)

    __table_args__ = (
        db.CheckConstraint("role IN ('admin', 'treasurer', 'member')"),
    )

# Courts Table
class Court(db.Model):
    __tablename__ = 'courts'
    court_id = db.Column(db.Integer, primary_key=True)
    availability = db.Column(db.Boolean, default=True)

# Reservations Table
class Reservation(db.Model):
    __tablename__ = 'reservations'
    reservation_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    court_id = db.Column(db.Integer, db.ForeignKey('courts.court_id'), nullable=False)
    date = db.Column(db.String(10), nullable=False)  # YYYY-MM-DD format
    start_time = db.Column(db.String(5), nullable=False)  # HH:MM format
    end_time = db.Column(db.String(5), nullable=False)  # HH:MM format
    game_type = db.Column(db.String(10), nullable=False)
    players = db.Column(JSON, nullable=True)  # Number of players
    availability = db.Column(db.Boolean, default=True)

    __table_args__ = (
        db.CheckConstraint("game_type IN ('singles', 'doubles', 'event')"),
    )

# Finances Table
class Finances(db.Model):
    __tablename__ = 'finances'
    finances_id = db.Column(db.Integer, primary_key=True)  # Add a primary key column
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    balance = db.Column(db.Float, nullable=False)
    user = db.relationship('User', backref='payments')

# Member Directory Table
class MemberDirectory(db.Model):
    __tablename__ = 'member_directory'
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), primary_key=True)
    visible = db.Column(db.Boolean, default=True)
    user = db.relationship('User', backref='directory_entry')

# Guest Tracking Table (for guests added to a member's reservation)
class Guest(db.Model):
    __tablename__ = 'guests'
    guest_id = db.Column(db.Integer, primary_key=True)
    reservation_id = db.Column(db.Integer, db.ForeignKey('reservations.reservation_id'), nullable=False)
    guest_name = db.Column(db.String(100), nullable=False)
    guest_email = db.Column(db.String(100), nullable=False)
    reservation = db.relationship('Reservation', backref='guests')
