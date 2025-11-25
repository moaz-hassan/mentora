import { GoogleGenAI } from "@google/genai";
import aiSecurity from "./aiSecurity.service.js";

class GeminiService {
  constructor() {
    // The client gets the API key from the environment variable `GEMINI_API_KEY`
    try {
      this.ai = new GoogleGenAI({});
      this.model = "gemini-2.5-flash";
      this.initialized = true;
    } catch (error) {
      console.error("Failed to initialize Gemini AI:", error);
      this.ai = null;
      this.initialized = false;
    }
  }

  /**
   * Check if AI is properly initialized
   */
  isInitialized() {
    return this.initialized && this.ai !== null;
  }

  /**
   * Generate AI response with security boundaries
   */
  async generateResponse(userMessage, context) {
    if (!this.isInitialized()) {
      throw new Error("AI service is not configured. Please check GEMINI_API_KEY.");
    }

    try {
      // Step 1: Sanitize input
      const sanitizedMessage = aiSecurity.sanitizeInput(userMessage);

      // Step 2: Build secure system prompt
      const systemPrompt = aiSecurity.buildSecureSystemPrompt(context.role || "guest");

      // Step 3: Build context-aware prompt
      const contextInfo = this.buildContextInfo(context);

      // Step 4: Build full prompt with boundaries
      const fullPrompt = `${systemPrompt}\n\n${contextInfo}\n\nUser Question: ${sanitizedMessage}`;

      // Step 5: Generate response using the new API
      const response = await this.ai.models.generateContent({
        model: this.model,
        contents: fullPrompt,
      });

      // Step 6: Get text from response
      const text = response.text;

      // Step 7: Sanitize output
      const sanitizedResponse = aiSecurity.sanitizeOutput(text);

      return sanitizedResponse;
    } catch (error) {
      if (error.message.includes("malicious")) {
        throw new Error("Request blocked for security reasons");
      }
      console.error("Gemini AI Error:", error);
      throw new Error(`AI Error: ${error.message}`);
    }
  }

  /**
   * Build context information for the AI
   */
  buildContextInfo(context) {
    const { role, page, data } = context;

    let contextInfo = "";

    // Add role-specific context
    switch (role) {
      case "student":
        contextInfo = "Context: You are helping a student who is taking courses on the platform.";
        break;
      case "instructor":
        contextInfo = "Context: You are assisting an instructor who creates and manages courses.";
        break;
      case "admin":
        contextInfo = "Context: You are helping an administrator who manages the entire platform.";
        break;
      default:
        contextInfo = "Context: You are helping a visitor learn about the platform features.";
    }

    // Add page-specific context
    if (page) {
      contextInfo += `\nCurrent Page: ${page}`;
    }

    // Add additional data context if provided
    if (data && Object.keys(data).length > 0) {
      contextInfo += `\nAdditional Context: ${JSON.stringify(data)}`;
    }

    return contextInfo;
  }

