# Design Document

## Overview

This design document outlines the integration of real backend data into the instructor dashboard pages. The solution replaces mock data with actual API calls to the analytics and chat services, implements real-time messaging using socket connections, and enhances the sidebar navigation with active link highlighting. The design follows React best practices with custom hooks for data fetching, proper error handling, and optimistic UI updates.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Dashboard   │  │   Earnings   │  │    Chats     │      │
│  │     Page     │  │     Page     │  │     Page     │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                  │                  │              │
│  ┌──────▼──────────────────▼──────────────────▼───────┐    │
│  │           API Call Layer (lib/apiCalls)             │    │
│  └──────┬──────────────────┬──────────────────┬────────┘    │
└─────────┼──────────────────┼──────────────────┼─────────────┘
          │                  │                  │
          │ HTTP             │ HTTP             │ WebSocket
          │                  │                  │
┌─────────▼──────────────────▼──────────────────▼─────────────┐
│                    Backend (Express.js)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Analytics   │  │   Payment    │  │     Chat     │      │
│  │  Controller  │  │  Controller  │  │  Controller  │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                  │                  │              │
│  ┌──────▼──────────────────▼──────────────────▼───────┐    │
│  │              Service Layer                          │    │
│  └──────┬──────────────────┬──────────────────┬────────┘    │
│         │                  │                  │              │
│  ┌──────▼──────────────────▼──────────────────▼───────┐    │
│  │              Database (MySQL/Sequelize)             │    │
│  └─────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────┘
```

### Component Structure

```
app/(dashboard)/dashboard/instructor/
├── page.js                    # Main dashboard with overview stats
├── earnings/
│   └── page.js               # Earnings page with revenue analytics
├── chats/
│   └── page.js               # Chats page with messaging
├── pending-reviews/
│   └── page.js               # Pending course reviews
└── analytics/
    └── page.js               # Analytics page with enrollment trends

lib/apiCalls/
├── instructor/
│   ├── getAnalytics.apiCall.js
│   └── getRevenueAnalytics.apiCall.js
├── chat/
│   ├── getUserChatRooms.apiCall.js
│   └── getRoomMessages.apiCall.js
└── courses/
    └── getPendingCourses.apiCall.js

components/
├── app-sidebar.jsx           # Enhanced with active link logic
└── charts/
    ├── RevenueChart.jsx      # Revenue trend visualization
    └── EnrollmentChart.jsx   # Enrollment trend visualization
```

## Components and Interfaces

### API Call Functions

**Note: All data comes from existing database tables. NO new tables are required.**

#### Analytics API Calls

```javascript
// lib/apiCalls/instructor/getInstructorAnalytics.apiCall.js
// Uses existing endpoint: GET /api/instructor/analytics?days={days}
export const getInstructorAnalytics = async (days = 30) => {
  // Returns comprehensive analytics including:
  // - overview: { totalEnrollments, activeStudents, completionRate, averageRating, totalRevenue }
  // - courses: Array of course performance data
  // - enrollmentTrend: Array of enrollment data over time
  // - engagement: Chat participation and session duration
}

// lib/apiCalls/analytics/getRevenueAnalytics.apiCall.js
// Uses existing endpoint: GET /api/instructor/analytics/revenue?startDate={}&endDate={}
export const getRevenueAnalytics = async (startDate, endDate) => {
  // Returns: { total_revenue, revenue_by_course, revenue_by_month, refund_rate, average_transaction_value }
  // Data comes from Payment table
}

// lib/apiCalls/analytics/getEnrollmentTrend.apiCall.js
// NEW endpoint needed: GET /api/instructor/analytics/enrollments?days={days}&groupBy={day|week|month}
export const getEnrollmentTrend = async (days, groupBy = 'day') => {
  // Returns: { enrollments: [{ date, count }] }
  // Data comes from Enrollment table
}
```

#### Chat API Calls

```javascript
// lib/apiCalls/chat/getUserChatRooms.apiCall.js
export const getUserChatRooms = async () => {
  // Returns: Array of chat rooms with lastMessage and unreadCount
}

// lib/apiCalls/chat/getRoomMessages.apiCall.js
export const getRoomMessages = async (roomId, limit, offset) => {
  // Returns: Array of messages with sender information
}

