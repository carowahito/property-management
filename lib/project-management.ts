/**
 * Universal Project Management System
 * Reusable across all industries (Education, Non-Profit, SaaS, etc.)
 */

export interface Project {
  id: string
  name: string
  description: string
  type: string // Industry-specific project types
  status: ProjectStatus
  priority: ProjectPriority
  startDate: string
  endDate?: string
  targetDate: string
  
  // Project Details
  owner: string
  assignees: string[]
  department: string // Industry-specific departments
  budget?: number
  
  // Metrics & Goals
  goals: ProjectGoal[]
  kpis: ProjectKPI[]
  
  // Tasks & Progress
  tasks: Task[]
  completionPercentage: number
  
  // Stakeholders
  stakeholders: string[]
  tags: string[]
  
  // Timestamps
  createdAt: string
  updatedAt: string
  
  // Related Entities (Industry-agnostic)
  relatedEntities: Record<string, string[]>
}

export interface Task {
  id: string
  projectId: string
  title: string
  description: string
  type: string // Industry-specific task types
  status: TaskStatus
  priority: TaskPriority
  
  // Assignment
  assignedTo: string
  assignedBy: string
  assignedDate: string
  
  // Timeline
  dueDate?: string
  completedDate?: string
  estimatedHours?: number
  actualHours?: number
  
  // Dependencies
  dependencies: string[]
  blockedBy: string[]
  
  // Progress
  checklistItems: ChecklistItem[]
  attachments: TaskAttachment[]
  comments: TaskComment[]
  
  // Context
  tags: string[]
  relatedEntities: Record<string, string[]> // Generic relationships
  
  createdAt: string
  updatedAt: string
}

export type ProjectStatus = 
  | 'planning'
  | 'active' 
  | 'on_hold'
  | 'completed'
  | 'cancelled'

export type ProjectPriority = 'low' | 'medium' | 'high' | 'urgent'

export type TaskStatus = 
  | 'not_started' 
  | 'in_progress' 
  | 'blocked' 
  | 'completed' 
  | 'cancelled'

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'

export interface ProjectGoal {
  id: string
  title: string
  description: string
  targetValue: number
  currentValue: number
  unit: string
  deadline: string
}

export interface ProjectKPI {
  id: string
  name: string
  description: string
  targetValue: number
  currentValue: number
  unit: string
  trend: 'up' | 'down' | 'stable'
}

export interface ChecklistItem {
  id: string
  title: string
  completed: boolean
  completedBy?: string
  completedDate?: string
}

export interface TaskAttachment {
  id: string
  name: string
  type: string
  url: string
  uploadedBy: string
  uploadedDate: string
}

export interface TaskComment {
  id: string
  content: string
  author: string
  createdAt: string
}

// Industry Configuration Interface
export interface IndustryProjectConfig {
  projectTypes: { id: string; name: string; description: string; icon: string }[]
  taskTypes: { id: string; name: string; description: string; icon: string }[]
  departments: { id: string; name: string; description: string }[]
  defaultTags: string[]
  relatedEntityTypes: { id: string; name: string; plural: string }[] // e.g., prospects, donors, clients
  projectTemplates: ProjectTemplate[]
  taskTemplates: TaskTemplate[]
}

export interface ProjectTemplate {
  name: string
  description: string
  type: string
  department: string
  priority: ProjectPriority
  estimatedDays: number
  goals: Omit<ProjectGoal, 'id' | 'currentValue'>[]
  tags: string[]
  defaultTasks: Omit<TaskTemplate, 'projectId'>[]
}

export interface TaskTemplate {
  title: string
  description: string
  type: string
  priority: TaskPriority
  estimatedHours: number
  tags: string[]
  checklistItems?: string[]
}

