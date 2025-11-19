/**
 * AI Prompts Library
 * Centralized collection of prompts for different AI features
 */

export const SYSTEM_PROMPTS = {
  PROPERTY_ANALYST: `You are an expert property management analyst with deep knowledge of real estate operations, financial analysis, and tenant relations. Provide clear, actionable insights based on data analysis. Focus on practical recommendations that can improve revenue, reduce costs, and enhance tenant satisfaction.`,

  FORECASTER: `You are a predictive analytics expert specializing in property management. Analyze historical data patterns, seasonal trends, and market conditions to generate accurate forecasts. Always provide confidence intervals and explain your reasoning.`,

  SENTIMENT_ANALYST: `You are a communication expert specializing in tenant relations and sentiment analysis. Analyze messages, maintenance requests, and communications to assess satisfaction levels and identify potential issues before they escalate.`,

  ANOMALY_DETECTOR: `You are a data anomaly detection specialist. Identify unusual patterns, outliers, and deviations from normal operations. Prioritize anomalies by severity and provide context about why they matter.`,

  REPORT_WRITER: `You are a professional report writer for property management executives. Create clear, concise, and well-structured reports that tell a story with data. Use executive-friendly language and focus on actionable insights.`,
};

export const INSIGHTS_PROMPTS = {
  EXECUTIVE_SUMMARY: (data: any) => `
Analyze this property management data and provide a comprehensive executive summary:

Current Period Data:
- Total Revenue: KES ${data.totalRevenue?.toLocaleString()} (${data.revenueChange > 0 ? '+' : ''}${data.revenueChange}% change)
- Occupancy Rate: ${data.occupancyRate}% (${data.occupancyChange > 0 ? '+' : ''}${data.occupancyChange}% change)
- Average Rent: KES ${data.avgRentPrice?.toLocaleString()} (${data.priceChange > 0 ? '+' : ''}${data.priceChange}% change)
- Maintenance Costs: KES ${data.maintenanceCost?.toLocaleString()} (${data.costChange > 0 ? '+' : ''}${data.costChange}% change)

Property Performance:
${data.properties?.map((p: any) => `- ${p.name}: ${p.occupancy}% occupancy, KES ${p.revenue?.toLocaleString()} revenue, ${p.units} units`).join('\n')}

Provide:
1. A brief 2-3 sentence overview of overall portfolio health
2. 3 key highlights (positive achievements)
3. 2-3 areas of concern that need attention
4. 3 specific, actionable recommendations

Keep the tone professional but conversational. Focus on what matters most to a property management executive.
`,

  PROPERTY_INSIGHTS: (propertyData: any) => `
Analyze this specific property's performance:

Property: ${propertyData.name}
- Units: ${propertyData.units}
- Occupancy: ${propertyData.occupancy}%
- Monthly Revenue: KES ${propertyData.revenue?.toLocaleString()}
- Maintenance Requests: ${propertyData.maintenanceCount || 0}
- Average Tenant Tenure: ${propertyData.avgTenure || 'N/A'} months
- Payment Collection Rate: ${propertyData.collectionRate || 'N/A'}%

Provide:
1. Performance assessment (Excellent/Good/Fair/Poor)
2. Key strengths
3. Areas for improvement
4. Specific recommendations for this property
`,

  TREND_ANALYSIS: (trendData: any) => `
Analyze these trends over time:

Revenue Trend (Last 6 months):
${trendData.revenue?.map((r: any) => `${r.month}: KES ${r.amount?.toLocaleString()}`).join('\n')}

Occupancy Trend:
${trendData.occupancy?.map((o: any) => `${o.month}: ${o.rate}%`).join('\n')}

Maintenance Cost Trend:
${trendData.maintenance?.map((m: any) => `${m.month}: KES ${m.cost?.toLocaleString()}`).join('\n')}

Identify:
1. Overall trend direction (improving/declining/stable)
2. Seasonal patterns or cycles
3. Notable inflection points or changes
4. Predicted direction for next period
5. Recommendations based on trends
`,

  COMPARATIVE_ANALYSIS: (comparison: any) => `
Compare performance across properties:

${comparison.properties?.map((p: any) => `
${p.name}:
- Occupancy: ${p.occupancy}%
- Revenue per Unit: KES ${p.revenuePerUnit?.toLocaleString()}
- Maintenance Cost per Unit: KES ${p.maintenanceCostPerUnit?.toLocaleString()}
- Tenant Satisfaction: ${p.satisfaction || 'N/A'}
`).join('\n')}

Portfolio Average:
- Occupancy: ${comparison.avgOccupancy}%
- Revenue per Unit: KES ${comparison.avgRevenuePerUnit?.toLocaleString()}

Provide:
1. Ranking of properties (best to worst performers)
2. Identify outliers (both positive and negative)
3. Key factors driving performance differences
4. Specific recommendations for underperforming properties
`,
};

