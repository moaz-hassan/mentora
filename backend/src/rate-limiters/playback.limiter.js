import rateLimit from 'express-rate-limit';

const keyGenerator = (req) => {
  return req.user && req.user.id ? `user:${req.user.id}` : req.ip;
};

export const playbackLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // allow up to 20 playback requests per minute per user/IP
  keyGenerator,
  validate: { keyGeneratorIpFallback: false },
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many playback requests. Please slow down.',
  },
  handler: (req, res, next, options) => {
    res.status(429).json(options.message);
  },
});

export const streamLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60, // playlists/segments may generate many requests
  keyGenerator,
  validate: { keyGeneratorIpFallback: false },
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many stream requests. Please try again shortly.',
  },
  handler: (req, res, next, options) => {
    res.status(429).json(options.message);
  },
});

export const downloadLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // limit downloads to avoid abuse
  keyGenerator,
  validate: { keyGeneratorIpFallback: false },
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many downloads. Please try again later.',
  },
  handler: (req, res, next, options) => {
    res.status(429).json(options.message);
  },
});
