import rateLimit from 'express-rate-limit';

export const createResourceLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many create requests. Please slow down.',
  },
  handler: (req, res, next, options) => {
    res.status(429).json(options.message);
  },
});

export const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many uploads. Please wait before uploading more files.',
  },
  handler: (req, res, next, options) => {
    res.status(429).json(options.message);
  },
});

export const sensitiveActionLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, 
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests for this operation. Please try again later.',
  },
  handler: (req, res, next, options) => {
    res.status(429).json(options.message);
  },
});