export const FORECASTING_PROMPTS = {
  REVENUE_FORECAST: (historicalData: any) => `
Generate a revenue forecast for the next 6 months based on this historical data:

Historical Revenue (Last 12 months):
${historicalData.revenue?.map((r: any) => `${r.month}: KES ${r.amount?.toLocaleString()}`).join('\n')}

Additional Context:
- Current Occupancy Rate: ${historicalData.currentOccupancy}%
- Upcoming Lease Renewals: ${historicalData.renewals || 0}
- Planned Rent Increases: ${historicalData.plannedIncreases || 0}
- Market Trend: ${historicalData.marketTrend || 'Stable'}
- Seasonal Pattern: ${historicalData.seasonalPattern || 'Not provided'}

Provide:
1. Month-by-month forecast for next 6 months with confidence intervals (±)
2. Expected growth rate
3. Key assumptions and factors considered
4. Confidence level (percentage)
5. Risks that could impact forecast
`,

  OCCUPANCY_FORECAST: (occupancyData: any) => `
Forecast occupancy rates for the next quarter:

Historical Occupancy (Last 12 months):
${occupancyData.history?.map((o: any) => `${o.month}: ${o.rate}%`).join('\n')}

Upcoming Events:
- Leases Expiring Next 3 Months: ${occupancyData.expiringLeases || 0}
- Current Vacancy: ${occupancyData.currentVacancy || 0} units
- Average Time to Fill Vacancy: ${occupancyData.avgFillTime || 0} days
- Renewal Rate: ${occupancyData.renewalRate || 0}%

Provide:
1. Quarterly occupancy forecast
2. Property-specific forecasts if data allows
3. Expected vacancy periods
4. Recommendations to optimize occupancy
`,

  CHURN_PREDICTION: (tenantData: any) => `
Analyze tenant churn risk:

Tenant Profile:
- Name: ${tenantData.name}
- Tenure: ${tenantData.tenure} months
- Payment History: ${tenantData.paymentHistory} (on-time rate)
- Maintenance Requests: ${tenantData.maintenanceRequests}
- Recent Communications: ${tenantData.recentComms}
- Lease End Date: ${tenantData.leaseEndDate}

Provide:
1. Churn Risk Score (Low/Medium/High)
2. Key risk factors
3. Retention recommendations
4. Optimal time to initiate renewal conversation
`,
};

export const SENTIMENT_PROMPTS = {
  ANALYZE_MESSAGE: (message: any) => `
Analyze the sentiment of this communication:

From: ${message.from}
To: ${message.to}
Subject: ${message.subject}
Content: ${message.content}
Date: ${message.date}

Provide:
1. Sentiment Score: Positive/Neutral/Negative
2. Confidence Level: (0-100%)
3. Key Themes: (e.g., maintenance, payment, lease terms)
4. Urgency Level: (Low/Medium/High/Urgent)
5. Suggested Response Strategy
6. Any red flags that need immediate attention
`,

  TENANT_SATISFACTION: (tenantComms: any) => `
Analyze overall tenant satisfaction based on communication history:

Tenant: ${tenantComms.tenantName}
Property: ${tenantComms.property}
Total Communications: ${tenantComms.count}

Recent Messages:
${tenantComms.messages?.map((m: any) => `- ${m.date}: ${m.subject} - "${m.preview}"`).join('\n')}

Maintenance Requests:
${tenantComms.maintenanceRequests?.map((m: any) => `- ${m.date}: ${m.title} - Priority: ${m.priority}`).join('\n')}

Provide:
1. Overall Satisfaction Score (0-100)
2. Trend (Improving/Declining/Stable)
3. Key satisfaction drivers
4. Areas of concern
5. Retention risk assessment
6. Recommendations for improving satisfaction
`,

  COMMUNICATION_TRENDS: (allComms: any) => `
Analyze communication trends across the portfolio:

Total Communications: ${allComms.total}
Time Period: ${allComms.period}

By Type:
${allComms.byType?.map((t: any) => `- ${t.type}: ${t.count}`).join('\n')}

By Sentiment:
- Positive: ${allComms.positive}
- Neutral: ${allComms.neutral}
- Negative: ${allComms.negative}

Common Topics:
${allComms.topics?.map((t: any) => `- ${t.topic}: ${t.count} mentions`).join('\n')}

Provide:
1. Overall communication health assessment
2. Emerging issues or trends
3. Properties with concerning communication patterns
4. Recommendations for improving tenant communications
`,
};

