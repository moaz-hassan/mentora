
import { body } from "express-validator";

export const updateProfileValidator = [
  // User fields
  body("first_name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage("First name must be between 2 and 255 characters"),

  body("last_name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage("Last name must be between 2 and 255 characters"),

  // Profile fields
  body("bio")
    .optional()
    .trim()
    .isLength({ max: 5000 })
    .withMessage("Bio must not exceed 5000 characters"),

  body("avatar_url")
    .optional()
    .trim()
    .isURL()
    .withMessage("Avatar URL must be a valid URL"),

  body("headline")
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage("Headline must not exceed 255 characters"),

  body("social_links")
    .optional()
    .custom((value) => {
      if (typeof value !== "object" || Array.isArray(value)) {
        throw new Error("Social links must be an object");
      }
      
      // Validate each social link is a valid URL
      const validKeys = ["twitter", "linkedin", "github", "website", "facebook", "instagram", "youtube"];
      const keys = Object.keys(value);
      
      for (const key of keys) {
        if (!validKeys.includes(key.toLowerCase())) {
          throw new Error(`Invalid social link key: ${key}. Allowed: ${validKeys.join(", ")}`);
        }
        
        if (value[key] && typeof value[key] !== "string") {
          throw new Error(`Social link ${key} must be a string`);
        }
        
        // Validate URL format if value is not empty
        if (value[key] && value[key].trim() !== "") {
          // More flexible URL regex that accepts various formats
          const urlRegex = /^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/;
          if (!urlRegex.test(value[key].trim())) {
            throw new Error(`Social link ${key} must be a valid URL (e.g., https://example.com or example.com/profile)`);
          }
        }
      }
      
      return true;
    })
    .withMessage("Invalid social links format"),
];
