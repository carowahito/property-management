/**
 * Sentiment Analysis Module
 * Analyze communications and tenant satisfaction
 */

import { getLLMService } from './llm-service';
import { SYSTEM_PROMPTS, SENTIMENT_PROMPTS } from './prompts';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface SentimentScore {
  score: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
  confidence: number;
  themes: string[];
  urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  suggestedResponse?: string;
  redFlags: string[];
}

export interface TenantSatisfaction {
  tenantId: string;
  tenantName: string;
  property: string;
  satisfactionScore: number;
  trend: 'IMPROVING' | 'DECLINING' | 'STABLE';
  keyDrivers: string[];
  concerns: string[];
  retentionRisk: 'LOW' | 'MEDIUM' | 'HIGH';
  recommendations: string[];
}

export interface PortfolioSentiment {
  overallScore: number;
  trend: string;
  breakdown: {
    positive: number;
    neutral: number;
    negative: number;
  };
  topConcerns: string[];
  propertiesNeedingAttention: string[];
}

export class SentimentAnalyzer {
  private llm = getLLMService();

  /**
   * Analyze sentiment of a single message
   */
  async analyzeMessage(messageId: string): Promise<SentimentScore> {
    try {
      const message = await prisma.message.findUnique({
        where: { id: messageId },
        include: {
          sentBy: true,
          property: true,
        },
      });

      if (!message) {
        throw new Error('Message not found');
      }

      const prompt = SENTIMENT_PROMPTS.ANALYZE_MESSAGE({
        from: message.sentBy.name || message.sentBy.email,
        to: message.stakeholderType,
        subject: message.subject,
        content: message.content,
        date: message.sentAt.toISOString(),
      });

      const response = await this.llm.generateCompletion(
        prompt,
        SYSTEM_PROMPTS.SENTIMENT_ANALYST
      );

      return this.parseSentimentScore(response.content);
    } catch (error) {
      console.error('Error analyzing message sentiment:', error);
      return this.getDefaultSentiment();
    }
  }

  /**
   * Analyze tenant satisfaction based on communication history
   */
  async analyzeTenantSatisfaction(tenantId: string): Promise<TenantSatisfaction> {
    try {
      const tenant = await prisma.tenant.findUnique({
        where: { id: tenantId },
        include: {
          property: true,
          messages: {
            orderBy: { sentAt: 'desc' },
            take: 10,
          },
          maintenanceRequests: {
            orderBy: { createdAt: 'desc' },
            take: 5,
          },
        },
      });

      if (!tenant) {
        throw new Error('Tenant not found');
      }

      // Analyze sentiment of recent communications
      const sentiments = await Promise.all(
        tenant.messages.slice(0, 5).map((msg) => this.quickSentiment(msg.content))
      );

      const avgSentiment =
        sentiments.reduce((sum, s) => sum + s, 0) / (sentiments.length || 1);

      // Convert to 0-100 scale
      const satisfactionScore = Math.round(((avgSentiment + 1) / 2) * 100);

      // Determine trend (simplified)
      const recentSentiments = sentiments.slice(0, 3);
      const olderSentiments = sentiments.slice(3);

      const recentAvg =
        recentSentiments.reduce((sum, s) => sum + s, 0) / (recentSentiments.length || 1);
      const olderAvg =
        olderSentiments.reduce((sum, s) => sum + s, 0) / (olderSentiments.length || 1);

      let trend: 'IMPROVING' | 'DECLINING' | 'STABLE' = 'STABLE';
      if (recentAvg > olderAvg + 0.2) trend = 'IMPROVING';
      else if (recentAvg < olderAvg - 0.2) trend = 'DECLINING';

      // Determine retention risk
      let retentionRisk: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
      if (satisfactionScore < 60) retentionRisk = 'HIGH';
      else if (satisfactionScore < 75) retentionRisk = 'MEDIUM';

      // Analyze maintenance requests for concerns
      const maintenanceConcerns = tenant.maintenanceRequests
        .filter((mr) => mr.priority === 'HIGH' || mr.priority === 'URGENT')
        .map((mr) => mr.title);

      return {
        tenantId: tenant.id,
        tenantName: tenant.name,
        property: tenant.property.name,
        satisfactionScore,
        trend,
        keyDrivers: this.identifyDrivers(tenant.messages, 'positive'),
        concerns: maintenanceConcerns.length > 0
          ? maintenanceConcerns
          : this.identifyDrivers(tenant.messages, 'negative'),
        retentionRisk,
        recommendations: this.generateRecommendations(satisfactionScore, trend, retentionRisk),
      };
    } catch (error) {
      console.error('Error analyzing tenant satisfaction:', error);
      throw error;
    }
  }

