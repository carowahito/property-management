/**
 * LLM Service - Wrapper for Large Language Model API calls
 * Supports multiple providers: OpenAI, Anthropic, Google, etc.
 */

interface LLMSettings {
  provider: string;
  apiKey: string;
  apiEndpoint?: string;
  model: string;
  temperature?: number;
  maxTokens?: number;
}

interface LLMResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export class LLMService {
  private settings: LLMSettings;

  constructor(settings?: LLMSettings) {
    // Default to OpenAI if no settings provided
    this.settings = settings || {
      provider: process.env.LLM_PROVIDER || 'openai',
      apiKey: process.env.LLM_API_KEY || '',
      model: process.env.LLM_MODEL || 'gpt-4',
      temperature: parseFloat(process.env.LLM_TEMPERATURE || '0.7'),
      maxTokens: parseInt(process.env.LLM_MAX_TOKENS || '2000'),
    };
  }

  /**
   * Generate completion from LLM
   */
  async generateCompletion(prompt: string, systemPrompt?: string): Promise<LLMResponse> {
    if (!this.settings.apiKey) {
      // Return mock response if no API key configured
      return this.getMockResponse(prompt);
    }

    try {
      switch (this.settings.provider) {
        case 'openai':
          return await this.callOpenAI(prompt, systemPrompt);
        case 'anthropic':
          return await this.callAnthropic(prompt, systemPrompt);
        case 'google':
          return await this.callGoogle(prompt, systemPrompt);
        default:
          return await this.callCustomProvider(prompt, systemPrompt);
      }
    } catch (error) {
      console.error('LLM API Error:', error);
      // Fallback to mock response on error
      return this.getMockResponse(prompt);
    }
  }

