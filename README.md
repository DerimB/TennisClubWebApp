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

This web application was developed by a team of three students as part of our CS 460W Software Development course. My personal contributions included:

- Setting up the backend using Python (Flask) and SQLite.
- Creating the database models and API routes (authentication, reservations, finances, etc.).
- Implementing court reservation logic and guest charging functionality.
- Leading integration and unit testing, including reservation flow and access control.
- Developing major frontend logic for login, member directory, and reservation pages.
- Writing setup instructions and documentation.

This was a collaborative project, and I ensured the backend structure and functionality were clean, testable, and well-documented.

---
