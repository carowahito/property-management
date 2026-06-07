drop extension if exists "pg_net";

create type "public"."ApplicationStatus" as enum ('SUBMITTED', 'DOCUMENTS_PENDING', 'SCREENING', 'APPROVED', 'REJECTED', 'LANDLORD_REVIEW', 'CONVERTED', 'WITHDRAWN');

create type "public"."ArrearsStep" as enum ('REMINDER_SENT', 'OVERDUE_NOTICE_1', 'PHONE_CALL', 'OVERDUE_NOTICE_2', 'FORMAL_NOTICE', 'LEGAL_REFERRAL', 'RESOLVED');

create type "public"."AttendanceStatus" as enum ('PRESENT', 'ABSENT', 'LATE', 'HALF_DAY', 'WORK_FROM_HOME', 'SICK_LEAVE', 'LEAVE');

create type "public"."CommunicationStatus" as enum ('SENT', 'DELIVERED', 'READ', 'FAILED');

create type "public"."CommunicationType" as enum ('EMAIL', 'PHONE', 'IN_APP', 'WHATSAPP');

create type "public"."Department" as enum ('MANAGEMENT', 'SALES', 'CUSTOMER_CARE', 'OPERATIONS', 'FINANCE', 'MAINTENANCE', 'HR', 'IT', 'MARKETING');

create type "public"."DepositStatus" as enum ('HELD', 'UNDER_REVIEW', 'PARTIALLY_REFUNDED', 'REFUNDED', 'FORFEITED');

create type "public"."Direction" as enum ('SENT', 'RECEIVED');

create type "public"."DistributionType" as enum ('GROSS_RENT', 'SERVICE_CHARGE', 'MANAGEMENT_FEE', 'MAINTENANCE_FEE', 'REPAIR_COST', 'INSURANCE', 'PROPERTY_TAX', 'LATE_FEE', 'AGENT_COMMISSION', 'OTHER_DEDUCTION', 'NET_PAYOUT');

create type "public"."EmployeeStatus" as enum ('ACTIVE', 'INACTIVE', 'ON_LEAVE', 'TERMINATED', 'SUSPENDED');

create type "public"."EnquiryStatus" as enum ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');

create type "public"."FeeType" as enum ('FIXED', 'PERCENTAGE');

create type "public"."GatewayTransactionType" as enum ('INBOUND', 'OUTBOUND');

create type "public"."InspectionStatus" as enum ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

create type "public"."InspectionType" as enum ('MOVE_IN', 'THREE_MONTH', 'ROUTINE_6_MONTH', 'PRE_MOVE_OUT', 'MOVE_OUT', 'ANNUAL');

create type "public"."LeadSource" as enum ('WEBSITE', 'REFERRAL', 'SOCIAL_MEDIA', 'WALK_IN', 'EMAIL', 'PHONE');

create type "public"."LeadStatus" as enum ('NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED', 'LOST');

create type "public"."LeadType" as enum ('TENANT', 'LANDLORD', 'BUYER', 'SELLER');

create type "public"."LeaseStatus" as enum ('ACTIVE', 'EXPIRED', 'TERMINATED', 'PENDING');

create type "public"."LeaseTemplateType" as enum ('RESIDENTIAL_STANDARD', 'RESIDENTIAL_SHORT_TERM', 'COMMERCIAL');

create type "public"."LeaveStatus" as enum ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');

create type "public"."LeaveType" as enum ('ANNUAL', 'SICK', 'PERSONAL', 'MATERNITY', 'PATERNITY', 'UNPAID', 'EMERGENCY');

create type "public"."LedgerEntryType" as enum ('CHARGE', 'PAYMENT', 'CREDIT_NOTE', 'LATE_FEE', 'ADJUSTMENT');

create type "public"."MaintenancePriority" as enum ('EMERGENCY', 'URGENT', 'ROUTINE', 'PREVENTIVE');

create type "public"."MaintenanceStatus" as enum ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

create type "public"."MessageCategory" as enum ('RENT_REMINDER', 'MAINTENANCE', 'LEASE', 'PAYMENT', 'ANNOUNCEMENT', 'SUPPORT', 'OTHER');

create type "public"."MessageStatus" as enum ('SENT', 'DELIVERED', 'READ', 'FAILED');

create type "public"."MessageType" as enum ('EMAIL', 'SMS', 'IN_APP', 'SYSTEM', 'WHATSAPP');

create type "public"."MoveInStatus" as enum ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

create type "public"."PaymentGateway" as enum ('MPESA', 'CARD', 'BANK', 'PESALINK', 'PAYPAL', 'OTHER');

create type "public"."PaymentMethod" as enum ('CASH', 'BANK_TRANSFER', 'MPESA', 'CARD', 'CHEQUE');

create type "public"."PaymentStatus" as enum ('PENDING', 'PAID', 'OVERDUE', 'FAILED', 'REFUNDED');

create type "public"."PaymentType" as enum ('RENT', 'DEPOSIT', 'LATE_FEE', 'UTILITY', 'MAINTENANCE', 'OTHER');

create type "public"."PayoutStatus" as enum ('PENDING', 'PROCESSING', 'PAID', 'FAILED');

create type "public"."Priority" as enum ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

create type "public"."PropertyStatus" as enum ('ACTIVE', 'INACTIVE', 'MAINTENANCE');

create type "public"."PropertyType" as enum ('APARTMENT', 'HOUSE', 'CONDO', 'TOWNHOUSE', 'STUDIO', 'COMMERCIAL');

create type "public"."RecipientType" as enum ('LANDLORD', 'MANAGER', 'SERVICE_PROVIDER', 'VENDOR', 'GOVERNMENT', 'INSURANCE_COMPANY', 'OTHER');

create type "public"."ReconciliationRunStatus" as enum ('IN_PROGRESS', 'COMPLETED', 'FAILED');

create type "public"."ReconciliationStatus" as enum ('UNMATCHED', 'AUTO_MATCHED', 'MANUAL_MATCHED', 'DISPUTED', 'DUPLICATE', 'REFUNDED');

create type "public"."RenewalIntent" as enum ('RENEW_SAME', 'RENEW_NEW_RENT', 'NOT_RENEWING');

create type "public"."RenewalStatus" as enum ('PENDING', 'LANDLORD_REVIEW', 'RENT_REVIEW', 'TENANT_NOTIFIED', 'ACCEPTED', 'DECLINED', 'RENEWED', 'EXPIRED', 'MONTH_TO_MONTH');

create type "public"."ReviewStatus" as enum ('PENDING', 'COMPLETED', 'REVIEWED');

create type "public"."StakeholderStatus" as enum ('ACTIVE', 'INACTIVE', 'SUSPENDED');

create type "public"."StakeholderType" as enum ('TENANT', 'LANDLORD', 'VENDOR', 'LEAD', 'ENQUIRY');

create type "public"."StatementStatus" as enum ('DRAFT', 'FINALIZED', 'SENT');

create type "public"."TaskStatus" as enum ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

create type "public"."TenantStatus" as enum ('ACTIVE', 'INACTIVE', 'PENDING', 'EVICTED');

create type "public"."UnitStatus" as enum ('VACANT', 'OCCUPIED', 'MAINTENANCE', 'RESERVED');

create type "public"."UserRole" as enum ('ADMIN', 'MANAGER', 'AGENT', 'STAFF');

create type "public"."ViewingStatus" as enum ('SCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW');

