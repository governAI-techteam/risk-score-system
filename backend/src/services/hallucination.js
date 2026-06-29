import ATTACK_PATTERNS from '../utils/patterns.js';

class HallucinationDetector {
  constructor() {
    this.patterns = ATTACK_PATTERNS;
  }

  analyze(response) {
    const claims = this.extractClaims(response);
    const evaluation = this.internalReevaluation(claims, response);
    const confidence = this.calculateConfidence(evaluation, claims);
    const reasoning = this.generateReasoning(evaluation, claims, response);

    return {
      claims: claims,
      evaluation: evaluation,
      confidence: confidence,
      reasoning: reasoning,
      indicators: this.identifyIndicators(response)
    };
  }

  extractClaims(response) {
    const claims = [];
    const sentences = response.split(/[.!?]+/).filter(s => s.trim().length > 10);

    const claimIndicators = [
      /\b(is|are|was|were|will be|can be|cannot be)\b/i,
      /\b(fact|proven|true|false)\b/i,
      /\b(always|never|everyone|nobody)\b/i,
      /\b(study|research|evidence|shows|demonstrates)\b/i,
      /\b(percent|%|percentage|rate)\b/i,
      /\b(all|most|some|few|none)\b/i
    ];

    for (const sentence of sentences) {
      const trimmed = sentence.trim();
      if (trimmed.length < 15) continue;

      let isClaim = false;
      let claimType = 'statement';

      for (const indicator of claimIndicators) {
        if (indicator.test(trimmed)) {
          isClaim = true;
          if (indicator.toString().includes('percent')) claimType = 'statistical';
          else if (indicator.toString().includes('study')) claimType = 'research';
          else if (indicator.toString().includes('always') || indicator.toString().includes('never')) claimType = 'absolute';
          break;
        }
      }

      if (isClaim) {
        claims.push({
          text: trimmed,
          type: claimType,
          length: trimmed.length,
          wordCount: trimmed.split(/\s+/).length
        });
      }
    }

    if (claims.length === 0) {
      claims.push({
        text: response.substring(0, 100) + '...',
        type: 'general',
        length: response.length,
        wordCount: response.split(/\s+/).length
      });
    }

    return claims;
  }

  internalReevaluation(claims, response) {
    const evaluation = {
      logicalConsistency: this.checkLogicalConsistency(claims),
      contradictions: this.detectContradictions(claims),
      clarity: this.assessClarity(response),
      specificity: this.assessSpecificity(claims),
      sourceAttribution: this.checkSourceAttribution(claims),
      overallScore: 0
    };

    const scores = [
      evaluation.logicalConsistency.score,
      evaluation.clarity.score,
      evaluation.specificity.score,
      evaluation.sourceAttribution.score
    ];

    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    evaluation.overallScore = Math.round(avgScore);

    return evaluation;
  }

  checkLogicalConsistency(claims) {
    let score = 7;
    const issues = [];

    const absoluteClaims = claims.filter(c => c.type === 'absolute');
    if (absoluteClaims.length > 2) {
      score -= 2;
      issues.push('Multiple absolute claims detected');
    }

    const longClaims = claims.filter(c => c.wordCount > 50);
    if (longClaims.length > claims.length * 0.5) {
      score -= 1;
      issues.push('Excessive verbosity may indicate unclear reasoning');
    }

    return {
      score: Math.max(1, Math.min(10, score)),
      issues: issues,
      assessment: score >= 7 ? 'Consistent' : score >= 4 ? 'Some concerns' : 'Likely inconsistent'
    };
  }

  detectContradictions(claims) {
    const contradictions = [];

    const positiveNegative = [
      { pos: 'can', neg: 'cannot' },
      { pos: 'is', neg: 'is not' },
      { pos: 'will', neg: 'will not' },
      { pos: 'always', neg: 'never' }
    ];

    for (let i = 0; i < claims.length; i++) {
      for (let j = i + 1; j < claims.length; j++) {
        const claim1 = claims[i].text.toLowerCase();
        const claim2 = claims[j].text.toLowerCase();

        for (const pair of positiveNegative) {
          if (claim1.includes(pair.pos) && claim2.includes(pair.neg)) {
            contradictions.push({
              claim1: claims[i].text.substring(0, 50),
              claim2: claims[j].text.substring(0, 50),
              conflict: `${pair.pos} vs ${pair.neg}`
            });
          }
        }
      }
    }

    return {
      found: contradictions.length > 0,
      count: contradictions.length,
      examples: contradictions.slice(0, 3)
    };
  }

  assessClarity(response) {
    let score = 7;
    const issues = [];

    const avgWordLength = response.split(/\s+/).reduce((sum, word) => sum + word.length, 0) / response.split(/\s+/).length;
    if (avgWordLength > 8) {
      score -= 1;
      issues.push('Complex vocabulary may reduce clarity');
    }

    const hasStructure = /^\d+\.|\•|first|second|finally/i.test(response);
    if (!hasStructure) {
      score -= 0.5;
    }

    const paragraphs = response.split(/\n\n+/).filter(p => p.trim().length > 0);
    if (paragraphs.length > 1) {
      score += 1;
    }

    return {
      score: Math.max(1, Math.min(10, Math.round(score))),
      issues: issues,
      assessment: score >= 7 ? 'Clear and well-structured' : score >= 4 ? 'Moderately clear' : 'Lacks clarity'
    };
  }

