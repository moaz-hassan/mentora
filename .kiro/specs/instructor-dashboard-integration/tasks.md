# Implementation Plan

- [x] 1. Set up backend analytics endpoints


  - Add new routes to instructor.routes.js for analytics data
  - Wire up existing analytics controller methods
  - Create new enrollment trend endpoint with groupBy parameter
  - Create report generation endpoint
  - _Requirements: 1.1, 2.1, 8.1, 9.1_

- [x] 1.1 Add revenue analytics route


  - Add GET /api/instructor/analytics/revenue route in instructor.routes.js
  - Connect to existing analyticsController.getRevenueAnalytics
  - Add authentication and authorization middleware
  - _Requirements: 2.1_

- [x] 1.2 Create enrollment trend endpoint


  - Add GET /api/instructor/analytics/enrollments route
  - Create getEnrollmentTrend controller method in analytics.controller.js
  - Modify getEnrollmentTrend service to accept groupBy parameter (day/week/month)
  - Query Enrollment table and aggregate by time period
  - _Requirements: 8.1, 8.2_

- [x] 1.3 Create report generation endpoint


  - Add POST /api/instructor/analytics/report route
  - Create generateReport controller method in analytics.controller.js
  - Create generateComprehensiveReport service method
  - Compile data from all analytics services
  - Implement student data anonymization logic
  - _Requirements: 9.1, 9.2, 9.10_



- [x] 2. Create API call functions for frontend




  - Create API call wrappers for all analytics endpoints
  - Implement error handling and retry logic
  - Add TypeScript types/JSDoc for API responses
  - _Requirements: 1.1, 2.1, 3.1, 4.1, 6.1_

- [x] 2.1 Create instructor analytics API calls


  - Create lib/apiCalls/instructor/getInstructorAnalytics.apiCall.js
  - Implement getInstructorAnalytics function calling /api/instructor/analytics
  - Add error handling with user-friendly messages
  - _Requirements: 1.1, 6.1_

- [x] 2.2 Create revenue analytics API calls

  - Create lib/apiCalls/analytics/getRevenueAnalytics.apiCall.js
  - Implement getRevenueAnalytics function with date range parameters
  - _Requirements: 2.1_

- [x] 2.3 Create enrollment trend API calls


  - Create lib/apiCalls/analytics/getEnrollmentTrend.apiCall.js
  - Implement getEnrollmentTrend function with days and groupBy parameters
  - _Requirements: 8.1_

- [x] 2.4 Create chat API calls


  - Create lib/apiCalls/chat/getUserChatRooms.apiCall.js
  - Create lib/apiCalls/chat/getRoomMessages.apiCall.js
  - Create lib/apiCalls/chat/sendMessage.apiCall.js
  - _Requirements: 3.1_

- [x] 2.5 Create report generation API call


  - Create lib/apiCalls/analytics/generateReport.apiCall.js
  - Implement generateReport function with filtering options
  - _Requirements: 9.1_



- [x] 3. Implement dashboard main page with real data





  - Replace mock data with API calls to analytics endpoint
  - Implement loading states with skeletons
  - Add error handling and retry functionality
  - Display all overview statistics
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x] 3.1 Fetch and display dashboard statistics




  - Call getInstructorAnalytics API on page load
  - Extract overview data from response
  - Update state with fetched data
  - _Requirements: 1.1_



- [x] 3.2 Implement currency and number formatting

  - Create formatCurrency utility function
  - Create formatNumber utility function
  - Apply formatting to all numeric displays
  - _Requirements: 1.2_





- [x] 3.4 Add loading and error states


  - Show loading spinner while fetching data
  - Display error message on API failure
  - Add retry button for failed requests
  - _Requirements: 1.3, 1.4, 6.1, 6.2_



- [x] 4. Implement earnings page with real data and charts




  - Replace mock earnings data with API calls
  - Add revenue trend chart component
  - Add enrollment trend chart component
  - Implement time range filtering
  - Display revenue by course table
  - Display recent transactions
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