create type "public"."WorkOrderStatus" as enum ('PENDING', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');


  create table "public"."accounts" (
    "id" text not null,
    "userId" text not null,
    "type" text not null,
    "provider" text not null,
    "providerAccountId" text not null,
    "refresh_token" text,
    "access_token" text,
    "expires_at" integer,
    "token_type" text,
    "scope" text,
    "id_token" text,
    "session_state" text
      );



  create table "public"."arrears_escalations" (
    "id" text not null,
    "leaseId" text not null,
    "tenantId" text not null,
    "propertyId" text not null,
    "rentAmount" numeric(10,2) not null,
    "amountOwed" numeric(10,2) not null,
    "daysOverdue" integer not null default 0,
    "currentStep" public."ArrearsStep" not null default 'REMINDER_SENT'::public."ArrearsStep",
    "reminderSentAt" timestamp(3) without time zone,
    "notice1SentAt" timestamp(3) without time zone,
    "phoneCallAt" timestamp(3) without time zone,
    "phoneCallNotes" text,
    "notice2SentAt" timestamp(3) without time zone,
    "landlordNotifiedAt" timestamp(3) without time zone,
    "formalNoticeAt" timestamp(3) without time zone,
    "legalReferralAt" timestamp(3) without time zone,
    "resolvedAt" timestamp(3) without time zone,
    "resolution" text,
    "notes" text,
    "isActive" boolean not null default true,
    "createdAt" timestamp(3) without time zone not null default CURRENT_TIMESTAMP,
    "updatedAt" timestamp(3) without time zone not null
      );



  create table "public"."attendance" (
    "id" text not null,
    "memberId" text not null,
    "date" timestamp(3) without time zone not null,
    "checkIn" timestamp(3) without time zone,
    "checkOut" timestamp(3) without time zone,
    "status" public."AttendanceStatus" not null default 'PRESENT'::public."AttendanceStatus",
    "notes" text,
    "location" text,
    "createdAt" timestamp(3) without time zone not null default CURRENT_TIMESTAMP,
    "updatedAt" timestamp(3) without time zone not null
      );



  create table "public"."communications" (
    "id" text not null,
    "type" public."CommunicationType" not null,
    "direction" public."Direction" not null,
    "subject" text,
    "content" text not null,
    "status" public."CommunicationStatus" not null default 'SENT'::public."CommunicationStatus",
    "sentAt" timestamp(3) without time zone not null default CURRENT_TIMESTAMP,
    "leadId" text,
    "enquiryId" text
      );



  create table "public"."companies" (
    "id" text not null,
    "name" text not null,
    "slug" text not null,
    "email" text,
    "phone" text,
    "address" text,
    "city" text,
    "country" text not null default 'Kenya'::text,
    "logo" text,
    "website" text,
    "taxId" text,
    "businessReg" text,
    "status" text not null default 'ACTIVE'::text,
    "plan" text not null default 'FREE'::text,
    "createdAt" timestamp(3) without time zone not null default CURRENT_TIMESTAMP,
    "updatedAt" timestamp(3) without time zone not null default CURRENT_TIMESTAMP
      );



  create table "public"."contractors" (
    "id" text not null,
    "name" text not null,
    "email" text,
    "phone" text not null,
    "trade" text not null,
    "businessRegistration" text,
    "kraPin" text,
    "insurance" boolean not null default false,
    "isVetted" boolean not null default false,
    "isActive" boolean not null default true,
    "rating" numeric(3,2),
    "totalJobs" integer not null default 0,
    "createdAt" timestamp(3) without time zone not null default CURRENT_TIMESTAMP,
    "updatedAt" timestamp(3) without time zone not null,
    "companyId" text not null
      );



  create table "public"."deposits" (
    "id" text not null,
    "tenantId" text not null,
    "leaseId" text not null,
    "propertyId" text not null,
    "amount" numeric(10,2) not null,
    "paymentDate" timestamp(3) without time zone not null,
    "paymentMethod" public."PaymentMethod" not null default 'MPESA'::public."PaymentMethod",
    "paymentReference" text,
    "status" public."DepositStatus" not null default 'HELD'::public."DepositStatus",
    "deductions" jsonb,
    "refundAmount" numeric(10,2),
    "refundDate" timestamp(3) without time zone,
    "refundReference" text,
    "settlementNotes" text,
    "createdAt" timestamp(3) without time zone not null default CURRENT_TIMESTAMP,
    "updatedAt" timestamp(3) without time zone not null
      );



  create table "public"."enquiries" (
    "id" text not null,
    "name" text not null,
    "email" text not null,
    "phone" text not null,
    "subject" text not null,
    "message" text not null,
    "status" public."EnquiryStatus" not null default 'OPEN'::public."EnquiryStatus",
    "priority" public."Priority" not null default 'MEDIUM'::public."Priority",
    "assignedTo" text,
    "createdAt" timestamp(3) without time zone not null default CURRENT_TIMESTAMP,
    "updatedAt" timestamp(3) without time zone not null,
    "resolvedAt" timestamp(3) without time zone,
    "propertyId" text,
    "companyId" text not null
      );



  create table "public"."gateway_transactions" (
    "id" text not null,
    "companyId" text not null,
    "gateway" public."PaymentGateway" not null,
    "transactionType" public."GatewayTransactionType" not null,
    "receiptNumber" text not null,
    "transactionDate" timestamp(3) without time zone not null,
    "amount" numeric(10,2) not null,
    "senderIdentifier" text,
    "recipientIdentifier" text,
    "accountReference" text,
    "transactionDesc" text,
    "senderName" text,
    "recipientName" text,
    "gatewayBalance" numeric(10,2),
    "rawPayload" jsonb,
    "reconciliationStatus" public."ReconciliationStatus" not null default 'UNMATCHED'::public."ReconciliationStatus",
    "matchedTenantId" text,
    "matchedLandlordId" text,
    "matchedLedgerEntryId" text,
    "matchedPayoutId" text,
    "reconciledAt" timestamp(3) without time zone,
    "reconciledBy" text,
    "reconciliationNotes" text,
    "createdAt" timestamp(3) without time zone not null default CURRENT_TIMESTAMP,
    "updatedAt" timestamp(3) without time zone not null default CURRENT_TIMESTAMP
      );



  create table "public"."inspections" (
    "id" text not null,
    "propertyId" text not null,
    "unitId" text,
    "tenantId" text,
    "leaseId" text,
    "type" public."InspectionType" not null,
    "scheduledDate" timestamp(3) without time zone not null,
    "completedDate" timestamp(3) without time zone,
    "inspector" text,
    "overallCondition" text,
    "summary" text,
    "rooms" jsonb,
    "followUpRequired" boolean not null default false,
    "maintenanceItems" jsonb,
    "violations" jsonb,
    "inspectorSignature" text,
    "tenantSignature" text,
    "tenantSignedAt" timestamp(3) without time zone,
    "status" public."InspectionStatus" not null default 'SCHEDULED'::public."InspectionStatus",
    "createdAt" timestamp(3) without time zone not null default CURRENT_TIMESTAMP,
    "updatedAt" timestamp(3) without time zone not null
      );



  create table "public"."landlord_statements" (
    "id" text not null,
    "landlordId" text not null,
    "propertyId" text,
    "period" text not null,
    "startDate" timestamp(3) without time zone not null,
    "endDate" timestamp(3) without time zone not null,
    "totalGrossRent" numeric(10,2) not null,
    "totalServiceCharges" numeric(10,2) not null,
    "totalManagementFees" numeric(10,2) not null,
    "totalMaintenanceFees" numeric(10,2) not null,
    "totalOtherDeductions" numeric(10,2) not null,
    "totalDeductions" numeric(10,2) not null,
    "totalNetAmount" numeric(10,2) not null,
    "transactionCount" integer not null default 0,
    "generated" boolean not null default false,
    "generatedAt" timestamp(3) without time zone,
    "generatedBy" text,
    "sent" boolean not null default false,
    "sentAt" timestamp(3) without time zone,
    "pdfUrl" text,
    "notes" text,
    "createdAt" timestamp(3) without time zone not null default CURRENT_TIMESTAMP,
    "updatedAt" timestamp(3) without time zone not null
      );



  create table "public"."landlords" (
    "id" text not null,
    "name" text not null,
    "email" text not null,
    "phone" text not null,
    "idNumber" text,
    "address" text,
    "bankName" text,
    "bankAccount" text,
    "taxId" text,
    "status" public."StakeholderStatus" not null default 'ACTIVE'::public."StakeholderStatus",
    "managementFeePercent" numeric(5,2),
    "tenantPlacementFee" numeric(5,2),
    "createdAt" timestamp(3) without time zone not null default CURRENT_TIMESTAMP,
    "updatedAt" timestamp(3) without time zone not null,
    "companyId" text not null
      );



  create table "public"."leads" (
    "id" text not null,
    "name" text not null,
    "email" text not null,
    "phone" text not null,
    "type" public."LeadType" not null default 'TENANT'::public."LeadType",
    "status" public."LeadStatus" not null default 'NEW'::public."LeadStatus",
    "source" public."LeadSource" not null default 'WEBSITE'::public."LeadSource",
    "budget" text,
    "moveInDate" timestamp(3) without time zone,
    "preferences" text,
    "notes" text,
    "assignedTo" text,
    "createdAt" timestamp(3) without time zone not null default CURRENT_TIMESTAMP,
    "updatedAt" timestamp(3) without time zone not null,
    "lastContact" timestamp(3) without time zone,
    "convertedAt" timestamp(3) without time zone,
    "companyId" text not null
      );



  create table "public"."lease_renewals" (
    "id" text not null,
    "leaseId" text not null,
    "tenantId" text not null,
    "propertyId" text not null,
    "currentRent" numeric(10,2) not null,
    "leaseEndDate" timestamp(3) without time zone not null,
    "alertDate" timestamp(3) without time zone not null,
    "alertSentAt" timestamp(3) without time zone,
    "agentActionAt" timestamp(3) without time zone,
    "landlordIntent" public."RenewalIntent",
    "landlordDecisionAt" timestamp(3) without time zone,
    "proposedRent" numeric(10,2),
    "rentIncreasePercent" numeric(5,2),
    "marketComparables" jsonb,
    "tenantNotifiedAt" timestamp(3) without time zone,
    "tenantResponse" text,
    "tenantResponseAt" timestamp(3) without time zone,
    "status" public."RenewalStatus" not null default 'PENDING'::public."RenewalStatus",
    "newLeaseId" text,
    "renewalNotes" text,
    "createdAt" timestamp(3) without time zone not null default CURRENT_TIMESTAMP,
    "updatedAt" timestamp(3) without time zone not null
      );



  create table "public"."lease_templates" (
    "id" text not null,
    "name" text not null,
    "type" public."LeaseTemplateType" not null,
    "content" text not null,
    "clauses" jsonb,
    "isDefault" boolean not null default false,
    "isActive" boolean not null default true,
    "createdAt" timestamp(3) without time zone not null default CURRENT_TIMESTAMP,
    "updatedAt" timestamp(3) without time zone not null,
    "companyId" text not null
      );



  create table "public"."leases" (
    "id" text not null,
    "tenantId" text not null,
    "propertyId" text not null,
    "unitId" text,
    "unit" text,
    "startDate" timestamp(3) without time zone not null,
    "endDate" timestamp(3) without time zone not null,
    "monthlyRent" numeric(10,2) not null,
    "securityDeposit" numeric(10,2) not null,
    "status" public."LeaseStatus" not null default 'ACTIVE'::public."LeaseStatus",
    "terms" text,
    "templateId" text,
    "documentHtml" text,
    "noticePeriod" integer not null default 1,
    "rentEscalation" numeric(5,2),
    "petPolicy" text,
    "specialConditions" text,
    "sentForSigning" boolean not null default false,
    "sentAt" timestamp(3) without time zone,
    "tenantSignedAt" timestamp(3) without time zone,
    "landlordSignedAt" timestamp(3) without time zone,
    "tenantSignature" text,
    "landlordSignature" text,
    "createdAt" timestamp(3) without time zone not null default CURRENT_TIMESTAMP,
    "updatedAt" timestamp(3) without time zone not null
      );



  create table "public"."leave_requests" (
    "id" text not null,
    "memberId" text not null,
    "leaveType" public."LeaveType" not null,
    "startDate" timestamp(3) without time zone not null,
    "endDate" timestamp(3) without time zone not null,
    "days" integer not null,
    "reason" text not null,
    "status" public."LeaveStatus" not null default 'PENDING'::public."LeaveStatus",
    "approvedBy" text,
    "approvedAt" timestamp(3) without time zone,
    "notes" text,
    "createdAt" timestamp(3) without time zone not null default CURRENT_TIMESTAMP,
    "updatedAt" timestamp(3) without time zone not null
      );



  create table "public"."maintenance_requests" (
    "id" text not null,
    "tenantId" text not null,
    "propertyId" text not null,
    "unit" text,
    "title" text not null,
    "description" text not null,
    "priority" public."Priority" not null default 'MEDIUM'::public."Priority",
    "status" public."MaintenanceStatus" not null default 'PENDING'::public."MaintenanceStatus",
    "category" text,
    "createdAt" timestamp(3) without time zone not null default CURRENT_TIMESTAMP,
    "updatedAt" timestamp(3) without time zone not null,
    "resolvedAt" timestamp(3) without time zone,
    "triageCategory" public."MaintenancePriority",
    "slaDeadline" timestamp(3) without time zone,
    "slaBreached" boolean not null default false,
    "estimatedCost" numeric(10,2),
    "approvalRequired" boolean not null default false,
    "approvedBy" text,
    "approvedAt" timestamp(3) without time zone,
    "landlordNotified" boolean not null default false,
    "landlordNotifiedAt" timestamp(3) without time zone
      );



  create table "public"."messages" (
    "id" text not null,
    "type" public."MessageType" not null,
    "category" public."MessageCategory" not null,
    "direction" public."Direction" not null,
    "stakeholderType" public."StakeholderType" not null,
    "stakeholderId" text not null,
    "subject" text not null,
    "content" text not null,
    "sentById" text not null,
    "sentAt" timestamp(3) without time zone not null default CURRENT_TIMESTAMP,
    "status" public."MessageStatus" not null default 'SENT'::public."MessageStatus",
    "propertyId" text,
    "relatedTo" text,
    "attachments" text[]
      );



  create table "public"."move_in_checklists" (
    "id" text not null,
    "leaseId" text not null,
    "tenantId" text not null,
    "propertyId" text not null,
    "unitId" text,
    "agreementSigned" boolean not null default false,
    "depositCleared" boolean not null default false,
    "firstMonthCleared" boolean not null default false,
    "inspectionDone" boolean not null default false,
    "metersLogged" boolean not null default false,
    "inventorySigned" boolean not null default false,
    "profileActive" boolean not null default false,
    "welcomePackSent" boolean not null default false,
    "keysHandedOver" boolean not null default false,
    "electricityMeterReading" text,
    "waterMeterReading" text,
    "status" public."MoveInStatus" not null default 'PENDING'::public."MoveInStatus",
    "completedAt" timestamp(3) without time zone,
    "notes" text,
    "createdAt" timestamp(3) without time zone not null default CURRENT_TIMESTAMP,
    "updatedAt" timestamp(3) without time zone not null
      );



  create table "public"."notes" (
    "id" text not null,
    "content" text not null,
    "authorId" text not null,
    "leadId" text,
    "enquiryId" text,
    "createdAt" timestamp(3) without time zone not null default CURRENT_TIMESTAMP,
    "updatedAt" timestamp(3) without time zone not null
      );



  create table "public"."owner_statements" (
    "id" text not null,
    "landlordId" text not null,
    "propertyId" text,
    "month" integer not null,
    "year" integer not null,
    "rentDue" numeric(10,2) not null,
    "rentReceived" numeric(10,2) not null,
    "managementFee" numeric(10,2) not null,
    "managementFeeRate" numeric(5,2) not null,
    "maintenanceCosts" numeric(10,2) not null default 0,
    "otherDeductions" numeric(10,2) not null default 0,
    "netDisbursement" numeric(10,2) not null,
    "depositsHeld" numeric(10,2) not null default 0,
    "lineItems" jsonb,
    "status" public."StatementStatus" not null default 'DRAFT'::public."StatementStatus",
    "generatedAt" timestamp(3) without time zone not null default CURRENT_TIMESTAMP,
    "sentAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone not null default CURRENT_TIMESTAMP,
    "updatedAt" timestamp(3) without time zone not null
      );



  create table "public"."payments" (
    "id" text not null,
    "tenantId" text not null,
    "leaseId" text not null,
    "amount" numeric(10,2) not null,
    "type" public."PaymentType" not null default 'RENT'::public."PaymentType",
    "method" public."PaymentMethod" not null,
    "status" public."PaymentStatus" not null default 'PENDING'::public."PaymentStatus",
    "dueDate" timestamp(3) without time zone not null,
    "paidDate" timestamp(3) without time zone,
    "reference" text,
    "notes" text,
    "createdAt" timestamp(3) without time zone not null default CURRENT_TIMESTAMP,
    "updatedAt" timestamp(3) without time zone not null
      );



  create table "public"."payouts" (
    "id" text not null,
    "landlordId" text not null,
    "unitId" text not null,
    "amount" numeric(10,2) not null,
    "period" text not null,
    "status" public."PayoutStatus" not null default 'PENDING'::public."PayoutStatus",
    "method" public."PaymentMethod" not null,
    "reference" text,
    "notes" text,
    "paidDate" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone not null default CURRENT_TIMESTAMP,
    "updatedAt" timestamp(3) without time zone not null
      );



  create table "public"."performance_reviews" (
    "id" text not null,
    "memberId" text not null,
    "reviewerId" text not null,
    "reviewPeriod" text not null,
    "overallRating" integer not null,
    "strengths" text[],
    "areasForImprovement" text[],
    "goals" text[],
    "feedback" text,
    "status" public."ReviewStatus" not null default 'PENDING'::public."ReviewStatus",
    "reviewDate" timestamp(3) without time zone not null,
    "createdAt" timestamp(3) without time zone not null default CURRENT_TIMESTAMP,
    "updatedAt" timestamp(3) without time zone not null
      );



  create table "public"."properties" (
    "id" text not null,
    "name" text not null,
    "address" text not null,
    "city" text,
    "state" text,
    "postalCode" text,
    "country" text not null default 'Kenya'::text,
    "type" public."PropertyType" not null,
    "totalUnits" integer not null default 1,
    "yearBuilt" integer,
    "status" public."PropertyStatus" not null default 'ACTIVE'::public."PropertyStatus",
    "description" text,
    "landlordId" text,
    "createdAt" timestamp(3) without time zone not null default CURRENT_TIMESTAMP,
    "updatedAt" timestamp(3) without time zone not null,
    "companyId" text not null
      );



  create table "public"."reconciliation_runs" (
    "id" text not null,
    "companyId" text not null,
    "runDate" timestamp(3) without time zone not null default CURRENT_TIMESTAMP,
    "periodStart" timestamp(3) without time zone not null,
    "periodEnd" timestamp(3) without time zone not null,
    "totalMpesaTxns" integer not null default 0,
    "autoMatched" integer not null default 0,
    "manuallyMatched" integer not null default 0,
    "unmatched" integer not null default 0,
    "disputed" integer not null default 0,
    "duplicates" integer not null default 0,
    "totalMpesaAmount" numeric(12,2) not null default 0,
    "totalLedgerExpected" numeric(12,2) not null default 0,
    "variance" numeric(12,2) not null default 0,
    "status" public."ReconciliationRunStatus" not null default 'IN_PROGRESS'::public."ReconciliationRunStatus",
    "completedAt" timestamp(3) without time zone,
    "runBy" text,
    "notes" text,
    "createdAt" timestamp(3) without time zone not null default CURRENT_TIMESTAMP,
    "updatedAt" timestamp(3) without time zone not null default CURRENT_TIMESTAMP
      );



  create table "public"."rent_distribution_items" (
    "id" text not null,
    "rentTransactionId" text not null,
    "unitId" text not null,
    "type" public."DistributionType" not null,
    "description" text not null,
    "amount" numeric(10,2) not null,
    "recipientType" public."RecipientType" not null,
    "recipientId" text,
    "recipientName" text,
    "paid" boolean not null default false,
    "paidDate" timestamp(3) without time zone,
    "paymentMethod" public."PaymentMethod",
    "reference" text,
    "createdAt" timestamp(3) without time zone not null default CURRENT_TIMESTAMP,
    "updatedAt" timestamp(3) without time zone not null
      );



  create table "public"."rent_transactions" (
    "id" text not null,
    "paymentId" text,
    "tenantId" text not null,
    "unitId" text not null,
    "leaseId" text not null,
    "landlordId" text not null,
    "propertyId" text not null,
    "grossRent" numeric(10,2) not null,
    "rentPeriod" text not null,
    "dueDate" timestamp(3) without time zone not null,
    "paidDate" timestamp(3) without time zone,
    "serviceCharge" numeric(10,2) not null default 0,
    "managementFee" numeric(10,2) not null default 0,
    "maintenanceFees" numeric(10,2) not null default 0,
    "otherDeductions" numeric(10,2) not null default 0,
    "totalDeductions" numeric(10,2) not null,
    "netAmount" numeric(10,2) not null,
    "lateFees" numeric(10,2) not null default 0,
    "payoutId" text,
    "payoutStatus" public."PayoutStatus" not null default 'PENDING'::public."PayoutStatus",
    "payoutDate" timestamp(3) without time zone,
    "payoutMethod" public."PaymentMethod",
    "payoutReference" text,
    "notes" text,
    "processed" boolean not null default false,
    "processedAt" timestamp(3) without time zone,
    "processedBy" text,
    "createdAt" timestamp(3) without time zone not null default CURRENT_TIMESTAMP,
    "updatedAt" timestamp(3) without time zone not null
      );



  create table "public"."sessions" (
    "id" text not null,
    "sessionToken" text not null,
    "userId" text not null,
    "expires" timestamp(3) without time zone not null
      );



  create table "public"."tasks" (
    "id" text not null,
    "title" text not null,
    "description" text not null,
    "priority" public."Priority" not null default 'MEDIUM'::public."Priority",
    "status" public."TaskStatus" not null default 'PENDING'::public."TaskStatus",
    "dueDate" timestamp(3) without time zone not null,
    "reminderDate" timestamp(3) without time zone,
    "assignedToId" text not null,
    "assignedById" text not null,
    "stakeholderType" public."StakeholderType",
    "stakeholderId" text,
    "leadId" text,
    "enquiryId" text,
    "notes" text,
    "createdAt" timestamp(3) without time zone not null default CURRENT_TIMESTAMP,
    "updatedAt" timestamp(3) without time zone not null,
    "completedAt" timestamp(3) without time zone
      );



  create table "public"."team_members" (
    "id" text not null,
    "userId" text not null,
    "employeeId" text not null,
    "department" public."Department" not null,
    "position" text not null,
    "reportingTo" text,
    "hireDate" timestamp(3) without time zone not null,
    "salary" numeric(10,2),
    "status" public."EmployeeStatus" not null default 'ACTIVE'::public."EmployeeStatus",
    "skills" text[],
    "certifications" text[],
    "emergencyContact" text,
    "emergencyPhone" text,
    "address" text,
    "notes" text,
    "createdAt" timestamp(3) without time zone not null default CURRENT_TIMESTAMP,
    "updatedAt" timestamp(3) without time zone not null
      );



  create table "public"."tenant_applications" (
    "id" text not null,
    "propertyId" text not null,
    "unitId" text,
    "fullName" text not null,
    "email" text not null,
    "phone" text not null,
    "idNumber" text not null,
    "currentAddress" text,
    "employer" text,
    "jobTitle" text,
    "monthlyIncome" numeric(10,2),
    "employmentDuration" text,
    "previousLandlord" text,
    "previousLandlordPhone" text,
    "personalReference" text,
    "personalReferencePhone" text,
    "status" public."ApplicationStatus" not null default 'SUBMITTED'::public."ApplicationStatus",
    "incomeCheckPassed" boolean,
    "crbCheckStatus" text,
    "crbCheckDate" timestamp(3) without time zone,
    "employerVerified" boolean,
    "employerVerifyNotes" text,
    "landlordRefChecked" boolean,
    "landlordRefNotes" text,
    "screeningNotes" text,
    "decidedBy" text,
    "decidedAt" timestamp(3) without time zone,
    "landlordApproved" boolean,
    "landlordApprovalDate" timestamp(3) without time zone,
    "convertedTenantId" text,
    "createdAt" timestamp(3) without time zone not null default CURRENT_TIMESTAMP,
    "updatedAt" timestamp(3) without time zone not null
      );



  create table "public"."tenant_ledger" (
    "id" text not null,
    "tenantId" text not null,
    "leaseId" text not null,
    "unitId" text not null,
    "date" timestamp(3) without time zone not null,
    "type" public."LedgerEntryType" not null,
    "description" text not null,
    "reference" text,
    "period" text,
    "debit" numeric(10,2) not null default 0,
    "credit" numeric(10,2) not null default 0,
    "balance" numeric(10,2) not null,
    "paymentId" text,
    "notes" text,
    "createdAt" timestamp(3) without time zone not null default CURRENT_TIMESTAMP,
    "updatedAt" timestamp(3) without time zone not null default CURRENT_TIMESTAMP
      );



  create table "public"."tenants" (
    "id" text not null,
    "name" text not null,
    "email" text not null,
    "phone" text not null,
    "idNumber" text,
    "emergencyContact" text,
    "emergencyPhone" text,
    "propertyId" text not null,
    "unitId" text,
    "unit" text,
    "moveInDate" timestamp(3) without time zone,
    "moveOutDate" timestamp(3) without time zone,
    "status" public."TenantStatus" not null default 'ACTIVE'::public."TenantStatus",
    "createdAt" timestamp(3) without time zone not null default CURRENT_TIMESTAMP,
    "updatedAt" timestamp(3) without time zone not null,
    "companyId" text not null
      );



  create table "public"."units" (
    "id" text not null,
    "unitNumber" text not null,
    "propertyId" text not null,
    "landlordId" text not null,
    "floor" integer,
    "bedrooms" integer,
    "bathrooms" integer,
    "sizeSqm" double precision,
    "status" public."UnitStatus" not null default 'VACANT'::public."UnitStatus",
    "monthlyRent" numeric(10,2),
    "serviceCharge" numeric(10,2),
    "serviceChargeType" public."FeeType" not null default 'FIXED'::public."FeeType",
    "managementFee" numeric(10,2),
    "managementFeeType" public."FeeType" not null default 'PERCENTAGE'::public."FeeType",
    "description" text,
    "createdAt" timestamp(3) without time zone not null default CURRENT_TIMESTAMP,
    "updatedAt" timestamp(3) without time zone not null
      );



  create table "public"."users" (
    "id" text not null,
    "email" text not null,
    "emailVerified" timestamp(3) without time zone,
    "password" text not null,
    "name" text,
    "image" text,
    "role" public."UserRole" not null default 'ADMIN'::public."UserRole",
    "active" boolean not null default true,
    "createdAt" timestamp(3) without time zone not null default CURRENT_TIMESTAMP,
    "updatedAt" timestamp(3) without time zone not null,
    "companyId" text not null
      );



  create table "public"."vendors" (
    "id" text not null,
    "name" text not null,
    "email" text not null,
    "phone" text not null,
    "specialization" text not null,
    "rating" double precision not null default 0,
    "status" public."StakeholderStatus" not null default 'ACTIVE'::public."StakeholderStatus",
    "address" text,
    "licenseNumber" text,
    "createdAt" timestamp(3) without time zone not null default CURRENT_TIMESTAMP,
    "updatedAt" timestamp(3) without time zone not null,
    "companyId" text not null
      );



  create table "public"."verification_tokens" (
    "identifier" text not null,
    "token" text not null,
    "expires" timestamp(3) without time zone not null
      );



  create table "public"."viewings" (
    "id" text not null,
    "propertyId" text not null,
    "visitorName" text not null,
    "visitorEmail" text not null,
    "visitorPhone" text not null,
    "scheduledDate" timestamp(3) without time zone not null,
    "status" public."ViewingStatus" not null default 'SCHEDULED'::public."ViewingStatus",
    "notes" text,
    "createdAt" timestamp(3) without time zone not null default CURRENT_TIMESTAMP,
    "updatedAt" timestamp(3) without time zone not null
      );



  create table "public"."work_orders" (
    "id" text not null,
    "maintenanceRequestId" text,
    "vendorId" text,
    "contractorId" text,
    "leaseId" text,
    "title" text not null,
    "description" text not null,
    "status" public."WorkOrderStatus" not null default 'PENDING'::public."WorkOrderStatus",
    "priority" public."Priority" not null default 'MEDIUM'::public."Priority",
    "estimatedCost" numeric(10,2),
    "actualCost" numeric(10,2),
    "cost" numeric(10,2),
    "landlordApproved" boolean not null default false,
    "scheduledDate" timestamp(3) without time zone,
    "completedDate" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone not null default CURRENT_TIMESTAMP,
    "updatedAt" timestamp(3) without time zone not null
      );


CREATE UNIQUE INDEX accounts_pkey ON public.accounts USING btree (id);

CREATE UNIQUE INDEX "accounts_provider_providerAccountId_key" ON public.accounts USING btree (provider, "providerAccountId");

CREATE INDEX "arrears_escalations_currentStep_idx" ON public.arrears_escalations USING btree ("currentStep");

CREATE INDEX "arrears_escalations_isActive_idx" ON public.arrears_escalations USING btree ("isActive");

CREATE INDEX "arrears_escalations_leaseId_idx" ON public.arrears_escalations USING btree ("leaseId");

CREATE UNIQUE INDEX arrears_escalations_pkey ON public.arrears_escalations USING btree (id);

CREATE INDEX "arrears_escalations_tenantId_idx" ON public.arrears_escalations USING btree ("tenantId");

CREATE INDEX attendance_date_idx ON public.attendance USING btree (date);

CREATE UNIQUE INDEX "attendance_memberId_date_key" ON public.attendance USING btree ("memberId", date);

CREATE INDEX "attendance_memberId_idx" ON public.attendance USING btree ("memberId");

CREATE UNIQUE INDEX attendance_pkey ON public.attendance USING btree (id);

CREATE INDEX "communications_enquiryId_idx" ON public.communications USING btree ("enquiryId");

CREATE INDEX "communications_leadId_idx" ON public.communications USING btree ("leadId");

CREATE UNIQUE INDEX communications_pkey ON public.communications USING btree (id);

CREATE UNIQUE INDEX companies_pkey ON public.companies USING btree (id);

CREATE INDEX companies_slug_idx ON public.companies USING btree (slug);

CREATE UNIQUE INDEX companies_slug_key ON public.companies USING btree (slug);

CREATE INDEX companies_status_idx ON public.companies USING btree (status);

CREATE INDEX contractors_companyid_idx ON public.contractors USING btree ("companyId");

CREATE INDEX "contractors_isVetted_isActive_idx" ON public.contractors USING btree ("isVetted", "isActive");

CREATE UNIQUE INDEX contractors_pkey ON public.contractors USING btree (id);

CREATE INDEX contractors_trade_idx ON public.contractors USING btree (trade);

CREATE INDEX "deposits_leaseId_idx" ON public.deposits USING btree ("leaseId");

CREATE UNIQUE INDEX deposits_pkey ON public.deposits USING btree (id);

CREATE INDEX "deposits_propertyId_idx" ON public.deposits USING btree ("propertyId");

CREATE INDEX deposits_status_idx ON public.deposits USING btree (status);

CREATE INDEX "deposits_tenantId_idx" ON public.deposits USING btree ("tenantId");

CREATE INDEX enquiries_companyid_idx ON public.enquiries USING btree ("companyId");

CREATE INDEX enquiries_email_idx ON public.enquiries USING btree (email);

CREATE UNIQUE INDEX enquiries_pkey ON public.enquiries USING btree (id);

CREATE INDEX enquiries_priority_idx ON public.enquiries USING btree (priority);

CREATE INDEX enquiries_status_idx ON public.enquiries USING btree (status);

CREATE UNIQUE INDEX gateway_transactions_pkey ON public.gateway_transactions USING btree (id);

CREATE UNIQUE INDEX "gateway_transactions_receiptNumber_key" ON public.gateway_transactions USING btree ("receiptNumber");

CREATE INDEX gw_txn_account_idx ON public.gateway_transactions USING btree ("accountReference");

CREATE INDEX gw_txn_company_idx ON public.gateway_transactions USING btree ("companyId");

CREATE INDEX gw_txn_date_idx ON public.gateway_transactions USING btree ("transactionDate");

CREATE INDEX gw_txn_gateway_idx ON public.gateway_transactions USING btree (gateway);

CREATE INDEX gw_txn_receipt_idx ON public.gateway_transactions USING btree ("receiptNumber");

CREATE INDEX gw_txn_recon_idx ON public.gateway_transactions USING btree ("reconciliationStatus");

CREATE INDEX gw_txn_sender_idx ON public.gateway_transactions USING btree ("senderIdentifier");

CREATE UNIQUE INDEX inspections_pkey ON public.inspections USING btree (id);

CREATE INDEX "inspections_propertyId_idx" ON public.inspections USING btree ("propertyId");

CREATE INDEX "inspections_scheduledDate_idx" ON public.inspections USING btree ("scheduledDate");

CREATE INDEX inspections_status_idx ON public.inspections USING btree (status);

CREATE INDEX "inspections_tenantId_idx" ON public.inspections USING btree ("tenantId");

CREATE INDEX inspections_type_idx ON public.inspections USING btree (type);

CREATE INDEX "landlord_statements_landlordId_idx" ON public.landlord_statements USING btree ("landlordId");

CREATE UNIQUE INDEX "landlord_statements_landlordId_period_propertyId_key" ON public.landlord_statements USING btree ("landlordId", period, "propertyId");

CREATE INDEX landlord_statements_period_idx ON public.landlord_statements USING btree (period);

CREATE UNIQUE INDEX landlord_statements_pkey ON public.landlord_statements USING btree (id);

CREATE INDEX "landlord_statements_startDate_endDate_idx" ON public.landlord_statements USING btree ("startDate", "endDate");

CREATE UNIQUE INDEX landlords_companyid_email_key ON public.landlords USING btree ("companyId", email);

CREATE INDEX landlords_companyid_idx ON public.landlords USING btree ("companyId");

CREATE INDEX landlords_email_idx ON public.landlords USING btree (email);

CREATE UNIQUE INDEX landlords_email_key ON public.landlords USING btree (email);

CREATE UNIQUE INDEX "landlords_idNumber_key" ON public.landlords USING btree ("idNumber");

CREATE UNIQUE INDEX landlords_pkey ON public.landlords USING btree (id);

CREATE INDEX landlords_status_idx ON public.landlords USING btree (status);

CREATE INDEX "leads_assignedTo_idx" ON public.leads USING btree ("assignedTo");

CREATE INDEX leads_companyid_idx ON public.leads USING btree ("companyId");

CREATE INDEX leads_email_idx ON public.leads USING btree (email);

CREATE UNIQUE INDEX leads_pkey ON public.leads USING btree (id);

CREATE INDEX leads_status_idx ON public.leads USING btree (status);

CREATE INDEX "lease_renewals_alertDate_idx" ON public.lease_renewals USING btree ("alertDate");

CREATE INDEX "lease_renewals_leaseId_idx" ON public.lease_renewals USING btree ("leaseId");

CREATE UNIQUE INDEX lease_renewals_pkey ON public.lease_renewals USING btree (id);

CREATE INDEX lease_renewals_status_idx ON public.lease_renewals USING btree (status);

CREATE INDEX lease_templates_companyid_idx ON public.lease_templates USING btree ("companyId");

CREATE UNIQUE INDEX lease_templates_pkey ON public.lease_templates USING btree (id);

CREATE UNIQUE INDEX leases_pkey ON public.leases USING btree (id);

CREATE INDEX "leases_propertyId_idx" ON public.leases USING btree ("propertyId");

CREATE INDEX leases_status_idx ON public.leases USING btree (status);

CREATE INDEX "leases_templateId_idx" ON public.leases USING btree ("templateId");

CREATE INDEX "leases_tenantId_idx" ON public.leases USING btree ("tenantId");

CREATE INDEX "leases_unitId_idx" ON public.leases USING btree ("unitId");

CREATE INDEX "leave_requests_memberId_idx" ON public.leave_requests USING btree ("memberId");

CREATE UNIQUE INDEX leave_requests_pkey ON public.leave_requests USING btree (id);

CREATE INDEX "leave_requests_startDate_idx" ON public.leave_requests USING btree ("startDate");

CREATE INDEX leave_requests_status_idx ON public.leave_requests USING btree (status);

CREATE UNIQUE INDEX maintenance_requests_pkey ON public.maintenance_requests USING btree (id);

CREATE INDEX maintenance_requests_priority_idx ON public.maintenance_requests USING btree (priority);

CREATE INDEX "maintenance_requests_propertyId_idx" ON public.maintenance_requests USING btree ("propertyId");

CREATE INDEX "maintenance_requests_slaBreached_idx" ON public.maintenance_requests USING btree ("slaBreached");

CREATE INDEX maintenance_requests_status_idx ON public.maintenance_requests USING btree (status);

CREATE INDEX "maintenance_requests_tenantId_idx" ON public.maintenance_requests USING btree ("tenantId");

CREATE UNIQUE INDEX messages_pkey ON public.messages USING btree (id);

CREATE INDEX "messages_sentById_idx" ON public.messages USING btree ("sentById");

CREATE INDEX "messages_stakeholderId_idx" ON public.messages USING btree ("stakeholderId");

CREATE UNIQUE INDEX "move_in_checklists_leaseId_key" ON public.move_in_checklists USING btree ("leaseId");

CREATE UNIQUE INDEX move_in_checklists_pkey ON public.move_in_checklists USING btree (id);

CREATE INDEX "move_in_checklists_propertyId_idx" ON public.move_in_checklists USING btree ("propertyId");

CREATE INDEX move_in_checklists_status_idx ON public.move_in_checklists USING btree (status);

CREATE INDEX "move_in_checklists_tenantId_idx" ON public.move_in_checklists USING btree ("tenantId");

CREATE INDEX "notes_enquiryId_idx" ON public.notes USING btree ("enquiryId");

CREATE INDEX "notes_leadId_idx" ON public.notes USING btree ("leadId");

CREATE UNIQUE INDEX notes_pkey ON public.notes USING btree (id);

CREATE INDEX "owner_statements_landlordId_idx" ON public.owner_statements USING btree ("landlordId");

CREATE UNIQUE INDEX "owner_statements_landlordId_propertyId_month_year_key" ON public.owner_statements USING btree ("landlordId", "propertyId", month, year);

CREATE INDEX owner_statements_month_year_idx ON public.owner_statements USING btree (month, year);

CREATE UNIQUE INDEX owner_statements_pkey ON public.owner_statements USING btree (id);

CREATE INDEX "owner_statements_propertyId_idx" ON public.owner_statements USING btree ("propertyId");

CREATE INDEX "payments_dueDate_idx" ON public.payments USING btree ("dueDate");

CREATE INDEX "payments_leaseId_idx" ON public.payments USING btree ("leaseId");

CREATE UNIQUE INDEX payments_pkey ON public.payments USING btree (id);

CREATE UNIQUE INDEX payments_reference_key ON public.payments USING btree (reference);

CREATE INDEX payments_status_idx ON public.payments USING btree (status);

CREATE INDEX "payments_tenantId_idx" ON public.payments USING btree ("tenantId");

CREATE INDEX "payouts_landlordId_idx" ON public.payouts USING btree ("landlordId");

CREATE UNIQUE INDEX payouts_pkey ON public.payouts USING btree (id);

CREATE UNIQUE INDEX payouts_reference_key ON public.payouts USING btree (reference);

CREATE INDEX payouts_status_idx ON public.payouts USING btree (status);

CREATE INDEX "payouts_unitId_idx" ON public.payouts USING btree ("unitId");

CREATE INDEX "performance_reviews_memberId_idx" ON public.performance_reviews USING btree ("memberId");

CREATE UNIQUE INDEX performance_reviews_pkey ON public.performance_reviews USING btree (id);

CREATE INDEX "performance_reviews_reviewDate_idx" ON public.performance_reviews USING btree ("reviewDate");

CREATE INDEX properties_companyid_idx ON public.properties USING btree ("companyId");

CREATE INDEX "properties_landlordId_idx" ON public.properties USING btree ("landlordId");

CREATE UNIQUE INDEX properties_pkey ON public.properties USING btree (id);

CREATE INDEX properties_status_idx ON public.properties USING btree (status);

CREATE INDEX recon_run_company_idx ON public.reconciliation_runs USING btree ("companyId");

CREATE INDEX recon_run_date_idx ON public.reconciliation_runs USING btree ("runDate");

CREATE UNIQUE INDEX reconciliation_runs_pkey ON public.reconciliation_runs USING btree (id);

CREATE UNIQUE INDEX rent_distribution_items_pkey ON public.rent_distribution_items USING btree (id);

CREATE INDEX "rent_distribution_items_recipientType_idx" ON public.rent_distribution_items USING btree ("recipientType");

CREATE UNIQUE INDEX rent_distribution_items_reference_key ON public.rent_distribution_items USING btree (reference);

CREATE INDEX "rent_distribution_items_rentTransactionId_idx" ON public.rent_distribution_items USING btree ("rentTransactionId");

CREATE INDEX rent_distribution_items_type_idx ON public.rent_distribution_items USING btree (type);

CREATE INDEX "rent_distribution_items_unitId_idx" ON public.rent_distribution_items USING btree ("unitId");

CREATE INDEX "rent_transactions_landlordId_idx" ON public.rent_transactions USING btree ("landlordId");

CREATE INDEX "rent_transactions_leaseId_idx" ON public.rent_transactions USING btree ("leaseId");

CREATE INDEX "rent_transactions_paymentId_idx" ON public.rent_transactions USING btree ("paymentId");

CREATE INDEX "rent_transactions_payoutStatus_idx" ON public.rent_transactions USING btree ("payoutStatus");

CREATE UNIQUE INDEX rent_transactions_pkey ON public.rent_transactions USING btree (id);

CREATE INDEX "rent_transactions_propertyId_idx" ON public.rent_transactions USING btree ("propertyId");

CREATE INDEX "rent_transactions_rentPeriod_idx" ON public.rent_transactions USING btree ("rentPeriod");

CREATE INDEX "rent_transactions_tenantId_idx" ON public.rent_transactions USING btree ("tenantId");

CREATE INDEX "rent_transactions_unitId_idx" ON public.rent_transactions USING btree ("unitId");

CREATE UNIQUE INDEX sessions_pkey ON public.sessions USING btree (id);

CREATE UNIQUE INDEX "sessions_sessionToken_key" ON public.sessions USING btree ("sessionToken");

CREATE INDEX "tasks_assignedToId_idx" ON public.tasks USING btree ("assignedToId");

CREATE INDEX "tasks_dueDate_idx" ON public.tasks USING btree ("dueDate");

CREATE UNIQUE INDEX tasks_pkey ON public.tasks USING btree (id);

CREATE INDEX tasks_status_idx ON public.tasks USING btree (status);

CREATE INDEX team_members_department_idx ON public.team_members USING btree (department);

CREATE INDEX "team_members_employeeId_idx" ON public.team_members USING btree ("employeeId");

CREATE UNIQUE INDEX "team_members_employeeId_key" ON public.team_members USING btree ("employeeId");

CREATE UNIQUE INDEX team_members_pkey ON public.team_members USING btree (id);

CREATE INDEX team_members_status_idx ON public.team_members USING btree (status);

CREATE INDEX "team_members_userId_idx" ON public.team_members USING btree ("userId");

CREATE UNIQUE INDEX "team_members_userId_key" ON public.team_members USING btree ("userId");

CREATE UNIQUE INDEX tenant_applications_pkey ON public.tenant_applications USING btree (id);

CREATE INDEX "tenant_applications_propertyId_idx" ON public.tenant_applications USING btree ("propertyId");

CREATE INDEX tenant_applications_status_idx ON public.tenant_applications USING btree (status);

CREATE INDEX tenant_ledger_date_idx ON public.tenant_ledger USING btree (date);

CREATE INDEX tenant_ledger_leaseid_idx ON public.tenant_ledger USING btree ("leaseId");

CREATE UNIQUE INDEX tenant_ledger_pkey ON public.tenant_ledger USING btree (id);

CREATE INDEX tenant_ledger_tenantid_idx ON public.tenant_ledger USING btree ("tenantId");

CREATE INDEX tenant_ledger_type_idx ON public.tenant_ledger USING btree (type);

CREATE INDEX tenant_ledger_unitid_idx ON public.tenant_ledger USING btree ("unitId");

CREATE UNIQUE INDEX tenants_companyid_email_key ON public.tenants USING btree ("companyId", email);

CREATE INDEX tenants_companyid_idx ON public.tenants USING btree ("companyId");

CREATE INDEX tenants_email_idx ON public.tenants USING btree (email);

CREATE UNIQUE INDEX tenants_email_key ON public.tenants USING btree (email);

CREATE UNIQUE INDEX "tenants_idNumber_key" ON public.tenants USING btree ("idNumber");

CREATE UNIQUE INDEX tenants_pkey ON public.tenants USING btree (id);

CREATE INDEX "tenants_propertyId_idx" ON public.tenants USING btree ("propertyId");

CREATE INDEX tenants_status_idx ON public.tenants USING btree (status);

CREATE INDEX "tenants_unitId_idx" ON public.tenants USING btree ("unitId");

CREATE INDEX "units_landlordId_idx" ON public.units USING btree ("landlordId");

CREATE UNIQUE INDEX units_pkey ON public.units USING btree (id);

CREATE INDEX "units_propertyId_idx" ON public.units USING btree ("propertyId");

CREATE INDEX units_status_idx ON public.units USING btree (status);

CREATE UNIQUE INDEX "units_unitNumber_key" ON public.units USING btree ("unitNumber");

CREATE UNIQUE INDEX users_companyid_email_key ON public.users USING btree ("companyId", email);

CREATE INDEX users_companyid_idx ON public.users USING btree ("companyId");

CREATE INDEX users_email_idx ON public.users USING btree (email);

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);