// Education Industry Configuration
export const educationProjectConfig: IndustryProjectConfig = {
  projectTypes: [
    { id: 'enrollment_campaign', name: 'Enrollment Campaign', description: 'Student recruitment campaigns', icon: '🎓' },
    { id: 'program_launch', name: 'Program Launch', description: 'New program/course launches', icon: '🚀' },
    { id: 'partnership_initiative', name: 'Partnership Initiative', description: 'Corporate partnership projects', icon: '🤝' },
    { id: 'event_organization', name: 'Event Organization', description: 'Info sessions, workshops, events', icon: '📅' },
    { id: 'scholarship_program', name: 'Scholarship Program', description: 'Scholarship fund management', icon: '💰' },
    { id: 'marketing_campaign', name: 'Marketing Campaign', description: 'Marketing and advertising campaigns', icon: '📢' },
    { id: 'community_outreach', name: 'Community Outreach', description: 'Community engagement projects', icon: '🌍' },
    { id: 'alumni_engagement', name: 'Alumni Engagement', description: 'Alumni network development', icon: '👥' },
    { id: 'crm_improvement', name: 'CRM Improvement', description: 'CRM system enhancements', icon: '⚙️' }
  ],
  
  taskTypes: [
    { id: 'communication', name: 'Communication', description: 'Email, call, message tasks', icon: '📧' },
    { id: 'content_creation', name: 'Content Creation', description: 'Create marketing materials', icon: '✍️' },
    { id: 'data_analysis', name: 'Data Analysis', description: 'Analyze metrics and reports', icon: '📊' },
    { id: 'event_planning', name: 'Event Planning', description: 'Plan/organize events', icon: '📅' },
    { id: 'follow_up', name: 'Follow Up', description: 'Follow up with prospects/partners', icon: '📞' },
    { id: 'research', name: 'Research', description: 'Market research, competitor analysis', icon: '🔍' },
    { id: 'administrative', name: 'Administrative', description: 'Admin tasks and documentation', icon: '📋' },
    { id: 'meeting', name: 'Meeting', description: 'Meetings and consultations', icon: '🤝' },
    { id: 'review', name: 'Review', description: 'Review applications, content, etc.', icon: '👀' },
    { id: 'outreach', name: 'Outreach', description: 'Outreach to prospects or partners', icon: '📣' }
  ],
  
  departments: [
    { id: 'admissions', name: 'Admissions', description: 'Enrollment and student recruitment' },
    { id: 'marketing', name: 'Marketing', description: 'Marketing and communications' },
    { id: 'partnerships', name: 'Partnerships', description: 'Corporate and community partnerships' },
    { id: 'events', name: 'Events', description: 'Event planning and management' },
    { id: 'financial_aid', name: 'Financial Aid', description: 'Scholarships and financial assistance' },
    { id: 'alumni_relations', name: 'Alumni Relations', description: 'Alumni engagement' },
    { id: 'leadership', name: 'Leadership', description: 'Executive and strategic projects' },
    { id: 'it', name: 'IT', description: 'Technology and systems' }
  ],
  
  defaultTags: ['education', 'enrollment', 'marketing', 'partnerships', 'events', 'alumni', 'scholarships'],
  
  relatedEntityTypes: [
    { id: 'prospects', name: 'Prospect', plural: 'Prospects' },
    { id: 'students', name: 'Student', plural: 'Students' },
    { id: 'programs', name: 'Program', plural: 'Programs' },
    { id: 'campaigns', name: 'Campaign', plural: 'Campaigns' },
    { id: 'events', name: 'Event', plural: 'Events' },
    { id: 'partners', name: 'Partner', plural: 'Partners' }
  ],
  
  projectTemplates: [
    {
      name: 'Student Enrollment Campaign',
      description: 'Comprehensive enrollment drive for new student intake',
      type: 'enrollment_campaign',
      department: 'admissions',
      priority: 'high',
      estimatedDays: 90,
      goals: [
        { title: 'Student Enrollments', description: 'Total new student enrollments', targetValue: 200, unit: 'students', deadline: '2024-12-31' },
        { title: 'Lead Generation', description: 'Generate qualified leads', targetValue: 1000, unit: 'leads', deadline: '2024-11-30' }
      ],
      tags: ['enrollment', 'marketing', 'leads'],
      defaultTasks: [
        { title: 'Create Landing Pages', description: 'Design landing pages for each program', type: 'content_creation', priority: 'high', estimatedHours: 16, tags: ['landing-page'] },
        { title: 'Set Up Email Campaigns', description: 'Create nurture email sequences', type: 'content_creation', priority: 'high', estimatedHours: 12, tags: ['email'] },
        { title: 'Launch Social Media Ads', description: 'Set up Facebook and Google ads', type: 'marketing', priority: 'high', estimatedHours: 8, tags: ['ads'] }
      ]
    }
  ],
  
  taskTemplates: [
    { title: 'Follow Up with Hot Leads', description: 'Call all prospects with lead score 75+', type: 'follow_up', priority: 'urgent', estimatedHours: 4, tags: ['calls', 'hot-leads'] },
    { title: 'Create Info Session Presentation', description: 'Design presentation for upcoming info session', type: 'content_creation', priority: 'medium', estimatedHours: 6, tags: ['presentation', 'events'] },
    { title: 'Research Corporate Partners', description: 'Identify potential corporate partners', type: 'research', priority: 'medium', estimatedHours: 4, tags: ['research', 'partnerships'] }
  ]
}

