import {
  AVAILABLE_MODULES,
  SUPPORTED_INDUSTRIES,
  type ModuleConfig,
  type Industry,
} from './module-config';

export interface TenantConfiguration {
  id: string;
  name: string;
  domain: string;
  subdomain?: string;
  industry: string;
  enabledModules: string[];
  moduleSettings: Record<string, any>;
  billingPlan: 'FREE' | 'BASIC' | 'PROFESSIONAL' | 'ENTERPRISE';
  customBranding?: {
    logo?: string;
    primaryColor?: string;
    secondaryColor?: string;
    companyName?: string;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ModuleLicense {
  tenantId: string;
  moduleId: string;
  tier: 'FREE' | 'BASIC' | 'PROFESSIONAL' | 'ENTERPRISE';
  isActive: boolean;
  features: string[];
  monthlyPrice: number;
  activatedAt: Date;
  expiresAt?: Date;
}

export class TenantManager {
  private static instance: TenantManager;
  private currentTenant: TenantConfiguration | null = null;
  private moduleCache: Map<string, ModuleConfig> = new Map();

  private constructor() {
    // Initialize module cache
    AVAILABLE_MODULES.forEach((module) => {
      this.moduleCache.set(module.id, module);
    });
  }

  public static getInstance(): TenantManager {
    if (!TenantManager.instance) {
      TenantManager.instance = new TenantManager();
    }
    return TenantManager.instance;
  }

  // ===================================
  // TENANT MANAGEMENT
  // ===================================

  public setCurrentTenant(tenant: TenantConfiguration): void {
    this.currentTenant = tenant;
  }

  public getCurrentTenant(): TenantConfiguration | null {
    return this.currentTenant;
  }

  public async getTenantByDomain(domain: string): Promise<TenantConfiguration | null> {
    // In real implementation, this would fetch from database
    // For now, return mock tenant configuration
    if (
      domain.includes('education') ||
      domain.includes('school') ||
      domain.includes('university')
    ) {
      return {
        id: 'tenant_edu_001',
        name: 'Demo Education Institution',
        domain: domain,
        industry: 'EDUCATION',
        enabledModules: ['crm', 'records', 'finance', 'learning', 'certification', 'engagement'],
        moduleSettings: {
          records: {
            entityName: 'Students',
            entityNameSingular: 'Student',
            customFields: ['studentNumber', 'program', 'tier'],
          },
          learning: {
            enableCertificates: true,
            enableVideoStreaming: false,
            maxCourseSize: 1000,
          },
        },
        billingPlan: 'PROFESSIONAL',
        customBranding: {
          primaryColor: '#3b82f6',
          secondaryColor: '#1d4ed8',
          companyName: 'Demo Educational Institution',
        },
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }

    if (domain.includes('health') || domain.includes('medical') || domain.includes('clinic')) {
      return {
        id: 'tenant_health_001',
        name: 'Demo Healthcare Clinic',
        domain: domain,
        industry: 'HEALTHCARE',
        enabledModules: ['crm', 'records', 'finance', 'learning'],
        moduleSettings: {
          records: {
            entityName: 'Patients',
            entityNameSingular: 'Patient',
            customFields: ['patientId', 'insurance', 'emergencyContact'],
          },
        },
        billingPlan: 'PROFESSIONAL',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }

    // Default tenant for demo
    return {
      id: 'tenant_demo_001',
      name: 'Demo Business',
      domain: domain,
      industry: 'SERVICES',
      enabledModules: ['crm', 'records', 'finance'],
      moduleSettings: {},
      billingPlan: 'BASIC',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  // ===================================
  // MODULE MANAGEMENT
  // ===================================

  public isModuleEnabled(moduleId: string): boolean {
    if (!this.currentTenant) return false;
    return this.currentTenant.enabledModules.includes(moduleId);
  }

  public getEnabledModules(): ModuleConfig[] {
    if (!this.currentTenant) return [];

    return this.currentTenant.enabledModules
      .map((id) => this.moduleCache.get(id))
      .filter(Boolean) as ModuleConfig[];
  }

  public getAvailableModulesForIndustry(): ModuleConfig[] {
    if (!this.currentTenant) return AVAILABLE_MODULES;

    const industry = SUPPORTED_INDUSTRIES.find((ind) => ind.id === this.currentTenant!.industry);
    if (!industry) return AVAILABLE_MODULES;

    return AVAILABLE_MODULES.filter((module) => industry.modules.includes(module.id));
  }

  public getModuleDisplayName(moduleId: string): string {
    if (!this.currentTenant) return moduleId;

    const industry = SUPPORTED_INDUSTRIES.find((ind) => ind.id === this.currentTenant!.industry);
    const moduleItem = this.moduleCache.get(moduleId);

    if (industry?.terminologyOverrides?.[moduleId]) {
      return industry.terminologyOverrides[moduleId];
    }

    return moduleItem?.displayName || moduleId;
  }

  public getModuleSettings(moduleId: string): any {
    if (!this.currentTenant) return {};
    return this.currentTenant.moduleSettings[moduleId] || {};
  }

  public async enableModule(moduleId: string): Promise<boolean> {
    if (!this.currentTenant) return false;

    const moduleItem = this.moduleCache.get(moduleId);
    if (!moduleItem) return false;

    // Check dependencies
    const dependencies = moduleItem.dependencies || [];
    for (const dep of dependencies) {
      if (!this.isModuleEnabled(dep)) {
        throw new Error(`Cannot enable ${moduleId}: dependency ${dep} is not enabled`);
      }
    }

    // Add to enabled modules if not already present
    if (!this.currentTenant.enabledModules.includes(moduleId)) {
      this.currentTenant.enabledModules.push(moduleId);
      this.currentTenant.updatedAt = new Date();

      // In real implementation, would save to database
      await this.saveTenantConfiguration(this.currentTenant);
    }

    return true;
  }

  public async disableModule(moduleId: string): Promise<boolean> {
    if (!this.currentTenant) return false;

    const moduleItem = this.moduleCache.get(moduleId);
    if (!moduleItem) return false;

    // Cannot disable core modules
    if (moduleItem.isCore) {
      throw new Error(`Cannot disable core module: ${moduleId}`);
    }

    // Check if other enabled modules depend on this one
    const dependentModules = this.currentTenant.enabledModules.filter((enabledId) => {
      const enabledModule = this.moduleCache.get(enabledId);
      return enabledModule?.dependencies?.includes(moduleId);
    });

    if (dependentModules.length > 0) {
      throw new Error(`Cannot disable ${moduleId}: required by ${dependentModules.join(', ')}`);
    }

    // Remove from enabled modules
    const index = this.currentTenant.enabledModules.indexOf(moduleId);
    if (index > -1) {
      this.currentTenant.enabledModules.splice(index, 1);
      this.currentTenant.updatedAt = new Date();

      // In real implementation, would save to database
      await this.saveTenantConfiguration(this.currentTenant);
    }

    return true;
  }

  // ===================================
  // BILLING & LICENSING
  // ===================================

  public calculateMonthlyPrice(): number {
    if (!this.currentTenant) return 0;

    return this.currentTenant.enabledModules.reduce((total, moduleId) => {
      const moduleItem = this.moduleCache.get(moduleId);
      return total + (moduleItem?.pricing.monthlyPrice || 0);
    }, 0);
  }

  public getModuleLicenses(): ModuleLicense[] {
    if (!this.currentTenant) return [];

    return this.currentTenant.enabledModules.map((moduleId) => {
      const moduleItem = this.moduleCache.get(moduleId)!;
      return {
        tenantId: this.currentTenant!.id,
        moduleId,
        tier: this.currentTenant!.billingPlan,
        isActive: true,
        features: moduleItem.features.map((f) => f.id),
        monthlyPrice: moduleItem.pricing.monthlyPrice,
        activatedAt: new Date(),
        expiresAt: undefined, // For subscription-based billing
      };
    });
  }

  public isFeatureEnabled(moduleId: string, featureId: string): boolean {
    if (!this.isModuleEnabled(moduleId)) return false;

    const moduleItem = this.moduleCache.get(moduleId);
    if (!moduleItem) return false;

    const feature = moduleItem.features.find((f) => f.id === featureId);
    if (!feature) return false;

    // Check if feature is available in current billing tier
    const tierOrder = ['FREE', 'BASIC', 'PROFESSIONAL', 'ENTERPRISE'];
    const currentTierIndex = tierOrder.indexOf(this.currentTenant!.billingPlan);
    const featureTierIndex = tierOrder.indexOf(feature.tier);

    return currentTierIndex >= featureTierIndex;
  }

  // ===================================
  // NAVIGATION & UI
  // ===================================

  public getNavigationItems(): NavigationItem[] {
    if (!this.currentTenant) return [];

    const items: NavigationItem[] = [];

    // Dashboard is always available
    items.push({
      id: 'dashboard',
      name: 'Dashboard',
      path: '/dashboard',
      icon: '📊',
      isActive: true,
    });

    // Add navigation items for enabled modules
    this.currentTenant.enabledModules.forEach((moduleId) => {
      const moduleItem = this.moduleCache.get(moduleId);
      if (moduleItem) {
        items.push({
          id: moduleId,
          name: this.getModuleDisplayName(moduleId),
          path: `/modules/${moduleId}`,
          icon: moduleItem.icon,
          isActive: true,
        });
      }
    });

    // Settings is always available
    items.push({
      id: 'settings',
      name: 'Settings',
      path: '/settings',
      icon: '⚙️',
      isActive: true,
    });

    return items;
  }

  public getModuleRoute(moduleId: string): string {
    return `/modules/${moduleId}`;
  }

  // ===================================
  // PRIVATE METHODS
  // ===================================

  private async saveTenantConfiguration(tenant: TenantConfiguration): Promise<void> {
    // In real implementation, save to database
    console.log('Saving tenant configuration:', tenant.id);
  }
}

export interface NavigationItem {
  id: string;
  name: string;
  path: string;
  icon: string;
  isActive: boolean;
  children?: NavigationItem[];
}

// Singleton instance
export const tenantManager = TenantManager.getInstance();
