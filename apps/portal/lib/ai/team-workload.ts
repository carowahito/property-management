/**
 * Team Workload Analyzer
 * AI-powered analysis of team member workloads, productivity, and performance
 */

import { PrismaClient } from '@prisma/client';
import { getLLMService } from './llm-service';
import { SYSTEM_PROMPTS } from './prompts';

const prisma = new PrismaClient();

export interface TeamMemberWorkload {
  userId: string;
  userName: string;
  department: string;
  position: string;
  tasksAssigned: number;
  tasksCompleted: number;
  tasksInProgress: number;
  tasksPending: number;
  tasksOverdue: number;
  completionRate: number;
  avgCompletionTime: number; // in hours
  workloadScore: number; // 0-100
  efficiencyScore: number; // 0-100
  properties: number;
  maintenanceRequests: number;
  messagesHandled: number;
  lastActive: Date;
  trend: 'IMPROVING' | 'DECLINING' | 'STABLE';
}

export interface WorkloadInsights {
  summary: string;
  overloadedMembers: TeamMemberWorkload[];
  underutilizedMembers: TeamMemberWorkload[];
  topPerformers: TeamMemberWorkload[];
  needsAttention: TeamMemberWorkload[];
  recommendations: string[];
  teamHealth: number; // 0-100
  generated: Date;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  userName: string;
  department: string;
  score: number;
  tasksCompleted: number;
  completionRate: number;
  efficiencyScore: number;
  badge?: string;
  achievement?: string;
}

export class TeamWorkloadAnalyzer {
  private llm = getLLMService();

  /**
   * Get workload data for all team members
   */
  async getTeamWorkloads(): Promise<TeamMemberWorkload[]> {
    try {
      const users = await prisma.user.findMany({
        where: { active: true },
        include: {
          assignedTasks: {
            where: {
              createdAt: {
                gte: new Date(new Date().setMonth(new Date().getMonth() - 1)),
              },
            },
          },
          messages: {
            where: {
              sentAt: {
                gte: new Date(new Date().setMonth(new Date().getMonth() - 1)),
              },
            },
          },
        },
      });

      const workloads: TeamMemberWorkload[] = [];

      for (const user of users) {
        const tasks = user.assignedTasks;
        const now = new Date();

        const tasksCompleted = tasks.filter((t) => t.status === 'COMPLETED').length;
        const tasksInProgress = tasks.filter((t) => t.status === 'IN_PROGRESS').length;
        const tasksPending = tasks.filter((t) => t.status === 'PENDING').length;
        const tasksOverdue = tasks.filter(
          (t) => t.status !== 'COMPLETED' && t.dueDate < now
        ).length;

        const completionRate = tasks.length > 0 ? (tasksCompleted / tasks.length) * 100 : 100;

        // Calculate average completion time
        const completedTasks = tasks.filter((t) => t.status === 'COMPLETED' && t.completedAt);
        const avgCompletionTime =
          completedTasks.length > 0
            ? completedTasks.reduce((sum, task) => {
                const hours =
                  (task.completedAt!.getTime() - task.createdAt.getTime()) /
                  (1000 * 60 * 60);
                return sum + hours;
              }, 0) / completedTasks.length
            : 0;

        // Workload score (0-100, lower is better)
        const workloadScore = Math.min(
          100,
          (tasks.length / 20) * 100 + (tasksOverdue / Math.max(1, tasks.length)) * 30
        );

        // Efficiency score (0-100, higher is better)
        const efficiencyScore =
          completionRate * 0.6 +
          (tasksOverdue === 0 ? 40 : Math.max(0, 40 - tasksOverdue * 10));

        // Determine trend
        let trend: 'IMPROVING' | 'DECLINING' | 'STABLE' = 'STABLE';
        if (completionRate > 85 && tasksOverdue === 0) trend = 'IMPROVING';
        else if (completionRate < 60 || tasksOverdue > 3) trend = 'DECLINING';

        workloads.push({
          userId: user.id,
          userName: user.name || user.email,
          department: this.mapRoleToDepartment(user.role),
          position: user.role,
          tasksAssigned: tasks.length,
          tasksCompleted,
          tasksInProgress,
          tasksPending,
          tasksOverdue,
          completionRate: Number(completionRate.toFixed(1)),
          avgCompletionTime: Number(avgCompletionTime.toFixed(1)),
          workloadScore: Number(workloadScore.toFixed(1)),
          efficiencyScore: Number(efficiencyScore.toFixed(1)),
          properties: 0, // Would need to query assigned properties
          maintenanceRequests: 0, // Would need to query
          messagesHandled: user.messages.length,
          lastActive: user.updatedAt,
          trend,
        });
      }

      return workloads.sort((a, b) => b.efficiencyScore - a.efficiencyScore);
    } catch (error) {
      console.error('Error getting team workloads:', error);
      return [];
    }
  }

