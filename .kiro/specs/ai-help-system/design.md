# Design Document: AI Help System with Gemini Integration

## Overview

This design document outlines the technical architecture for an AI-powered help system that integrates Google's Gemini AI across the learning platform. The system provides intelligent assistance through a universal help page accessible to all users (authenticated and unauthenticated) and embeds AI capabilities throughout instructor and admin dashboards. Additionally, the system includes a comprehensive reporting feature that allows users to submit reports about content or general platform issues, with AI-powered categorization and prioritization for administrators.

The implementation uses Next.js for the frontend, Node.js/Express for the backend, and the @google/generative-ai SDK for Gemini integration.

## Architecture

### High-Level Architecture

```
┌─────────────────┐
│   Frontend      │
│   (Next.js)     │
│                 │
│  - Help Page    │
│  - Chat UI      │
│  - Dashboard    │
│    Integration  │
│  - Report Forms │
└────────┬────────┘
         │
         │ HTTP/REST
         │
┌────────▼────────┐
│   Backend       │
│  (Node/Express) │
│                 │
│  - AI Service   │
│  - Report API   │
│  - Context      │
│    Provider     │
└────────┬────────┘
         │
         ├──────────────┐
         │              │
┌────────▼────────┐ ┌──▼──────────┐
│  Gemini AI      │ │  MongoDB    │
│  (Google API)   │ │  Database   │
│                 │ │             │
│  - Content Gen  │ │  - Reports  │
│  - Analysis     │ │  - Users    │
│  - Insights     │ │  - Courses  │
└─────────────────┘ └─────────────┘
```

### Component Architecture

1. **Frontend Components**
   - Universal Help Page (dedicated full-page help interface)
   - Floating Chat Widget (accessible from any page via floating icon)
   - Chat Interface Component (reusable across contexts)
   - AI-Enhanced Dashboard Widgets (instructor & admin)
   - Report Submission Forms
   - Report Management Interface (admin)

2. **Backend Services**
   - Gemini AI Service (centralized AI integration)
   - Context Service (role-based context generation)
   - Report Service (CRUD operations for reports)
   - AI Analysis Service (report categorization, insights)

3. **API Endpoints**
   - `/api/ai/chat` - Chat message handling
   - `/api/ai/analyze` - Content analysis
   - `/api/ai/suggest` - AI suggestions
   - `/api/reports` - Report CRUD operations
   - `/api/reports/:id` - Individual report operations
   - `/api/reports/analyze` - AI-powered report analysis

## Components and Interfaces

### Frontend Components

#### 1. Help Page Component (`/app/help/page.js`)

```javascript
// Universal help page accessible to all users
export default function HelpPage() {
  const { user } = useAuth(); // May be null for unauthenticated users
  const userRole = user?.role || 'guest';
  
  return (
    <div>
      <ChatInterface 
        userRole={userRole}
        contextType="help"
      />
      <ExampleQuestions role={userRole} />
    </div>
  );
}
```

#### 2. Floating Chat Widget (`/components/FloatingChatWidget.jsx`)

```javascript
// Floating chat widget accessible from any page (like Hostinger)
export function FloatingChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const { user } = useAuth();
  const userRole = user?.role || 'guest';
  
  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button 
          className="floating-chat-button"
          onClick={() => setIsOpen(true)}
          aria-label="Open AI Help Chat"
        >
          <MessageCircleIcon />
          <span className="badge">AI Help</span>
        </button>
      )}
      
      {/* Chat Window */}
      {isOpen && (
        <div className={`floating-chat-window ${isMinimized ? 'minimized' : ''}`}>
          <div className="chat-header">
            <h3>AI Assistant</h3>
            <div className="chat-controls">
              <button onClick={() => setIsMinimized(!isMinimized)}>
                {isMinimized ? <MaximizeIcon /> : <MinimizeIcon />}
              </button>
              <button onClick={() => setIsOpen(false)}>
                <CloseIcon />
              </button>
            </div>
          </div>
          
          {!isMinimized && (
            <div className="chat-body">
              <ChatInterface 
                userRole={userRole}
                contextType="floating"
                mode="compact"
              />
            </div>
          )}
        </div>
      )}
    </>
  );
}

// Styles for floating widget
const styles = `
.floating-chat-button {
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  cursor: pointer;
  z-index: 1000;
  transition: transform 0.2s;
}

.floating-chat-button:hover {
  transform: scale(1.1);
}

.floating-chat-window {
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 380px;
  height: 600px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.2);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.floating-chat-window.minimized {
  height: 60px;
}

.chat-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chat-body {
  flex: 1;
  overflow: hidden;
}
`;
```

#### 3. Chat Interface Component (`/components/ChatInterface.jsx`)

```javascript
interface ChatInterfaceProps {
  userRole: 'guest' | 'student' | 'instructor' | 'admin';
  contextType: 'help' | 'dashboard' | 'course' | 'analytics' | 'floating';
  contextData?: object;
  mode?: 'full' | 'compact'; // full for help page, compact for floating widget
}

// Reusable chat component with role-aware context
export function ChatInterface({ userRole, contextType, contextData, mode = 'full' }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  
  const sendMessage = async (message) => {
    // Send to backend with context
  };
  
  return (
    <div className={`chat-container ${mode}`}>
      <MessageList messages={messages} mode={mode} />
      <MessageInput 
        value={input}
        onChange={setInput}
        onSubmit={sendMessage}
        loading={loading}
        mode={mode}
      />
    </div>
  );
}
```

#### 4. Root Layout Integration (`/app/layout.js`)

