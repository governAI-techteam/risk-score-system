import ATTACK_PATTERNS from '../utils/patterns.js';

class Sanitizer {
  constructor() {
    this.patterns = ATTACK_PATTERNS;
  }

  sanitize(input, analysis) {
    const result = {
      original: input,
      sanitized: input,
      removedSegments: [],
      preservedSegments: [],
      transformations: []
    };

    if (analysis.type === 'SAFE') {
      result.sanitized = input;
      result.preservedSegments.push({ content: input, reason: 'No threats detected' });
      result.transformations.push({ type: 'NONE', reason: 'Input is clean' });
      return result;
    }

    if (analysis.type === 'DIRECT_ATTACK') {
      return this.sanitizeDirectAttack(input, analysis, result);
    }

    if (analysis.type === 'INDIRECT_ATTACK') {
      return this.sanitizeIndirectAttack(input, analysis, result);
    }

    if (analysis.type === 'SUSPICIOUS') {
      return this.sanitizeSuspicious(input, analysis, result);
    }

    return result;
  }

  sanitizeDirectAttack(input, analysis, result) {
    const lines = input.split('\n');
    const safeLines = [];
    let hasAttackLine = false;

    for (const line of lines) {
      let lineIsAttack = false;
      let matchedPattern = null;

      for (const keyword of this.patterns.DIRECT_KEYWORDS) {
        if (line.toLowerCase().includes(keyword.toLowerCase())) {
          lineIsAttack = true;
          matchedPattern = keyword;
          break;
        }
      }

      if (lineIsAttack) {
        hasAttackLine = true;
        result.removedSegments.push({
          content: line,
          reason: `Direct attack pattern: "${matchedPattern}"`
        });
        result.transformations.push({
          original: line,
          sanitized: '[REMOVED: Potential Prompt Injection]',
          reason: 'Contains direct attack instruction'
        });
        safeLines.push('[REMOVED: Potential Prompt Injection]');
      } else {
        safeLines.push(line);
      }
    }

    result.sanitized = safeLines.join('\n');
    
    if (!hasAttackLine) {
      result.sanitized = '[REMOVED: Potential Prompt Injection]';
      result.removedSegments.push({
        content: input,
        reason: 'Entire input classified as direct attack'
      });
    }

    return result;
  }

  sanitizeIndirectAttack(input, analysis, result) {
    const lines = input.split('\n');
    const safeLines = [];
    
    const suspiciousLineNumbers = new Set(
      analysis.indirectAnalysis.suspiciousLines.map(l => l.lineNumber)
    );

    const suspiciousPatterns = [
      ...this.patterns.INDIRECT_PATTERNS,
      ...this.patterns.STRUCTURED_INJECTION
    ];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNumber = i + 1;

      if (suspiciousLineNumbers.has(lineNumber)) {
        result.removedSegments.push({
          content: line,
          reason: `Indirect attack on line ${lineNumber}: Suspicious pattern detected`
        });
        result.transformations.push({
          original: line,
          sanitized: '[REMOVED: Potential Prompt Injection]',
          reason: `Contains suspicious pattern on line ${lineNumber}`
        });
        safeLines.push('[REMOVED: Potential Prompt Injection]');
      } else {
        let lineHasPattern = false;
        for (const pattern of suspiciousPatterns) {
          if (pattern.pattern.test(line)) {
            lineHasPattern = true;
            result.removedSegments.push({
              content: line,
              reason: `Pattern detected on line ${lineNumber}: ${line.match(pattern.pattern)?.[0] || 'matched'}`
            });
            result.transformations.push({
              original: line,
              sanitized: '[REMOVED: Potential Prompt Injection]',
              reason: 'Contains suspicious pattern'
            });
            break;
          }
        }
        
        if (lineHasPattern) {
          safeLines.push('[REMOVED: Potential Prompt Injection]');
        } else {
          safeLines.push(line);
        }
      }
    }

    result.sanitized = safeLines.join('\n');
    
