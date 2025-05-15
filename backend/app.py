import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from dbConfig import db, User, Reservation, Court, Guest, Finances


app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})

basedir = os.path.abspath(os.path.dirname(__file__))
db_path = os.path.join(basedir, 'instance', 'tennis_club.db')
app.config["SQLALCHEMY_DATABASE_URI"] = f"sqlite:///{db_path}"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db.init_app(app)

@app.route("/api/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    user = User.query.filter_by(email=email, password=password).first()
    if user:
        return jsonify({"message": "Login successful!",
                    "user_id": user.id,
                    "role": user.role
                    })
    else:
        return jsonify({"message": "Invalid email or password"}), 401

@app.route("/api/members")
def get_visible_members():
    search = request.args.get("search", "").lower()
    query = User.query.filter_by(visibility=True)

    if search:
        query = query.filter(
            (User.first_name.ilike(f"%{search}%")) |
            (User.last_name.ilike(f"%{search}%")) |
            (User.email.ilike(f"%{search}%"))|
            (User.phone_number.ilike(f"%{search}%"))
        )

    members = query.order_by(User.first_name).all()
    return jsonify([
        {
            "first_name": m.first_name,
            "last_name": m.last_name,
            "email": m.email,
            "phone_number": m.phone_number

        } for m in members
    ])

@app.route("/api/members-finances", methods=["GET"])
def get_members_with_balance():
    search = request.args.get("search", "").lower()

    query = db.session.query(User, Finances).join(Finances)

    if search:
        query = query.filter(
            (User.first_name.ilike(f"%{search}%")) |
            (User.last_name.ilike(f"%{search}%")) |
            (User.email.ilike(f"%{search}%")) |
            (User.phone_number.ilike(f"%{search}%"))
        )

    results = query.order_by(User.first_name).all()

    return jsonify([
        {
            "id": user.id,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "email": user.email,
            "phone_number": user.phone_number,
            "balance": finances.balance
        }
        for user, finances in results
    ])


@app.route("/api/membersID")
def get_visible_members_with_id():
    search = request.args.get("search", "").lower()
    query = User.query

    if search:
        query = query.filter(
            (User.id.ilike(f"%{search}%")) |
            (User.first_name.ilike(f"%{search}%")) |
            (User.last_name.ilike(f"%{search}%")) |
            (User.email.ilike(f"%{search}%"))|
            (User.phone_number.ilike(f"%{search}%"))
        )

    membersID = query.order_by(User.first_name).all()
    return jsonify([
        {
            "id": m.id,
            "first_name": m.first_name,
            "last_name": m.last_name,
            "email": m.email,
            "phone_number": m.phone_number,
            "password": m.password,
            "role": m.role,
            "guest_count": m.guest_count,
            "visibility": m.visibility

        } for m in membersID
    ])

@app.route("/api/reservations", methods=["POST"])
def create_reservation():
    data = request.get_json()

    required_fields = ["user_id", "court_id", "date", "start_time", "end_time", "game_type", "guest_count_used"]
    for field in required_fields:
        if field not in data:
            return jsonify({"error": f"Missing field: {field}"}), 400

    user = db.session.get(User, data["user_id"])
    if not user:
        return jsonify({"error": "Invalid user ID"}), 400

    court = db.session.get(Court, data["court_id"])
    if not court:
        return jsonify({"error": f"Invalid court ID: {data['court_id']}"}), 400

    # Validate game type
    if data["game_type"].lower() not in ["singles", "doubles", "event"]:
        return jsonify({"error": "Invalid game type"}), 400

    # Check for conflicting reservations
    conflict = Reservation.query.filter(
        Reservation.court_id == data["court_id"],
        Reservation.date == data["date"],
        Reservation.start_time < data["end_time"],
        Reservation.end_time > data["start_time"]
    ).first()
    if conflict:
        return jsonify({"error": "Court is already reserved at this time"}), 409

    # Deduct guest passes
    guest_count_used = data["guest_count_used"]
    if user.guest_count < guest_count_used:
        return jsonify({"error": "Not enough guest passes available"}), 400

    user.guest_count -= guest_count_used

    if user.payments:
        user.payments[0].balance += guest_count_used * 5
    else:
        # Handle if somehow finances doesn't exist (just in case)
        return jsonify({"error": "Finance record not found for user"}), 400


    new_reservation = Reservation(
        user_id=data["user_id"],
        court_id=data["court_id"],
        date=data["date"],
        start_time=data["start_time"],
        end_time=data["end_time"],
        game_type=data["game_type"].lower(),
        players=[player.get("player_name") for player in data.get("players", [])],  # Extract only player names        
        availability=True
    )

    try:
        db.session.add(new_reservation)
        db.session.flush()  # Flush to get the reservation ID

        # Add players to the reservation
        players = data.get("players", [])
        for player in players:
            player_name = player.get("player_name")
            is_guest = player.get("is_guest", False)
            if is_guest:
                new_guest = Guest(
                    reservation_id=new_reservation.reservation_id,
                    guest_name=player_name,
                    guest_email= player.get("email") if is_guest else ""  # Set email only for guests
                )
                db.session.add(new_guest)

        db.session.commit()
        return jsonify({"message": "Reservation created successfully"}), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Database error: {str(e)}"}), 500

@app.route("/api/reservations", methods=["GET"])
def get_reservations():
    # Get optional query parameters
    user_id = request.args.get("user_id")
    court_id = request.args.get("court_id")
    date = request.args.get("date")

    # Build the query dynamically based on the provided filters
    query = Reservation.query

    if user_id:
        query = query.filter(Reservation.user_id == user_id)
    if court_id:
        query = query.filter(Reservation.court_id == court_id)
    if date:
        query = query.filter(Reservation.date == date)

    # Execute the query and fetch all matching reservations
    reservations = query.all()

    # Return the reservations as JSON
    return jsonify([
        {
            "reservation_id": r.reservation_id,
            "user_id": r.user_id,
            "court_id": r.court_id,
            "date": r.date,
            "start_time": r.start_time,
            "end_time": r.end_time,
            "game_type": r.game_type,
            "players": r.players,
            "availability": r.availability
        } for r in reservations
    ])

@app.route("/api/create-account", methods=["POST"])
def create_account():
    data = request.get_json()

    required_fields = ["firstname", "lastname", "email", "phonenum", "password", "role", "visibility"]
    for field in required_fields:
        if field not in data:
            return jsonify({"error": f"Missing field: {field}"}), 400

    email = User.query.get(data["email"])
    if email:
        return jsonify({"error": "Email in use"}), 400

    new_user = User(
        first_name=data["firstname"],
        last_name=data["lastname"],
        email=data["email"],
        phone_number=data["phonenum"],
        password=data["password"],
        role=data["role"],
        visibility=data["visibility"],
    )

    try:
        db.session.add(new_user)
        db.session.flush()  # flush is similar to a refresh in SQLAlchemy, so the new user ID can be used for the finances

        new_finances = Finances(user_id=new_user.id, balance=0.0)
        db.session.add(new_finances)

        db.session.commit()
        return jsonify({"message": "User successfully added!"}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Couldnt add account"}), 500

@app.route("/api/update-member", methods=["PUT"])
def update_member():
    data = request.get_json()

    if not data or "id" not in data or "field" not in data or "value" not in data:
        return jsonify({"error": "Invalid input"}), 400

    user = User.query.get(data["id"])
    if not user:
        return jsonify({"error": "User not found"}), 404

    if hasattr(user, data["field"]):
        setattr(user, data["field"], data["value"])
    else:
        return jsonify({"error": "Invalid field"}), 400

    try:
        db.session.commit()
        return jsonify({"message": "User updated successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@app.route("/api/users/<int:user_id>", methods=["GET"])
def get_user(user_id):
    # Query the database for the user with the given user_id
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    # Return the user's guest count and other relevant details
    return jsonify({
        "id": user.id,
        "guest_count": user.guest_count
    })

@app.route("/api/modify-balance", methods=["PUT"])
def modify_balance():
    data = request.get_json()
    user_id = data.get("user_id")
    amount = data.get("balance")

    if not user_id or amount is None:
        return jsonify({"error": "Missing user ID or amount"}), 400

    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    finances = Finances.query.filter_by(user_id=user_id).first()
    if not finances:
        return jsonify({"error": "Finances record not found"}), 404

    try:
        if amount == "PAID_FULL":
            finances.balance = 0.0
        else:
            finances.balance += float(amount)
    except ValueError:
        return jsonify({"error": "Invalid amount format"}), 400

    try:
        db.session.commit()
        return jsonify({"message": "Balance updated successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
    
@app.route("/api/delete-reservation", methods=["DELETE"])
def delete_reservation():
    data = request.get_json()
    reservation_id = data.get("reservation_id")

    if not reservation_id:
        return jsonify({"error": "Missing reservation ID"}), 400

    reservation = Reservation.query.get(reservation_id)
    if not reservation:
        return jsonify({"error": "Reservation not found"}), 404

    try:
        Guest.query.filter_by(reservation_id=reservation_id).delete()
        db.session.delete(reservation)
        db.session.commit()
        return jsonify({"message": "Reservation deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@app.route("/api/users/<int:user_id>/decrement-guest-count", methods=["PUT"])
def decrement_guest_count(user_id):
    data = request.get_json()
    decrement_by = data.get("decrement_by", 0)

    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    if user.guest_count < decrement_by:
        return jsonify({"error": "Not enough guest passes available"}), 400

    user.guest_count -= decrement_by

    try:
        db.session.commit()
        return jsonify({"message": "Guest count updated successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Failed to update guest count"}), 500

@app.route("/api/reset-guest-count", methods=["PUT"])
def reset_guest_count():
    default_guest_count = 4
    try:
        users = User.query.all()
        for user in users:
            user.guest_count = default_guest_count

        db.session.commit()
        return jsonify({"message": "Guest counts reset successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
    
@app.route("/api/delete-user", methods=["DELETE"])
def delete_user():
    data = request.get_json()
    print("Request data:", data)  # Debugging: Log the incoming data

    delete_user_id = data.get("userId")
    if not delete_user_id:
        return jsonify({"error": "Missing user ID"}), 400

    user = User.query.get(delete_user_id)
    print("Retrieved user:", user)  # Debugging: Log the retrieved user object

    if not user:
        return jsonify({"error": "User not found"}), 404

    try:
        # Delete the associated Finances record
        finances = Finances.query.filter_by(user_id=delete_user_id).first()
        if finances:
            db.session.delete(finances)

        # Delete the user
        db.session.delete(user)
        db.session.commit()
        return jsonify({"message": "User deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        print("Error during deletion:", str(e))  # Debugging: Log the error
        return jsonify({"error": str(e)}), 500

# Function to send an email
def send_email(recipient_email, subject, body):
    sender_email = "gulf.coast.courts.and.oil.rigs@gmail.com"  # Replace with your email
    sender_password = "123!@#Password"  # Replace with your email password or app password

    try:
        # Set up the email
        msg = MIMEMultipart()
        msg["From"] = sender_email
        msg["To"] = recipient_email
        msg["Subject"] = subject

        # Add the email body
        msg.attach(MIMEText(body, "plain"))

        # Connect to the SMTP server and send the email
        with smtplib.SMTP("smtp.gmail.com", 587) as server:
            server.starttls()  # Secure the connection
            server.login(sender_email, sender_password)
            server.sendmail(sender_email, recipient_email, msg.as_string())

        print(f"Email sent to {recipient_email}")
    except Exception as e:
        print(f"Error sending email: {e}")

# API endpoint to send an email
@app.route("/api/send-email", methods=["POST"])
def api_send_email():
    data = request.get_json()
    recipient_email = data.get("email")
    subject = data.get("subject", "No Subject")
    body = data.get("body", "No Body")

    if not recipient_email:
        return jsonify({"error": "Recipient email is required"}), 400

    try:
        send_email(recipient_email, subject, body)
        return jsonify({"message": "Email sent successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# API endpoint to send reservation emails
@app.route("/api/send-reservation-emails", methods=["POST"])
def send_reservation_emails():
    data = request.get_json()
    emails = data.get("emails", [])
    reservation_details = data.get("reservation_details", {})

    if not reservation_details:
        return jsonify({"error": "Reservation details are required"}), 400

    # Fetch the user's email from the database
    user_id = reservation_details.get("user_id")
    if user_id:
        user = User.query.get(user_id)
        if user and user.email:
            emails.append(user.email)  # Add the user's email to the list

    if not emails:
        return jsonify({"error": "No emails to send notifications to"}), 400

    subject = "Your Reservation Details"
    body = (
        f"Hello,\n\n"
        f"Here are the details of your reservation:\n"
        f"Date: {reservation_details.get('date')}\n"
        f"Time: {reservation_details.get('start_time')} - {reservation_details.get('end_time')}\n"
        f"Court: {reservation_details.get('court')}\n"
        f"Game Type: {reservation_details.get('game_type')}\n\n"
        f"Thank you for using our reservation system!"
    )

    for email in emails:
        send_email(email, subject, body)

    return jsonify({"message": "Emails sent successfully"}), 200

if __name__ == "__main__":
    app.run(debug=True)