  /**
   * Call OpenAI API
   */
  private async callOpenAI(prompt: string, systemPrompt?: string): Promise<LLMResponse> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.settings.apiKey}`,
      },
      body: JSON.stringify({
        model: this.settings.model,
        messages: [
          ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
          { role: 'user', content: prompt },
        ],
        temperature: this.settings.temperature,
        max_tokens: this.settings.maxTokens,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      content: data.choices[0].message.content,
      usage: {
        promptTokens: data.usage.prompt_tokens,
        completionTokens: data.usage.completion_tokens,
        totalTokens: data.usage.total_tokens,
      },
    };
  }

  /**
   * Call Anthropic (Claude) API
   */
  private async callAnthropic(prompt: string, systemPrompt?: string): Promise<LLMResponse> {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.settings.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: this.settings.model,
        max_tokens: this.settings.maxTokens,
        temperature: this.settings.temperature,
        system: systemPrompt,
        messages: [
          { role: 'user', content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      content: data.content[0].text,
      usage: {
        promptTokens: data.usage.input_tokens,
        completionTokens: data.usage.output_tokens,
        totalTokens: data.usage.input_tokens + data.usage.output_tokens,
      },
    };
  }

  /**
   * Call Google (Gemini) API
   */
  private async callGoogle(prompt: string, systemPrompt?: string): Promise<LLMResponse> {
    const fullPrompt = systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt;
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/${this.settings.model}:generateContent?key=${this.settings.apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: fullPrompt }] }],
          generationConfig: {
            temperature: this.settings.temperature,
            maxOutputTokens: this.settings.maxTokens,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Google API error: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      content: data.candidates[0].content.parts[0].text,
    };
  }

  /**
   * Call custom provider API
   */
  private async callCustomProvider(prompt: string, systemPrompt?: string): Promise<LLMResponse> {
    if (!this.settings.apiEndpoint) {
      throw new Error('Custom provider requires apiEndpoint');
    }

    const response = await fetch(this.settings.apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.settings.apiKey}`,
      },
      body: JSON.stringify({
        prompt,
        systemPrompt,
        model: this.settings.model,
        temperature: this.settings.temperature,
        maxTokens: this.settings.maxTokens,
      }),
    });

    if (!response.ok) {
      throw new Error(`Custom provider API error: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      content: data.content || data.text || data.response,
    };
  }

  /**
   * Get mock response for development/testing
   */
  private getMockResponse(prompt: string): LLMResponse {
    // Generate intelligent mock responses based on prompt keywords
    let content = '';

    if (prompt.includes('insight') || prompt.includes('analysis')) {
      content = `Your portfolio is performing well with KES 1.8M revenue this month, showing a 12.5% increase.

Key Highlights:
• Strong occupancy rate at 87.5%, up 3.2% from last period
• Sunset Apartments leading with 92% occupancy and KES 540K revenue
• Revenue growth consistent across all properties

Areas of Concern:
• Maintenance costs increased by 8.4% to KES 145K - investigate recurring issues
• Vista Plaza occupancy at 80% - needs attention to prevent further decline
• Average rent price decreased by 2.1% - consider market analysis

Recommendations:
1. Investigate maintenance cost spike - may indicate deferred maintenance issues coming due
2. Implement targeted marketing for Vista Plaza to improve occupancy
3. Review rental pricing strategy to align with market rates`;
    } else if (prompt.includes('forecast') || prompt.includes('predict')) {
      content = `Revenue Forecast (Next 6 Months):
• January 2025: KES 1,850,000 (±50,000) - Growth expected from seasonal demand
• February 2025: KES 1,820,000 (±55,000) - Slight dip typical for post-holiday period
• March 2025: KES 1,900,000 (±60,000) - Strong recovery as market heats up
• April 2025: KES 1,950,000 (±65,000) - Peak season begins
• May 2025: KES 1,980,000 (±70,000) - Continued growth
• June 2025: KES 2,020,000 (±75,000) - Mid-year peak

Occupancy Forecast:
• Expected to stabilize at 88-90% over next quarter
• Vista Plaza likely to see 5% improvement with targeted efforts
• Highland House expected to maintain strong 88% rate

Confidence: 78% based on historical patterns and current market conditions.`;
    } else if (prompt.includes('sentiment') || prompt.includes('communication')) {
      content = `Tenant Sentiment Analysis:

Overall Sentiment: 82% Positive
Trend: ↑ 5% improvement from last month

Breakdown by Property:
• Sunset Apartments: 90% Positive - Excellent tenant satisfaction
• Highland House: 85% Positive - Strong satisfaction with minor concerns
• Vista Plaza: 72% Positive - Needs attention, declining trend
• Garden Estate: 80% Positive - Stable satisfaction

Key Themes:
• Positive: Quick maintenance response, professional staff, well-maintained properties
• Concerns: Vista Plaza parking issues, occasional communication delays

Watch List:
• Unit 3B (Vista Plaza): 3 negative messages this week regarding noise complaints
• Tenant John Doe: Expressing frustration with maintenance delays

Recommendation: Prioritize communication with Vista Plaza tenants and address parking concerns.`;
    } else if (prompt.includes('anomaly') || prompt.includes('alert')) {
      content = `Anomaly Detection Report:

🚨 High Priority Alerts:
1. Maintenance Cost Spike at Sunset Apartments
   • Current: KES 85,000 (3x normal)
   • Expected: KES 25,000
   • Cause: Multiple plumbing work orders
   • Action: Investigate root cause, may indicate systemic issue

2. Payment Pattern Change
   • 3 previously reliable tenants now 5+ days late
   • Property: Vista Plaza
   • Possible cause: Local economic factors or property satisfaction issue

⚠️ Medium Priority:
1. Viewing activity down 30% this month
   • May indicate marketing issue or seasonal slowdown

2. Maintenance request response time increased to 2.5 days
   • Target: 1.5 days
   • Investigate staffing levels

No low-priority anomalies detected.`;
    } else if (prompt.includes('recommendation')) {
      content = `Strategic Recommendations:

Immediate Actions (This Week):
1. 📈 Sunset Apartments: Schedule comprehensive plumbing inspection to prevent future costly repairs
2. 💰 Highland House: Initiate rent increase discussions (market supports 5-7% increase)
3. 📞 Vista Plaza: Start lease renewal conversations for 3 expiring leases next month

Short-term (This Month):
1. Launch targeted marketing campaign for Vista Plaza to improve 80% occupancy
2. Implement preventive maintenance program to reduce reactive repair costs
3. Review and update rental pricing across portfolio based on market analysis

Long-term (This Quarter):
1. Consider capital improvements for Vista Plaza to justify rent increases
2. Develop tenant retention program - focus on early lease renewal incentives
3. Invest in property management software upgrades for better efficiency

Expected Impact:
• Revenue increase: 8-12% through optimized pricing and improved occupancy
• Cost reduction: 15-20% through preventive maintenance
• Tenant retention: Improve by 10-15% through proactive engagement`;
    } else {
      content = 'AI analysis completed. Please provide more specific data or context for detailed insights.';
    }

    return { content };
  }
}

// Singleton instance
let llmServiceInstance: LLMService | null = null;

export function getLLMService(settings?: LLMSettings): LLMService {
  if (!llmServiceInstance) {
    llmServiceInstance = new LLMService(settings);
  }
  return llmServiceInstance;
}
