import ATTACK_PATTERNS from '../utils/patterns.js';

class Detector {
  constructor() {
    this.patterns = ATTACK_PATTERNS;
    this.reasoning = [];
  }

  analyze(input, fileName = null) {
    this.reasoning = [];
    this.reasoning.push({
      step: 'INPUT_RECEIVED',
      message: `Received ${fileName ? 'file content' : 'text input'}`,
      details: input.substring(0, 100) + (input.length > 100 ? '...' : '')
    });

    const directResult = this.detectDirectAttack(input);
    const indirectResult = this.detectIndirectAttack(input);
    
    const classification = this.classify(directResult, indirectResult);
    
    this.reasoning.push({
      step: 'PATTERN_DETECTION',
      message: 'Pattern analysis completed',
      details: {
        directMatches: directResult.matches.length,
        indirectMatches: indirectResult.matches.length,
        patternsFound: [...directResult.matches, ...indirectResult.matches].map(m => m.pattern)
      }
    });

    const intent = this.identifyIntent(directResult, indirectResult);
    
    this.reasoning.push({
      step: 'INTENT_IDENTIFICATION',
      message: `Intent identified: ${intent.category}`,
      details: intent.reasoning
    });

    this.reasoning.push({
      step: 'CLASSIFICATION_ASSIGNED',
      message: `Classification: ${classification.type}`,
      details: {
        primary: classification.type,
        confidence: classification.confidence,
        evidence: classification.evidence
      }
    });

    return {
      type: classification.type,
      confidence: classification.confidence,
      evidence: classification.evidence,
      directAnalysis: directResult,
      indirectAnalysis: indirectResult,
      intent: intent,
      reasoning: this.reasoning
    };
  }

  detectDirectAttack(input) {
    const result = {
      isAttack: false,
      severity: 0,
      matches: []
    };

    const lowerInput = input.toLowerCase();
    const normalizedInput = lowerInput.replace(/[^\w\s]/g, ' ');

    for (const keyword of this.patterns.DIRECT_KEYWORDS) {
      const normalizedKeyword = keyword.toLowerCase().replace(/[^\w\s]/g, ' ');
      if (normalizedInput.includes(normalizedKeyword)) {
        result.matches.push({
          pattern: keyword,
          type: 'direct_keyword',
          severity: this.calculateSeverity(keyword)
        });
      }
    }

    for (const pattern of this.patterns.INDIRECT_PATTERNS) {
      const matches = input.match(pattern.pattern);
      if (matches) {
        for (const match of matches) {
          result.matches.push({
            pattern: match,
            type: 'indirect_pattern',
            severity: pattern.severity
          });
        }
      }
    }

    for (const pattern of this.patterns.STRUCTURED_INJECTION) {
      const matches = input.match(pattern.pattern);
      if (matches) {
        for (const match of matches) {
          result.matches.push({
            pattern: match,
            type: 'structured_injection',
            severity: pattern.severity
          });
        }
      }
    }

    if (result.matches.length > 0) {
      result.isAttack = true;
      result.severity = result.matches.reduce((max, m) => Math.max(max, m.severity), 0);
      result.matches.sort((a, b) => b.severity - a.severity);
    }

    return result;
  }

  detectIndirectAttack(input) {
    const result = {
      isAttack: false,
      severity: 0,
      matches: [],
      suspiciousLines: []
    };

    const lines = input.split('\n');
    const suspiciousPatterns = [
      ...this.patterns.INDIRECT_PATTERNS,
      ...this.patterns.STRUCTURED_INJECTION
    ];

    lines.forEach((line, index) => {
      for (const pattern of suspiciousPatterns) {
        if (pattern.pattern.test(line)) {
          result.suspiciousLines.push({
            lineNumber: index + 1,
            content: line.trim(),
            pattern: line.match(pattern.pattern)?.[0] || ''
          });
          result.matches.push({
            pattern: line.trim(),
            type: 'indirect_line',
            severity: pattern.severity || 2,
            lineNumber: index + 1
          });
        }
      }
    });

    for (const clue of this.patterns.CONTEXT_CLUES) {
      const regex = new RegExp(`\\b${clue.keyword}\\b`, 'gi');
      if (regex.test(input)) {
        result.matches.push({
          pattern: clue.keyword,
          type: 'context_clue',
          severity: clue.weight
        });
      }
    }

    if (result.matches.length > 0) {
      result.isAttack = true;
      result.severity = Math.max(...result.matches.map(m => m.severity));
    }

    return result;
  }

