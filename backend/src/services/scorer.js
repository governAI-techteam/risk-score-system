import ATTACK_PATTERNS from '../utils/patterns.js';

class Scorer {
  constructor() {
    this.patterns = ATTACK_PATTERNS;
    this.thresholds = {
      safe: 3,
      suspicious: 6,
      malicious: 10
    };
  }

  calculateScore(analysis) {
    let score = 0;
    const factors = [];

    if (analysis.type === 'DIRECT_ATTACK') {
      score += 4;
      factors.push({ factor: 'direct_attack', weight: 4, reason: 'Direct prompt injection detected' });
    }

    if (analysis.type === 'INDIRECT_ATTACK') {
      score += 3;
      factors.push({ factor: 'indirect_attack', weight: 3, reason: 'Indirect prompt injection detected' });
    }

    if (analysis.type === 'SUSPICIOUS') {
      score += 1;
      factors.push({ factor: 'suspicious_content', weight: 1, reason: 'Suspicious patterns found' });
    }

    for (const match of analysis.evidence) {
      const baseScore = Math.min(match.severity || 1, 3);
      const multiplier = this.getSeverityMultiplier(match.type);
      const points = baseScore * multiplier;
      score += points;
      factors.push({
        factor: match.pattern.substring(0, 30),
        weight: points,
        reason: `${match.type}: "${match.pattern.substring(0, 50)}${match.pattern.length > 50 ? '...' : ''}"`
      });
    }

    const intentBoost = this.getIntentBoost(analysis.intent);
    if (intentBoost > 0) {
      score += intentBoost;
      factors.push({ factor: 'intent', weight: intentBoost, reason: `${analysis.intent.category} intent` });
    }

    const confidence = this.getConfidenceAdjustment(analysis);
    score *= confidence.multiplier;

    score = Math.min(Math.max(score, 0), 10);

    return {
      score: Math.round(score),
      riskLevel: this.getRiskLevel(score),
      action: this.getRecommendedAction(score),
      factors: factors.sort((a, b) => b.weight - a.weight),
      confidence: confidence
    };
  }

  getSeverityMultiplier(type) {
    const multipliers = {
      direct_keyword: 1.5,
      indirect_pattern: 1.2,
      structured_injection: 1.5,
      indirect_line: 1.3,
      context_clue: 0.5
    };
    return multipliers[type] || 1;
  }

  getIntentBoost(intent) {
    if (intent.confidence === 'HIGH') return 2;
    if (intent.confidence === 'MEDIUM') return 1;
    return 0;
  }

  getConfidenceAdjustment(analysis) {
    const evidenceCount = analysis.evidence.length;
    const analysisConfidence = analysis.confidence;

    if (analysisConfidence === 'HIGH' && evidenceCount >= 2) {
      return { level: 'HIGH', multiplier: 1.0, reason: 'Multiple high-confidence matches' };
    }
    if (analysisConfidence === 'HIGH' || evidenceCount >= 1) {
      return { level: 'MEDIUM', multiplier: 0.9, reason: 'Sufficient evidence for confident assessment' };
    }
    if (evidenceCount >= 2) {
      return { level: 'MEDIUM', multiplier: 0.8, reason: 'Multiple lower-confidence matches' };
    }
    return { level: 'LOW', multiplier: 0.7, reason: 'Limited evidence available' };
  }

  getRiskLevel(score) {
    if (score <= this.thresholds.safe) return 'SAFE';
    if (score <= this.thresholds.suspicious) return 'SUSPICIOUS';
    return 'MALICIOUS';
  }

  getRecommendedAction(score) {
    if (score <= this.thresholds.safe) return 'ALLOW';
    if (score <= this.thresholds.suspicious) return 'SANITIZE';
    return 'BLOCK';
  }

  explainScore(result) {
    const explanations = {
      SAFE: 'Input appears to be a normal, safe query with no detected threats.',
      SUSPICIOUS: 'Input contains some suspicious patterns that may require attention before processing.',
      MALICIOUS: 'Input contains clear indicators of a prompt injection attack. Recommended action: BLOCK.'
    };

    return {
      levelExplanation: explanations[result.riskLevel],
      actionExplanation: this.getActionExplanation(result.action),
      riskBreakdown: this.formatRiskBreakdown(result)
    };
  }

  getActionExplanation(action) {
    const explanations = {
      ALLOW: 'Input has been approved for processing by the LLM without modifications.',
      SANITIZE: 'Input has been modified to remove potentially malicious content while preserving safe parts.',
      BLOCK: 'Input has been blocked and will not be processed. No response will be generated from this input.'
    };
    return explanations[action];
  }

  formatRiskBreakdown(result) {
    return result.factors.slice(0, 5).map(f => ({
      component: f.factor,
      contribution: f.weight,
      reason: f.reason
    }));
  }
}

export default new Scorer();