  /**
   * Analyze overall portfolio sentiment
   */
  async analyzePortfolioSentiment(): Promise<PortfolioSentiment> {
    try {
      // Get all recent communications
      const recentMessages = await prisma.message.findMany({
        where: {
          sentAt: {
            gte: new Date(new Date().setMonth(new Date().getMonth() - 1)),
          },
        },
        include: {
          property: true,
        },
        take: 100,
      });

      // Analyze sentiment for each message
      const sentiments = await Promise.all(
        recentMessages.map((msg) => this.quickSentiment(msg.content))
      );

      const positive = sentiments.filter((s) => s > 0.3).length;
      const negative = sentiments.filter((s) => s < -0.3).length;
      const neutral = sentiments.length - positive - negative;

      const avgSentiment = sentiments.reduce((sum, s) => sum + s, 0) / (sentiments.length || 1);
      const overallScore = Math.round(((avgSentiment + 1) / 2) * 100);

      // Identify properties with low sentiment
      const propertyMessages = new Map<string, number[]>();
      recentMessages.forEach((msg, idx) => {
        if (msg.property) {
          if (!propertyMessages.has(msg.property.name)) {
            propertyMessages.set(msg.property.name, []);
          }
          propertyMessages.get(msg.property.name)!.push(sentiments[idx]);
        }
      });

      const propertiesNeedingAttention: string[] = [];
      propertyMessages.forEach((scores, propertyName) => {
        const avg = scores.reduce((sum, s) => sum + s, 0) / scores.length;
        if (avg < -0.2) {
          propertiesNeedingAttention.push(propertyName);
        }
      });

      // Identify top concerns from negative messages
      const negativeMsgs = recentMessages.filter((_, idx) => sentiments[idx] < -0.3);
      const topConcerns = this.extractTopConcerns(negativeMsgs);

      return {
        overallScore,
        trend: overallScore >= 75 ? '↑ Positive' : overallScore >= 60 ? '→ Stable' : '↓ Needs Attention',
        breakdown: {
          positive: Math.round((positive / sentiments.length) * 100),
          neutral: Math.round((neutral / sentiments.length) * 100),
          negative: Math.round((negative / sentiments.length) * 100),
        },
        topConcerns,
        propertiesNeedingAttention,
      };
    } catch (error) {
      console.error('Error analyzing portfolio sentiment:', error);
      return {
        overallScore: 75,
        trend: 'Stable',
        breakdown: { positive: 70, neutral: 20, negative: 10 },
        topConcerns: [],
        propertiesNeedingAttention: [],
      };
    }
  }

  /**
   * Quick sentiment analysis using keyword matching
   */
  private quickSentiment(text: string): number {
    const positive = [
      'thank', 'great', 'excellent', 'happy', 'satisfied', 'appreciate', 'good',
      'wonderful', 'fantastic', 'amazing', 'love', 'perfect', 'pleased',
    ];

    const negative = [
      'problem', 'issue', 'broken', 'complaint', 'unhappy', 'dissatisfied',
      'poor', 'terrible', 'awful', 'bad', 'urgent', 'unacceptable', 'disappointed',
      'angry', 'frustrated', 'delayed', 'never', 'still', 'again',
    ];

    const lowerText = text.toLowerCase();
    let score = 0;

    positive.forEach((word) => {
      if (lowerText.includes(word)) score += 0.2;
    });

    negative.forEach((word) => {
      if (lowerText.includes(word)) score -= 0.2;
    });

    return Math.max(-1, Math.min(1, score));
  }