// Non-Profit Industry Configuration  
export const nonprofitProjectConfig: IndustryProjectConfig = {
  projectTypes: [
    { id: 'fundraising_campaign', name: 'Fundraising Campaign', description: 'Fundraising and donor campaigns', icon: '💰' },
    { id: 'program_launch', name: 'Program Launch', description: 'New program/service launches', icon: '🚀' },
    { id: 'community_project', name: 'Community Project', description: 'Community service projects', icon: '🌍' },
    { id: 'event_organization', name: 'Event Organization', description: 'Fundraising events and galas', icon: '📅' },
    { id: 'volunteer_recruitment', name: 'Volunteer Recruitment', description: 'Volunteer recruitment campaigns', icon: '👥' },
    { id: 'grant_application', name: 'Grant Application', description: 'Grant funding applications', icon: '📝' },
    { id: 'awareness_campaign', name: 'Awareness Campaign', description: 'Public awareness campaigns', icon: '📢' },
    { id: 'partnership_initiative', name: 'Partnership Initiative', description: 'Partner collaboration projects', icon: '🤝' }
  ],
  
  taskTypes: [
    { id: 'donor_outreach', name: 'Donor Outreach', description: 'Contact donors and prospects', icon: '📞' },
    { id: 'content_creation', name: 'Content Creation', description: 'Create fundraising materials', icon: '✍️' },
    { id: 'event_planning', name: 'Event Planning', description: 'Plan fundraising events', icon: '📅' },
    { id: 'volunteer_coordination', name: 'Volunteer Coordination', description: 'Coordinate volunteer activities', icon: '👥' },
    { id: 'grant_writing', name: 'Grant Writing', description: 'Write grant applications', icon: '📝' },
    { id: 'data_analysis', name: 'Data Analysis', description: 'Analyze donation and program data', icon: '📊' },
    { id: 'community_outreach', name: 'Community Outreach', description: 'Engage with community', icon: '🌍' },
    { id: 'administrative', name: 'Administrative', description: 'Admin and compliance tasks', icon: '📋' }
  ],
  
  departments: [
    { id: 'development', name: 'Development', description: 'Fundraising and donor relations' },
    { id: 'programs', name: 'Programs', description: 'Program delivery and management' },
    { id: 'marketing', name: 'Marketing', description: 'Marketing and communications' },
    { id: 'events', name: 'Events', description: 'Event planning and management' },
    { id: 'volunteers', name: 'Volunteers', description: 'Volunteer coordination' },
    { id: 'grants', name: 'Grants', description: 'Grant writing and management' },
    { id: 'leadership', name: 'Leadership', description: 'Executive and strategic' }
  ],
  
  defaultTags: ['nonprofit', 'fundraising', 'volunteers', 'community', 'grants', 'programs'],
  
  relatedEntityTypes: [
    { id: 'donors', name: 'Donor', plural: 'Donors' },
    { id: 'volunteers', name: 'Volunteer', plural: 'Volunteers' },
    { id: 'beneficiaries', name: 'Beneficiary', plural: 'Beneficiaries' },
    { id: 'programs', name: 'Program', plural: 'Programs' },
    { id: 'events', name: 'Event', plural: 'Events' },
    { id: 'grants', name: 'Grant', plural: 'Grants' }
  ],
  
  projectTemplates: [
    {
      name: 'Annual Fundraising Campaign',
      description: 'Year-end fundraising campaign for operational support',
      type: 'fundraising_campaign', 
      department: 'development',
      priority: 'high',
      estimatedDays: 120,
      goals: [
        { title: 'Fundraising Goal', description: 'Total funds raised', targetValue: 100000, unit: 'USD', deadline: '2024-12-31' },
        { title: 'New Donors', description: 'Acquire new donors', targetValue: 200, unit: 'donors', deadline: '2024-12-31' }
      ],
      tags: ['fundraising', 'donors', 'annual'],
      defaultTasks: []
    }
  ],
  
  taskTemplates: [
    { title: 'Contact Major Donors', description: 'Reach out to major donor prospects', type: 'donor_outreach', priority: 'high', estimatedHours: 6, tags: ['major-gifts', 'outreach'] },
    { title: 'Write Grant Proposal', description: 'Draft grant application for foundation', type: 'grant_writing', priority: 'medium', estimatedHours: 12, tags: ['grants', 'writing'] }
  ]
}

