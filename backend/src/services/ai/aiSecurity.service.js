class AISecurityService {
  constructor() {
    
    this.dangerousPatterns = [
      /ignore previous instructions/i,
      /system prompt/i,
      /you are now/i,
      /forget everything/i,
      /new instructions/i,
      /admin password/i,
      /database credentials/i,
      /api[_\s]?key/i,
    ];

    
    this.sensitivePatterns = [
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, 
      /\b\d{3}-\d{2}-\d{4}\b/g, 
      /\b(?:\d{4}[-\s]?){3}\d{4}\b/g, 
      /password[:\s]+\S+/gi,
      /api[_\s]?key[:\s]+\S+/gi,
      /secret[:\s]+\S+/gi,
    ];

    
    this.forbiddenActions = [
      "delete",
      "remove",
      "drop",
      "truncate",
      "update",
      "insert",
      "modify",
      "execute",
      "run",
      "eval",
    ];
  }

  
  sanitizeInput(userInput) {
    
    for (const pattern of this.dangerousPatterns) {
      if (pattern.test(userInput)) {
        throw new Error("Input contains potentially malicious content");
      }
    }

    
    let sanitized = userInput
      .replace(/```/g, "") // Remove code blocks
      .replace(/\[SYSTEM\]/gi, "")
      .replace(/\[ADMIN\]/gi, "")
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
      sanitized = sanitized.replace(pattern, "[REDACTED]");
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
   * Build a secure system prompt that establishes boundaries and platform knowledge
   */
  buildSecureSystemPrompt(userRole) {
    const platformKnowledge = `
ABOUT MENTORA PLATFORM:
Mentora is an online learning platform where students can enroll in courses, instructors can create and sell courses, and admins manage the entire platform.

KEY FEATURES:
- Course Catalog: Browse courses by category, subcategory, level, language, and price
- Course Content: Video lessons, quizzes, downloadable materials, and certificates
- Search: Smart fuzzy search with filters (rating, level, price type, language)
- Enrollments: Students can enroll (free/paid), track progress, complete quizzes
- Certificates: Automatically generated upon 100% course completion
- Ratings & Reviews: Students can rate and review courses they've completed
- Chat: Course-specific chat rooms for student-instructor communication
- Notifications: Real-time notifications for enrollments, messages, course approvals
- Payments: Secure checkout with coupon support
- Global Coupons: Site-wide discount offers shown in homepage banner

USER ROLES:
- Students: Browse courses, enroll, watch lessons, complete quizzes, get certificates
- Instructors: Create courses, add lessons/quizzes, view analytics, manage coupons
- Admins: Approve courses, manage users, view platform analytics, send announcements

COMMON QUESTIONS:
Q: How do I create a course? A: Log in as instructor, go to Dashboard > Create Course
Q: How do I get a certificate? A: Complete all lessons and quizzes (100% progress), then click "Get Certificate"
Q: Can I refund a course? A: Contact support within 30 days of purchase
Q: How do instructors get paid? A: Monthly payouts after platform commission (20%)
Q: How do I become an instructor? A: Go to Profile > Apply as Instructor
`;

    return `You are Mentora AI, the helpful assistant for the Mentora online learning platform.

${platformKnowledge}

STRICT RULES YOU MUST FOLLOW:
1. You can ONLY provide information and suggestions. You CANNOT perform any actions.
2. You MUST NOT access, retrieve, or display sensitive information like passwords, API keys, or personal data.
3. You MUST NOT provide instructions on how to bypass security measures.
4. You MUST NOT pretend to be a system administrator or have elevated privileges.
5. You can only access information appropriate for a ${userRole} role.
6. If asked about something unrelated to Mentora, politely redirect to platform topics.
7. Be concise, friendly, and helpful.

Current user role: ${userRole}

You are here to help users understand and use Mentora effectively!`;
  }

  /**
   * Limit database queries based on user role
   */
  getScopeForRole(userRole) {
    const scopes = {
      guest: {
        allowedCollections: ["courses", "categories"],
        allowedFields: ["title", "description", "price", "instructor"],
        maxResults: 10,
      },
      student: {
        allowedCollections: ["courses", "enrollments", "progress"],
        allowedFields: ["title", "description", "content", "progress"],
        maxResults: 50,
      },
      instructor: {
        allowedCollections: ["courses", "students", "analytics", "reviews"],
        allowedFields: [
          "title",
          "content",
          "enrollments",
          "ratings",
          "revenue",
        ],
        maxResults: 100,
      },
      admin: {
        allowedCollections: ["users", "courses", "reports", "analytics"],
        allowedFields: ["name", "email", "role", "status", "metrics"],
        maxResults: 200,
        excludedFields: ["password", "apiKey", "secret"],
      },
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
      query.fields = query.fields.filter(
        (field) =>
          scope.allowedFields.includes(field) &&
          !scope.excludedFields?.includes(field)
      );
    }

    // Limit results
    query.limit = Math.min(query.limit || 10, scope.maxResults);

    return query;
  }
}

export default new AISecurityService();