CREATE UNIQUE INDEX users_pkey ON public.users USING btree (id);

CREATE UNIQUE INDEX vendors_companyid_email_key ON public.vendors USING btree ("companyId", email);

CREATE INDEX vendors_companyid_idx ON public.vendors USING btree ("companyId");

CREATE INDEX vendors_email_idx ON public.vendors USING btree (email);

CREATE UNIQUE INDEX vendors_email_key ON public.vendors USING btree (email);

CREATE UNIQUE INDEX vendors_pkey ON public.vendors USING btree (id);

CREATE INDEX vendors_specialization_idx ON public.vendors USING btree (specialization);

CREATE INDEX vendors_status_idx ON public.vendors USING btree (status);

CREATE UNIQUE INDEX verification_tokens_identifier_token_key ON public.verification_tokens USING btree (identifier, token);

CREATE UNIQUE INDEX verification_tokens_token_key ON public.verification_tokens USING btree (token);

CREATE UNIQUE INDEX viewings_pkey ON public.viewings USING btree (id);

CREATE INDEX "viewings_propertyId_idx" ON public.viewings USING btree ("propertyId");

CREATE INDEX "viewings_scheduledDate_idx" ON public.viewings USING btree ("scheduledDate");

CREATE INDEX "work_orders_contractorId_idx" ON public.work_orders USING btree ("contractorId");