- [x] 4.1 Fetch and display earnings data


  - Call getRevenueAnalytics API on page load
  - Update state with revenue data
  - Handle time range changes and refetch
  - _Requirements: 2.1, 2.5_

- [x] 4.2 Create revenue trend chart component

  - Create components/charts/RevenueChart.jsx
  - Use recharts library for line chart
  - Display monthly revenue with percentage changes
  - Add hover tooltips with detailed information
  - _Requirements: 2.2_

- [x] 4.3 Create enrollment trend chart component

  - Create components/charts/EnrollmentChart.jsx
  - Use recharts library for line chart
  - Display enrollment counts over time
  - Support day/week/month grouping based on time range
  - _Requirements: 2.6, 8.1, 8.2_



- [x] 4.5 Display revenue by course table

  - Render table with course revenue data
  - Show all required fields per course
  - _Requirements: 2.3_



- [x] 4.7 Display recent transactions list

  - Render transaction cards with all details
  - Show status badges (completed/refunded)
  - Format dates and amounts
  - _Requirements: 2.4_



- [x] 5. Implement chats page with real-time messaging


  - Fetch user's chat rooms from API
  - Display chat room list with type indicators
  - Implement chat room selection
  - Load and display messages
  - Integrate socket.io for real-time updates
  - Implement message sending
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.7, 3.8, 7.1, 7.2, 7.5_

- [x] 5.1 Fetch and display chat rooms


  - Call getUserChatRooms API on page load
  - Render chat room list with group/private indicators
  - Display unread count badges
  - Show last message preview and timestamp
  - _Requirements: 3.1, 3.2, 3.3, 3.4_




- [x] 5.5 Implement chat room selection and message loading
  - Handle chat room click events
  - Call getRoomMessages API when room is selected
  - Display messages in chronological order
  - _Requirements: 3.5_




- [x] 5.7 Display course information for group chats
  - Show course title and thumbnail for group chats
  - _Requirements: 3.7_




- [x] 5.9 Display student information for private chats
  - Show student name and profile for private chats
  - _Requirements: 3.8_



- [x] 5.11 Integrate socket.io for real-time messaging

  - Use existing useSocket hook
  - Join selected chat room
  - Listen for new_message events
  - Update messages state on new message
  - Handle socket disconnection and reconnection
  - _Requirements: 7.1, 7.4_


- [x] 5.12 Implement message sending
  - Create message input component
  - Call sendMessage API on submit
  - Show optimistic UI update
  - Handle send errors
  - _Requirements: 7.2_


- [x] 5.13 Implement unread count updates
  - Increment unread count when message arrives in inactive chat
  - Reset unread count when chat is selected
  - _Requirements: 7.5_



- [x] 6. Implement pending reviews page




  - Fetch instructor's courses from API
  - Filter for pending/under_review status
  - Display pending course cards
  - Show all required course information
  - Handle empty state
  - _Requirements: 4.1, 4.2, 4.4, 4.5_




- [x] 6.1 Fetch and filter pending courses

  - Call getAllCourses API
  - Filter courses with status 'pending' or 'under_review'
  - Update state with filtered courses

  - _Requirements: 4.1_

- [x] 6.2 Display pending course cards

  - Render course cards with all required fields
  - Show submission date, status, and review progress
  - Display thumbnail, description, and metadata
  - _Requirements: 4.2, 4.5_






- [x] 6.5 Implement empty state

  - Show helpful message when no courses are pending
  - _Requirements: 4.4_

- [x] 7. Enhance sidebar with active link highlighting




  - Use usePathname hook to get current path
  - Implement isActive function for link matching
  - Apply active styles to current page link
  - Handle nested routes with parent highlighting
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_


- [x] 7.1 Implement active link detection logic

  - Create isActive function in app-sidebar.jsx
  - Check if pathname matches link path
  - Handle nested route matching
  - _Requirements: 5.1, 5.4, 5.5_



