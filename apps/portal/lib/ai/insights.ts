/**
 * AI Insights Generator
 * Generates intelligent insights from property management data
 */

import { getLLMService } from './llm-service';
import { SYSTEM_PROMPTS, INSIGHTS_PROMPTS } from './prompts';
import { DataAnalyzer, PortfolioStats, PropertyPerformance } from './data-analyzer';

export interface ExecutiveInsight {
  summary: string;
  highlights: string[];
  concerns: string[];
  recommendations: string[];
  generated: Date;
}

export interface PropertyInsight {
  propertyId: string;
  propertyName: string;
  assessment: string;
  strengths: string[];
  improvements: string[];
  recommendations: string[];
}

export class InsightsGenerator {
  private llm = getLLMService();

  /**
   * Generate executive dashboard insights
   */
  async generateExecutiveInsights(): Promise<ExecutiveInsight> {
    try {
      const stats = await DataAnalyzer.getPortfolioStats();
      const properties = await DataAnalyzer.getPropertyPerformance();

      const prompt = INSIGHTS_PROMPTS.EXECUTIVE_SUMMARY({
        ...stats,
        properties: properties.slice(0, 5), // Top 5 properties
      });

      const response = await this.llm.generateCompletion(
        prompt,
        SYSTEM_PROMPTS.PROPERTY_ANALYST
      );

      // Parse the response to extract structured insights
      const parsed = this.parseExecutiveInsights(response.content);

      return {
        ...parsed,
        generated: new Date(),
      };
    } catch (error) {
      console.error('Error generating executive insights:', error);
      return this.getFallbackExecutiveInsights();
    }
  }

  /**
   * Generate insights for a specific property
   */
  async generatePropertyInsights(propertyId: string): Promise<PropertyInsight> {
    try {
      const properties = await DataAnalyzer.getPropertyPerformance();
      const propertyData = properties.find((p) => p.id === propertyId);

      if (!propertyData) {
        throw new Error('Property not found');
      }

      const prompt = INSIGHTS_PROMPTS.PROPERTY_INSIGHTS(propertyData);

      const response = await this.llm.generateCompletion(
        prompt,
        SYSTEM_PROMPTS.PROPERTY_ANALYST
      );

      const parsed = this.parsePropertyInsights(response.content);

      return {
        propertyId,
        propertyName: propertyData.name,
        ...parsed,
      };
    } catch (error) {
      console.error('Error generating property insights:', error);
      throw error;
    }
  }

  /**
   * Generate trend analysis insights
   */
  async generateTrendInsights(months: number = 6): Promise<string> {
    try {
      const trendData = await DataAnalyzer.getTimeSeriesData(months);

      const prompt = INSIGHTS_PROMPTS.TREND_ANALYSIS({
        revenue: trendData.map((d) => ({ month: d.month, amount: d.revenue })),
        occupancy: trendData.map((d) => ({ month: d.month, rate: d.occupancy })),
        maintenance: trendData.map((d) => ({ month: d.month, cost: d.expenses })),
      });

      const response = await this.llm.generateCompletion(
        prompt,
        SYSTEM_PROMPTS.PROPERTY_ANALYST
      );

      return response.content;
    } catch (error) {
      console.error('Error generating trend insights:', error);
      return 'Unable to generate trend insights at this time.';
    }
  }

  /**
   * Generate comparative analysis
   */
  async generateComparativeAnalysis(): Promise<string> {
    try {
      const properties = await DataAnalyzer.getPropertyPerformance();

      const avgOccupancy =
        properties.reduce((sum, p) => sum + p.occupancy, 0) / properties.length;
      const avgRevenuePerUnit =
        properties.reduce((sum, p) => sum + p.revenuePerUnit, 0) / properties.length;

      const prompt = INSIGHTS_PROMPTS.COMPARATIVE_ANALYSIS({
        properties,
        avgOccupancy: avgOccupancy.toFixed(1),
        avgRevenuePerUnit: avgRevenuePerUnit.toFixed(0),
      });

      const response = await this.llm.generateCompletion(
        prompt,
        SYSTEM_PROMPTS.PROPERTY_ANALYST
      );

      return response.content;
    } catch (error) {
      console.error('Error generating comparative analysis:', error);
      return 'Unable to generate comparative analysis at this time.';
    }
  }