```javascript
// Add floating chat widget to root layout so it's available on all pages
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <FloatingChatWidget /> {/* Available on every page */}
      </body>
    </html>
  );
}
```

#### 5. AI Dashboard Widgets

```javascript
// Instructor Dashboard - Course Insights Widget
export function CourseInsightsWidget({ courseId }) {
  const { insights, loading } = useAIInsights(courseId);
  
  return (
    <div className="ai-widget">
      <h3>AI-Powered Insights</h3>
      {insights && (
        <div>
          <p>{insights.engagement}</p>
          <p>{insights.recommendations}</p>
        </div>
      )}
    </div>
  );
}

// Admin Dashboard - Content Moderation Widget
export function ContentModerationWidget() {
  const { flaggedContent } = useAIModeration();
  
  return (
    <div className="ai-widget">
      <h3>AI-Flagged Content</h3>
      <ContentList items={flaggedContent} />
    </div>
  );
}
```

#### 6. Report Components

```javascript
// Report Submission Form
export function ReportForm({ contentId, contentType }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    contentReference: contentId || null,
    contentType: contentType || 'general'
  });
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Submit report to backend
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input 
        type="text" 
        placeholder="Report Title"
        value={formData.title}
        onChange={(e) => setFormData({...formData, title: e.target.value})}
        required
      />
      <textarea 
        placeholder="Describe the issue..."
        value={formData.description}
        onChange={(e) => setFormData({...formData, description: e.target.value})}
        required
      />
      <button type="submit">Submit Report</button>
    </form>
  );
}

// Admin Report Management Interface
export function ReportManagement() {
  const [reports, setReports] = useState([]);
  const [filters, setFilters] = useState({
    status: 'all',
    type: 'all',
    dateRange: 'all'
  });
  
  return (
    <div className="report-management">
      <ReportFilters filters={filters} onChange={setFilters} />
      <ReportTable reports={reports} />
    </div>
  );
}
```

### Backend Services

#### 1. Gemini AI Service (`/services/gemini.service.js`)

```javascript
const { GoogleGenerativeAI } = require('@google/generative-ai');

class GeminiService {
  constructor() {
    this.ai = new GoogleGenerativeAI({
      apiKey: process.env.GEMINI_API_KEY
    });
    this.model = 'gemini-2.0-flash-exp';
  }
  
  async generateResponse(prompt, context) {
    try {
      const enhancedPrompt = this.buildPromptWithContext(prompt, context);
      
      const response = await this.ai.models.generateContent({
        model: this.model,
        contents: enhancedPrompt
      });
      
      return response.text;
    } catch (error) {
      throw new Error(`Gemini API Error: ${error.message}`);
    }
  }
  
  buildPromptWithContext(userMessage, context) {
    const { role, page, data } = context;
    
    let systemContext = '';
    
    switch(role) {
      case 'student':
        systemContext = 'You are helping a student navigate an online learning platform.';
        break;
      case 'instructor':
        systemContext = 'You are assisting an instructor with course creation and management.';
        break;
      case 'admin':
        systemContext = 'You are helping an administrator manage the learning platform.';
        break;
      default:
        systemContext = 'You are helping a visitor learn about the platform.';
    }
    
    return `${systemContext}\n\nUser Question: ${userMessage}`;
  }
  
  async analyzeContent(content, analysisType) {
    const prompts = {
      moderation: `Analyze this content for inappropriate material: ${content}`,
      summary: `Provide a concise summary of: ${content}`,
      insights: `Provide actionable insights about: ${content}`,
      categorization: `Categorize this report and assess severity: ${content}`
    };
    
    return await this.generateResponse(prompts[analysisType], {});
  }
  
  async generateSuggestions(context) {
    const prompt = `Based on this context, provide helpful suggestions: ${JSON.stringify(context)}`;
    return await this.generateResponse(prompt, {});
  }
}

module.exports = new GeminiService();
```

#### 2. Report Service (`/services/report.service.js`)

```javascript
const Report = require('../models/report.model');
const geminiService = require('./gemini.service');

class ReportService {
  async createReport(reportData, userId) {
    const report = new Report({
      title: reportData.title,
      description: reportData.description,
      reportedBy: userId,
      contentReference: reportData.contentReference,
      contentType: reportData.contentType,
      status: 'pending',
      submittedAt: new Date()
    });
    
    // Use AI to categorize and assess severity
    const aiAnalysis = await geminiService.analyzeContent(
      `Title: ${reportData.title}\nDescription: ${reportData.description}`,
      'categorization'
    );
    
    report.aiCategory = aiAnalysis.category;
    report.aiSeverity = aiAnalysis.severity;
    
    await report.save();
    return report;
  }
  
  async getReports(filters) {
    const query = {};
    
    if (filters.status && filters.status !== 'all') {
      query.status = filters.status;
    }
    
    if (filters.type && filters.type !== 'all') {
      query.contentType = filters.type;
    }
    
    if (filters.dateRange && filters.dateRange !== 'all') {
      // Apply date range filter
    }
    
    return await Report.find(query)
      .populate('reportedBy', 'name email')
      .sort({ submittedAt: -1 });
  }
  
  async getReportById(reportId) {
    return await Report.findById(reportId)
      .populate('reportedBy', 'name email')
      .populate('contentReference');
  }
  
  async updateReportStatus(reportId, status, adminId) {
    return await Report.findByIdAndUpdate(
      reportId,
      { 
        status, 
        reviewedBy: adminId,
        reviewedAt: new Date()
      },
      { new: true }
    );
  }
  
  async getAISummary(reportId) {
    const report = await this.getReportById(reportId);
    
    const summary = await geminiService.analyzeContent(
      `Report: ${report.title}\n${report.description}`,
      'summary'
    );
    
    const recommendations = await geminiService.generateSuggestions({
      reportType: report.contentType,
      severity: report.aiSeverity,
      description: report.description
    });
    
    return { summary, recommendations };
  }
}

module.exports = new ReportService();
```