export const ANOMALY_PROMPTS = {
  DETECT_ANOMALIES: (metrics: any) => `
Analyze these metrics for anomalies:

Current Period Metrics:
${JSON.stringify(metrics.current, null, 2)}

Historical Average (Last 6 months):
${JSON.stringify(metrics.historical, null, 2)}

Standard Deviations:
${JSON.stringify(metrics.stdDev, null, 2)}

Identify:
1. Any metrics significantly outside normal range (>2 standard deviations)
2. Severity level (Critical/High/Medium/Low)
3. Potential causes
4. Business impact
5. Recommended actions
6. Whether this requires immediate attention

Prioritize by business impact and urgency.
`,

  PAYMENT_ANOMALIES: (paymentData: any) => `
Detect unusual payment patterns:

Current Payment Performance:
- On-time: ${paymentData.onTime}%
- Late (1-7 days): ${paymentData.late1to7}%
- Late (8-30 days): ${paymentData.late8to30}%
- Overdue (>30 days): ${paymentData.overdue}%

Historical Average:
- On-time: ${paymentData.historicalOnTime}%

Tenants with Changed Patterns:
${paymentData.changedPatterns?.map((t: any) => `- ${t.name}: Previously ${t.previous} -> Now ${t.current}`).join('\n')}

Identify:
1. Concerning payment pattern changes
2. Possible causes (economic factors, property issues, individual circumstances)
3. Risk to cash flow
4. Recommended interventions
`,
};

export const REPORT_PROMPTS = {
  EXECUTIVE_REPORT: (data: any) => `
Generate a comprehensive executive report for property management:

Period: ${data.period}
Portfolio: ${data.portfolioName}

Financial Summary:
${JSON.stringify(data.financial, null, 2)}

Operational Summary:
${JSON.stringify(data.operational, null, 2)}

Property Performance:
${JSON.stringify(data.properties, null, 2)}

Create a professional report with:
1. Executive Summary (2-3 paragraphs)
2. Financial Performance section
3. Operational Highlights section
4. Property-by-Property Analysis
5. Key Trends and Insights
6. Recommendations and Action Items
7. Outlook for Next Period

Use clear headings, bullet points, and professional language suitable for stakeholders.
`,

  MONTHLY_SUMMARY: (monthData: any) => `
Create a monthly performance summary:

Month: ${monthData.month}
${JSON.stringify(monthData, null, 2)}

Format as a concise monthly digest suitable for email distribution:
1. Month in Review (brief paragraph)
2. Key Metrics (bullet points)
3. Highlights and Wins
4. Areas of Focus for Next Month
5. Quick Action Items

Keep it scannable and to-the-point, maximum 500 words.
`,
};

export const QUERY_PROMPTS = {
  NATURAL_LANGUAGE_QUERY: (query: string, context: any) => `
User asked: "${query}"

Available data context:
${JSON.stringify(context, null, 2)}

Provide:
1. Direct answer to the question
2. Supporting data/evidence
3. Any relevant context or caveats
4. Related insights they might find useful

Be conversational but precise. If data is insufficient, explain what's missing and what you can provide.
`,
};
