# TennisClubWebApp

A full-stack web application for managing a tennis club, built as a team project. This system allows members to reserve courts, admins to manage users, and treasurers to track financial balances and guest usage. Built with Python (Flask + SQLAlchemy), SQLite, HTML, CSS, and JavaScript.

## Features

- Court reservation system with dynamic court display
- Role-based access for Admin, Treasurer, and Member
- Guest pass tracking and enforcement
- Financial management system with billing logic
- Member directory with search and visibility control
- Email notifications on reservation updates

## Technologies Used

- **Backend**: Python (Flask, SQLAlchemy, Flask-CORS)
- **Database**: SQLite
- **Frontend**: HTML, CSS, JavaScript
- **Build Tool**: Gulp
- **Testing**: Python `unittest` for unit testing, manual integration testing

## Core Folder Structure

```
TennisClubWebApp/
├── backend/
│   ├── app.py
│   ├── dbSetup.py
│   ├── dbConfig.py
│   └── test-app.py
├── frontend/
│   ├── assets/
│   ├── html/
│   ├── js/
│   └── styles/
├── .gitignore
├── gulpfile.js
└── README.md

```

## Instructions to Run the Project

To run the TennisClubWebApp on your local machine:

### 1. Install Python dependencies (backend)

Navigate to the `backend/` project directory and run:

```bash
pip install -r dependencies.txt
```

This installs Flask, Flask-CORS, SQLAlchemy, etc.

---

### 2. Set up the frontend (Node/Gulp)

From the root directory, initialize and install frontend dependencies:

```bash
npm install
```

Make sure `gulp`, `gulp-cli`, `gulp-clean-css`, `gulp-concat`, `gulp-uglify`, and `browser-sync` are installed via package.json or manually.

---

### 3. Initialize the database

From the `backend/` directory, run:

```bash
python dbSetup.py
```

This sets up the SQLite database and creates the required tables.

---

### 4. Start the Flask backend

Still in the `backend/` directory:

```bash
python app.py
```

Flask will run on [http://localhost:5000](http://localhost:5000).

---

### 5. Launch the frontend (Gulp)

From the root directory again, run:

```bash
npx gulp serve
```

This starts a Browsersync server at [http://localhost:3000](http://localhost:3000) and serves the static frontend.

---

## About the Team & My Contribution

This web application was built by a team of three students as part of our CS 460W Software Development course. While the project was collaborative, I took on a leadership role during multiple phases and contributed heavily to both backend and frontend development.

My individual contributions included:

- Designing and implementing the backend using Python, Flask, SQLAlchemy, and SQLite.
- Creating API routes for core functionality such as login, reservations, guest tracking, and finances.
- Developing the reservation system, including court conflict checks and guest billing logic.
- Building key frontend features in JavaScript such as the login flow, reservation form, member directory search, and treasurer account tools.
- Leading integration and unit testing using Python's `unittest` framework — covering authentication, role-based access, and edge case handling.
- Writing the technical documentation and setup instructions used to run the project.
- Helping coordinate code integration, debugging, and task management throughout the semester.

This project gave me a chance to apply full-stack development skills in a real team setting while taking initiative on complex features and testing workflows. It also helped sharpen my understanding of the software development life cycle (SDLC), especially in areas like requirement gathering, iterative development, testing, and deployment.

---