// lib/apiCalls/chat/sendMessage.apiCall.js
export const sendMessage = async (roomId, message) => {
  // Returns: Created message object
}
```

#### Course API Calls

```javascript
// lib/apiCalls/courses/getPendingCourses.apiCall.js
// Uses existing endpoint: GET /api/instructor/all-courses
// Then filters on frontend for status 'pending' or 'under_review'
export const getPendingCourses = async () => {
  // Returns: Array of courses with status 'pending' or 'under_review'
  // Data comes from Course table
}
```

### Backend Endpoints to Add

Only **3 new endpoints** need to be added to `backend/routes/instructor.routes.js`:

1. **GET /api/instructor/analytics/revenue** - Revenue-specific analytics
   - Controller: `analyticsController.getRevenueAnalytics` (already exists in analytics.controller.js)
   - Service: `analyticsService.getRevenueAnalytics` (already exists in analytics.service.js)
   - Just needs to be wired up in instructor routes

2. **GET /api/instructor/analytics/enrollments** - Enrollment trend with flexible grouping
   - Controller: New method needed in analytics.controller.js
   - Service: Modify existing `getEnrollmentTrend` in instructor.service.js to support groupBy parameter
   - Data source: Enrollment table (existing)

3. **POST /api/instructor/analytics/report** - Generate comprehensive analytics report
   - Controller: New method in analytics.controller.js
   - Service: New service method to compile and format report data
   - Returns: Report data in JSON format (frontend handles PDF/CSV generation)
   - Data source: All existing tables

All other data is available through existing endp

### React Components

#### Dashboard Main Page

```javascript
// State management
const [stats, setStats] = useState(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

// Data fetching
useEffect(() => {
  fetchDashboardStats();
}, []);

// Display: Stats cards, recent courses, quick actions
```

#### Earnings Page

```javascript
// State management
const [earnings, setEarnings] = useState(null);
const [timeRange, setTimeRange] = useState('30');
const [loading, setLoading] = useState(true);

// Data fetching with time range dependency
useEffect(() => {
  fetchEarnings(timeRange);
}, [timeRange]);

// Display: Summary cards, revenue chart, enrollment chart, course table, transactions
```

#### Chats Page

```javascript
// State management
const [chatRooms, setChatRooms] = useState([]);
const [selectedRoom, setSelectedRoom] = useState(null);
const [messages, setMessages] = useState([]);
const [socket, setSocket] = useState(null);

// Socket connection
useEffect(() => {
  const socketConnection = initializeSocket();
  setSocket(socketConnection);
  return () => socketConnection.disconnect();
}, []);

// Real-time message handling
useEffect(() => {
  if (socket && selectedRoom) {
    socket.on('new_message', handleNewMessage);
  }
}, [socket, selectedRoom]);

// Display: Chat room list, message thread, input field
```

#### Pending Reviews Page

```javascript
// State management
const [pendingCourses, setPendingCourses] = useState([]);
const [loading, setLoading] = useState(true);

// Data fetching
useEffect(() => {
  fetchPendingCourses();
}, []);

// Display: Course cards with status, submission date, actions
```

### Sidebar Component Enhancement

```javascript
// app-sidebar.jsx
const Sidebar = () => {
  const pathname = usePathname();
  
  const isActive = (path) => {
    return pathname === path || pathname.startsWith(path + '/');
  };
  
  // Apply active styles based on pathname
  const getLinkClassName = (path) => {
    return isActive(path) 
      ? 'bg-blue-100 text-blue-700 font-semibold'
      : 'text-gray-700 hover:bg-gray-100';
  };
};
```

## Data Models

### Dashboard Stats Model

```typescript
interface DashboardStats {
  total_students: number;
  total_earnings: string;  // Formatted currency
  course_count: number;
  average_rating: string | null;
  recent_enrollments: number;
}
```

### Revenue Analytics Model

```typescript
interface RevenueAnalytics {
  total_revenue: string;
  revenue_by_course: Array<{
    course_id: string;
    course_title: string;
    revenue: string;
    sales: number;
  }>;
  revenue_by_month: Array<{
    month: string;  // Format: YYYY-MM
    revenue: string;
    sales: number;
  }>;
  refund_rate: number;
  average_transaction_value: string;
}
```

### Enrollment Trend Model

```typescript
interface EnrollmentTrend {
  enrollments_by_day: Array<{
    date: string;  // ISO date string
    count: number;
  }>;
}
```

### Chat Room Model

```typescript
interface ChatRoom {
  id: string;
  type: 'group' | 'private';
  name: string;
  course_id: string | null;
  Course: {
    id: string;
    title: string;
    thumbnail_url: string;
  } | null;
  ChatParticipants: Array<{
    user_id: string;
    User: {
      id: string;
      first_name: string;
      last_name: string;
      email: string;
    };
  }>;
  lastMessage: {
    message: string;
    created_at: string;
    User: {
      first_name: string;
      last_name: string;
    };
  } | null;
  unreadCount: number;
}
```

### Chat Message Model

```typescript
interface ChatMessage {
  id: string;
  room_id: string;
  sender_id: string;
  message: string;
  created_at: string;
  User: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    role: string;
  };
}
```

### Pending Course Model

```typescript
interface PendingCourse {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string;
  status: 'pending' | 'under_review' | 'approved' | 'rejected';
  submitted_at: string;
  reviewed_at: string | null;
  review_notes: string | null;
}
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Currency formatting consistency

