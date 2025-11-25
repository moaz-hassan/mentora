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
      /api[_\s]?key/i,
    ];

    // Sensitive data patterns to filter from responses
    this.sensitivePatterns = [
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, // emails
      /\b\d{3}-\d{2}-\d{4}\b/g, // SSN
      /\b(?:\d{4}[-\s]?){3}\d{4}\b/g, // credit cards
      /password[:\s]+\S+/gi,
      /api[_\s]?key[:\s]+\S+/gi,
      /secret[:\s]+\S+/gi,
    ];

    // Actions AI is NOT allowed to perform
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

  /**
   * Sanitize user input to prevent prompt injection
   */
  sanitizeInput(userInput) {
    // Check for dangerous patterns
    for (const pattern of this.dangerousPatterns) {
      if (pattern.test(userInput)) {
        throw new Error("Input contains potentially malicious content");
      }
    }

    // Remove any attempts to break out of context
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
