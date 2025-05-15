import unittest
import json
from app import app, db
from dbConfig import User, Court, Reservation

class TestLogin(unittest.TestCase):

    def setUp(self):
        app.config['TESTING'] = True
        app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
        self.client = app.test_client()

        with app.app_context():
            db.create_all()

            test_user = User(
                first_name="Unit",
                last_name="Tester",
                email="unittest@gmail.com",
                phone_number="2033331111",
                password="test123",
                role="member",
                visibility=True
            )
            db.session.add(test_user)
            db.session.commit()

    def tearDown(self):
        with app.app_context():
            db.drop_all()

    def test_login_success(self):
        response = self.client.post(
            "/api/login",
            data=json.dumps({"email": "unittest@gmail.com", "password": "test123"}),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIn("message", data)
        self.assertEqual(data["message"], "Login successful!")

    def test_login_failure(self):
        response = self.client.post(
            "/api/login",
            data=json.dumps({"email": "wrong@example.com", "password": "wrongpass"}),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 401)
        data = json.loads(response.data)
        self.assertIn("message", data)
        self.assertEqual(data["message"], "Invalid email or password")


class TestMemberDirectory(unittest.TestCase):

    def setUp(self):
        app.config['TESTING'] = True
        app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
        self.client = app.test_client()

        with app.app_context():
            db.create_all()

            test_user = User(
                first_name="Unit",
                last_name="Tester",
                email="unittest@gmail.com",
                phone_number="2033331111",
                password="test123",
                role="member",
                visibility=True
            )
            db.session.add(test_user)

            invisible_user = User(
                first_name="Invisible",
                last_name="User",
                email="sneaky@gmail.com",
                phone_number="8601231233",
                password="test123",
                role="member",
                visibility=False
            )
            db.session.add(invisible_user)

            db.session.commit()

    def tearDown(self):
        with app.app_context():
            db.drop_all()

    def test_get_visible_members(self):
        response = self.client.get("/api/members")
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]["first_name"], "Unit")
        self.assertEqual(data[0]["last_name"], "Tester")

    def test_get_visible_members_with_id(self):
        response = self.client.get("/api/membersID")
        self.assertEqual(response.status_code, 200)

        data = json.loads(response.data)
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]["first_name"], "Unit")
        self.assertEqual(data[0]["last_name"], "Tester")
        self.assertIn("id", data[0])
        self.assertEqual(data[0]["email"], "unittest@gmail.com")



class TestReservation(unittest.TestCase):
    def setUp(self):
        app.config['TESTING'] = True
        app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
        self.client = app.test_client()

        with app.app_context():
            db.create_all()

            test_user = User(
                first_name="Unit",
                last_name="Tester",
                email="unittest@gmail.com",
                phone_number="2033331111",
                password="test123",
                role="member",
                visibility=True
            )
            db.session.add(test_user),

            test_court = Court(
                court_id=1,
                availability=True
            )

            db.session.add(test_court)

            test_court_time_conflict = Court(
                court_id=2,
                availability=True
            )
            db.session.add(test_court_time_conflict)


            db.session.commit()

    def tearDown(self):
        with app.app_context():
            db.drop_all()
        
    def test_create_reservation(self):
        response = self.client.post(
            "/api/reservations",
            data=json.dumps({
                "user_id": 1, "court_id": 1, "date": "2025-04-15", "start_time": "10:10", "end_time": "10:30", "game_type": "doubles", "guest_count_used": 0
            }),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 201)
        data = json.loads(response.data)
        self.assertIn("message", data)
        self.assertEqual(data["message"], "Reservation created successfully")

    def test_reservation_time_conflict(self):
        response = self.client.post(
            "/api/reservations",
            data=json.dumps({
                "user_id": 1, "court_id": 1, "date": "2025-04-15", "start_time": "10:10", "end_time": "10:30", "game_type": "doubles", "guest_count_used": 0
            }),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 201)
        data = json.loads(response.data)
        self.assertIn("message", data)
        self.assertEqual(data["message"], "Reservation created successfully")

class TestCreateAccount(unittest.TestCase):

    def setUp(self):
        app.config['TESTING'] = True
        app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
        self.client = app.test_client()

        with app.app_context():
            db.create_all()

            test_user = User(
                first_name="Unit",
                last_name="Tester",
                email="unittest@gmail.com",
                phone_number="2033331111",
                password="test123",
                role="member",
                visibility=True
            )
            db.session.add(test_user)
            db.session.commit()

    def tearDown(self):
        with app.app_context():
            db.drop_all()

    def test_create_account_success(self):
        response = self.client.post(
            "/api/create-account",
            data=json.dumps({"firstname": "John", "lastname": "Smith", "email": "john@gmail.com", "phonenum": "1231231122", "password": "pass123", "role": "member", "visibility": True}),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 201)
        data = json.loads(response.data)
        self.assertIn("message", data)
        self.assertEqual(data["message"], "User successfully added!")
    
    def test_create_account_invalid_input(self):
        response = self.client.post(
            "/api/create-account",
            data=json.dumps({"firstname": "Max", "lastname": "Smith", "email": "max@gmail.com", "phonenum": "1231231122", "password": "pass123", "role": "member", "visibility": "WRONG"}),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 500)
        data = json.loads(response.data)
        self.assertIn("error", data)
        self.assertEqual(data["error"], "Couldnt add account")

    def test_create_account_missing_input(self):
        response = self.client.post(
            "/api/create-account",
            data=json.dumps({"firstname": "Max", "lastname": "Smith", "email": "max@gmail.com", "phonenum": "1231231122", "password": "pass123", "role": "member", "visibility": ""}),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 500)
        data = json.loads(response.data)
        self.assertIn("error", data)
        self.assertEqual(data["error"], "Couldnt add account")

    def test_get_reservations(self):

        with app.app_context():

            reservation = Reservation(
                user_id=1,
                court_id=1,
                date="2025-04-15",
                start_time="10:00",
                end_time="10:30",
                game_type="singles",
                availability=True
            )

            db.session.add(reservation)

            db.session.commit()

        response = self.client.get("/api/reservations")
        
        self.assertEqual(response.status_code, 200)

        data = json.loads(response.data)
        self.assertIsInstance(data, list)
        self.assertEqual(len(data), 1)

        self.assertEqual(data[0]["user_id"], 1)
        self.assertEqual(data[0]["court_id"], 1)
        self.assertEqual(data[0]["date"], "2025-04-15")
        self.assertEqual(data[0]["start_time"], "10:00")
        self.assertEqual(data[0]["end_time"], "10:30")
        self.assertEqual(data[0]["game_type"], "singles")


    
if __name__ == '__main__':
    unittest.main()
