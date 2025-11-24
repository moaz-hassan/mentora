import { query } from "express-validator";

export const validateAnalyticsQuery = [
  query("courseId")
    .optional()
    .isUUID()
    .withMessage("courseId must be a valid UUID"),

  query("days")
    .optional()
    .isInt({ min: 1, max: 365 })
    .withMessage("days must be an integer between 1 and 365")
    .toInt(),
];