### API Controllers

#### 1. AI Controller (`/controllers/ai.controller.js`)

```javascript
const geminiService = require('../services/gemini.service');

exports.chat = async (req, res) => {
  try {
    const { message, context } = req.body;
    
    // Build context from user session and request
    const userContext = {
      role: req.user?.role || 'guest',
      page: context.page,
      data: context.data
    };
    
    const response = await geminiService.generateResponse(message, userContext);
    
    res.json({
      success: true,
      response,
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to generate AI response',
      message: error.message
    });
  }
};

exports.analyze = async (req, res) => {
  try {
    const { content, analysisType } = req.body;
    
    const analysis = await geminiService.analyzeContent(content, analysisType);
    
    res.json({
      success: true,
      analysis
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Analysis failed'
    });
  }
};

exports.suggest = async (req, res) => {
  try {
    const { context } = req.body;
    
    const suggestions = await geminiService.generateSuggestions(context);
    
    res.json({
      success: true,
      suggestions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to generate suggestions'
    });
  }
};
```

#### 2. Report Controller (`/controllers/report.controller.js`)

```javascript
const reportService = require('../services/report.service');

exports.createReport = async (req, res) => {
  try {
    const report = await reportService.createReport(req.body, req.user._id);
    
    res.status(201).json({
      success: true,
      report,
      message: 'Report submitted successfully',
      referenceNumber: report._id
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to submit report'
    });
  }
};

exports.getReports = async (req, res) => {
  try {
    const filters = {
      status: req.query.status,
      type: req.query.type,
      dateRange: req.query.dateRange
    };
    
    const reports = await reportService.getReports(filters);
    
    res.json({
      success: true,
      reports,
      count: reports.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch reports'
    });
  }
};

exports.getReportById = async (req, res) => {
  try {
    const report = await reportService.getReportById(req.params.id);
    
    if (!report) {
      return res.status(404).json({
        success: false,
        error: 'Report not found'
      });
    }
    
    res.json({
      success: true,
      report
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch report'
    });
  }
};

exports.updateReportStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const report = await reportService.updateReportStatus(
      req.params.id,
      status,
      req.user._id
    );
    
    res.json({
      success: true,
      report
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update report'
    });
  }
};

exports.getAISummary = async (req, res) => {
  try {
    const summary = await reportService.getAISummary(req.params.id);
    
    res.json({
      success: true,
      ...summary
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to generate AI summary'
    });
  }
};
```

## Data Models

### Report Model

```javascript
const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  contentReference: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'contentType',
    default: null
  },
  contentType: {
    type: String,
    enum: ['Course', 'Lesson', 'Quiz', 'general'],
    default: 'general'
  },
  status: {
    type: String,
    enum: ['pending', 'in-review', 'resolved', 'dismissed'],
    default: 'pending'
  },
  aiCategory: {
    type: String,
    default: null
  },
  aiSeverity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  reviewedAt: {
    type: Date,
    default: null
  },
  submittedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Report', reportSchema);
```

### Chat Session Model (Optional - for persistence)

