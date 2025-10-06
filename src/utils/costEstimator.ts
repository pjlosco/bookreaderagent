/**
 * Cost estimation utilities for Google Cloud Text-to-Speech API
 * 
 * Pricing (as of 2024):
 * - Standard voices: $4.00 per 1 million characters
 * - Neural voices: $16.00 per 1 million characters
 * - First 1 million characters per month: FREE
 */

export interface CostEstimate {
  characterCount: number;
  estimatedCost: number;
  isWithinFreeTier: boolean;
  voiceType: 'standard' | 'neural';
}

export class CostEstimator {
  private static readonly STANDARD_RATE = 4.00; // per 1M characters
  private static readonly NEURAL_RATE = 16.00; // per 1M characters
  private static readonly FREE_TIER = 1000000; // 1M characters per month

  /**
   * Estimate cost for text-to-speech conversion
   */
  static estimateCost(text: string, voiceName: string = 'en-US-Standard-D'): CostEstimate {
    const characterCount = text.length;
    const isNeural = voiceName.includes('Wavenet') || voiceName.includes('Neural');
    const voiceType = isNeural ? 'neural' : 'standard';
    const rate = isNeural ? this.NEURAL_RATE : this.STANDARD_RATE;
    
    const estimatedCost = characterCount > this.FREE_TIER 
      ? ((characterCount - this.FREE_TIER) / 1000000) * rate
      : 0;

    return {
      characterCount,
      estimatedCost: Math.round(estimatedCost * 100) / 100, // Round to 2 decimal places
      isWithinFreeTier: characterCount <= this.FREE_TIER,
      voiceType
    };
  }

  /**
   * Get cost-friendly voice recommendations
   */
  static getCostFriendlyVoices(): Array<{name: string, description: string, cost: string}> {
    return [
      { name: 'en-US-Standard-A', description: 'Female, Standard', cost: '$4/1M chars' },
      { name: 'en-US-Standard-B', description: 'Male, Standard', cost: '$4/1M chars' },
      { name: 'en-US-Standard-C', description: 'Female, Standard', cost: '$4/1M chars' },
      { name: 'en-US-Standard-D', description: 'Male, Standard', cost: '$4/1M chars' },
      { name: 'en-US-Wavenet-A', description: 'Female, Neural (High Quality)', cost: '$16/1M chars' },
      { name: 'en-US-Wavenet-B', description: 'Male, Neural (High Quality)', cost: '$16/1M chars' },
      { name: 'en-US-Wavenet-C', description: 'Female, Neural (High Quality)', cost: '$16/1M chars' },
      { name: 'en-US-Wavenet-D', description: 'Male, Neural (High Quality)', cost: '$16/1M chars' }
    ];
  }

  /**
   * Format cost estimate for display
   */
  static formatCostEstimate(estimate: CostEstimate): string {
    if (estimate.isWithinFreeTier) {
      return `FREE (${estimate.characterCount.toLocaleString()} characters - within free tier)`;
    }
    
    return `$${estimate.estimatedCost} (${estimate.characterCount.toLocaleString()} characters, ${estimate.voiceType} voice)`;
  }
}