  /**
   * Generate AI-powered workload insights
   */
  async generateWorkloadInsights(): Promise<WorkloadInsights> {
    try {
      const workloads = await this.getTeamWorkloads();

      // Identify categories
      const overloadedMembers = workloads.filter((w) => w.workloadScore > 70);
      const underutilizedMembers = workloads.filter(
        (w) => w.tasksAssigned < 5 && w.workloadScore < 30
      );
      const topPerformers = workloads
        .filter((w) => w.efficiencyScore > 80)
        .slice(0, 5);
      const needsAttention = workloads.filter(
        (w) => w.trend === 'DECLINING' || w.tasksOverdue > 2
      );

      // Calculate team health
      const avgEfficiency =
        workloads.reduce((sum, w) => sum + w.efficiencyScore, 0) / (workloads.length || 1);
      const teamHealth = Number(avgEfficiency.toFixed(1));

      // Generate AI summary
      const prompt = `
Analyze this team workload data and provide insights:

Team Size: ${workloads.length} members
Average Efficiency Score: ${teamHealth}%

Overloaded Members (>70% workload): ${overloadedMembers.length}
Underutilized Members (<30% workload): ${underutilizedMembers.length}
Top Performers: ${topPerformers.length}
Members Needing Attention: ${needsAttention.length}

Top performers:
${topPerformers.map((p) => `- ${p.userName}: ${p.efficiencyScore}% efficiency, ${p.tasksCompleted} tasks completed`).join('\n')}

Overloaded members:
${overloadedMembers.map((m) => `- ${m.userName}: ${m.tasksAssigned} tasks, ${m.tasksOverdue} overdue`).join('\n')}

Provide:
1. A 2-3 sentence executive summary of team health
2. 3-5 specific recommendations for improving team productivity and balance
3. Any concerning patterns or trends

Keep it concise and actionable.
`;

      const systemPrompt = `You are an HR analytics expert specializing in team productivity and workload management. Provide data-driven insights and practical recommendations.`;

      const response = await this.llm.generateCompletion(prompt, systemPrompt);

      // Parse recommendations
      const recommendations = this.parseRecommendations(
        response.content,
        workloads,
        overloadedMembers,
        underutilizedMembers
      );

      return {
        summary: this.extractSummary(response.content),
        overloadedMembers,
        underutilizedMembers,
        topPerformers,
        needsAttention,
        recommendations,
        teamHealth,
        generated: new Date(),
      };
    } catch (error) {
      console.error('Error generating workload insights:', error);
      return this.getFallbackInsights();
    }
  }

  /**
   * Generate team leaderboard
   */
  async generateLeaderboard(period: 'week' | 'month' | 'quarter' = 'month'): Promise<LeaderboardEntry[]> {
    try {
      const workloads = await this.getTeamWorkloads();

      // Calculate scores
      const leaderboard = workloads.map((w) => {
        // Score calculation: 40% completion rate + 40% efficiency + 20% volume
        const volumeScore = Math.min(100, (w.tasksCompleted / 20) * 100);
        const score =
          w.completionRate * 0.4 + w.efficiencyScore * 0.4 + volumeScore * 0.2;

        // Assign badges
        let badge = '';
        let achievement = '';

        if (w.tasksCompleted >= 50) {
          badge = '🏆';
          achievement = 'Task Master';
        } else if (w.completionRate === 100) {
          badge = '💯';
          achievement = 'Perfect Score';
        } else if (w.efficiencyScore > 90) {
          badge = '⚡';
          achievement = 'High Performer';
        } else if (w.trend === 'IMPROVING') {
          badge = '📈';
          achievement = 'Rising Star';
        }

        return {
          rank: 0, // Will be set later
          userId: w.userId,
          userName: w.userName,
          department: w.department,
          score: Number(score.toFixed(1)),
          tasksCompleted: w.tasksCompleted,
          completionRate: w.completionRate,
          efficiencyScore: w.efficiencyScore,
          badge,
          achievement,
        };
      });

      // Sort by score and assign ranks
      leaderboard.sort((a, b) => b.score - a.score);
      leaderboard.forEach((entry, index) => {
        entry.rank = index + 1;
      });

      return leaderboard;
    } catch (error) {
      console.error('Error generating leaderboard:', error);
      return [];
    }
  }