```javascript
const chatSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null // null for unauthenticated users
  },
  sessionId: {
    type: String,
    required: true,
    unique: true
  },
  messages: [{
    role: {
      type: String,
      enum: ['user', 'assistant'],
      required: true
    },
    content: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  context: {
    userRole: String,
    page: String,
    data: mongoose.Schema.Types.Mixed
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 86400 // Auto-delete after 24 hours
  }
});

module.exports = mongoose.model('ChatSession', chatSessionSchema);
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Property 1: API Communication Round Trip
*For any* user question submitted through the chat interface, the system should send the query to the Gemini API and return a response object containing text content.
**Validates: Requirements 1.2**

### Property 2: Conversation History Persistence
*For any* sequence of messages submitted in a session, all messages should be stored and retrievable in the correct chronological order.
**Validates: Requirements 2.4**

### Property 3: Error Handling Consistency
*For any* API error condition (network failure, invalid response, timeout), the system should catch the error and return a user-friendly error message without crashing.
**Validates: Requirements 4.4**

### Property 4: Role-Based Context Detection
*For any* authenticated user with a defined role (student, instructor, admin), the help page should detect and apply the correct role-specific context to AI interactions.
**Validates: Requirements 5.3**

### Property 5: Report Validation
*For any* report submission attempt with empty title or description fields, the system should reject the submission and return a validation error.
**Validates: Requirements 9.3**

### Property 6: Reporter Information Capture
*For any* authenticated user submitting a report, the system should automatically capture and store the user's ID, name, and email from their profile.
**Validates: Requirements 9.4**

### Property 7: Content Reference Storage
*For any* report submitted about specific content (course, lesson, quiz), the system should store both the content ID and content type in the report record.
**Validates: Requirements 9.5**

### Property 8: General Report Creation
*For any* report submitted without a content reference, the system should successfully create the report with contentReference set to null and contentType set to 'general'.
**Validates: Requirements 10.3**

### Property 9: Contact Information Inclusion
*For any* report created, the system should include the reporter's contact information (from the user profile) in the stored report data.
**Validates: Requirements 10.4**

### Property 10: Reference Number Generation
*For any* successfully submitted report, the API response should include a unique reference number (report ID) that can be used to track the report.
**Validates: Requirements 10.5**

### Property 11: Content Link Generation
*For any* report with a non-null content reference, the admin interface should generate a clickable link to the referenced content.
**Validates: Requirements 11.4**

### Property 12: Status Update Persistence
*For any* report status update performed by an administrator, the system should save the new status, the admin's ID, and a timestamp of the update.
**Validates: Requirements 11.5**

### Property 13: Filter Application
*For any* combination of filter values (status, type, date range), the system should return only reports that match all applied filters.
**Validates: Requirements 12.2**

### Property 14: Search Functionality
*For any* keyword search term, the system should return reports where the search term appears in either the title or description (case-insensitive).
**Validates: Requirements 12.3**

### Property 15: Result Count Accuracy
*For any* filtered or searched report list, the displayed count should exactly match the number of reports in the results.
**Validates: Requirements 12.4**

## Error Handling

### Frontend Error Handling

1. **API Communication Errors**
   - Network failures: Display "Unable to connect. Please check your internet connection."
   - Timeout errors: Display "Request timed out. Please try again."
   - Server errors: Display "Something went wrong. Please try again later."

2. **Validation Errors**
   - Empty message: Prevent submission, show inline validation
   - Missing required fields in reports: Highlight fields, show error messages
   - Invalid content references: Display "Content not found" error

3. **Authentication Errors**
   - Expired session: Redirect to login with message
   - Insufficient permissions: Display "You don't have permission to access this feature."

### Backend Error Handling

1. **Gemini API Errors**
   ```javascript
   try {
     const response = await geminiService.generateResponse(message, context);
     return response;
   } catch (error) {
     if (error.code === 'INVALID_API_KEY') {
       throw new Error('AI service configuration error');
     } else if (error.code === 'RATE_LIMIT_EXCEEDED') {
       throw new Error('Too many requests. Please try again in a moment.');
     } else {
       throw new Error('AI service temporarily unavailable');
     }
   }
   ```

2. **Database Errors**
   - Connection failures: Retry with exponential backoff
   - Validation errors: Return detailed field-level errors
   - Duplicate key errors: Return user-friendly conflict messages

3. **Missing Environment Variables**
   ```javascript
   if (!process.env.GEMINI_API_KEY) {
     throw new Error('GEMINI_API_KEY environment variable is required');
   }
   ```

## Testing Strategy

### Unit Testing

Unit tests will verify specific examples and edge cases:

1. **Component Tests**
   - Chat interface renders correctly
   - Message input handles user typing
   - Loading states display appropriately
   - Report form validation works

2. **Service Tests**
   - Gemini service initializes with API key
   - Context builder creates correct prompts
   - Report service creates reports with correct data
   - Filter logic returns expected results

3. **API Tests**
   - Endpoints return correct status codes
   - Request validation works
   - Authentication middleware functions
   - Error responses have correct format

### Property-Based Testing

Property-based tests will verify universal properties using a testing library like `fast-check` (JavaScript):

1. **API Communication Properties**
   - Any valid message generates a response
   - Error conditions are handled gracefully

2. **Data Integrity Properties**
   - Report data is stored completely
   - User information is captured correctly
   - Content references are maintained

3. **Filter and Search Properties**
   - Filters return only matching results
   - Search finds all relevant reports
   - Result counts are accurate

### Integration Testing

Integration tests will verify end-to-end workflows:

1. **Help Page Flow**
   - User navigates to help page
   - Submits question
   - Receives AI response
   - Conversation history is maintained

2. **Report Submission Flow**
   - User opens report form
   - Fills in details
   - Submits report
   - Receives confirmation

3. **Admin Report Management Flow**
   - Admin views reports list
   - Applies filters
   - Views report details
   - Updates report status

## Security Considerations

1. **API Key Protection**
   - Store GEMINI_API_KEY in environment variables only
   - Never expose API key in client-side code
   - Use server-side proxy for all AI requests

2. **Input Sanitization**
   - Sanitize all user inputs before sending to AI
   - Prevent prompt injection attacks
   - Validate and escape report content

3. **Authentication & Authorization**
   - Verify user authentication for report submission
   - Restrict admin endpoints to admin role only
   - Validate user ownership of data

4. **Rate Limiting**
   - Implement rate limiting on AI endpoints
   - Prevent abuse of AI service
   - Track usage per user/session

## Performance Considerations

1. **Response Time Optimization**
   - Cache common AI responses
   - Implement request debouncing
   - Use streaming responses for long AI outputs

2. **Database Query Optimization**
   - Index frequently queried fields (status, contentType, submittedAt)
   - Use pagination for report lists
   - Implement efficient filtering queries

3. **Frontend Optimization**
   - Lazy load chat history
   - Virtualize long message lists
   - Optimize re-renders with React.memo

## Deployment Considerations

1. **Environment Variables**
   ```
   GEMINI_API_KEY=your_api_key_here
   MONGODB_URI=your_mongodb_connection_string
   NODE_ENV=production
   ```

2. **Dependencies**
   - Frontend: `@google/generative-ai` (if using client-side, though not recommended)
   - Backend: `@google/generative-ai`, `mongoose`, `express`

3. **Monitoring**
   - Track AI API usage and costs
   - Monitor response times
   - Log errors for debugging
   - Track report submission rates

## Future Enhancements

1. **Advanced AI Features**
   - Multi-turn conversations with context
   - Voice input/output
   - Image analysis for visual content
   - Personalized learning recommendations

2. **Report Management**
   - Automated report categorization
   - Priority scoring based on AI analysis
   - Bulk actions for admins
   - Report analytics dashboard

3. **Dashboard Integration**
   - Embedded AI assistants in specific workflows
   - Contextual help based on current task
   - Proactive suggestions and tips
   - AI-powered content generation tools


## AI Security and Boundaries

### Security Architecture

The AI system implements multiple layers of security to prevent unauthorized access, data leakage, and malicious actions:

```
┌─────────────────────────────────────────┐
│         User Request                     │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│   Input Sanitization Layer              │
│   - Prompt injection detection          │
│   - Malicious pattern filtering         │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│   Authorization Layer                   │
│   - Role-based access control           │
│   - Action permission validation        │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│   Data Access Control Layer             │
│   - Query scope limitation              │
│   - Sensitive data filtering            │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│   AI Processing (Gemini)                │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│   Output Sanitization Layer             │
│   - PII removal                         │
│   - Sensitive data redaction            │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│   Response to User                      │
└─────────────────────────────────────────┘
```

### Security Service Implementation

```javascript
// /services/aiSecurity.service.js