  assessSpecificity(claims) {
    let score = 5;

    const specificIndicators = /\b\d+(%|percent|years|people|million|billion)\b/i;
    const vagueIndicators = /\b(some|often|sometimes|usually|generally)\b/i;

    const specificCount = claims.filter(c => specificIndicators.test(c.text)).length;
    const vagueCount = claims.filter(c => vagueIndicators.test(c.text)).length;

    score += specificCount * 0.5;
    score -= vagueCount * 0.5;

    return {
      score: Math.max(1, Math.min(10, Math.round(score))),
      assessment: score >= 7 ? 'Specific and concrete' : score >= 4 ? 'Moderately specific' : 'Vague or general'
    };
  }

  checkSourceAttribution(claims) {
    let score = 5;

    const hasSources = /\b(study|research|studies|research|according to|source|journal|report)\b/i.test(
      claims.map(c => c.text).join(' ')
    );

    const hasDates = /\b(20\d{2}|20\d{2}s|recent|latest|current)\b/i.test(
      claims.map(c => c.text).join(' ')
    );

    if (hasSources) score += 2;
    if (hasDates) score += 1;

    return {
      score: Math.max(1, Math.min(10, score)),
      hasSources: hasSources,
      hasDates: hasDates,
      assessment: hasSources ? 'Properly attributed' : 'Lacks source attribution'
    };
  }

  calculateConfidence(evaluation, claims) {
    let confidenceScore = evaluation.overallScore;
    let level = 'LOW';

    if (confidenceScore >= 7) level = 'HIGH';
    else if (confidenceScore >= 5) level = 'MEDIUM';

    if (claims.length < 2) {
      confidenceScore -= 1;
      if (confidenceScore >= 7) level = 'HIGH';
      else if (confidenceScore >= 5) level = 'MEDIUM';
      else level = 'LOW';
    }

    if (evaluation.contradictions.found) {
      confidenceScore -= 2;
      level = 'LOW';
    }

    return {
      level: level,
      score: Math.max(1, Math.min(10, confidenceScore)),
      factors: this.getConfidenceFactors(evaluation, claims)
    };
  }

  getConfidenceFactors(evaluation, claims) {
    const factors = [];

    factors.push({
      factor: 'Logical Consistency',
      impact: evaluation.logicalConsistency.score >= 7 ? 'positive' : 'negative',
      description: evaluation.logicalConsistency.assessment
    });

    factors.push({
      factor: 'Clarity',
      impact: evaluation.clarity.score >= 7 ? 'positive' : 'negative',
      description: evaluation.clarity.assessment
    });

    factors.push({
      factor: 'Specificity',
      impact: evaluation.specificity.score >= 6 ? 'positive' : 'negative',
      description: evaluation.specificity.assessment
    });

    factors.push({
      factor: 'Source Attribution',
      impact: evaluation.sourceAttribution.score >= 6 ? 'positive' : 'negative',
      description: evaluation.sourceAttribution.assessment
    });

    return factors;
  }

  identifyIndicators(response) {
    const indicators = [];

    for (const pattern of this.patterns.HALLUCINATION_INDICATORS) {
      const matches = response.match(pattern.pattern);
      if (matches) {
        indicators.push({
          type: pattern.type,
          matches: matches.length,
          examples: matches.slice(0, 2),
          severity: this.getIndicatorSeverity(pattern.type)
        });
      }
    }

    return indicators;
  }

  getIndicatorSeverity(type) {
    const severityMap = {
      absolute_certainty: 'medium',
      absolute_accuracy: 'high',
      unproven_fact: 'medium',
      unproven_science: 'high',
      unsourced_studies: 'medium',
      unsourced_research: 'medium',
      unsourced_sources: 'medium',
      unfounded_assertion: 'medium',
      absolute_claim: 'high',
      absolute_definite: 'medium'
    };
    return severityMap[type] || 'low';
  }

  generateReasoning(evaluation, claims, response) {
    const confidence = evaluation.overallScore;

    let reason = '';
    if (confidence >= 8) {
      reason = 'Response demonstrates strong logical consistency, clear structure, and proper source attribution. Claims are well-supported and specific.';
    } else if (confidence >= 6) {
      reason = 'Response shows moderate quality but has some areas of concern. Consider verifying critical information from external sources.';
    } else if (confidence >= 4) {
      reason = 'Response contains notable issues including vague statements, lack of sources, or potential logical inconsistencies. Exercise caution.';
    } else {
      reason = 'Response shows significant weaknesses including possible contradictions, lack of specificity, or unverified claims. Recommend thorough verification.';
    }

    let interpretation = '';
    if (evaluation.overallScore >= 7) {
      interpretation = 'Output is usable with high confidence. The response appears reliable for general informational purposes, though critical applications should still verify key facts.';
    } else if (evaluation.overallScore >= 5) {
      interpretation = 'Output is usable but should be verified. The response may contain inaccuracies or unverified claims. Cross-reference with reliable sources for important decisions.';
    } else {
      interpretation = 'Output should be used with caution. Significant concerns about accuracy and reliability suggest manual verification is essential before acting on this information.';
    }

    if (evaluation.contradictions.found) {
      interpretation += ' Additionally, potential contradictions were detected which further reduce reliability.';
    }

    return {
      reason: reason,
      interpretation: interpretation,
      claimCount: claims.length,
      overallScore: evaluation.overallScore
    };
  }
}

export default new HallucinationDetector();