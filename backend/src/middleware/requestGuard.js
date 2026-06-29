import normalizer from '../services/normalizer.js';

/**
 * Request Guard Middleware
 * Intercepts incoming requests and scans HTTP headers and query parameters
 * for de-obfuscated prompt injection attacks before they reach backend routes.
 */
export const requestGuard = (req, res, next) => {
  // Scans critical request headers typically logged or parsed by downstream systems
  const headersToScan = ['user-agent', 'referer', 'x-forwarded-for'];
  
  for (const header of headersToScan) {
    const val = req.headers[header];
    if (val && typeof val === 'string') {
      const normalized = normalizer.normalize(val);
      // Run quick heuristics matching direct injection override patterns
      const hasInjection = /ignore\s+(all\s+)?previous\s+instructions/i.test(normalized) ||
                           /reveal\s+(system|internal)/i.test(normalized) ||
                           /bypass\s+(security|filters)/i.test(normalized);
      if (hasInjection) {
        console.warn(`[RequestGuard] Security Violation: Prompt Injection matched in header '${header}':`, val);
        return res.status(403).json({
          success: false,
          error: `Security Violation: Prompt Injection pattern detected in header '${header}'.`
        });
      }
    }
  }

  // Scans incoming URL query string parameters for overrides
  if (req.query) {
    for (const key of Object.keys(req.query)) {
      const val = req.query[key];
      if (val && typeof val === 'string') {
        const normalized = normalizer.normalize(val);
        const hasInjection = /ignore\s+(all\s+)?previous\s+instructions/i.test(normalized) ||
                             /reveal\s+(system|internal)/i.test(normalized) ||
                             /bypass\s+(security|filters)/i.test(normalized);
        if (hasInjection) {
          console.warn(`[RequestGuard] Security Violation: Prompt Injection matched in query parameter '${key}':`, val);
          return res.status(403).json({
            success: false,
            error: `Security Violation: Prompt Injection pattern detected in query parameter '${key}'.`
          });
        }
      }
    }
  }

  next();
};
