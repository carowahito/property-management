-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'MANAGER', 'AGENT', 'STAFF');

-- CreateEnum
CREATE TYPE "PropertyType" AS ENUM ('APARTMENT', 'HOUSE', 'CONDO', 'TOWNHOUSE', 'STUDIO', 'COMMERCIAL');

-- CreateEnum
CREATE TYPE "PropertyStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'MAINTENANCE');

-- CreateEnum
CREATE TYPE "StakeholderStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "TenantStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'PENDING', 'EVICTED');

-- CreateEnum
CREATE TYPE "LeadType" AS ENUM ('TENANT', 'LANDLORD', 'BUYER', 'SELLER');

-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED', 'LOST');

-- CreateEnum
CREATE TYPE "LeadSource" AS ENUM ('WEBSITE', 'REFERRAL', 'SOCIAL_MEDIA', 'WALK_IN', 'EMAIL', 'PHONE');

-- CreateEnum
CREATE TYPE "EnquiryStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "LeaseStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'TERMINATED', 'PENDING');

-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('RENT', 'DEPOSIT', 'LATE_FEE', 'UTILITY', 'MAINTENANCE', 'OTHER');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'BANK_TRANSFER', 'MPESA', 'CARD', 'CHEQUE');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'OVERDUE', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "PayoutStatus" AS ENUM ('PENDING', 'PROCESSING', 'PAID', 'FAILED');

-- CreateEnum
CREATE TYPE "DistributionType" AS ENUM ('GROSS_RENT', 'SERVICE_CHARGE', 'MANAGEMENT_FEE', 'MAINTENANCE_FEE', 'REPAIR_COST', 'INSURANCE', 'PROPERTY_TAX', 'LATE_FEE', 'OTHER_DEDUCTION', 'NET_PAYOUT');

-- CreateEnum
CREATE TYPE "RecipientType" AS ENUM ('LANDLORD', 'MANAGER', 'SERVICE_PROVIDER', 'VENDOR', 'GOVERNMENT', 'INSURANCE_COMPANY', 'OTHER');

-- CreateEnum
CREATE TYPE "MaintenanceStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "WorkOrderStatus" AS ENUM ('PENDING', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "InspectionType" AS ENUM ('MOVE_IN', 'MOVE_OUT', 'QUARTERLY', 'ANNUAL', 'MAINTENANCE');

