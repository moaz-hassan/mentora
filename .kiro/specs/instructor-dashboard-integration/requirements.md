# Requirements Document

## Introduction

This specification defines the integration of real backend data into the instructor dashboard pages, replacing mock data with actual API calls. The system will provide instructors with accurate, real-time information about their courses, earnings, student interactions, and pending reviews. Additionally, the sidebar navigation will be enhanced to highlight the active page.

## Glossary

- **Instructor Dashboard**: The web interface where instructors manage their courses and view analytics
- **Analytics Service**: Backend service providing statistical data about courses and revenue
- **Chat Service**: Backend service managing both group (community) and private chat functionality
- **Earnings Data**: Financial information including revenue, payouts, and transactions
- **Pending Reviews**: Courses submitted by instructors awaiting admin approval
- **Active Link**: The currently selected navigation item in the sidebar
- **Community Chat**: Group chat room associated with a specific course
- **Private Chat**: One-on-one conversation between instructor and student
- **Enrollment Trend**: Time-series data showing student enrollments over time

## Requirements

### Requirement 1

**User Story:** As an instructor, I want to see real-time dashboard statistics on my main page, so that I can quickly understand my teaching performance.

#### Acceptance Criteria

1. WHEN an instructor visits the dashboard main page THEN the system SHALL fetch and display total students, total earnings, course count, and average rating from the analytics API
2. WHEN the analytics API returns data THEN the system SHALL format numerical values appropriately with currency symbols and decimal precision
3. WHEN the API request fails THEN the system SHALL display an error message and maintain the loading state gracefully
4. WHEN the dashboard loads THEN the system SHALL show a loading indicator until all data is fetched
5. WHEN recent enrollments data is available THEN the system SHALL display the count of enrollments from the last 30 days

### Requirement 2

**User Story:** As an instructor, I want to view detailed earnings information with real transaction data, so that I can track my revenue accurately.

#### Acceptance Criteria

1. WHEN an instructor visits the earnings page THEN the system SHALL fetch revenue analytics from the backend API
2. WHEN displaying revenue trends THEN the system SHALL render a chart showing monthly revenue data with percentage changes
3. WHEN showing revenue by course THEN the system SHALL display enrollment counts, average prices, refund counts, and total revenue per course
4. WHEN displaying transactions THEN the system SHALL show recent payment records with dates, student names, amounts, and status
5. WHEN the time range filter changes THEN the system SHALL refetch earnings data with the new date parameters
6. WHEN displaying the enrollment trend chart THEN the system SHALL render a line chart showing enrollment counts over time periods

### Requirement 3

**User Story:** As an instructor, I want to access both community and private chats with real message data, so that I can communicate effectively with my students.

#### Acceptance Criteria

1. WHEN an instructor visits the chats page THEN the system SHALL fetch all chat rooms where the instructor is a participant
2. WHEN displaying chat rooms THEN the system SHALL show both group chats and private chats with distinct visual indicators
3. WHEN a chat room has unread messages THEN the system SHALL display an unread count badge
4. WHEN displaying a chat room THEN the system SHALL show the last message preview and timestamp
5. WHEN an instructor selects a chat room THEN the system SHALL load and display all messages in chronological order
6. WHEN a new message is sent THEN the system SHALL update the chat interface in real-time using socket connections
7. WHEN displaying group chats THEN the system SHALL show the associated course information
8. WHEN displaying private chats THEN the system SHALL show the student's name and profile information

### Requirement 4

**User Story:** As an instructor, I want to see courses pending admin review with real status data, so that I can track my course submission progress.

#### Acceptance Criteria

1. WHEN an instructor visits the pending reviews page THEN the system SHALL fetch courses with pending approval status
2. WHEN displaying pending courses THEN the system SHALL show course title, submission date, current status, and review progress
3. WHEN a course status changes THEN the system SHALL reflect the updated status without requiring page refresh
4. WHEN no courses are pending THEN the system SHALL display an appropriate empty state message
5. WHEN displaying course details THEN the system SHALL show thumbnail, description, and submission metadata

### Requirement 5

**User Story:** As an instructor, I want the sidebar navigation to highlight my current page, so that I can easily understand where I am in the dashboard.

#### Acceptance Criteria

1. WHEN an instructor navigates to any dashboard page THEN the system SHALL highlight the corresponding sidebar link
2. WHEN the active link is highlighted THEN the system SHALL apply distinct visual styling including background color and font weight
3. WHEN the page URL changes THEN the system SHALL update the active link indicator accordingly
4. WHEN nested routes are accessed THEN the system SHALL highlight the parent navigation item appropriately
5. WHEN the sidebar renders THEN the system SHALL determine the active link based on the current pathname

### Requirement 6

**User Story:** As an instructor, I want error handling for all API requests, so that I receive clear feedback when data cannot be loaded.

#### Acceptance Criteria

1. WHEN any API request fails THEN the system SHALL display a user-friendly error message
2. WHEN a network error occurs THEN the system SHALL provide retry functionality
3. WHEN authentication fails THEN the system SHALL redirect to the login page
4. WHEN data is loading THEN the system SHALL show appropriate loading skeletons or spinners
5. WHEN an error is displayed THEN the system SHALL log detailed error information to the console for debugging

### Requirement 7

**User Story:** As an instructor, I want real-time updates for chat messages, so that I can have seamless conversations with students.

#### Acceptance Criteria

1. WHEN a new message arrives in a chat room THEN the system SHALL display it immediately without page refresh
2. WHEN the instructor sends a message THEN the system SHALL show optimistic UI updates before server confirmation
3. WHEN socket connection is established THEN the system SHALL join all relevant chat rooms automatically
4. WHEN socket connection is lost THEN the system SHALL attempt to reconnect and notify the user
5. WHEN receiving a message in an inactive chat THEN the system SHALL increment the unread count badge

### Requirement 8

**User Story:** As an instructor, I want to see enrollment trends over time on the analytics page, so that I can understand student acquisition patterns.

#### Acceptance Criteria

1. WHEN an instructor views the analytics page THEN the system SHALL display a line chart showing enrollments over time
2. WHEN displaying enrollment data THEN the system SHALL aggregate enrollments by day, week, or month based on the selected time range
3. WHEN hovering over data points THEN the system SHALL show detailed enrollment counts for that period
4. WHEN the time range changes THEN the system SHALL update the enrollment trend chart accordingly
5. WHEN no enrollment data exists THEN the system SHALL display an empty state with helpful messaging


### Requirement 9

**User Story:** As an instructor, I want to generate and download a comprehensive analytics report, so that I can analyze my teaching performance offline and share insights with stakeholders.

#### Acceptance Criteria

1. WHEN an instructor clicks the "Generate Report" button THEN the system SHALL compile all analytics data into a downloadable format
2. WHEN generating a report THEN the system SHALL include overview statistics, course performance, revenue data, enrollment trends, quiz analytics, and engagement metrics
3. WHEN the report is ready THEN the system SHALL offer download options in PDF and CSV formats
4. WHEN downloading as PDF THEN the system SHALL include charts, graphs, and formatted tables with proper styling
5. WHEN downloading as CSV THEN the system SHALL provide separate CSV files for each data category in a ZIP archive
6. WHEN selecting a date range THEN the system SHALL filter all report data to the specified time period
7. WHEN selecting specific courses THEN the system SHALL generate a report for only the selected courses
8. WHEN the report generation is in progress THEN the system SHALL display a progress indicator
9. WHEN the report includes revenue data THEN the system SHALL show detailed transaction breakdowns and payment summaries
10. WHEN the report includes student data THEN the system SHALL anonymize personally identifiable information for privacy compliance
