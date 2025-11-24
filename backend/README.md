# LMS (Learning Management System) Backend API

A complete Node.js + Express backend for an online learning platform with authentication, course management, quizzes, payments, and more.

## 🚀 Features

- **Authentication & Authorization**: JWT-based auth with role-based access control (student, instructor, admin)
- **User Management**: Complete CRUD operations for users and profiles
- **Course Management**: Create, update, delete courses with lessons
- **Enrollments**: Student enrollment system with progress tracking
- **Quizzes & Questions**: Quiz creation and submission with results tracking
- **Payments**: Payment processing and tracking
- **Notifications**: User notification system
- **Chat System**: Course-based chat rooms and messaging
- **Reviews**: Course review and rating system
- **Certificates**: Certificate generation and verification

## 📁 Project Structure

```
backend/
├── config/
│   └── db.js                 # Database configuration
├── controllers/              # Route handlers
│   ├── auth.controller.js
│   ├── user.controller.js
│   ├── course.controller.js
│   └── ...
├── middlewares/              # Custom middleware
│   ├── auth.middleware.js    # JWT authentication
│   ├── error.middleware.js   # Error handling
│   └── validateResult.middleware.js
├── models/                   # Sequelize models
│   ├── index.model.js        # Model associations
│   ├── user.model.js
│   ├── course.model.js
│   └── ...
├── routes/                   # API routes
│   ├── auth.routes.js
│   ├── user.routes.js
│   ├── course.routes.js
│   └── ...
├── services/                 # Business logic
│   ├── auth.service.js
│   ├── user.service.js
│   ├── course.service.js
│   └── ...
├── validators/               # Input validation
│   ├── auth.validator.js
│   ├── user.validator.js
│   ├── course.validator.js
│   └── ...
├── app.js                    # Express app setup
├── server.js                 # Server entry point
└── package.json
```

## 🛠️ Installation

### Prerequisites

- Node.js (v14 or higher)
- MySQL (v5.7 or higher)
- npm or yarn

### Steps

1. **Clone the repository**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create MySQL database**
   ```sql
   CREATE DATABASE online_courses_platform;
   ```

4. **Configure environment variables**
   - Copy `.env.example` to `.env`
   ```bash
   cp .env.example .env
   ```
   - Update the values in `.env`:
   ```env
   PORT=3000
   NODE_ENV=development
   
   DB_NAME=online_courses_platform
   DB_USER=root
   DB_PASS=your_password
   DB_HOST=localhost
   DB_PORT=3306
   
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRES_IN=7d
   ```

5. **Start the server**
   ```bash
   npm start
   ```

The server will start on `http://localhost:3000` and automatically sync database models.

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Authentication Endpoints

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "full_name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "student"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

### Course Endpoints

#### Get All Courses
```http
GET /api/courses
```

#### Get Course by ID
```http
GET /api/courses/:id
```

#### Create Course (Instructor/Admin)
```http
POST /api/courses
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Introduction to JavaScript",
  "description": "Learn JavaScript from scratch",
  "category": "Programming",
  "level": "beginner",
  "price": 49.99
}
```

#### Update Course (Instructor/Admin)
```http
PUT /api/courses/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated Course Title",
  "is_published": true
}
```

#### Delete Course (Instructor/Admin)
```http
DELETE /api/courses/:id
Authorization: Bearer <token>
```

### Enrollment Endpoints

#### Enroll in Course
```http
POST /api/enrollments
Authorization: Bearer <token>
Content-Type: application/json

{
  "course_id": "course-uuid"
}
```

#### Update Progress
```http
PUT /api/enrollments/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "progress": 75.5
}
```

### Quiz Endpoints

#### Create Quiz (Instructor/Admin)
```http
POST /api/quizzes
Authorization: Bearer <token>
Content-Type: application/json

{
  "course_id": "course-uuid",
  "title": "JavaScript Basics Quiz",
  "total_marks": 100
}
```

#### Submit Quiz Result
```http
POST /api/quizzes/submit
Authorization: Bearer <token>
Content-Type: application/json

{
  "quiz_id": "quiz-uuid",
  "score": 85
}
```

### Other Endpoints

- **Users**: `/api/users`
- **Lessons**: `/api/lessons`
- **Questions**: `/api/questions`
- **Payments**: `/api/payments`
- **Notifications**: `/api/notifications`
- **Chat**: `/api/chat`
- **Reviews**: `/api/reviews`
- **Certificates**: `/api/certificates`

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## 👥 User Roles

- **Student**: Can enroll in courses, submit quizzes, write reviews
- **Instructor**: Can create and manage courses, lessons, quizzes
- **Admin**: Full access to all resources

## ✅ Input Validation

All endpoints use `express-validator` for input validation. Validation errors return:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Please provide a valid email",
      "value": "invalid-email"
    }
  ]
}
```

## 🚨 Error Handling

Errors are handled centrally and return consistent responses:

```json
{
  "success": false,
  "message": "Error message here"
}
```

## 🗄️ Database Models

- **User**: User accounts with authentication
- **Profile**: Extended user profile information
- **Course**: Course information and metadata
- **Lesson**: Course lessons with content
- **Enrollment**: Student course enrollments
- **Quiz**: Course quizzes
- **Question**: Quiz questions
- **QuizResult**: Student quiz submissions
- **Payment**: Payment transactions
- **Notification**: User notifications
- **ChatRoom**: Course chat rooms
- **ChatMessage**: Chat messages
- **CourseReview**: Course reviews and ratings
- **Certificate**: Course completion certificates

## 📦 Dependencies

- **express**: Web framework
- **sequelize**: ORM for MySQL
- **mysql2**: MySQL driver
- **bcryptjs**: Password hashing
- **jsonwebtoken**: JWT authentication
- **express-validator**: Input validation
- **cors**: Cross-origin resource sharing
- **dotenv**: Environment variables
- **uuid**: UUID generation

## 🧪 Testing

```bash
npm test
```

## 📝 License

ISC

## 👨‍💻 Author

Your Name

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
