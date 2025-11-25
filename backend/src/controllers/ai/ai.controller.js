import geminiService from "../../services/ai/gemini.service.js";

/**
 * Handle chat messages
 */
export const chat = async (req, res) => {
  try {
    const { message, context } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        error: "Message is required",
      });
    }

    // Build context from user session and request
    const userContext = {
      role: req.user?.role || "guest",
      page: context?.page || "unknown",
      data: context?.data || {},
    };

    const response = await geminiService.generateResponse(message, userContext);

    res.json({
      success: true,
      response,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error("Chat error:", error);
    
    let statusCode = 500;
    let errorMessage = "Failed to generate AI response";

    if (error.message.includes("not configured")) {
      statusCode = 503;
      errorMessage = "AI service is not available";
    } else if (error.message.includes("security")) {
      statusCode = 403;
      errorMessage = "Request blocked for security reasons";
    }

    res.status(statusCode).json({
      success: false,
      error: errorMessage,
      message: error.message,
    });
  }
};

/**
 * Analyze content with AI
 */
export const analyze = async (req, res) => {
  try {
    const { content, analysisType } = req.body;

    if (!content) {
      return res.status(400).json({
        success: false,
        error: "Content is required",
      });
    }

    if (!["moderation", "summary", "insights", "categorization"].includes(analysisType)) {
      return res.status(400).json({
        success: false,
        error: "Invalid analysis type",
      });
    }

    const analysis = await geminiService.analyzeContent(content, analysisType);

    res.json({
      success: true,
      analysis,
    });
  } catch (error) {
    console.error("Analysis error:", error);
    res.status(500).json({
      success: false,
      error: "Analysis failed",
      message: error.message,
    });
  }
};

/**
 * Get AI suggestions
 */
export const suggest = async (req, res) => {
  try {
    const { context } = req.body;

    if (!context) {
      return res.status(400).json({
        success: false,
        error: "Context is required",
      });
    }

    const suggestions = await geminiService.generateSuggestions(context);

    res.json({
      success: true,
      suggestions,
    });
  } catch (error) {
    console.error("Suggestion error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to generate suggestions",
      message: error.message,
    });
  }
};

/**
 * Get example questions based on user role
 */
export const getExamples = async (req, res) => {
  try {
    const userRole = req.user?.role || "guest";
    const examples = geminiService.getExampleQuestions(userRole);

    res.json({
      success: true,
      examples,
    });
  } catch (error) {
    console.error("Examples error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get examples",
      message: error.message,
    });
  }
};