*For any* numeric value representing currency, the formatting function should return a string with the USD currency symbol, exactly two decimal places, and proper thousand separators.
**Validates: Requirements 1.2**

### Property 2: Course revenue display completeness

*For any* course in the revenue by course table, the displayed data should include all required fields: enrollment count, average price, refund count, and total revenue.
**Validates: Requirements 2.3**

### Property 3: Transaction display completeness

*For any* transaction in the recent transactions list, the displayed data should include all required fields: date, student name, amount, and status.
**Validates: Requirements 2.4**

### Property 4: Chat type visual distinction

*For any* pair of group and private chat rooms, they should have distinct visual indicators (icons, labels, or styling) that differentiate them.
**Validates: Requirements 3.2**

### Property 5: Unread count display

*For any* chat room with unread messages, the UI should display a badge showing the unread count greater than zero.
**Validates: Requirements 3.3**

### Property 6: Chat room preview completeness

*For any* chat room with at least one message, the displayed preview should include both the last message text and a timestamp.
**Validates: Requirements 3.4**

### Property 7: Message chronological ordering

*For any* set of messages in a chat room, when displayed, they should be ordered by their created_at timestamp in ascending order (oldest first).
**Validates: Requirements 3.5**

### Property 8: Group chat course information

*For any* group chat room, the displayed information should include the associated course title and thumbnail.
**Validates: Requirements 3.7**

### Property 9: Private chat student information

*For any* private chat room, the displayed information should include the student's full name and profile details.
**Validates: Requirements 3.8**

### Property 10: Pending course display completeness

*For any* pending course, the displayed information should include all required fields: title, submission date, current status, and review progress indicator.
**Validates: Requirements 4.2**

### Property 11: Pending course field completeness

*For any* course in the pending reviews list, the displayed details should include thumbnail, description, and submission metadata.
**Validates: Requirements 4.5**

### Property 12: Active link highlighting

*For any* page pathname in the instructor dashboard, exactly one sidebar link should be highlighted as active, and it should correspond to the current page or its parent route.
**Validates: Requirements 5.1**

### Property 13: Active link styling

*For any* active sidebar link, it should have distinct CSS classes applied including background color and font weight that differ from inactive links.
**Validates: Requirements 5.2**

### Property 14: Nested route parent highlighting

*For any* nested route pathname (e.g., /dashboard/instructor/courses/123/edit), the parent navigation item (/dashboard/instructor/courses) should be highlighted as active.
**Validates: Requirements 5.4**

### Property 15: API error message display

*For any* failed API request, the UI should display a user-friendly error message that does not expose technical implementation details.
**Validates: Requirements 6.1**

### Property 16: Loading state indicators

*For any* component fetching data, a loading indicator (spinner or skeleton) should be visible until the data is successfully loaded or an error occurs.
**Validates: Requirements 6.4**

### Property 17: Error logging completeness

*For any* error that occurs during API calls or data processing, detailed error information should be logged to the console including error message, stack trace, and context.
**Validates: Requirements 6.5**

### Property 18: Unread count increment

*For any* new message received in an inactive chat room, the unread count badge should increment by exactly one.
**Validates: Requirements 7.5**

### Property 19: Enrollment data aggregation

*For any* set of enrollment records and selected time range (day/week/month), the aggregated data should group enrollments correctly by the time period with accurate counts.
**Validates: Requirements 8.2**

### Property 20: Report section completeness

*For any* generated analytics report, it should include all required sections: overview statistics, course performance, revenue data, enrollment trends, quiz analytics, and engagement metrics.
**Validates: Requirements 9.2**

### Property 21: PDF report element completeness

*For any* PDF report generated, it should contain all charts, graphs, and formatted tables with proper styling applied.
**Validates: Requirements 9.4**

### Property 22: CSV archive structure