CREATE INDEX "work_orders_leaseId_idx" ON public.work_orders USING btree ("leaseId");

CREATE UNIQUE INDEX work_orders_pkey ON public.work_orders USING btree (id);

CREATE INDEX work_orders_status_idx ON public.work_orders USING btree (status);

CREATE INDEX "work_orders_vendorId_idx" ON public.work_orders USING btree ("vendorId");

alter table "public"."accounts" add constraint "accounts_pkey" PRIMARY KEY using index "accounts_pkey";

alter table "public"."arrears_escalations" add constraint "arrears_escalations_pkey" PRIMARY KEY using index "arrears_escalations_pkey";

alter table "public"."attendance" add constraint "attendance_pkey" PRIMARY KEY using index "attendance_pkey";

alter table "public"."communications" add constraint "communications_pkey" PRIMARY KEY using index "communications_pkey";

alter table "public"."companies" add constraint "companies_pkey" PRIMARY KEY using index "companies_pkey";

alter table "public"."contractors" add constraint "contractors_pkey" PRIMARY KEY using index "contractors_pkey";

alter table "public"."deposits" add constraint "deposits_pkey" PRIMARY KEY using index "deposits_pkey";

alter table "public"."enquiries" add constraint "enquiries_pkey" PRIMARY KEY using index "enquiries_pkey";