  /**
   * Parse executive insights from AI response
   */
  private parseExecutiveInsights(content: string): Omit<ExecutiveInsight, 'generated'> {
    const lines = content.split('\n').filter((line) => line.trim());

    let summary = '';
    const highlights: string[] = [];
    const concerns: string[] = [];
    const recommendations: string[] = [];

    let currentSection = 'summary';

    for (const line of lines) {
      const lower = line.toLowerCase();

      if (lower.includes('highlight') || lower.includes('achievement')) {
        currentSection = 'highlights';
        continue;
      } else if (lower.includes('concern') || lower.includes('attention')) {
        currentSection = 'concerns';
        continue;
      } else if (lower.includes('recommendation') || lower.includes('action')) {
        currentSection = 'recommendations';
        continue;
      }

      const cleaned = line.replace(/^[\d\.\-\*\•]+\s*/, '').trim();
      if (!cleaned) continue;

      if (currentSection === 'summary' && !summary) {
        summary = cleaned;
      } else if (currentSection === 'highlights' && cleaned) {
        highlights.push(cleaned);
      } else if (currentSection === 'concerns' && cleaned) {
        concerns.push(cleaned);
      } else if (currentSection === 'recommendations' && cleaned) {
        recommendations.push(cleaned);
      }
    }

    return {
      summary: summary || 'Your portfolio is performing within expected parameters.',
      highlights: highlights.length > 0 ? highlights : ['Stable occupancy rates', 'Consistent revenue'],
      concerns: concerns.length > 0 ? concerns : ['No major concerns identified'],
      recommendations: recommendations.length > 0 ? recommendations : ['Continue monitoring key metrics'],
    };
  }

  /**
   * Parse property insights from AI response
   */
  private parsePropertyInsights(content: string): Omit<PropertyInsight, 'propertyId' | 'propertyName'> {
    const lines = content.split('\n').filter((line) => line.trim());

    let assessment = 'Good';
    const strengths: string[] = [];
    const improvements: string[] = [];
    const recommendations: string[] = [];

    let currentSection = '';

    for (const line of lines) {
      const lower = line.toLowerCase();

      if (lower.includes('assessment') || lower.includes('performance')) {
        if (lower.includes('excellent')) assessment = 'Excellent';
        else if (lower.includes('good')) assessment = 'Good';
        else if (lower.includes('fair')) assessment = 'Fair';
        else if (lower.includes('poor')) assessment = 'Poor';
        continue;
      } else if (lower.includes('strength')) {
        currentSection = 'strengths';
        continue;
      } else if (lower.includes('improvement') || lower.includes('concern')) {
        currentSection = 'improvements';
        continue;
      } else if (lower.includes('recommendation')) {
        currentSection = 'recommendations';
        continue;
      }

      const cleaned = line.replace(/^[\d\.\-\*\•]+\s*/, '').trim();
      if (!cleaned) continue;

      if (currentSection === 'strengths') {
        strengths.push(cleaned);
      } else if (currentSection === 'improvements') {
        improvements.push(cleaned);
      } else if (currentSection === 'recommendations') {
        recommendations.push(cleaned);
      }
    }

    return {
      assessment,
      strengths: strengths.length > 0 ? strengths : ['Operational stability'],
      improvements: improvements.length > 0 ? improvements : ['Continue current practices'],
      recommendations: recommendations.length > 0 ? recommendations : ['Monitor ongoing performance'],
    };
  }

  /**
   * Fallback insights when AI is unavailable
   */
  private getFallbackExecutiveInsights(): ExecutiveInsight {
    return {
      summary: 'Your portfolio is operational. AI insights are temporarily unavailable.',
      highlights: [
        'Properties are actively managed',
        'Monitoring systems are functional',
      ],
      concerns: [
        'AI analysis service is currently unavailable',
      ],
      recommendations: [
        'Configure LLM API settings to enable AI insights',
        'Review manual analytics dashboard for current metrics',
      ],
      generated: new Date(),
    };
  }
}

// Singleton instance
let insightsGeneratorInstance: InsightsGenerator | null = null;

export function getInsightsGenerator(): InsightsGenerator {
  if (!insightsGeneratorInstance) {
    insightsGeneratorInstance = new InsightsGenerator();
  }
  return insightsGeneratorInstance;
}