*For any* CSV report generated, the ZIP archive should contain separate CSV files for each data category (overview, courses, revenue, enrollments, engagement).
**Validates: Requirements 9.5**

### Property 23: Report date filtering

*For any* date range selected, all data in the generated report should fall within the specified start and end dates.
**Validates: Requirements 9.6**

### Property 24: Report course filtering

*For any* set of selected courses, the generated report should include data only for those courses and exclude all others.
**Validates: Requirements 9.7**

### Property 25: Revenue report detail completeness

*For any* report containing revenue data, it should include detailed transaction breakdowns showing individual payments, refunds, and summary totals.
**Validates: Requirements 9.9**

### Property 26: Student data anonymization

*For any* report containing student information, all personally identifiable information (names, emails, contact details) should be replaced with anonymized identifiers.
**Validates: Requirements 9.10**

## Error Handling

### API Error Handling Strategy

1. **Network Errors**: Display "Unable to connect to server. Please check your internet connection." with retry button
2. **Authentication Errors (401)**: Redirect to login page and clear stored tokens
3. **Authorization Errors (403)**: Display "You don't have permission to access this resource."
4. **Not Found Errors (404)**: Display "The requested resource was not found."
5. **Server Errors (500)**: Display "Something went wrong on our end. Please try again later."
6. **Validation Errors (400)**: Display specific validation messages from the API response

### Error Handling Implementation

```javascript
const handleApiError = (error) => {
  console.error('API Error:', error);
  
  if (error.response) {
    switch (error.response.status) {
      case 401:
        // Clear auth and redirect
        localStorage.removeItem('token');
        router.push('/login');
        break;
      case 403:
        setError('You don\'t have permission to access this resource.');
        break;
      case 404:
        setError('The requested resource was not found.');
        break;
      case 500:
        setError('Something went wrong on our end. Please try again later.');
        break;
      default:
        setError(error.response.data.message || 'An error occurred.');
    }
  } else if (error.request) {
    setError('Unable to connect to server. Please check your internet connection.');
  } else {
    setError('An unexpected error occurred.');
  }
};
```

### Loading States

Each page should implement loading states using:
- Skeleton loaders for content areas
- Spinner for button actions
- Disabled state for interactive elements during loading

### Retry Logic

For network errors, implement exponential backoff retry:
```javascript
const fetchWithRetry = async (fetchFn, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fetchFn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
    }
  }
};
```

## Testing Strategy

### Unit Testing

Unit tests will verify individual functions and components:

1. **Formatting Functions**
   - Test currency formatting with various numeric inputs
   - Test date formatting with different date strings
   - Test percentage calculations

2. **Component Rendering**
   - Test that components render with provided props
   - Test conditional rendering based on state
   - Test empty states and error states

3. **Utility Functions**
   - Test active link detection logic
   - Test data transformation functions
   - Test validation functions

### Property-Based Testing

Property-based tests will use **fast-check** library for JavaScript to verify universal properties:

1. **Data Display Properties**
   - Generate random course data and verify all required fields are displayed
   - Generate random transaction data and verify completeness
   - Generate random chat rooms and verify type-specific information

2. **Formatting Properties**
   - Generate random numbers and verify currency formatting
   - Generate random dates and verify date formatting
   - Generate random percentages and verify calculation accuracy

3. **Ordering Properties**
   - Generate random message sets and verify chronological ordering
   - Generate random enrollment data and verify aggregation correctness

4. **UI State Properties**
   - Generate random pathnames and verify active link highlighting
   - Generate random error scenarios and verify error message display
   - Generate random loading states and verify indicator display

### Integration Testing

Integration tests will verify end-to-end flows:

1. **Dashboard Page Flow**
   - Load dashboard → Verify API call → Verify data display
   - Simulate API error → Verify error handling

2. **Earnings Page Flow**
   - Load earnings page → Verify data fetch → Verify charts render
   - Change time range → Verify refetch → Verify updated display

3. **Chats Page Flow**
   - Load chats page → Verify rooms fetch → Select room → Verify messages load
   - Send message → Verify optimistic update → Verify server confirmation

4. **Pending Reviews Flow**
   - Load pending reviews → Verify courses fetch → Verify display

### Socket Testing

Socket functionality will be tested using mock socket connections:

1. **Connection Testing**
   - Test socket initialization
   - Test room joining
   - Test reconnection logic

2. **Message Testing**
   - Test receiving messages
   - Test sending messages
   - Test unread count updates

### Test Configuration