-- CreateEnum
CREATE TYPE "InspectionStatus" AS ENUM ('SCHEDULED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ViewingStatus" AS ENUM ('SCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "StakeholderType" AS ENUM ('TENANT', 'LANDLORD', 'VENDOR', 'LEAD', 'ENQUIRY');

-- CreateEnum
CREATE TYPE "CommunicationType" AS ENUM ('EMAIL', 'PHONE', 'IN_APP', 'WHATSAPP');

-- CreateEnum
CREATE TYPE "MessageType" AS ENUM ('EMAIL', 'SMS', 'IN_APP', 'SYSTEM', 'WHATSAPP');

-- CreateEnum
CREATE TYPE "MessageCategory" AS ENUM ('RENT_REMINDER', 'MAINTENANCE', 'LEASE', 'PAYMENT', 'ANNOUNCEMENT', 'SUPPORT', 'OTHER');

-- CreateEnum
CREATE TYPE "Direction" AS ENUM ('SENT', 'RECEIVED');

-- CreateEnum
CREATE TYPE "CommunicationStatus" AS ENUM ('SENT', 'DELIVERED', 'READ', 'FAILED');

-- CreateEnum
CREATE TYPE "MessageStatus" AS ENUM ('SENT', 'DELIVERED', 'READ', 'FAILED');

-- CreateEnum
CREATE TYPE "Department" AS ENUM ('MANAGEMENT', 'SALES', 'CUSTOMER_CARE', 'OPERATIONS', 'FINANCE', 'MAINTENANCE', 'HR', 'IT', 'MARKETING');

-- CreateEnum
CREATE TYPE "EmployeeStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'ON_LEAVE', 'TERMINATED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('PRESENT', 'ABSENT', 'LATE', 'HALF_DAY', 'WORK_FROM_HOME', 'SICK_LEAVE', 'LEAVE');

-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('PENDING', 'COMPLETED', 'REVIEWED');

-- CreateEnum
CREATE TYPE "LeaveType" AS ENUM ('ANNUAL', 'SICK', 'PERSONAL', 'MATERNITY', 'PATERNITY', 'UNPAID', 'EMERGENCY');

-- CreateEnum
CREATE TYPE "LeaveStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "password" TEXT NOT NULL,
    "name" TEXT,
    "image" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'ADMIN',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "properties" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT,
    "state" TEXT,
    "postalCode" TEXT,
    "country" TEXT NOT NULL DEFAULT 'Kenya',
    "type" "PropertyType" NOT NULL,
    "units" INTEGER NOT NULL DEFAULT 1,
    "yearBuilt" INTEGER,
    "status" "PropertyStatus" NOT NULL DEFAULT 'ACTIVE',
    "description" TEXT,
    "landlordId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "properties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "landlords" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "idNumber" TEXT,
    "address" TEXT,
    "bankName" TEXT,
    "bankAccount" TEXT,
    "taxId" TEXT,
    "status" "StakeholderStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "landlords_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenants" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "idNumber" TEXT,
    "emergencyContact" TEXT,
    "emergencyPhone" TEXT,
    "propertyId" TEXT NOT NULL,
    "unit" TEXT,
    "moveInDate" TIMESTAMP(3),
    "moveOutDate" TIMESTAMP(3),
    "status" "TenantStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendors" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "specialization" TEXT NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" "StakeholderStatus" NOT NULL DEFAULT 'ACTIVE',
    "address" TEXT,
    "licenseNumber" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vendors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leads" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "type" "LeadType" NOT NULL DEFAULT 'TENANT',
    "status" "LeadStatus" NOT NULL DEFAULT 'NEW',
    "source" "LeadSource" NOT NULL DEFAULT 'WEBSITE',
    "budget" TEXT,
    "moveInDate" TIMESTAMP(3),
    "preferences" TEXT,
    "notes" TEXT,
    "assignedTo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastContact" TIMESTAMP(3),
    "convertedAt" TIMESTAMP(3),

    CONSTRAINT "leads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "enquiries" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" "EnquiryStatus" NOT NULL DEFAULT 'OPEN',
    "priority" "Priority" NOT NULL DEFAULT 'MEDIUM',
    "assignedTo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "resolvedAt" TIMESTAMP(3),
    "propertyId" TEXT,

    CONSTRAINT "enquiries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leases" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "unit" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "monthlyRent" DECIMAL(10,2) NOT NULL,
    "securityDeposit" DECIMAL(10,2) NOT NULL,
    "status" "LeaseStatus" NOT NULL DEFAULT 'ACTIVE',
    "terms" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "leases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "leaseId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "type" "PaymentType" NOT NULL DEFAULT 'RENT',
    "method" "PaymentMethod" NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "dueDate" TIMESTAMP(3) NOT NULL,
    "paidDate" TIMESTAMP(3),
    "reference" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payouts" (
    "id" TEXT NOT NULL,
    "landlordId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "period" TEXT NOT NULL,
    "status" "PayoutStatus" NOT NULL DEFAULT 'PENDING',
    "method" "PaymentMethod" NOT NULL,
    "reference" TEXT,
    "notes" TEXT,
    "paidDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payouts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rent_transactions" (
    "id" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "leaseId" TEXT NOT NULL,
    "landlordId" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "unitId" TEXT,
    "tenantId" TEXT NOT NULL,
    "grossRent" DECIMAL(10,2) NOT NULL,
    "rentPeriod" TEXT NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "paidDate" TIMESTAMP(3) NOT NULL,
    "serviceCharge" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "managementFee" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "maintenanceFees" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "otherDeductions" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "totalDeductions" DECIMAL(10,2) NOT NULL,
    "netAmount" DECIMAL(10,2) NOT NULL,
    "lateFees" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "payoutId" TEXT,
    "payoutStatus" "PayoutStatus" NOT NULL DEFAULT 'PENDING',
    "payoutDate" TIMESTAMP(3),
    "payoutMethod" "PaymentMethod",
    "payoutReference" TEXT,
    "notes" TEXT,
    "processed" BOOLEAN NOT NULL DEFAULT false,
    "processedAt" TIMESTAMP(3),
    "processedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rent_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rent_distribution_items" (
    "id" TEXT NOT NULL,
    "rentTransactionId" TEXT NOT NULL,
    "type" "DistributionType" NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "recipientType" "RecipientType" NOT NULL,
    "recipientId" TEXT,
    "recipientName" TEXT,
    "paid" BOOLEAN NOT NULL DEFAULT false,
    "paidDate" TIMESTAMP(3),
    "paymentMethod" "PaymentMethod",
    "reference" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rent_distribution_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "landlord_statements" (
    "id" TEXT NOT NULL,
    "landlordId" TEXT NOT NULL,
    "propertyId" TEXT,
    "period" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "totalGrossRent" DECIMAL(10,2) NOT NULL,
    "totalServiceCharges" DECIMAL(10,2) NOT NULL,
    "totalManagementFees" DECIMAL(10,2) NOT NULL,
    "totalMaintenanceFees" DECIMAL(10,2) NOT NULL,
    "totalOtherDeductions" DECIMAL(10,2) NOT NULL,
    "totalDeductions" DECIMAL(10,2) NOT NULL,
    "totalNetAmount" DECIMAL(10,2) NOT NULL,
    "transactionCount" INTEGER NOT NULL DEFAULT 0,
    "generated" BOOLEAN NOT NULL DEFAULT false,
    "generatedAt" TIMESTAMP(3),
    "generatedBy" TEXT,
    "sent" BOOLEAN NOT NULL DEFAULT false,
    "sentAt" TIMESTAMP(3),
    "pdfUrl" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "landlord_statements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "maintenance_requests" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "unit" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "priority" "Priority" NOT NULL DEFAULT 'MEDIUM',
    "status" "MaintenanceStatus" NOT NULL DEFAULT 'PENDING',
    "category" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "maintenance_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work_orders" (
    "id" TEXT NOT NULL,
    "maintenanceRequestId" TEXT,
    "vendorId" TEXT,
    "leaseId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "WorkOrderStatus" NOT NULL DEFAULT 'PENDING',
    "priority" "Priority" NOT NULL DEFAULT 'MEDIUM',
    "estimatedCost" DECIMAL(10,2),
    "actualCost" DECIMAL(10,2),
    "cost" DECIMAL(10,2),
    "landlordApproved" BOOLEAN NOT NULL DEFAULT false,
    "scheduledDate" TIMESTAMP(3),
    "completedDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "work_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inspections" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "type" "InspectionType" NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "inspector" TEXT NOT NULL,
    "findings" TEXT,
    "status" "InspectionStatus" NOT NULL DEFAULT 'SCHEDULED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inspections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "viewings" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "visitorName" TEXT NOT NULL,
    "visitorEmail" TEXT NOT NULL,
    "visitorPhone" TEXT NOT NULL,
    "scheduledDate" TIMESTAMP(3) NOT NULL,
    "status" "ViewingStatus" NOT NULL DEFAULT 'SCHEDULED',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "viewings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tasks" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "priority" "Priority" NOT NULL DEFAULT 'MEDIUM',
    "status" "TaskStatus" NOT NULL DEFAULT 'PENDING',
    "dueDate" TIMESTAMP(3) NOT NULL,
    "reminderDate" TIMESTAMP(3),
    "assignedToId" TEXT NOT NULL,
    "assignedById" TEXT NOT NULL,
    "stakeholderType" "StakeholderType",
    "stakeholderId" TEXT,
    "leadId" TEXT,
    "enquiryId" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "communications" (
    "id" TEXT NOT NULL,
    "type" "CommunicationType" NOT NULL,
    "direction" "Direction" NOT NULL,
    "subject" TEXT,
    "content" TEXT NOT NULL,
    "status" "CommunicationStatus" NOT NULL DEFAULT 'SENT',
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leadId" TEXT,
    "enquiryId" TEXT,

    CONSTRAINT "communications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" TEXT NOT NULL,
    "type" "MessageType" NOT NULL,
    "category" "MessageCategory" NOT NULL,
    "direction" "Direction" NOT NULL,
    "stakeholderType" "StakeholderType" NOT NULL,
    "stakeholderId" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "sentById" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "MessageStatus" NOT NULL DEFAULT 'SENT',
    "propertyId" TEXT,
    "relatedTo" TEXT,
    "attachments" TEXT[],

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notes" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "leadId" TEXT,
    "enquiryId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "team_members" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "department" "Department" NOT NULL,
    "position" TEXT NOT NULL,
    "reportingTo" TEXT,
    "hireDate" TIMESTAMP(3) NOT NULL,
    "salary" DECIMAL(10,2),
    "status" "EmployeeStatus" NOT NULL DEFAULT 'ACTIVE',
    "skills" TEXT[],
    "certifications" TEXT[],
    "emergencyContact" TEXT,
    "emergencyPhone" TEXT,
    "address" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "team_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attendance" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "checkIn" TIMESTAMP(3),
    "checkOut" TIMESTAMP(3),
    "status" "AttendanceStatus" NOT NULL DEFAULT 'PRESENT',
    "notes" TEXT,
    "location" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "attendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "performance_reviews" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "reviewPeriod" TEXT NOT NULL,
    "overallRating" INTEGER NOT NULL,
    "strengths" TEXT[],
    "areasForImprovement" TEXT[],
    "goals" TEXT[],
    "feedback" TEXT,
    "status" "ReviewStatus" NOT NULL DEFAULT 'PENDING',
    "reviewDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "performance_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leave_requests" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "leaveType" "LeaveType" NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "days" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "status" "LeaveStatus" NOT NULL DEFAULT 'PENDING',
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "leave_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_providerAccountId_key" ON "accounts"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_sessionToken_key" ON "sessions"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_token_key" ON "verification_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_identifier_token_key" ON "verification_tokens"("identifier", "token");

-- CreateIndex
CREATE INDEX "properties_landlordId_idx" ON "properties"("landlordId");

-- CreateIndex
CREATE INDEX "properties_status_idx" ON "properties"("status");

-- CreateIndex
CREATE UNIQUE INDEX "landlords_email_key" ON "landlords"("email");

-- CreateIndex
CREATE UNIQUE INDEX "landlords_idNumber_key" ON "landlords"("idNumber");

-- CreateIndex
CREATE INDEX "landlords_email_idx" ON "landlords"("email");

-- CreateIndex
CREATE INDEX "landlords_status_idx" ON "landlords"("status");

-- CreateIndex
CREATE UNIQUE INDEX "tenants_email_key" ON "tenants"("email");

-- CreateIndex
CREATE UNIQUE INDEX "tenants_idNumber_key" ON "tenants"("idNumber");

-- CreateIndex
CREATE INDEX "tenants_email_idx" ON "tenants"("email");

-- CreateIndex
CREATE INDEX "tenants_propertyId_idx" ON "tenants"("propertyId");

-- CreateIndex
CREATE INDEX "tenants_status_idx" ON "tenants"("status");

-- CreateIndex
CREATE UNIQUE INDEX "vendors_email_key" ON "vendors"("email");

-- CreateIndex
CREATE INDEX "vendors_email_idx" ON "vendors"("email");

-- CreateIndex
CREATE INDEX "vendors_specialization_idx" ON "vendors"("specialization");

-- CreateIndex
CREATE INDEX "vendors_status_idx" ON "vendors"("status");

-- CreateIndex
CREATE INDEX "leads_email_idx" ON "leads"("email");

-- CreateIndex
CREATE INDEX "leads_status_idx" ON "leads"("status");

-- CreateIndex
CREATE INDEX "leads_assignedTo_idx" ON "leads"("assignedTo");

-- CreateIndex
CREATE INDEX "enquiries_email_idx" ON "enquiries"("email");

-- CreateIndex
CREATE INDEX "enquiries_status_idx" ON "enquiries"("status");

-- CreateIndex
CREATE INDEX "enquiries_priority_idx" ON "enquiries"("priority");

-- CreateIndex
CREATE INDEX "leases_tenantId_idx" ON "leases"("tenantId");

-- CreateIndex
CREATE INDEX "leases_propertyId_idx" ON "leases"("propertyId");

-- CreateIndex
CREATE INDEX "leases_status_idx" ON "leases"("status");

-- CreateIndex
CREATE INDEX "payments_tenantId_idx" ON "payments"("tenantId");

-- CreateIndex
CREATE INDEX "payments_leaseId_idx" ON "payments"("leaseId");

-- CreateIndex
CREATE INDEX "payments_status_idx" ON "payments"("status");

-- CreateIndex
CREATE INDEX "payments_dueDate_idx" ON "payments"("dueDate");

-- CreateIndex
CREATE INDEX "payouts_landlordId_idx" ON "payouts"("landlordId");

-- CreateIndex
CREATE INDEX "payouts_status_idx" ON "payouts"("status");

-- CreateIndex
CREATE UNIQUE INDEX "rent_transactions_paymentId_key" ON "rent_transactions"("paymentId");

-- CreateIndex
CREATE INDEX "rent_transactions_paymentId_idx" ON "rent_transactions"("paymentId");

-- CreateIndex
CREATE INDEX "rent_transactions_landlordId_idx" ON "rent_transactions"("landlordId");

-- CreateIndex
CREATE INDEX "rent_transactions_propertyId_idx" ON "rent_transactions"("propertyId");

-- CreateIndex
CREATE INDEX "rent_transactions_tenantId_idx" ON "rent_transactions"("tenantId");

-- CreateIndex
CREATE INDEX "rent_transactions_rentPeriod_idx" ON "rent_transactions"("rentPeriod");

-- CreateIndex
CREATE INDEX "rent_transactions_payoutStatus_idx" ON "rent_transactions"("payoutStatus");

-- CreateIndex
CREATE INDEX "rent_distribution_items_rentTransactionId_idx" ON "rent_distribution_items"("rentTransactionId");

-- CreateIndex
CREATE INDEX "rent_distribution_items_type_idx" ON "rent_distribution_items"("type");

-- CreateIndex
CREATE INDEX "rent_distribution_items_recipientType_idx" ON "rent_distribution_items"("recipientType");

-- CreateIndex
CREATE INDEX "landlord_statements_landlordId_idx" ON "landlord_statements"("landlordId");

-- CreateIndex
CREATE INDEX "landlord_statements_period_idx" ON "landlord_statements"("period");

-- CreateIndex
CREATE INDEX "landlord_statements_startDate_endDate_idx" ON "landlord_statements"("startDate", "endDate");

-- CreateIndex
CREATE UNIQUE INDEX "landlord_statements_landlordId_period_propertyId_key" ON "landlord_statements"("landlordId", "period", "propertyId");

-- CreateIndex
CREATE INDEX "maintenance_requests_tenantId_idx" ON "maintenance_requests"("tenantId");

-- CreateIndex
CREATE INDEX "maintenance_requests_propertyId_idx" ON "maintenance_requests"("propertyId");

-- CreateIndex
CREATE INDEX "maintenance_requests_status_idx" ON "maintenance_requests"("status");

-- CreateIndex
CREATE INDEX "maintenance_requests_priority_idx" ON "maintenance_requests"("priority");

-- CreateIndex
CREATE INDEX "work_orders_vendorId_idx" ON "work_orders"("vendorId");

-- CreateIndex
CREATE INDEX "work_orders_leaseId_idx" ON "work_orders"("leaseId");

-- CreateIndex
CREATE INDEX "work_orders_status_idx" ON "work_orders"("status");

-- CreateIndex
CREATE INDEX "inspections_propertyId_idx" ON "inspections"("propertyId");

-- CreateIndex
CREATE INDEX "inspections_date_idx" ON "inspections"("date");

-- CreateIndex
CREATE INDEX "viewings_propertyId_idx" ON "viewings"("propertyId");

-- CreateIndex
CREATE INDEX "viewings_scheduledDate_idx" ON "viewings"("scheduledDate");

-- CreateIndex
CREATE INDEX "tasks_assignedToId_idx" ON "tasks"("assignedToId");

-- CreateIndex
CREATE INDEX "tasks_status_idx" ON "tasks"("status");

-- CreateIndex
CREATE INDEX "tasks_dueDate_idx" ON "tasks"("dueDate");

-- CreateIndex
CREATE INDEX "communications_leadId_idx" ON "communications"("leadId");

-- CreateIndex
CREATE INDEX "communications_enquiryId_idx" ON "communications"("enquiryId");

-- CreateIndex
CREATE INDEX "messages_stakeholderId_idx" ON "messages"("stakeholderId");

-- CreateIndex
CREATE INDEX "messages_sentById_idx" ON "messages"("sentById");

-- CreateIndex
CREATE INDEX "notes_leadId_idx" ON "notes"("leadId");

-- CreateIndex
CREATE INDEX "notes_enquiryId_idx" ON "notes"("enquiryId");

-- CreateIndex
CREATE UNIQUE INDEX "team_members_userId_key" ON "team_members"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "team_members_employeeId_key" ON "team_members"("employeeId");

-- CreateIndex
CREATE INDEX "team_members_userId_idx" ON "team_members"("userId");

-- CreateIndex
CREATE INDEX "team_members_employeeId_idx" ON "team_members"("employeeId");

-- CreateIndex
CREATE INDEX "team_members_department_idx" ON "team_members"("department");

-- CreateIndex
CREATE INDEX "team_members_status_idx" ON "team_members"("status");

-- CreateIndex
CREATE INDEX "attendance_memberId_idx" ON "attendance"("memberId");

-- CreateIndex
CREATE INDEX "attendance_date_idx" ON "attendance"("date");

-- CreateIndex
CREATE UNIQUE INDEX "attendance_memberId_date_key" ON "attendance"("memberId", "date");

-- CreateIndex
CREATE INDEX "performance_reviews_memberId_idx" ON "performance_reviews"("memberId");

-- CreateIndex
CREATE INDEX "performance_reviews_reviewDate_idx" ON "performance_reviews"("reviewDate");

-- CreateIndex
CREATE INDEX "leave_requests_memberId_idx" ON "leave_requests"("memberId");

-- CreateIndex
CREATE INDEX "leave_requests_startDate_idx" ON "leave_requests"("startDate");

-- CreateIndex
CREATE INDEX "leave_requests_status_idx" ON "leave_requests"("status");

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "properties" ADD CONSTRAINT "properties_landlordId_fkey" FOREIGN KEY ("landlordId") REFERENCES "landlords"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenants" ADD CONSTRAINT "tenants_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leases" ADD CONSTRAINT "leases_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leases" ADD CONSTRAINT "leases_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_leaseId_fkey" FOREIGN KEY ("leaseId") REFERENCES "leases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payouts" ADD CONSTRAINT "payouts_landlordId_fkey" FOREIGN KEY ("landlordId") REFERENCES "landlords"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rent_transactions" ADD CONSTRAINT "rent_transactions_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "payments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rent_transactions" ADD CONSTRAINT "rent_transactions_leaseId_fkey" FOREIGN KEY ("leaseId") REFERENCES "leases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rent_transactions" ADD CONSTRAINT "rent_transactions_landlordId_fkey" FOREIGN KEY ("landlordId") REFERENCES "landlords"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rent_transactions" ADD CONSTRAINT "rent_transactions_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rent_transactions" ADD CONSTRAINT "rent_transactions_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rent_transactions" ADD CONSTRAINT "rent_transactions_payoutId_fkey" FOREIGN KEY ("payoutId") REFERENCES "payouts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rent_distribution_items" ADD CONSTRAINT "rent_distribution_items_rentTransactionId_fkey" FOREIGN KEY ("rentTransactionId") REFERENCES "rent_transactions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "landlord_statements" ADD CONSTRAINT "landlord_statements_landlordId_fkey" FOREIGN KEY ("landlordId") REFERENCES "landlords"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "landlord_statements" ADD CONSTRAINT "landlord_statements_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_requests" ADD CONSTRAINT "maintenance_requests_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_requests" ADD CONSTRAINT "maintenance_requests_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_maintenanceRequestId_fkey" FOREIGN KEY ("maintenanceRequestId") REFERENCES "maintenance_requests"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_leaseId_fkey" FOREIGN KEY ("leaseId") REFERENCES "leases"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inspections" ADD CONSTRAINT "inspections_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "viewings" ADD CONSTRAINT "viewings_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_assignedById_fkey" FOREIGN KEY ("assignedById") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "leads"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_enquiryId_fkey" FOREIGN KEY ("enquiryId") REFERENCES "enquiries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "communications" ADD CONSTRAINT "communications_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "leads"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "communications" ADD CONSTRAINT "communications_enquiryId_fkey" FOREIGN KEY ("enquiryId") REFERENCES "enquiries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_sentById_fkey" FOREIGN KEY ("sentById") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_tenant_fkey" FOREIGN KEY ("stakeholderId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_landlord_fkey" FOREIGN KEY ("stakeholderId") REFERENCES "landlords"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_vendor_fkey" FOREIGN KEY ("stakeholderId") REFERENCES "vendors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notes" ADD CONSTRAINT "notes_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notes" ADD CONSTRAINT "notes_enquiryId_fkey" FOREIGN KEY ("enquiryId") REFERENCES "enquiries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_reportingTo_fkey" FOREIGN KEY ("reportingTo") REFERENCES "team_members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "team_members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "performance_reviews" ADD CONSTRAINT "performance_reviews_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "team_members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leave_requests" ADD CONSTRAINT "leave_requests_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "team_members"("id") ON DELETE CASCADE ON UPDATE CASCADE;