alter table "public"."gateway_transactions" add constraint "gateway_transactions_pkey" PRIMARY KEY using index "gateway_transactions_pkey";

alter table "public"."inspections" add constraint "inspections_pkey" PRIMARY KEY using index "inspections_pkey";

alter table "public"."landlord_statements" add constraint "landlord_statements_pkey" PRIMARY KEY using index "landlord_statements_pkey";

alter table "public"."landlords" add constraint "landlords_pkey" PRIMARY KEY using index "landlords_pkey";

alter table "public"."leads" add constraint "leads_pkey" PRIMARY KEY using index "leads_pkey";

alter table "public"."lease_renewals" add constraint "lease_renewals_pkey" PRIMARY KEY using index "lease_renewals_pkey";

alter table "public"."lease_templates" add constraint "lease_templates_pkey" PRIMARY KEY using index "lease_templates_pkey";

alter table "public"."leases" add constraint "leases_pkey" PRIMARY KEY using index "leases_pkey";

alter table "public"."leave_requests" add constraint "leave_requests_pkey" PRIMARY KEY using index "leave_requests_pkey";

alter table "public"."maintenance_requests" add constraint "maintenance_requests_pkey" PRIMARY KEY using index "maintenance_requests_pkey";

alter table "public"."messages" add constraint "messages_pkey" PRIMARY KEY using index "messages_pkey";