```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  collectCoverageFrom: [
    'app/**/*.{js,jsx}',
    'lib/**/*.{js,jsx}',
    'components/**/*.{js,jsx}',
    '!**/*.test.{js,jsx}',
    '!**/node_modules/**',
  ],
};
```

Each property-based test will run a minimum of 100 iterations to ensure thorough coverage of the input space.

## Implementation Notes

### Socket.IO Integration

The chat functionality will use the existing socket connection from `hooks/useSocket.js`:

```javascript
const socket = useSocket();

useEffect(() => {
  if (socket && selectedRoom) {
    socket.emit('join_room', selectedRoom.id);
    
    socket.on('new_message', (message) => {
      setMessages(prev => [...prev, message]);
    });
    
    return () => {
      socket.emit('leave_room', selectedRoom.id);
      socket.off('new_message');
    };
  }
}, [socket, selectedRoom]);
```

### Data Caching Strategy

To improve performance and reduce API calls:

1. Cache dashboard stats for 5 minutes
2. Cache earnings data for 10 minutes
3. Invalidate cache on user actions (e.g., creating a course)
4. Use React Query or SWR for automatic cache management

### Responsive Design

All pages should be responsive:
- Mobile: Single column layout, collapsible sidebar
- Tablet: Two column layout where appropriate
- Desktop: Full multi-column layout with expanded sidebar

### Accessibility

Ensure WCAG 2.1 AA compliance:
- Proper ARIA labels for interactive elements
- Keyboard navigation support
- Screen reader announcements for dynamic content
- Sufficient color contrast ratios
- Focus indicators for all interactive elements

## Analytics Report Generation

### Report Structure

The comprehensive analytics report will include the following sections:

1. **Executive Summary**
   - Total students across all courses
   - Total revenue generated
   - Average course rating
   - Overall completion rate
   - Date range of the report

2. **Course Performance**
   - Individual course statistics
   - Enrollment numbers per course
   - Revenue per course
   - Completion rates
   - Student ratings

3. **Revenue Analysis**
   - Total revenue breakdown
   - Revenue by course
   - Revenue trends over time
   - Average transaction value
   - Refund rate and analysis

4. **Student Engagement**
   - Active students count
   - Chat participation rates
   - Average session duration
   - Quiz performance metrics
   - Lesson completion rates

5. **Enrollment Trends**
   - Enrollment growth over time
   - Peak enrollment periods
   - Course popularity trends

### Report Generation Libraries

**PDF Generation:**
- Use `jsPDF` with `jspdf-autotable` for tables
- Use `html2canvas` for capturing charts as images
- Include instructor branding and logo

**CSV Generation:**
- Use `papaparse` for CSV formatting
- Create separate CSV files for each data category
- Use `JSZip` to bundle multiple CSVs

**Chart Rendering:**
- Use `recharts` or `chart.js` for visualizations
- Export charts as PNG images for PDF inclusion

### Report API Interface

```javascript
// lib/apiCalls/analytics/generateReport.apiCall.js
export const generateReport = async (options) => {
  // POST /api/instructor/analytics/report
  // Body: {
  //   startDate: string,
  //   endDate: string,
  //   courseIds: string[] | null,  // null for all courses
  //   includeCharts: boolean,
  //   anonymizeStudents: boolean
  // }
  // Returns: {
  //   overview: {...},
  //   courses: [...],
  //   revenue: {...},
  //   engagement: {...},
  //   enrollmentTrend: [...]
  // }
}
```

### Report UI Component

```javascript
// components/analytics/ReportGenerator.jsx
const ReportGenerator = () => {
  const [dateRange, setDateRange] = useState({ start: null, end: null });
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [format, setFormat] = useState('pdf'); // 'pdf' or 'csv'
  const [generating, setGenerating] = useState(false);
  
  const handleGenerate = async () => {
    setGenerating(true);
    const reportData = await generateReport({
      startDate: dateRange.start,
      endDate: dateRange.end,
      courseIds: selectedCourses.length > 0 ? selectedCourses : null,
      includeCharts: format === 'pdf',
      anonymizeStudents: true
    });
    
    if (format === 'pdf') {
      await generatePDF(reportData);
    } else {
      await generateCSV(reportData);
    }
    setGenerating(false);
  };
  
  return (
    // UI for date range picker, course selector, format selector, and generate button
  );
};
```

### Privacy Considerations

When generating reports with student data:
- Replace student names with anonymized IDs (e.g., "Student #1234")
- Remove email addresses and contact information
- Aggregate data where possible to prevent identification
- Include a privacy notice in the report footer