  /**
   * Parse sentiment score from AI response
   */
  private parseSentimentScore(content: string): SentimentScore {
    const lower = content.toLowerCase();

    let score: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE' = 'NEUTRAL';
    if (lower.includes('positive')) score = 'POSITIVE';
    else if (lower.includes('negative')) score = 'NEGATIVE';

    let urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' = 'LOW';
    if (lower.includes('urgent')) urgency = 'URGENT';
    else if (lower.includes('high')) urgency = 'HIGH';
    else if (lower.includes('medium')) urgency = 'MEDIUM';

    // Extract confidence percentage
    const confidenceMatch = content.match(/(\d+)%/);
    const confidence = confidenceMatch ? parseInt(confidenceMatch[1]) : 80;

    return {
      score,
      confidence,
      themes: [],
      urgency,
      redFlags: lower.includes('red flag') || lower.includes('concern') ? ['Requires attention'] : [],
    };
  }

  /**
   * Identify key satisfaction drivers
   */
  private identifyDrivers(messages: any[], type: 'positive' | 'negative'): string[] {
    const keywords = type === 'positive'
      ? ['maintenance', 'responsive', 'clean', 'professional']
      : ['delay', 'noise', 'repair', 'communication'];

    const drivers: string[] = [];
    messages.forEach((msg) => {
      keywords.forEach((keyword) => {
        if (msg.content.toLowerCase().includes(keyword) && !drivers.includes(keyword)) {
          drivers.push(keyword);
        }
      });
    });

    return drivers.slice(0, 3);
  }

  /**
   * Extract top concerns from messages
   */
  private extractTopConcerns(messages: any[]): string[] {
    const concernKeywords = ['maintenance', 'repair', 'noise', 'parking', 'payment', 'lease'];
    const concerns = new Map<string, number>();

    messages.forEach((msg) => {
      concernKeywords.forEach((keyword) => {
        if (msg.content.toLowerCase().includes(keyword)) {
          concerns.set(keyword, (concerns.get(keyword) || 0) + 1);
        }
      });
    });

    return Array.from(concerns.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map((e) => e[0]);
  }

  /**
   * Generate recommendations based on satisfaction metrics
   */
  private generateRecommendations(
    score: number,
    trend: string,
    risk: string
  ): string[] {
    const recommendations: string[] = [];

    if (score < 60) {
      recommendations.push('Schedule immediate check-in meeting');
      recommendations.push('Address any outstanding maintenance issues');
    }

    if (trend === 'DECLINING') {
      recommendations.push('Investigate recent changes or issues');
      recommendations.push('Increase communication frequency');
    }

    if (risk === 'HIGH') {
      recommendations.push('Develop retention strategy');
      recommendations.push('Consider lease renewal incentives');
    }

    if (recommendations.length === 0) {
      recommendations.push('Maintain regular communication');
      recommendations.push('Continue current service level');
    }

    return recommendations;
  }

  /**
   * Default sentiment when analysis fails
   */
  private getDefaultSentiment(): SentimentScore {
    return {
      score: 'NEUTRAL',
      confidence: 50,
      themes: [],
      urgency: 'LOW',
      redFlags: [],
    };
  }
}

// Singleton instance
let sentimentAnalyzerInstance: SentimentAnalyzer | null = null;

export function getSentimentAnalyzer(): SentimentAnalyzer {
  if (!sentimentAnalyzerInstance) {
    sentimentAnalyzerInstance = new SentimentAnalyzer();
  }
  return sentimentAnalyzerInstance;
}