  /**
   * Get individual member detailed analysis
   */
  async analyzeMember(userId: string): Promise<{
    workload: TeamMemberWorkload;
    insights: string;
    suggestions: string[];
  }> {
    try {
      const workloads = await this.getTeamWorkloads();
      const memberWorkload = workloads.find((w) => w.userId === userId);

      if (!memberWorkload) {
        throw new Error('Member not found');
      }

      const prompt = `
Analyze this team member's performance:

Name: ${memberWorkload.userName}
Department: ${memberWorkload.department}
Tasks Completed: ${memberWorkload.tasksCompleted} / ${memberWorkload.tasksAssigned}
Completion Rate: ${memberWorkload.completionRate}%
Efficiency Score: ${memberWorkload.efficiencyScore}%
Overdue Tasks: ${memberWorkload.tasksOverdue}
Trend: ${memberWorkload.trend}
Average Task Completion Time: ${memberWorkload.avgCompletionTime} hours

Provide:
1. A brief assessment of their performance (2-3 sentences)
2. 3-4 specific suggestions for improvement or recognition

Be constructive and actionable.
`;

      const response = await this.llm.generateCompletion(
        prompt,
        SYSTEM_PROMPTS.PROPERTY_ANALYST
      );

      const suggestions = this.parseSuggestions(response.content);

      return {
        workload: memberWorkload,
        insights: response.content,
        suggestions,
      };
    } catch (error) {
      console.error('Error analyzing member:', error);
      throw error;
    }
  }

  /**
   * Helper: Map role to department
   */
  private mapRoleToDepartment(role: string): string {
    const mapping: { [key: string]: string } = {
      ADMIN: 'Management',
      MANAGER: 'Management',
      STAFF: 'Operations',
      AGENT: 'Sales',
    };
    return mapping[role] || 'Operations';
  }

  /**
   * Helper: Extract summary from AI response
   */
  private extractSummary(content: string): string {
    const lines = content.split('\n').filter((l) => l.trim());
    // Return first paragraph
    return lines[0] || 'Team performance analysis complete.';
  }

  /**
   * Helper: Parse recommendations from AI response
   */
  private parseRecommendations(
    content: string,
    workloads: TeamMemberWorkload[],
    overloaded: TeamMemberWorkload[],
    underutilized: TeamMemberWorkload[]
  ): string[] {
    const recommendations: string[] = [];

    // AI-generated recommendations
    const lines = content.split('\n').filter((l) => l.trim().match(/^[\d\.\-\•]/));
    recommendations.push(...lines.map((l) => l.replace(/^[\d\.\-\•\s]+/, '')));

    // Add rule-based recommendations
    if (overloaded.length > 0) {
      recommendations.push(
        `Redistribute tasks from ${overloaded.length} overloaded team members to balance workload`
      );
    }

    if (underutilized.length > 0) {
      recommendations.push(
        `Assign more responsibilities to ${underutilized.length} underutilized team members`
      );
    }

    const lowEfficiency = workloads.filter((w) => w.efficiencyScore < 50);
    if (lowEfficiency.length > 0) {
      recommendations.push(
        `Provide additional training or support to ${lowEfficiency.length} team members with low efficiency`
      );
    }

    return recommendations.slice(0, 5);
  }

  /**
   * Helper: Parse suggestions from AI response
   */
  private parseSuggestions(content: string): string[] {
    const lines = content.split('\n').filter((l) => l.trim().match(/^[\d\.\-\•]/));
    return lines.map((l) => l.replace(/^[\d\.\-\•\s]+/, '')).slice(0, 4);
  }

  /**
   * Fallback insights when AI unavailable
   */
  private getFallbackInsights(): WorkloadInsights {
    return {
      summary: 'Team workload analysis complete. Configure AI settings for detailed insights.',
      overloadedMembers: [],
      underutilizedMembers: [],
      topPerformers: [],
      needsAttention: [],
      recommendations: [
        'Review task distribution across team members',
        'Monitor completion rates and address bottlenecks',
        'Recognize top performers to maintain motivation',
      ],
      teamHealth: 75,
      generated: new Date(),
    };
  }
}

// Singleton instance
let teamWorkloadAnalyzerInstance: TeamWorkloadAnalyzer | null = null;

export function getTeamWorkloadAnalyzer(): TeamWorkloadAnalyzer {
  if (!teamWorkloadAnalyzerInstance) {
    teamWorkloadAnalyzerInstance = new TeamWorkloadAnalyzer();
  }
  return teamWorkloadAnalyzerInstance;
}
