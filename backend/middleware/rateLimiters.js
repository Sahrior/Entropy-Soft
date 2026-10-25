import rateLimit from 'express-rate-limit';

const handler = (req, res) =>
  res.status(429).json({
    success: false,
    message: 'Too many submissions from your connection. Please wait a while and try again.',
  });

export const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler,
});

export const careersLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler,
});