alter table "public"."move_in_checklists" add constraint "move_in_checklists_pkey" PRIMARY KEY using index "move_in_checklists_pkey";

alter table "public"."notes" add constraint "notes_pkey" PRIMARY KEY using index "notes_pkey";

alter table "public"."owner_statements" add constraint "owner_statements_pkey" PRIMARY KEY using index "owner_statements_pkey";

alter table "public"."payments" add constraint "payments_pkey" PRIMARY KEY using index "payments_pkey";

alter table "public"."payouts" add constraint "payouts_pkey" PRIMARY KEY using index "payouts_pkey";

alter table "public"."performance_reviews" add constraint "performance_reviews_pkey" PRIMARY KEY using index "performance_reviews_pkey";

alter table "public"."properties" add constraint "properties_pkey" PRIMARY KEY using index "properties_pkey";

alter table "public"."reconciliation_runs" add constraint "reconciliation_runs_pkey" PRIMARY KEY using index "reconciliation_runs_pkey";

alter table "public"."rent_distribution_items" add constraint "rent_distribution_items_pkey" PRIMARY KEY using index "rent_distribution_items_pkey";

alter table "public"."rent_transactions" add constraint "rent_transactions_pkey" PRIMARY KEY using index "rent_transactions_pkey";

alter table "public"."sessions" add constraint "sessions_pkey" PRIMARY KEY using index "sessions_pkey";

