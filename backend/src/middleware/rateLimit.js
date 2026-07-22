const windowMs = 60 * 1000;
const maxRequests = 30;

const hits = new Map();

setInterval(() => {
  for (const [key, data] of hits) {
    if (Date.now() - data.windowStart > windowMs) {
      hits.delete(key);
    }
  }
}, windowMs);

function rateLimit(req, res, next) {
  const userId = req.user?.userId;
  if (!userId) return next();

  const now = Date.now();
  const entry = hits.get(userId);

  if (!entry || now - entry.windowStart > windowMs) {
    hits.set(userId, { windowStart: now, count: 1 });
    return next();
  }

  entry.count++;
  if (entry.count > maxRequests) {
    return res.status(429).json({ error: "Rate limit exceeded. Try again later." });
  }

  next();
}

module.exports = rateLimit;