// Universal Project Manager Class
export class ProjectManager {
  constructor(private industryConfig: IndustryProjectConfig) {}
  
  createProject(template: ProjectTemplate, customizations: Partial<Project> = {}): Project {
    return {
      id: this.generateId(),
      name: template.name,
      description: template.description,
      type: template.type,
      department: template.department,
      priority: template.priority,
      status: 'planning',
      owner: '',
      completionPercentage: 0,
      tasks: [],
      stakeholders: [],
      assignees: [],
      goals: template.goals.map(goal => ({ ...goal, id: this.generateId(), currentValue: 0 })),
      kpis: [],
      tags: template.tags,
      relatedEntities: {},
      startDate: new Date().toISOString(),
      targetDate: new Date(Date.now() + template.estimatedDays * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...customizations
    }
  }
  
  createTask(template: TaskTemplate, projectId: string, customizations: Partial<Task> = {}): Task {
    return {
      id: this.generateId(),
      projectId,
      title: template.title,
      description: template.description,
      type: template.type,
      priority: template.priority,
      status: 'not_started',
      assignedTo: '',
      assignedBy: '',
      estimatedHours: template.estimatedHours,
      tags: template.tags,
      dependencies: [],
      blockedBy: [],
      checklistItems: template.checklistItems?.map(item => ({ 
        id: this.generateId(), 
        title: item, 
        completed: false 
      })) || [],
      attachments: [],
      comments: [],
      relatedEntities: {},
      assignedDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...customizations
    }
  }
  
  calculateProjectProgress(project: Project): number {
    if (project.tasks.length === 0) return 0
    const completedTasks = project.tasks.filter(task => task.status === 'completed').length
    return Math.round((completedTasks / project.tasks.length) * 100)
  }
  
  getProjectsByType(projects: Project[], type: string): Project[] {
    return projects.filter(project => project.type === type)
  }
  
  getTasksByStatus(tasks: Task[], status: TaskStatus): Task[] {
    return tasks.filter(task => task.status === status)
  }
  
  getOverdueTasks(tasks: Task[]): Task[] {
    const now = new Date()
    return tasks.filter(task => 
      task.dueDate && 
      new Date(task.dueDate) < now && 
      task.status !== 'completed' && 
      task.status !== 'cancelled'
    )
  }
  
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9) + '_' + Date.now().toString(36)
  }
}

// Factory function to get industry-specific project manager
export function getProjectManager(industry: 'education' | 'nonprofit'): ProjectManager {
  const config = industry === 'education' ? educationProjectConfig : nonprofitProjectConfig
  return new ProjectManager(config)
}

// educationProjectConfig and nonprofitProjectConfig are already exported above