alter table "public"."tasks" add constraint "tasks_pkey" PRIMARY KEY using index "tasks_pkey";

alter table "public"."team_members" add constraint "team_members_pkey" PRIMARY KEY using index "team_members_pkey";

alter table "public"."tenant_applications" add constraint "tenant_applications_pkey" PRIMARY KEY using index "tenant_applications_pkey";

alter table "public"."tenant_ledger" add constraint "tenant_ledger_pkey" PRIMARY KEY using index "tenant_ledger_pkey";

alter table "public"."tenants" add constraint "tenants_pkey" PRIMARY KEY using index "tenants_pkey";

alter table "public"."units" add constraint "units_pkey" PRIMARY KEY using index "units_pkey";

alter table "public"."users" add constraint "users_pkey" PRIMARY KEY using index "users_pkey";

alter table "public"."vendors" add constraint "vendors_pkey" PRIMARY KEY using index "vendors_pkey";

alter table "public"."viewings" add constraint "viewings_pkey" PRIMARY KEY using index "viewings_pkey";

alter table "public"."work_orders" add constraint "work_orders_pkey" PRIMARY KEY using index "work_orders_pkey";

alter table "public"."accounts" add constraint "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."accounts" validate constraint "accounts_userId_fkey";

alter table "public"."arrears_escalations" add constraint "arrears_escalations_leaseId_fkey" FOREIGN KEY ("leaseId") REFERENCES public.leases(id) ON UPDATE CASCADE ON DELETE RESTRICT not valid;

alter table "public"."arrears_escalations" validate constraint "arrears_escalations_leaseId_fkey";

alter table "public"."arrears_escalations" add constraint "arrears_escalations_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES public.properties(id) ON UPDATE CASCADE ON DELETE RESTRICT not valid;

alter table "public"."arrears_escalations" validate constraint "arrears_escalations_propertyId_fkey";

alter table "public"."arrears_escalations" add constraint "arrears_escalations_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE RESTRICT not valid;

alter table "public"."arrears_escalations" validate constraint "arrears_escalations_tenantId_fkey";

alter table "public"."attendance" add constraint "attendance_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES public.team_members(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."attendance" validate constraint "attendance_memberId_fkey";

alter table "public"."communications" add constraint "communications_enquiryId_fkey" FOREIGN KEY ("enquiryId") REFERENCES public.enquiries(id) ON UPDATE CASCADE ON DELETE SET NULL not valid;

alter table "public"."communications" validate constraint "communications_enquiryId_fkey";

alter table "public"."communications" add constraint "communications_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES public.leads(id) ON UPDATE CASCADE ON DELETE SET NULL not valid;

alter table "public"."communications" validate constraint "communications_leadId_fkey";

alter table "public"."companies" add constraint "companies_slug_key" UNIQUE using index "companies_slug_key";

alter table "public"."contractors" add constraint "contractors_companyid_fkey" FOREIGN KEY ("companyId") REFERENCES public.companies(id) ON DELETE CASCADE not valid;

alter table "public"."contractors" validate constraint "contractors_companyid_fkey";

alter table "public"."deposits" add constraint "deposits_leaseId_fkey" FOREIGN KEY ("leaseId") REFERENCES public.leases(id) ON UPDATE CASCADE ON DELETE RESTRICT not valid;

alter table "public"."deposits" validate constraint "deposits_leaseId_fkey";

alter table "public"."deposits" add constraint "deposits_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES public.properties(id) ON UPDATE CASCADE ON DELETE RESTRICT not valid;

alter table "public"."deposits" validate constraint "deposits_propertyId_fkey";

alter table "public"."deposits" add constraint "deposits_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE RESTRICT not valid;

alter table "public"."deposits" validate constraint "deposits_tenantId_fkey";

alter table "public"."enquiries" add constraint "enquiries_companyid_fkey" FOREIGN KEY ("companyId") REFERENCES public.companies(id) ON DELETE CASCADE not valid;

alter table "public"."enquiries" validate constraint "enquiries_companyid_fkey";

alter table "public"."gateway_transactions" add constraint "gateway_transactions_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public.companies(id) ON DELETE CASCADE not valid;

alter table "public"."gateway_transactions" validate constraint "gateway_transactions_companyId_fkey";

alter table "public"."gateway_transactions" add constraint "gateway_transactions_receiptNumber_key" UNIQUE using index "gateway_transactions_receiptNumber_key";

alter table "public"."inspections" add constraint "inspections_leaseId_fkey" FOREIGN KEY ("leaseId") REFERENCES public.leases(id) ON UPDATE CASCADE ON DELETE SET NULL not valid;

alter table "public"."inspections" validate constraint "inspections_leaseId_fkey";

alter table "public"."inspections" add constraint "inspections_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES public.properties(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."inspections" validate constraint "inspections_propertyId_fkey";

alter table "public"."inspections" add constraint "inspections_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE SET NULL not valid;

alter table "public"."inspections" validate constraint "inspections_tenantId_fkey";

alter table "public"."inspections" add constraint "inspections_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES public.units(id) ON UPDATE CASCADE ON DELETE SET NULL not valid;

alter table "public"."inspections" validate constraint "inspections_unitId_fkey";