  /**
   * Analyze content with AI
   */
  async analyzeContent(content, analysisType) {
    if (!this.isInitialized()) {
      throw new Error("AI service is not configured");
    }

    const prompts = {
      moderation: `Analyze this content for inappropriate material and provide a brief assessment:\n\n${content}`,
      summary: `Provide a concise summary (2-3 sentences) of the following:\n\n${content}`,
      insights: `Provide 3 actionable insights about the following:\n\n${content}`,
      categorization: `Analyze this report and categorize it. Provide your response in JSON format with these fields: category (string), severity (low/medium/high/critical), reasoning (string):\n\n${content}`,
    };

    try {
      const response = await this.ai.models.generateContent({
        model: this.model,
        contents: prompts[analysisType],
      });

      const text = response.text;

      // For categorization, try to parse JSON
      if (analysisType === "categorization") {
        try {
          // Extract JSON from response (handle markdown code blocks)
          const jsonMatch = text.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
          }
        } catch (e) {
          console.error("Failed to parse categorization JSON:", e);
        }
      }

      return text;
    } catch (error) {
      console.error("Content analysis error:", error);
      throw new Error(`Failed to analyze content: ${error.message}`);
    }
  }

  /**
   * Generate suggestions based on context
   */
  async generateSuggestions(context) {
    if (!this.isInitialized()) {
      throw new Error("AI service is not configured");
    }

    const prompt = `Based on this context, provide 3-5 helpful suggestions:\n\n${JSON.stringify(context, null, 2)}`;

    try {
      const response = await this.ai.models.generateContent({
        model: this.model,
        contents: prompt,
      });

      return response.text;
    } catch (error) {
      console.error("Suggestion generation error:", error);
      throw new Error(`Failed to generate suggestions: ${error.message}`);
    }
  }

  /**
   * Analyze report and provide action recommendations
   */
  async analyzeReportForActions(report) {
    if (!this.isInitialized()) {
      throw new Error("AI service is not configured");
    }

    const prompt = `Analyze this report and suggest appropriate actions an administrator could take.

Report Title: ${report.title}
Description: ${report.description}
Type: ${report.contentType || "general"}
Current Status: ${report.status || "pending"}

Provide your response in JSON format with this structure:
{
  "severity": "low|medium|high|critical",
  "priority": 1-5 (where 5 is highest),
  "actions": [
    {
      "action": "action name",
      "reasoning": "why this action",
      "impact": "expected impact"
    }
  ],
  "similarCases": "description of similar patterns"
}`;

    try {
      const response = await this.ai.models.generateContent({
        model: this.model,
        contents: prompt,
      });

      const text = response.text;

      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const analysis = JSON.parse(jsonMatch[0]);

        // Validate that suggested actions are safe
        for (const actionItem of analysis.actions) {
          aiSecurity.validateAction(actionItem.action);
        }

        return analysis;
      }

      throw new Error("Failed to parse AI response");
    } catch (error) {
      console.error("Report analysis error:", error);
      throw new Error(`Failed to analyze report: ${error.message}`);
    }
  }

  /**
   * Get example questions based on user role
   */
  getExampleQuestions(userRole) {
    const examples = {
      guest: [
        "What courses are available on this platform?",
        "How do I create an account?",
        "What are the pricing options?",
        "How does the learning process work?",
      ],
      student: [
        "How do I enroll in a course?",
        "Where can I track my progress?",
        "How do I submit assignments?",
        "Can I get a certificate after completing a course?",
      ],
      instructor: [
        "How do I create a new course?",
        "How can I track student engagement?",
        "What are the best practices for course content?",
        "How do I manage course pricing?",
      ],
      admin: [
        "How do I manage user accounts?",
        "What reports are available?",
        "How do I moderate content?",
        "How can I view platform analytics?",
      ],
    };

    return examples[userRole] || examples.guest;
  }
  /**
   * Analyze course for review
   */
  async analyzeCourseForReview(courseData) {
    if (!this.isInitialized()) {
      throw new Error("AI service is not configured");
    }

    const prompt = `Analyze this course submission and provide a review for the administrator.
    
    Course Title: ${courseData.title}
    Description: ${courseData.description}
    Learning Objectives: ${JSON.stringify(courseData.learning_objectives)}
    Target Audience: ${courseData.target_audience}
    Level: ${courseData.level}
    
    Provide your response in JSON format with this structure:
    {
      "summary": "Brief summary of the course content",
      "strengths": ["List of strong points"],
      "weaknesses": ["List of potential issues or missing information"],
      "suggested_decision": "approve" or "reject",
      "reasoning": "Explanation for the suggested decision",
      "content_quality_score": 1-10
    }`;

    try {
      const response = await this.ai.models.generateContent({
        model: this.model,
        contents: prompt,
      });

      const text = response.text;
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      throw new Error("Failed to parse AI response");
    } catch (error) {
      console.error("Course analysis error:", error);
      // Return a fallback structure so the flow doesn't break
      return {
        summary: "AI Analysis failed to generate.",
        strengths: [],
        weaknesses: [],
        suggested_decision: "manual_review",
        reasoning: "AI service error: " + error.message,
        content_quality_score: 0
      };
    }
  }
}

export default new GeminiService();