    const preservedPercentage = ((lines.length - result.removedSegments.length) / lines.length * 100).toFixed(0);
    result.preservationRate = parseInt(preservedPercentage);
    
    return result;
  }

  sanitizeSuspicious(input, analysis, result) {
    const lines = input.split('\n');
    const safeLines = [];

    for (const line of lines) {
      let lineIsSuspicious = false;

      for (const clue of this.patterns.CONTEXT_CLUES) {
        const regex = new RegExp(`\\b${clue.keyword}\\b`, 'gi');
        if (regex.test(line)) {
          lineIsSuspicious = true;
          result.removedSegments.push({
            content: line,
            reason: `Context clue: "${clue.keyword}"`
          });
          result.transformations.push({
            original: line,
            sanitized: '[FLAGGED: Suspicious Content - Review Recommended]',
            reason: 'Contains context clue suggesting potential manipulation'
          });
          break;
        }
      }

      safeLines.push(lineIsSuspicious ? '[FLAGGED: Suspicious Content - Review Recommended]' : line);
    }

    result.sanitized = safeLines.join('\n');
    result.transformations.push({
      type: 'FLAGGED',
      reason: 'Some content has been flagged for review'
    });

    return result;
  }

  detectSensitiveData(text) {
    const detections = {
      hasPII: false,
      hasCredentials: false,
      sensitiveData: []
    };

    for (const pattern of this.patterns.SENSITIVE_DATA_PATTERNS.PII) {
      const matches = text.match(pattern.pattern);
      if (matches) {
        detections.hasPII = true;
        detections.sensitiveData.push({
          type: pattern.type,
          count: matches.length,
          samples: matches.slice(0, 2).map(m => this.maskSensitive(m, pattern.type))
        });
      }
    }

    for (const pattern of this.patterns.SENSITIVE_DATA_PATTERNS.CREDENTIALS) {
      const matches = text.match(pattern.pattern);
      if (matches) {
        detections.hasCredentials = true;
        detections.sensitiveData.push({
          type: pattern.type,
          count: matches.length,
          samples: ['[REDACTED]']
        });
      }
    }

    return detections;
  }

  maskSensitive(value, type) {
    if (type === 'email') {
      const [local, domain] = value.split('@');
      return `${local.charAt(0)}${'*'.repeat(Math.min(local.length - 1, 5))}@${domain}`;
    }
    if (type === 'phone') {
      return value.substring(0, 3) + '*******';
    }
    if (type === 'password' || type === 'api_key' || type === 'token') {
      return value.substring(0, 8) + '****';
    }
    return '****';
  }

  generateExplanation(result, analysis, riskScore) {
    const explanations = {
      DIRECT_ATTACK: {
        what: 'Direct prompt injection attempt detected',
        why: 'The input contains explicit commands attempting to override system instructions',
        action: 'Malicious content has been identified and removed',
        guidance: 'Do not include system-level instructions in your queries. Focus on the legitimate question you want answered.'
      },
      INDIRECT_ATTACK: {
        what: 'Indirect prompt injection detected',
        why: 'Suspicious patterns were embedded within the content that could manipulate AI behavior',
        action: 'Malicious segments have been isolated and removed',
        guidance: 'Avoid embedding hidden instructions in normal-looking content. Present your query clearly.'
      },
      SUSPICIOUS: {
        what: 'Suspicious content detected',
        why: 'Some patterns in the input may suggest attempted manipulation',
        action: 'Content has been flagged for manual review',
        guidance: 'Consider rephrasing your query without potentially manipulative language.'
      },
      SAFE: {
        what: 'No threats detected',
        why: 'The input appears to be a normal, legitimate query',
        action: 'Input has been approved for processing',
        guidance: 'Your query is safe and will be processed normally.'
      }
    };

    return {
      ...explanations[analysis.type],
      riskLevel: riskScore.riskLevel,
      actionTaken: riskScore.action,
      preservationRate: result.preservationRate || 100
    };
  }
}

export default new Sanitizer();