alter table "public"."landlord_statements" add constraint "landlord_statements_landlordId_fkey" FOREIGN KEY ("landlordId") REFERENCES public.landlords(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."landlord_statements" validate constraint "landlord_statements_landlordId_fkey";

alter table "public"."landlord_statements" add constraint "landlord_statements_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES public.properties(id) ON UPDATE CASCADE ON DELETE SET NULL not valid;

alter table "public"."landlord_statements" validate constraint "landlord_statements_propertyId_fkey";

alter table "public"."landlords" add constraint "landlords_companyid_fkey" FOREIGN KEY ("companyId") REFERENCES public.companies(id) ON DELETE CASCADE not valid;

alter table "public"."landlords" validate constraint "landlords_companyid_fkey";

alter table "public"."leads" add constraint "leads_companyid_fkey" FOREIGN KEY ("companyId") REFERENCES public.companies(id) ON DELETE CASCADE not valid;

alter table "public"."leads" validate constraint "leads_companyid_fkey";

alter table "public"."lease_renewals" add constraint "lease_renewals_leaseId_fkey" FOREIGN KEY ("leaseId") REFERENCES public.leases(id) ON UPDATE CASCADE ON DELETE RESTRICT not valid;

alter table "public"."lease_renewals" validate constraint "lease_renewals_leaseId_fkey";

alter table "public"."lease_renewals" add constraint "lease_renewals_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES public.properties(id) ON UPDATE CASCADE ON DELETE RESTRICT not valid;

alter table "public"."lease_renewals" validate constraint "lease_renewals_propertyId_fkey";

alter table "public"."lease_renewals" add constraint "lease_renewals_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE RESTRICT not valid;

alter table "public"."lease_renewals" validate constraint "lease_renewals_tenantId_fkey";

alter table "public"."lease_templates" add constraint "lease_templates_companyid_fkey" FOREIGN KEY ("companyId") REFERENCES public.companies(id) ON DELETE CASCADE not valid;

alter table "public"."lease_templates" validate constraint "lease_templates_companyid_fkey";

alter table "public"."leases" add constraint "leases_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES public.properties(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."leases" validate constraint "leases_propertyId_fkey";

alter table "public"."leases" add constraint "leases_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES public.lease_templates(id) ON UPDATE CASCADE ON DELETE SET NULL not valid;

alter table "public"."leases" validate constraint "leases_templateId_fkey";

alter table "public"."leases" add constraint "leases_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."leases" validate constraint "leases_tenantId_fkey";

alter table "public"."leases" add constraint "leases_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES public.units(id) ON UPDATE CASCADE ON DELETE SET NULL not valid;

alter table "public"."leases" validate constraint "leases_unitId_fkey";

alter table "public"."leave_requests" add constraint "leave_requests_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES public.team_members(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."leave_requests" validate constraint "leave_requests_memberId_fkey";

alter table "public"."maintenance_requests" add constraint "maintenance_requests_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES public.properties(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."maintenance_requests" validate constraint "maintenance_requests_propertyId_fkey";

alter table "public"."maintenance_requests" add constraint "maintenance_requests_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."maintenance_requests" validate constraint "maintenance_requests_tenantId_fkey";

alter table "public"."messages" add constraint "messages_landlord_fkey" FOREIGN KEY ("stakeholderId") REFERENCES public.landlords(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."messages" validate constraint "messages_landlord_fkey";

alter table "public"."messages" add constraint "messages_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES public.properties(id) ON UPDATE CASCADE ON DELETE SET NULL not valid;

alter table "public"."messages" validate constraint "messages_propertyId_fkey";

alter table "public"."messages" add constraint "messages_sentById_fkey" FOREIGN KEY ("sentById") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."messages" validate constraint "messages_sentById_fkey";

alter table "public"."messages" add constraint "messages_tenant_fkey" FOREIGN KEY ("stakeholderId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."messages" validate constraint "messages_tenant_fkey";

alter table "public"."messages" add constraint "messages_vendor_fkey" FOREIGN KEY ("stakeholderId") REFERENCES public.vendors(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."messages" validate constraint "messages_vendor_fkey";

alter table "public"."move_in_checklists" add constraint "move_in_checklists_leaseId_fkey" FOREIGN KEY ("leaseId") REFERENCES public.leases(id) ON UPDATE CASCADE ON DELETE RESTRICT not valid;

alter table "public"."move_in_checklists" validate constraint "move_in_checklists_leaseId_fkey";

alter table "public"."move_in_checklists" add constraint "move_in_checklists_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES public.properties(id) ON UPDATE CASCADE ON DELETE RESTRICT not valid;

alter table "public"."move_in_checklists" validate constraint "move_in_checklists_propertyId_fkey";

alter table "public"."move_in_checklists" add constraint "move_in_checklists_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE RESTRICT not valid;

alter table "public"."move_in_checklists" validate constraint "move_in_checklists_tenantId_fkey";

alter table "public"."notes" add constraint "notes_enquiryId_fkey" FOREIGN KEY ("enquiryId") REFERENCES public.enquiries(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."notes" validate constraint "notes_enquiryId_fkey";

alter table "public"."notes" add constraint "notes_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES public.leads(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."notes" validate constraint "notes_leadId_fkey";

alter table "public"."owner_statements" add constraint "owner_statements_landlordId_fkey" FOREIGN KEY ("landlordId") REFERENCES public.landlords(id) ON UPDATE CASCADE ON DELETE RESTRICT not valid;

alter table "public"."owner_statements" validate constraint "owner_statements_landlordId_fkey";

alter table "public"."owner_statements" add constraint "owner_statements_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES public.properties(id) ON UPDATE CASCADE ON DELETE SET NULL not valid;

alter table "public"."owner_statements" validate constraint "owner_statements_propertyId_fkey";

alter table "public"."payments" add constraint "payments_leaseId_fkey" FOREIGN KEY ("leaseId") REFERENCES public.leases(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."payments" validate constraint "payments_leaseId_fkey";

alter table "public"."payments" add constraint "payments_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."payments" validate constraint "payments_tenantId_fkey";

alter table "public"."payouts" add constraint "payouts_landlordId_fkey" FOREIGN KEY ("landlordId") REFERENCES public.landlords(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."payouts" validate constraint "payouts_landlordId_fkey";

alter table "public"."payouts" add constraint "payouts_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES public.units(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."payouts" validate constraint "payouts_unitId_fkey";

alter table "public"."performance_reviews" add constraint "performance_reviews_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES public.team_members(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."performance_reviews" validate constraint "performance_reviews_memberId_fkey";

alter table "public"."properties" add constraint "properties_companyid_fkey" FOREIGN KEY ("companyId") REFERENCES public.companies(id) ON DELETE CASCADE not valid;

alter table "public"."properties" validate constraint "properties_companyid_fkey";

alter table "public"."properties" add constraint "properties_landlordId_fkey" FOREIGN KEY ("landlordId") REFERENCES public.landlords(id) ON UPDATE CASCADE ON DELETE SET NULL not valid;

alter table "public"."properties" validate constraint "properties_landlordId_fkey";

alter table "public"."rent_distribution_items" add constraint "rent_distribution_items_rentTransactionId_fkey" FOREIGN KEY ("rentTransactionId") REFERENCES public.rent_transactions(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."rent_distribution_items" validate constraint "rent_distribution_items_rentTransactionId_fkey";

alter table "public"."rent_distribution_items" add constraint "rent_distribution_items_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES public.units(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."rent_distribution_items" validate constraint "rent_distribution_items_unitId_fkey";

alter table "public"."rent_transactions" add constraint "rent_transactions_landlordId_fkey" FOREIGN KEY ("landlordId") REFERENCES public.landlords(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."rent_transactions" validate constraint "rent_transactions_landlordId_fkey";

alter table "public"."rent_transactions" add constraint "rent_transactions_leaseId_fkey" FOREIGN KEY ("leaseId") REFERENCES public.leases(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."rent_transactions" validate constraint "rent_transactions_leaseId_fkey";

alter table "public"."rent_transactions" add constraint "rent_transactions_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES public.payments(id) ON DELETE SET NULL not valid;

alter table "public"."rent_transactions" validate constraint "rent_transactions_paymentId_fkey";

alter table "public"."rent_transactions" add constraint "rent_transactions_payoutId_fkey" FOREIGN KEY ("payoutId") REFERENCES public.payouts(id) ON UPDATE CASCADE ON DELETE SET NULL not valid;

alter table "public"."rent_transactions" validate constraint "rent_transactions_payoutId_fkey";

alter table "public"."rent_transactions" add constraint "rent_transactions_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES public.properties(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."rent_transactions" validate constraint "rent_transactions_propertyId_fkey";

alter table "public"."rent_transactions" add constraint "rent_transactions_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."rent_transactions" validate constraint "rent_transactions_tenantId_fkey";

alter table "public"."rent_transactions" add constraint "rent_transactions_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES public.units(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."rent_transactions" validate constraint "rent_transactions_unitId_fkey";

alter table "public"."sessions" add constraint "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."sessions" validate constraint "sessions_userId_fkey";

alter table "public"."tasks" add constraint "tasks_assignedById_fkey" FOREIGN KEY ("assignedById") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."tasks" validate constraint "tasks_assignedById_fkey";

alter table "public"."tasks" add constraint "tasks_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."tasks" validate constraint "tasks_assignedToId_fkey";

alter table "public"."tasks" add constraint "tasks_enquiryId_fkey" FOREIGN KEY ("enquiryId") REFERENCES public.enquiries(id) ON UPDATE CASCADE ON DELETE SET NULL not valid;

alter table "public"."tasks" validate constraint "tasks_enquiryId_fkey";

alter table "public"."tasks" add constraint "tasks_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES public.leads(id) ON UPDATE CASCADE ON DELETE SET NULL not valid;

alter table "public"."tasks" validate constraint "tasks_leadId_fkey";

alter table "public"."team_members" add constraint "team_members_reportingTo_fkey" FOREIGN KEY ("reportingTo") REFERENCES public.team_members(id) ON UPDATE CASCADE ON DELETE SET NULL not valid;

alter table "public"."team_members" validate constraint "team_members_reportingTo_fkey";

alter table "public"."team_members" add constraint "team_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."team_members" validate constraint "team_members_userId_fkey";

alter table "public"."tenant_applications" add constraint "tenant_applications_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES public.properties(id) ON UPDATE CASCADE ON DELETE RESTRICT not valid;

alter table "public"."tenant_applications" validate constraint "tenant_applications_propertyId_fkey";

alter table "public"."tenant_applications" add constraint "tenant_applications_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES public.units(id) ON UPDATE CASCADE ON DELETE SET NULL not valid;

alter table "public"."tenant_applications" validate constraint "tenant_applications_unitId_fkey";

alter table "public"."tenant_ledger" add constraint "tenant_ledger_leaseId_fkey" FOREIGN KEY ("leaseId") REFERENCES public.leases(id) ON DELETE CASCADE not valid;

alter table "public"."tenant_ledger" validate constraint "tenant_ledger_leaseId_fkey";

alter table "public"."tenant_ledger" add constraint "tenant_ledger_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES public.payments(id) ON DELETE SET NULL not valid;

alter table "public"."tenant_ledger" validate constraint "tenant_ledger_paymentId_fkey";

alter table "public"."tenant_ledger" add constraint "tenant_ledger_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.tenants(id) ON DELETE CASCADE not valid;

alter table "public"."tenant_ledger" validate constraint "tenant_ledger_tenantId_fkey";

alter table "public"."tenant_ledger" add constraint "tenant_ledger_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES public.units(id) ON DELETE CASCADE not valid;

alter table "public"."tenant_ledger" validate constraint "tenant_ledger_unitId_fkey";

alter table "public"."tenants" add constraint "tenants_companyid_fkey" FOREIGN KEY ("companyId") REFERENCES public.companies(id) ON DELETE CASCADE not valid;

alter table "public"."tenants" validate constraint "tenants_companyid_fkey";

alter table "public"."tenants" add constraint "tenants_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES public.properties(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."tenants" validate constraint "tenants_propertyId_fkey";

alter table "public"."tenants" add constraint "tenants_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES public.units(id) ON UPDATE CASCADE ON DELETE SET NULL not valid;

alter table "public"."tenants" validate constraint "tenants_unitId_fkey";

alter table "public"."units" add constraint "units_landlordId_fkey" FOREIGN KEY ("landlordId") REFERENCES public.landlords(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."units" validate constraint "units_landlordId_fkey";

alter table "public"."units" add constraint "units_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES public.properties(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."units" validate constraint "units_propertyId_fkey";

alter table "public"."users" add constraint "users_companyid_fkey" FOREIGN KEY ("companyId") REFERENCES public.companies(id) ON DELETE CASCADE not valid;

alter table "public"."users" validate constraint "users_companyid_fkey";

alter table "public"."vendors" add constraint "vendors_companyid_fkey" FOREIGN KEY ("companyId") REFERENCES public.companies(id) ON DELETE CASCADE not valid;

alter table "public"."vendors" validate constraint "vendors_companyid_fkey";

alter table "public"."viewings" add constraint "viewings_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES public.properties(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."viewings" validate constraint "viewings_propertyId_fkey";

alter table "public"."work_orders" add constraint "work_orders_contractorId_fkey" FOREIGN KEY ("contractorId") REFERENCES public.contractors(id) ON UPDATE CASCADE ON DELETE SET NULL not valid;

alter table "public"."work_orders" validate constraint "work_orders_contractorId_fkey";

alter table "public"."work_orders" add constraint "work_orders_leaseId_fkey" FOREIGN KEY ("leaseId") REFERENCES public.leases(id) ON UPDATE CASCADE ON DELETE SET NULL not valid;

alter table "public"."work_orders" validate constraint "work_orders_leaseId_fkey";

alter table "public"."work_orders" add constraint "work_orders_maintenanceRequestId_fkey" FOREIGN KEY ("maintenanceRequestId") REFERENCES public.maintenance_requests(id) ON UPDATE CASCADE ON DELETE SET NULL not valid;

alter table "public"."work_orders" validate constraint "work_orders_maintenanceRequestId_fkey";

alter table "public"."work_orders" add constraint "work_orders_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES public.vendors(id) ON UPDATE CASCADE ON DELETE SET NULL not valid;

alter table "public"."work_orders" validate constraint "work_orders_vendorId_fkey";


