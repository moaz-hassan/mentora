# AI Help System - Implementation Complete

## Overview
This implementation adds an AI-powered help system with Google Gemini integration, accessible to all users (authenticated and unauthenticated), along with a comprehensive reporting system for content moderation.

## Features Implemented

### 1. Universal Help Page
- **Location**: `/help`
- **Access**: Available to all users (no login required)
- **Features**:
  - AI-powered chat interface
  - Role-aware responses (guest, student, instructor, admin)
  - Example questions based on user role
  - Real-time conversation with Gemini AI

### 2. Report System
- **User Features**:
  - Submit reports about courses, lessons, quizzes, or general issues
  - Report button component for easy integration
  - Automatic capture of reporter information
  - Confirmation with reference number

- **Admin Features**:
  - Report management dashboard at `/dashboard/admin/reports`
  - Filter by status, type, severity, date range
  - Search functionality
  - AI-powered categorization and severity assessment
  - AI-generated summaries and recommendations
  - Status management (pending, in-review, resolved, dismissed)

### 3. AI Integration Throughout Platform
- **Instructor Dashboard**:
  - AI insights widget for course performance
  - AI content suggestions for course creation
  - AI-powered metadata generation

- **Admin Dashboard**:
  - AI platform insights
  - AI content moderation tools
  - Automated report categorization

## Setup Instructions

### 1. Install Dependencies
Backend dependencies are already installed (including @google/generative-ai).

### 2. Configure Gemini API Key
1. Get your API key from: https://makersuite.google.com/app/apikey
2. Add to `backend/.env`:
   ```
   GEMINI_API_KEY=your_actual_api_key_here
   ```

### 3. Database Migration
Run the following SQL to create the reports table:

```sql
CREATE TABLE reports (
  id VARCHAR(50) PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  description TEXT NOT NULL,
  reported_by VARCHAR(50) NOT NULL,
  content_reference VARCHAR(50) DEFAULT NULL,
  content_type ENUM('course', 'lesson', 'quiz', 'general') DEFAULT 'general',
  status ENUM('pending', 'in-review', 'resolved', 'dismissed') DEFAULT 'pending',
  ai_category VARCHAR(100) DEFAULT NULL,
  ai_severity ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
  ai_reasoning TEXT DEFAULT NULL,
  reviewed_by VARCHAR(50) DEFAULT NULL,
  reviewed_at DATETIME DEFAULT NULL,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL,
  FOREIGN KEY (reported_by) REFERENCES users(id),
  FOREIGN KEY (reviewed_by) REFERENCES users(id),
  INDEX idx_status (status),
  INDEX idx_content_type (content_type),
  INDEX idx_reported_by (reported_by),
  INDEX idx_ai_severity (ai_severity),
  INDEX idx_createdAt (createdAt)
);
```

Or use Sequelize sync:
```javascript
// In backend, temporarily enable sync
await sequelize.sync({ alter: true });
```

### 4. Start the Application
```bash
# Backend
cd backend
npm start

# Frontend
cd frontend
npm run dev
```

## API Endpoints

### AI Endpoints
- `POST /api/ai/chat` - Send message to AI (public with optional auth)
- `GET /api/ai/examples` - Get example questions (public with optional auth)
- `POST /api/ai/analyze` - Analyze content (requires auth)
- `POST /api/ai/suggest` - Get AI suggestions (requires auth)
- `GET /api/ai/config` - Check AI configuration status

### Report Endpoints
- `POST /api/reports` - Create a report (requires auth)
- `GET /api/reports` - Get all reports (admin only)
- `GET /api/reports/stats` - Get report statistics (admin only)
- `GET /api/reports/:id` - Get report details (admin only)
- `PATCH /api/reports/:id/status` - Update report status (admin only)
- `GET /api/reports/:id/ai-summary` - Get AI summary of report (admin only)

## Components

### Reusable Components
- `ChatInterface` - AI chat component (can be embedded anywhere)
- `ReportForm` - Report submission form
- `ReportButton` - Quick report button for content pages
- `AIInsightsWidget` - Course insights for instructors
- `AIContentSuggestions` - Content generation helper
- `AdminAIInsights` - Platform insights for admins
- `AIContentModeration` - Content moderation tool

## Navigation
- Help link added to:
  - Public header (desktop and mobile)
  - Student dashboard sidebar
  - Instructor dashboard sidebar
  - Admin dashboard sidebar

## Usage Examples

### Adding Report Button to a Course Page
```jsx
import ReportButton from "@/components/ReportButton";

<ReportButton 
  contentId={courseId} 
  contentType="course" 
/>
```

### Using AI Chat in Custom Page
```jsx
import ChatInterface from "@/components/ChatInterface";

<ChatInterface 
  userRole={user?.role || "guest"}
  contextType="custom-page"
  contextData={{ pageInfo: "..." }}
/>
```

### Adding AI Insights to Instructor Dashboard
```jsx
import AIInsightsWidget from "@/components/AIInsightsWidget";

<AIInsightsWidget 
  courseId={courseId}
  courseData={{
    title: course.title,
    enrollmentCount: 150,
    completionRate: 75,
    averageRating: 4.5
  }}
/>
```

## Testing the Implementation

### 1. Test Help Page
- Visit `/help` (works without login)
- Try asking questions
- Login and see role-specific examples

### 2. Test Report System
- Login as any user
- Submit a report (general or content-specific)
- Login as admin
- Visit `/dashboard/admin/reports`
- View reports, filter, search
- Click on a report to see details and AI analysis
- Update report status

### 3. Test AI Features
- As instructor: Check course insights
- As admin: View platform insights
- Try content suggestions

## Important Notes

1. **API Key Required**: The AI features will not work without a valid GEMINI_API_KEY
2. **Error Handling**: The system gracefully handles missing API key and shows appropriate messages
3. **Rate Limiting**: Consider implementing rate limiting for AI endpoints in production
4. **Cost Management**: Monitor Gemini API usage to manage costs
5. **Database**: Ensure the reports table is created before using the report system

## Troubleshooting

### AI Not Working
- Check if GEMINI_API_KEY is set in backend/.env
- Visit `/api/ai/config` to check configuration status
- Check backend console for error messages

### Reports Not Saving
- Ensure reports table exists in database
- Check foreign key constraints (users table must exist)
- Verify user is authenticated when submitting

### Navigation Links Not Showing
- Clear browser cache
- Check user role in localStorage
- Verify sidebar component is rendering

## Next Steps (Optional Enhancements)
- Add conversation history persistence
- Implement AI response caching
- Add more AI-powered features (quiz generation, content recommendations)
- Enhance report analytics dashboard
- Add email notifications for critical reports