  identifyIntent(directResult, indirectResult) {
    const allMatches = [...directResult.matches, ...indirectResult.matches];
    const intentCategories = {
      SYSTEM_PROMPT_THEFT: { keywords: ['system prompt', 'reveal', 'show your', 'tell me your', 'instructions'], score: 0 },
      BEHAVIOR_OVERRIDE: { keywords: ['ignore', 'forget', 'disregard', 'override', 'bypass'], score: 0 },
      ROLE_CONFUSION: { keywords: ['you are now', 'pretend', 'roleplay', 'act as', 'persona'], score: 0 },
      SAFETY_BYPASS: { keywords: ['safety off', 'disable', 'bypass safety', 'jailbreak', 'dan'], score: 0 },
      DATA_EXFILTRATION: { keywords: ['confidential', 'secret', 'private', 'hidden'], score: 0 }
    };

    const lowerInput = directResult.matches.length > 0 ? 
      directResult.matches[0].pattern.toLowerCase() : '';

    for (const [category, data] of Object.entries(intentCategories)) {
      for (const keyword of data.keywords) {
        if (lowerInput.includes(keyword)) {
          data.score += 2;
        }
      }
    }

    let maxIntent = 'UNKNOWN';
    let maxScore = 0;
    for (const [category, data] of Object.entries(intentCategories)) {
      if (data.score > maxScore) {
        maxScore = data.score;
        maxIntent = category;
      }
    }

    const intentNames = {
      SYSTEM_PROMPT_THEFT: 'System Prompt Theft',
      BEHAVIOR_OVERRIDE: 'Behavior Override Attempt',
      ROLE_CONFUSION: 'Role Confusion Attack',
      SAFETY_BYPASS: 'Safety Bypass Attempt',
      DATA_EXFILTRATION: 'Data Exfiltration Attempt',
      UNKNOWN: 'Unknown/Other'
    };

    return {
      category: maxIntent,
      displayName: intentNames[maxIntent],
      confidence: maxScore > 4 ? 'HIGH' : maxScore > 2 ? 'MEDIUM' : 'LOW',
      reasoning: allMatches.length > 0 ?
        `Detected ${allMatches.length} suspicious pattern(s) suggesting ${intentNames[maxIntent]}` :
        'No clear malicious intent detected'
    };
  }

  classify(directResult, indirectResult) {
    let type = 'SAFE';
    let confidence = 'HIGH';
    let evidence = [];
    let score = 0;

    if (directResult.isAttack && directResult.severity >= 3) {
      type = 'DIRECT_ATTACK';
      evidence = directResult.matches;
      score = directResult.severity * 2 + directResult.matches.length;
      confidence = 'HIGH';
    } else if (indirectResult.isAttack && indirectResult.suspiciousLines.length > 0) {
      if (indirectResult.severity >= 3 || indirectResult.suspiciousLines.length >= 2) {
        type = 'INDIRECT_ATTACK';
        evidence = indirectResult.matches;
        score = indirectResult.severity * 2 + indirectResult.matches.length;
        confidence = 'HIGH';
      } else {
        type = 'SUSPICIOUS';
        evidence = indirectResult.matches;
        score = indirectResult.severity + indirectResult.matches.length;
        confidence = 'MEDIUM';
      }
    } else if (indirectResult.matches.length > 0) {
      type = 'SUSPICIOUS';
      evidence = indirectResult.matches;
      score = indirectResult.matches.reduce((max, m) => Math.max(max, m.severity), 0);
      confidence = 'LOW';
    }

    return {
      type,
      confidence,
      evidence,
      rawScore: Math.min(score, 10)
    };
  }

  calculateSeverity(keyword) {
    const critical = ['ignore previous instructions', 'system prompt', 'reveal your system', 'bypass safety', 'jailbreak'];
    const high = ['ignore your instructions', 'forget your instructions', 'act as', 'disable safety'];
    const medium = ['ignore instructions', 'override your', 'new instructions'];

    const lowerKeyword = keyword.toLowerCase();
    if (critical.some(k => lowerKeyword.includes(k))) return 3;
    if (high.some(k => lowerKeyword.includes(k))) return 2;
    if (medium.some(k => lowerKeyword.includes(k))) return 1;
    return 1;
  }
}

export default new Detector();