class AISecurityService {
  constructor() {
    // Patterns that indicate potential attacks
    this.dangerousPatterns = [
      /ignore previous instructions/i,
      /system prompt/i,
      /you are now/i,
      /forget everything/i,
      /new instructions/i,
      /admin password/i,
      /database credentials/i,
      /api[_\s]?key/i
    ];
    
    // Sensitive data patterns to filter from responses
    this.sensitivePatterns = [
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, // emails
      /\b\d{3}-\d{2}-\d{4}\b/g, // SSN
      /\b(?:\d{4}[-\s]?){3}\d{4}\b/g, // credit cards
      /password[:\s]+\S+/gi,
      /api[_\s]?key[:\s]+\S+/gi,
      /secret[:\s]+\S+/gi
    ];
    
    // Actions AI is NOT allowed to perform
    this.forbiddenActions = [
      'delete',
      'remove',
      'drop',
      'truncate',
      'update',
      'insert',
      'modify',
      'execute',
      'run',
      'eval'
    ];
  }
  
  /**
   * Sanitize user input to prevent prompt injection
   */
  sanitizeInput(userInput) {
    // Check for dangerous patterns
    for (const pattern of this.dangerousPatterns) {
      if (pattern.test(userInput)) {
        throw new Error('Input contains potentially malicious content');
      }
    }
    
    // Remove any attempts to break out of context
    let sanitized = userInput
      .replace(/```/g, '') // Remove code blocks
      .replace(/\[SYSTEM\]/gi, '')
      .replace(/\[ADMIN\]/gi, '')
      .trim();
    
    // Limit length to prevent overflow attacks
    if (sanitized.length > 2000) {
      sanitized = sanitized.substring(0, 2000);
    }
    
    return sanitized;
  }
  
  /**
   * Filter sensitive information from AI responses
   */
  sanitizeOutput(aiResponse) {
    let sanitized = aiResponse;
    
    // Replace sensitive patterns with redacted text
    for (const pattern of this.sensitivePatterns) {
      sanitized = sanitized.replace(pattern, '[REDACTED]');
    }
    
    return sanitized;
  }
  
  /**
   * Validate that AI is not attempting forbidden actions
   */
  validateAction(action) {
    const actionLower = action.toLowerCase();
    
    for (const forbidden of this.forbiddenActions) {
      if (actionLower.includes(forbidden)) {
        throw new Error(`AI attempted forbidden action: ${forbidden}`);
      }
    }
    
    return true;
  }
  
  /**
   * Build a secure system prompt that establishes boundaries
   */
  buildSecureSystemPrompt(userRole) {
    return `You are a helpful AI assistant for an online learning platform.

STRICT RULES YOU MUST FOLLOW:
1. You can ONLY provide information and suggestions. You CANNOT perform any actions.
2. You MUST NOT access, retrieve, or display sensitive information like passwords, API keys, or personal data.
3. You MUST NOT provide instructions on how to bypass security measures.
4. You MUST NOT pretend to be a system administrator or have elevated privileges.
5. You can only access information appropriate for a ${userRole} role.
6. If asked to do something outside your boundaries, politely decline and explain your limitations.

Your purpose is to help users understand and use the platform effectively within these boundaries.`;
  }
  
  /**
   * Limit database queries based on user role
   */
  getScopeForRole(userRole) {
    const scopes = {
      guest: {
        allowedCollections: ['courses', 'categories'],
        allowedFields: ['title', 'description', 'price', 'instructor'],
        maxResults: 10
      },
      student: {
        allowedCollections: ['courses', 'enrollments', 'progress'],
        allowedFields: ['title', 'description', 'content', 'progress'],
        maxResults: 50
      },
      instructor: {
        allowedCollections: ['courses', 'students', 'analytics', 'reviews'],
        allowedFields: ['title', 'content', 'enrollments', 'ratings', 'revenue'],
        maxResults: 100
      },
      admin: {
        allowedCollections: ['users', 'courses', 'reports', 'analytics'],
        allowedFields: ['name', 'email', 'role', 'status', 'metrics'],
        maxResults: 200,
        excludedFields: ['password', 'apiKey', 'secret']
      }
    };
    
    return scopes[userRole] || scopes.guest;
  }
  
  /**
   * Validate and sanitize database query
   */
  sanitizeQuery(query, userRole) {
    const scope = this.getScopeForRole(userRole);
    
    // Ensure query only accesses allowed collections
    if (!scope.allowedCollections.includes(query.collection)) {
      throw new Error(`Access denied to collection: ${query.collection}`);
    }
    
    // Filter fields to only allowed ones
    if (query.fields) {
      query.fields = query.fields.filter(field => 
        scope.allowedFields.includes(field) &&
        !scope.excludedFields?.includes(field)
      );
    }
    
    // Limit results
    query.limit = Math.min(query.limit || 10, scope.maxResults);
    
    return query;
  }
}

module.exports = new AISecurityService();
```

### Enhanced Gemini Service with Security

```javascript
// Updated /services/gemini.service.js with security

const { GoogleGenerativeAI } = require('@google/generative-ai');
const aiSecurity = require('./aiSecurity.service');

class GeminiService {
  constructor() {
    this.ai = new GoogleGenerativeAI({
      apiKey: process.env.GEMINI_API_KEY
    });
    this.model = 'gemini-2.0-flash-exp';
  }
  
  async generateResponse(userMessage, context) {
    try {
      // Step 1: Sanitize input
      const sanitizedMessage = aiSecurity.sanitizeInput(userMessage);
      
      // Step 2: Build secure system prompt
      const systemPrompt = aiSecurity.buildSecureSystemPrompt(context.role);
      
      // Step 3: Build full prompt with boundaries
      const fullPrompt = `${systemPrompt}\n\nUser Question: ${sanitizedMessage}`;
      
      // Step 4: Generate response
      const response = await this.ai.models.generateContent({
        model: this.model,
        contents: fullPrompt
      });
      
      // Step 5: Sanitize output
      const sanitizedResponse = aiSecurity.sanitizeOutput(response.text);
      
      return sanitizedResponse;
    } catch (error) {
      if (error.message.includes('malicious')) {
        throw new Error('Request blocked for security reasons');
      }
      throw new Error(`AI Error: ${error.message}`);
    }
  }
  
  async analyzeReportForActions(report) {
    const prompt = `Analyze this report and suggest appropriate actions an administrator could take.

Report Title: ${report.title}
Description: ${report.description}
Type: ${report.contentType}
Current Status: ${report.status}

Provide:
1. Severity assessment (low/medium/high/critical)
2. Three specific action recommendations with reasoning
3. Priority level (1-5, where 5 is highest)
4. Similar past cases (if patterns detected)

Format your response as JSON with this structure:
{
  "severity": "string",
  "priority": number,
  "actions": [
    {
      "action": "string",
      "reasoning": "string",
      "impact": "string"
    }
  ],
  "similarCases": "string"
}`;

    try {
      const response = await this.ai.models.generateContent({
        model: this.model,
        contents: prompt
      });
      
      // Parse JSON response
      const analysis = JSON.parse(response.text);
      
      // Validate that suggested actions are read-only or require manual execution
      for (const actionItem of analysis.actions) {
        aiSecurity.validateAction(actionItem.action);
      }
      
      return analysis;
    } catch (error) {
      throw new Error(`Failed to analyze report: ${error.message}`);
    }
  }
}

module.exports = new GeminiService();
```

### Report Decision Support System

```javascript
// Enhanced Report Service with AI Decision Support

class ReportService {
  // ... existing methods ...
  
  async getAIActionRecommendations(reportId) {
    const report = await this.getReportById(reportId);
    
    if (!report) {
      throw new Error('Report not found');
    }
    
    // Get AI analysis with action recommendations
    const analysis = await geminiService.analyzeReportForActions(report);
    
    // Find similar past reports
    const similarReports = await Report.find({
      aiCategory: report.aiCategory,
      status: 'resolved',
      _id: { $ne: reportId }
    })
    .limit(5)
    .select('title status resolution');
    
    return {
      reportId: report._id,
      severity: analysis.severity,
      priority: analysis.priority,
      recommendedActions: analysis.actions.map(action => ({
        ...action,
        requiresConfirmation: true, // All actions require manual confirmation
        canBeAutomated: false // AI cannot execute actions directly
      })),
      similarCases: {
        description: analysis.similarCases,
        examples: similarReports
      },
      timestamp: new Date()
    };
  }
  
  async executeReportAction(reportId, actionType, adminId) {
    // Validate admin has permission
    const admin = await User.findById(adminId);
    if (admin.role !== 'admin') {
      throw new Error('Unauthorized: Only admins can execute report actions');
    }
    
    // Log the action
    await ReportAction.create({
      reportId,
      actionType,
      executedBy: adminId,
      executedAt: new Date()
    });
    
    // Execute the action based on type
    switch(actionType) {
      case 'dismiss':
        return await this.updateReportStatus(reportId, 'dismissed', adminId);
      case 'investigate':
        return await this.updateReportStatus(reportId, 'in-review', adminId);
      case 'resolve':
        return await this.updateReportStatus(reportId, 'resolved', adminId);
      case 'escalate':
        // Send notification to senior admin
        await this.escalateReport(reportId);
        return await this.updateReportStatus(reportId, 'escalated', adminId);
      default:
        throw new Error('Invalid action type');
    }
  }
}

module.exports = new ReportService();
```

### Report Action Controller

```javascript
// /controllers/report.controller.js - Additional endpoints

exports.getActionRecommendations = async (req, res) => {
  try {
    // Only admins can access action recommendations
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized access'
      });
    }
    
    const recommendations = await reportService.getAIActionRecommendations(
      req.params.id
    );
    
    res.json({
      success: true,
      recommendations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to generate recommendations',
      message: error.message
    });
  }
};

exports.executeAction = async (req, res) => {
  try {
    // Only admins can execute actions
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized access'
      });
    }
    
    const { actionType } = req.body;
    
    const result = await reportService.executeReportAction(
      req.params.id,
      actionType,
      req.user._id
    );
    
    res.json({
      success: true,
      result,
      message: `Action '${actionType}' executed successfully`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to execute action',
      message: error.message
    });
  }
};
```

### Frontend: Report Action Interface

```javascript
// Component for displaying AI action recommendations

export function ReportActionPanel({ reportId }) {
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(false);
  const [executing, setExecuting] = useState(false);
  
  useEffect(() => {
    loadRecommendations();
  }, [reportId]);
  
  const loadRecommendations = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/reports/${reportId}/recommendations`);
      const data = await response.json();
      setRecommendations(data.recommendations);
    } catch (error) {
      console.error('Failed to load recommendations:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const executeAction = async (actionType) => {
    // Require confirmation
    const confirmed = window.confirm(
      `Are you sure you want to ${actionType} this report? This action will be logged.`
    );
    
    if (!confirmed) return;
    
    setExecuting(true);
    try {
      const response = await fetch(`/api/reports/${reportId}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actionType })
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert('Action executed successfully');
        // Refresh report data
      }
    } catch (error) {
      alert('Failed to execute action');
    } finally {
      setExecuting(false);
    }
  };
  
  if (loading) return <div>Loading AI recommendations...</div>;
  if (!recommendations) return null;
  
  return (
    <div className="report-action-panel">
      <h3>AI-Powered Action Recommendations</h3>
      
      <div className="severity-badge">
        Severity: <span className={`badge-${recommendations.severity}`}>
          {recommendations.severity.toUpperCase()}
        </span>
      </div>
      
      <div className="priority-badge">
        Priority: {recommendations.priority}/5
      </div>
      
      <div className="recommended-actions">
        <h4>Recommended Actions:</h4>
        {recommendations.recommendedActions.map((action, index) => (
          <div key={index} className="action-card">
            <h5>{action.action}</h5>
            <p><strong>Reasoning:</strong> {action.reasoning}</p>
            <p><strong>Impact:</strong> {action.impact}</p>
            <button 
              onClick={() => executeAction(action.action)}
              disabled={executing}
              className="btn-execute"
            >
              Execute Action (Requires Confirmation)
            </button>
          </div>
        ))}
      </div>
      
      {recommendations.similarCases.examples.length > 0 && (
        <div className="similar-cases">
          <h4>Similar Past Cases:</h4>
          <p>{recommendations.similarCases.description}</p>
          <ul>
            {recommendations.similarCases.examples.map(report => (
              <li key={report._id}>
                {report.title} - <em>{report.status}</em>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
```

## Security Best Practices

### 1. Input Validation
- All user inputs are sanitized before being sent to AI
- Prompt injection patterns are detected and blocked
- Input length is limited to prevent overflow attacks

### 2. Output Filtering
- AI responses are scanned for sensitive information
- PII, credentials, and secrets are automatically redacted
- Responses are validated before being sent to users

### 3. Action Restrictions
- AI can only suggest actions, never execute them
- All actions require manual admin confirmation
- Action execution is logged with admin ID and timestamp

### 4. Data Access Control
- Role-based query scoping limits what data AI can access
- Sensitive fields are excluded from AI queries
- Result limits prevent data exfiltration

### 5. Audit Logging
- All AI interactions are logged
- Security violations are flagged and reported
- Admin actions are tracked for accountability



### Correctness Properties

Property 1: AI Response Generation
*For any* user question submitted to the help system, the system should send the query to Gemini AI and return a response
**Validates: Requirements 1.2**

Property 2: Response Time Performance
*For any* AI response, the system should display it in the chat interface within 5 seconds of submission
**Validates: Requirements 1.3**

Property 3: Role-Based Context
*For any* authenticated user accessing the help page, the system should detect their role and provide role-appropriate context
**Validates: Requirements 2.1, 3.1, 5.3**

Property 4: Conversation History Persistence
*For any* user session with multiple messages, the system should maintain conversation history when navigating within the session
**Validates: Requirements 2.4, 5.5**

Property 5: Error Handling
*For any* API error that occurs during AI interaction, the system should handle it gracefully and display a user-friendly error message
**Validates: Requirements 4.4**

Property 6: Example Questions Variation
*For any* help page load, the system should provide different example questions based on the user's authentication status and role
**Validates: Requirements 5.4**

Property 7: Report AI Categorization
*For any* submitted report, the system should use AI to categorize and assign a severity level
**Validates: Requirements 6.3**

Property 8: Report AI Summary Generation
*For any* report viewed by an administrator, the system should provide AI-generated summaries and recommended actions
**Validates: Requirements 6.4**

Property 9: Message Visual Distinction
*For any* message displayed in the chat interface, the system should clearly distinguish between user messages and AI responses through different styling
**Validates: Requirements 7.3**

Property 10: Auto-Scroll Behavior
*For any* new message added to the conversation, the system should automatically scroll to show the latest message
**Validates: Requirements 7.4**

Property 11: Course Material AI Tagging
*For any* course material uploaded by an instructor, the system should use AI to generate metadata tags and categorization suggestions
**Validates: Requirements 8.4**

Property 12: Report Form Validation
*For any* report submission attempt, the system should require both a title and detailed description before allowing submission
**Validates: Requirements 9.3**

Property 13: Reporter Information Capture
*For any* report submitted by an authenticated user, the system should automatically capture the reporter's contact information from their profile
**Validates: Requirements 9.4, 10.4**

Property 14: Content Reference Storage
*For any* report about specific content, the system should store a reference to the reported course, lesson, or content item
**Validates: Requirements 9.5**

Property 15: Report Confirmation Display
*For any* successfully submitted report, the system should display a confirmation message with a unique report reference number
**Validates: Requirements 10.5**

Property 16: Report Field Display
*For any* report displayed in the admin management interface, the system should show title, reporter name, submission date, status, and type
**Validates: Requirements 11.2**

Property 17: Content Reference Links
*For any* report with a content reference, the system should provide a direct link to review the reported content
**Validates: Requirements 11.4**

Property 18: Status Update Persistence
*For any* report status update by an administrator, the system should save the status change with a timestamp
**Validates: Requirements 11.5**

Property 19: Report Filtering
*For any* filter applied by an administrator, the system should update the report list to show only matching reports
**Validates: Requirements 12.2**

Property 20: Report Search
*For any* keyword search by an administrator, the system should search both report titles and descriptions
**Validates: Requirements 12.3**

Property 21: Filter Result Count
*For any* filtered report view, the system should display the count of matching reports
**Validates: Requirements 12.4**

Property 22: Input Sanitization for Security
*For any* AI request, the system should validate and sanitize the input to prevent access to restricted data and prompt injection attacks
**Validates: Requirements 13.1, 13.4**

Property 23: Output Sanitization for Security
*For any* AI-generated response, the system should filter out sensitive information like passwords, API keys, and personal data
**Validates: Requirements 13.2**

Property 24: Action Restriction
*For any* AI request that attempts to perform an action, the system should restrict the AI to read-only operations and suggestions only
**Validates: Requirements 13.3**

Property 25: Role-Based Data Access
*For any* AI query accessing database information, the system should limit the query scope to only data appropriate for the user's role
**Validates: Requirements 13.5**

Property 26: AI Action Recommendations
*For any* report viewed by an administrator, the system should provide AI-generated action recommendations with reasoning
**Validates: Requirements 14.1, 14.2**

Property 27: Action Metadata Inclusion
*For any* AI action suggestion, the system should include severity assessment and priority level
**Validates: Requirements 14.3**

Property 28: Manual Confirmation Requirement
*For any* administrator action selection, the system should require manual confirmation before execution
**Validates: Requirements 14.4**

Property 29: Similar Report Identification
*For any* AI report analysis, the system should identify and display similar past reports and their resolutions
**Validates: Requirements 14.5**

Property 30: Floating Chat Button Visibility
*For any* page viewed on the platform, the system should display a floating chat button in the bottom-right corner
**Validates: Requirements 7.5.1**

Property 31: Chat Window State Persistence
*For any* navigation between pages, the system should maintain the chat window state and conversation history
**Validates: Requirements 7.5.5**

## Error Handling

### Error Categories

1. **AI Service Errors**
   - API key missing or invalid
   - Rate limiting exceeded
   - Network connectivity issues
   - Model unavailable

2. **Security Errors**
   - Prompt injection detected
   - Unauthorized data access attempt
   - Forbidden action requested
   - Role permission violation

3. **Data Errors**
   - Report not found
   - Invalid report data
   - Database connection failure
   - Query timeout

### Error Handling Strategy

```javascript
class ErrorHandler {
  static handleAIError(error) {
    if (error.message.includes('API key')) {
      return {
        userMessage: 'AI service is not configured. Please contact support.',
        logLevel: 'critical',
        notify: ['admin']
      };
    }
    
    if (error.message.includes('rate limit')) {
      return {
        userMessage: 'AI service is temporarily busy. Please try again in a moment.',
        logLevel: 'warning',
        retry: true
      };
    }
    
    if (error.message.includes('malicious')) {
      return {
        userMessage: 'Your request was blocked for security reasons.',
        logLevel: 'security',
        notify: ['security-team'],
        logDetails: true
      };
    }
    
    return {
      userMessage: 'An error occurred. Please try again.',
      logLevel: 'error'
    };
  }
  
  static handleSecurityError(error) {
    // Log security violations
    SecurityLogger.log({
      type: 'security_violation',
      error: error.message,
      timestamp: new Date(),
      severity: 'high'
    });
    
    return {
      userMessage: 'Access denied for security reasons.',
      statusCode: 403
    };
  }
}
```

## Testing Strategy

### Unit Testing

Unit tests will cover:
- Individual component rendering (Help page, Chat interface, Report forms)
- Service method functionality (Gemini service, Report service, Security service)
- Input/output sanitization functions
- Error handling logic
- Form validation

**Testing Framework**: Jest with React Testing Library for frontend, Jest for backend

### Property-Based Testing

Property-based tests will verify universal properties across all inputs using **fast-check** library for JavaScript:

- AI response generation for random questions
- Security sanitization for malicious input patterns
- Role-based context for all user roles
- Report categorization for various report types
- Filter and search functionality for random queries
- Action restriction for forbidden operations

**Configuration**: Each property test will run a minimum of 100 iterations to ensure comprehensive coverage.

### Integration Testing

Integration tests will verify:
- End-to-end chat flow from user input to AI response
- Report submission and admin review workflow
- AI security boundaries in real scenarios
- Database operations with AI services

### Security Testing

Security tests will specifically target:
- Prompt injection attempts
- Data exfiltration attempts
- Privilege escalation attempts
- Sensitive data leakage

## Deployment Considerations

### Environment Variables

```env
# Required
GEMINI_API_KEY=your_gemini_api_key_here
MONGODB_URI=your_mongodb_connection_string

# Optional
AI_MODEL=gemini-2.0-flash-exp
AI_MAX_TOKENS=2000
AI_TEMPERATURE=0.7
SECURITY_LOG_LEVEL=info
```

### Performance Optimization

1. **Caching**: Cache AI responses for common questions
2. **Rate Limiting**: Implement rate limiting per user to prevent abuse
3. **Lazy Loading**: Load AI features only when needed
4. **Response Streaming**: Stream AI responses for better UX

### Monitoring

- Track AI API usage and costs
- Monitor response times
- Log security violations
- Track report resolution times
- Monitor AI recommendation accuracy