- [x] 7.3 Apply active link styling

  - Create getLinkClassName function
  - Apply distinct CSS classes for active links
  - Ensure background color and font weight differ from inactive
  - _Requirements: 5.2_



- [x] 8. Implement comprehensive error handling


  - Create centralized error handling utility
  - Implement error message mapping
  - Add retry logic with exponential backoff
  - Log errors to console with context
  - _Requirements: 6.1, 6.2, 6.3, 6.5_

- [x] 8.1 Create error handling utility


  - Create lib/utils/errorHandler.js
  - Implement handleApiError function
  - Map HTTP status codes to user-friendly messages
  - Handle authentication errors with redirect
  - _Requirements: 6.1, 6.3_

- [x] 8.2 Implement retry logic

  - Create fetchWithRetry utility function
  - Implement exponential backoff
  - Add retry button to error states
  - _Requirements: 6.2_

- [x] 8.3 Implement error logging

  - Log all errors to console with stack traces
  - Include request context in logs
  - _Requirements: 6.5_



- [x] 9. Implement analytics report generation


  - Create report generator UI component
  - Implement date range picker
  - Implement course selector
  - Add format selector (PDF/CSV)
  - Implement PDF generation with charts
  - Implement CSV generation with ZIP bundling
  - Add progress indicator
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7, 9.8, 9.9, 9.10_

- [x] 9.1 Install report generation libraries


  - Install jspdf and jspdf-autotable for PDF
  - Install papaparse for CSV formatting
  - Install jszip for bundling CSVs
  - Install html2canvas for chart screenshots
  - _Requirements: 9.4, 9.5_

- [x] 9.2 Create report generator UI component


  - Create components/analytics/ReportGenerator.jsx
  - Add date range picker
  - Add course multi-select dropdown
  - Add format radio buttons (PDF/CSV)
  - Add generate button
  - _Requirements: 9.1, 9.3, 9.6, 9.7_

- [x] 9.3 Implement report data fetching

  - Call generateReport API with selected options
  - Handle loading state during generation
  - Show progress indicator
  - _Requirements: 9.1, 9.8_



- [x] 9.5 Implement PDF generation


  - Create lib/utils/pdfGenerator.js
  - Generate PDF with jsPDF
  - Add executive summary section
  - Add course performance tables
  - Add revenue analysis section
  - Capture charts as images with html2canvas
  - Include charts in PDF
  - Apply styling and formatting
  - _Requirements: 9.4, 9.9_



- [x] 9.8 Implement CSV generation


  - Create lib/utils/csvGenerator.js
  - Generate separate CSV for each data category
  - Use papaparse to format CSVs
  - Bundle CSVs into ZIP with JSZip
  - Trigger download
  - _Requirements: 9.5_



- [x] 9.10 Implement report filtering

  - Filter data by date range before generation
  - Filter data by selected courses
  - _Requirements: 9.6, 9.7_



- [x] 9.13 Implement student data anonymization

  - Create anonymization utility function
  - Replace names with anonymized IDs
  - Remove email addresses
  - Remove contact information
  - _Requirements: 9.10_



- [x] 10. Add report generator to analytics page


  - Add "Generate Report" button to analytics page header
  - Integrate ReportGenerator component
  - Wire up to analytics data
  - _Requirements: 9.1, 9.3_

- [x] 11. Final testing and polish

  - Test all pages with real data
  - Verify all charts render correctly
  - Test error scenarios
  - Test socket reconnection
  - Verify responsive design on mobile/tablet
  - Check accessibility compliance
  - _Requirements: All_

- [x] 11.1 Integration testing

  - Test complete user flows for each page
  - Verify data consistency across pages
  - Test navigation and active link highlighting
  - Test report generation end-to-end

- [x] 11.2 Performance optimization

  - Implement data caching where appropriate
  - Optimize chart rendering
  - Minimize API calls with proper dependencies

- [x] 11.3 Accessibility audit

  - Verify ARIA labels on all interactive elements
  - Test keyboard navigation
  - Check color contrast ratios
  - Test with screen reader
