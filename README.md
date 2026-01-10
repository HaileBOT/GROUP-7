Mentor Routes API

This module provides backend API routes for managing and retrieving mentor information in a mentoring platform. It is built using Node.js, Express, and PostgreSQL, and supports mentor discovery, filtering, and profile viewing.

📌 Features

Secure mentor-related endpoints using JWT authentication

Recommend mentors based on courses

Browse all approved mentors

View detailed mentor profiles

Pagination and sorting support

Rating and session statistics for mentors

🛠 Technologies Used

Node.js

Express.js

PostgreSQL

JWT Authentication

SQL (with JSONB queries)

📁 File Location
Algorithm/
└── routes/
    └── mentorRoutes.js

🔐 Authentication

Some endpoints require authentication using a JWT token.

Middleware used: authenticateToken

Token must be sent in the Authorization header:

Authorization: Bearer <your_token>

🚀 API Endpoints
1️⃣ Recommend Mentors

POST /mentors

Returns top mentors, optionally prioritized by course.

Request Body

{
  "tags": ["javascript", "backend"],
  "courseId": "CS101"
}


Response

List of recommended mentors

Average rating

Total ratings and sessions

2️⃣ Get All Mentors

GET /mentors/all

Browse all approved mentors.

Query Parameters

courses – filter by course(s)

sortBy – rating, sessions, newest, name

limit – number of results (default: 20)

offset – pagination offset

3️⃣ Get Mentor by ID

GET /mentors/:id

Returns detailed information for a single mentor, including:

Profile information

Ratings summary

Recent feedback

Availability status

📊 Data Considerations

Only approved mentors are returned

Ratings and session counts are aggregated

Mentors are marked available if they have fewer than 3 active sessions

⚠️ Error Handling

Returns 404 if mentor not found

Returns 500 for server/database errors

Errors include a clear message for debugging

📦 Export

The routes are exported as an Express router:

module.exports = router;


They should be mounted in the main Express app, for example:

app.use('/api', mentorRoutes);

✅ Status

✔ Functional
✔ Secure
✔ Ready for integration