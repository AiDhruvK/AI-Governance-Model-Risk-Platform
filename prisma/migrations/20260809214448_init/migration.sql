-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('EXECUTIVE', 'AI_GOVERNANCE_MANAGER', 'BUSINESS_OWNER', 'TECHNICAL_OWNER', 'RISK_COMPLIANCE', 'AUDITOR');

-- CreateEnum
CREATE TYPE "RiskLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "ProductionStatus" AS ENUM ('CONCEPT', 'DEVELOPMENT', 'PILOT', 'PRODUCTION', 'RETIRED');

-- CreateEnum
CREATE TYPE "GovernanceStatus" AS ENUM ('DRAFT', 'PENDING_REVIEW', 'IN_ASSESSMENT', 'APPROVED', 'CONDITIONAL', 'REJECTED', 'UNDER_MONITORING');

-- CreateEnum
CREATE TYPE "DataSensitivity" AS ENUM ('PUBLIC', 'INTERNAL', 'CONFIDENTIAL', 'RESTRICTED');

-- CreateEnum
CREATE TYPE "ControlStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'DRAFT');

-- CreateEnum
CREATE TYPE "ControlEffectiveness" AS ENUM ('EFFECTIVE', 'PARTIALLY_EFFECTIVE', 'INEFFECTIVE', 'NOT_APPLICABLE', 'NOT_TESTED');

-- CreateEnum
CREATE TYPE "TestResult" AS ENUM ('PASSED', 'PASSED_WITH_CONDITIONS', 'FAILED');

-- CreateEnum
CREATE TYPE "IssueSeverity" AS ENUM ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW');

-- CreateEnum
CREATE TYPE "IssueStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'PENDING_VALIDATION', 'CLOSED');

-- CreateEnum
CREATE TYPE "ApprovalStage" AS ENUM ('BUSINESS_OWNER_REVIEW', 'TECHNICAL_REVIEW', 'AI_RISK_REVIEW', 'PRIVACY_REVIEW', 'SECURITY_REVIEW', 'LEGAL_COMPLIANCE_REVIEW', 'FINAL_GOVERNANCE_APPROVAL');

-- CreateEnum
CREATE TYPE "ApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CHANGES_REQUESTED');

-- CreateEnum
CREATE TYPE "AssessmentStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE');

-- CreateTable
CREATE TABLE "BusinessUnit" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BusinessUnit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "title" TEXT,
    "role" "UserRole" NOT NULL,
    "businessUnitId" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AIType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RiskCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "weight" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RiskCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssessmentQuestion" (
    "id" TEXT NOT NULL,
    "section" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "weight" INTEGER NOT NULL DEFAULT 5,
    "helpText" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssessmentQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AISystem" (
    "id" TEXT NOT NULL,
    "systemId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "businessPurpose" TEXT NOT NULL,
    "businessImpact" TEXT NOT NULL,
    "users" TEXT NOT NULL,
    "deploymentEnv" TEXT NOT NULL,
    "modelProvider" TEXT NOT NULL,
    "dataSources" TEXT NOT NULL,
    "downstreamSystems" TEXT NOT NULL,
    "aiTypeId" TEXT NOT NULL,
    "businessUnitId" TEXT NOT NULL,
    "businessOwnerId" TEXT NOT NULL,
    "technicalOwnerId" TEXT NOT NULL,
    "riskLevel" "RiskLevel" NOT NULL DEFAULT 'MEDIUM',
    "customerFacing" BOOLEAN NOT NULL DEFAULT false,
    "dataSensitivity" "DataSensitivity" NOT NULL DEFAULT 'INTERNAL',
    "productionStatus" "ProductionStatus" NOT NULL DEFAULT 'DEVELOPMENT',
    "governanceStatus" "GovernanceStatus" NOT NULL DEFAULT 'DRAFT',
    "lastAssessmentAt" TIMESTAMP(3),
    "nextReviewAt" TIMESTAMP(3),
    "governanceScore" INTEGER NOT NULL DEFAULT 0,
    "documentationPct" INTEGER NOT NULL DEFAULT 0,
    "controlsPct" INTEGER NOT NULL DEFAULT 0,
    "testingPct" INTEGER NOT NULL DEFAULT 0,
    "approvalsPct" INTEGER NOT NULL DEFAULT 0,
    "issueMgmtPct" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AISystem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RiskAssessment" (
    "id" TEXT NOT NULL,
    "aiSystemId" TEXT NOT NULL,
    "status" "AssessmentStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "overallScore" INTEGER NOT NULL DEFAULT 0,
    "riskLevel" "RiskLevel" NOT NULL DEFAULT 'LOW',
    "leadId" TEXT,
    "dueDate" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "summary" TEXT,
    "factorNotes" TEXT,
    "privacyScore" INTEGER NOT NULL DEFAULT 0,
    "securityScore" INTEGER NOT NULL DEFAULT 0,
    "biasScore" INTEGER NOT NULL DEFAULT 0,
    "explainabilityScore" INTEGER NOT NULL DEFAULT 0,
    "reliabilityScore" INTEGER NOT NULL DEFAULT 0,
    "regulatoryScore" INTEGER NOT NULL DEFAULT 0,
    "humanOversightScore" INTEGER NOT NULL DEFAULT 0,
    "dataQualityScore" INTEGER NOT NULL DEFAULT 0,
    "thirdPartyScore" INTEGER NOT NULL DEFAULT 0,
    "reputationalScore" INTEGER NOT NULL DEFAULT 0,
    "privacyComment" TEXT,
    "securityComment" TEXT,
    "biasComment" TEXT,
    "explainabilityComment" TEXT,
    "reliabilityComment" TEXT,
    "regulatoryComment" TEXT,
    "humanOversightComment" TEXT,
    "dataQualityComment" TEXT,
    "thirdPartyComment" TEXT,
    "reputationalComment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RiskAssessment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssessmentResponse" (
    "id" TEXT NOT NULL,
    "assessmentId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "answer" BOOLEAN NOT NULL,
    "comments" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssessmentResponse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Control" (
    "id" TEXT NOT NULL,
    "controlId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "requirement" TEXT NOT NULL,
    "ownerId" TEXT,
    "applicableRiskLevel" "RiskLevel" NOT NULL,
    "testingFrequency" TEXT NOT NULL,
    "status" "ControlStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Control_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIControlAssessment" (
    "id" TEXT NOT NULL,
    "aiSystemId" TEXT NOT NULL,
    "controlId" TEXT NOT NULL,
    "effectiveness" "ControlEffectiveness" NOT NULL DEFAULT 'NOT_TESTED',
    "testerId" TEXT,
    "testDate" TIMESTAMP(3),
    "evidence" TEXT,
    "comments" TEXT,
    "remediationAction" TEXT,
    "nextTestingDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AIControlAssessment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Test" (
    "id" TEXT NOT NULL,
    "testId" TEXT NOT NULL,
    "aiSystemId" TEXT NOT NULL,
    "testType" TEXT NOT NULL,
    "testerId" TEXT,
    "testDate" TIMESTAMP(3) NOT NULL,
    "result" "TestResult" NOT NULL,
    "score" INTEGER,
    "evidence" TEXT,
    "comments" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Test_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Issue" (
    "id" TEXT NOT NULL,
    "issueId" TEXT NOT NULL,
    "aiSystemId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "severity" "IssueSeverity" NOT NULL,
    "category" TEXT NOT NULL,
    "ownerId" TEXT,
    "dateIdentified" TIMESTAMP(3) NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "status" "IssueStatus" NOT NULL DEFAULT 'OPEN',
    "remediationPlan" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Issue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Approval" (
    "id" TEXT NOT NULL,
    "aiSystemId" TEXT NOT NULL,
    "stage" "ApprovalStage" NOT NULL,
    "reviewerId" TEXT,
    "status" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "reviewDate" TIMESTAMP(3),
    "comments" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Approval_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditEvent" (
    "id" TEXT NOT NULL,
    "aiSystemId" TEXT,
    "actorId" TEXT,
    "action" TEXT NOT NULL,
    "details" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComplianceTrend" (
    "id" TEXT NOT NULL,
    "month" TEXT NOT NULL,
    "percentage" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ComplianceTrend_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BusinessUnit_name_key" ON "BusinessUnit"("name");

-- CreateIndex
CREATE UNIQUE INDEX "BusinessUnit_code_key" ON "BusinessUnit"("code");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "AIType_name_key" ON "AIType"("name");

-- CreateIndex
CREATE UNIQUE INDEX "RiskCategory_name_key" ON "RiskCategory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "AISystem_systemId_key" ON "AISystem"("systemId");

-- CreateIndex
CREATE INDEX "AISystem_riskLevel_idx" ON "AISystem"("riskLevel");

-- CreateIndex
CREATE INDEX "AISystem_businessUnitId_idx" ON "AISystem"("businessUnitId");

-- CreateIndex
CREATE INDEX "AISystem_governanceStatus_idx" ON "AISystem"("governanceStatus");

-- CreateIndex
CREATE INDEX "AISystem_productionStatus_idx" ON "AISystem"("productionStatus");

-- CreateIndex
CREATE INDEX "RiskAssessment_aiSystemId_idx" ON "RiskAssessment"("aiSystemId");

-- CreateIndex
CREATE INDEX "RiskAssessment_status_idx" ON "RiskAssessment"("status");

-- CreateIndex
CREATE UNIQUE INDEX "AssessmentResponse_assessmentId_questionId_key" ON "AssessmentResponse"("assessmentId", "questionId");

-- CreateIndex
CREATE UNIQUE INDEX "Control_controlId_key" ON "Control"("controlId");

-- CreateIndex
CREATE INDEX "AIControlAssessment_effectiveness_idx" ON "AIControlAssessment"("effectiveness");

-- CreateIndex
CREATE UNIQUE INDEX "AIControlAssessment_aiSystemId_controlId_key" ON "AIControlAssessment"("aiSystemId", "controlId");

-- CreateIndex
CREATE UNIQUE INDEX "Test_testId_key" ON "Test"("testId");

-- CreateIndex
CREATE INDEX "Test_aiSystemId_idx" ON "Test"("aiSystemId");

-- CreateIndex
CREATE INDEX "Test_testType_idx" ON "Test"("testType");

-- CreateIndex
CREATE UNIQUE INDEX "Issue_issueId_key" ON "Issue"("issueId");

-- CreateIndex
CREATE INDEX "Issue_status_idx" ON "Issue"("status");

-- CreateIndex
CREATE INDEX "Issue_severity_idx" ON "Issue"("severity");

-- CreateIndex
CREATE INDEX "Issue_aiSystemId_idx" ON "Issue"("aiSystemId");

-- CreateIndex
CREATE INDEX "Approval_status_idx" ON "Approval"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Approval_aiSystemId_stage_key" ON "Approval"("aiSystemId", "stage");

-- CreateIndex
CREATE INDEX "AuditEvent_aiSystemId_idx" ON "AuditEvent"("aiSystemId");

-- CreateIndex
CREATE INDEX "AuditEvent_createdAt_idx" ON "AuditEvent"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ComplianceTrend_month_key" ON "ComplianceTrend"("month");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_businessUnitId_fkey" FOREIGN KEY ("businessUnitId") REFERENCES "BusinessUnit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AISystem" ADD CONSTRAINT "AISystem_aiTypeId_fkey" FOREIGN KEY ("aiTypeId") REFERENCES "AIType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AISystem" ADD CONSTRAINT "AISystem_businessUnitId_fkey" FOREIGN KEY ("businessUnitId") REFERENCES "BusinessUnit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AISystem" ADD CONSTRAINT "AISystem_businessOwnerId_fkey" FOREIGN KEY ("businessOwnerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AISystem" ADD CONSTRAINT "AISystem_technicalOwnerId_fkey" FOREIGN KEY ("technicalOwnerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RiskAssessment" ADD CONSTRAINT "RiskAssessment_aiSystemId_fkey" FOREIGN KEY ("aiSystemId") REFERENCES "AISystem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RiskAssessment" ADD CONSTRAINT "RiskAssessment_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentResponse" ADD CONSTRAINT "AssessmentResponse_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "RiskAssessment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentResponse" ADD CONSTRAINT "AssessmentResponse_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "AssessmentQuestion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Control" ADD CONSTRAINT "Control_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIControlAssessment" ADD CONSTRAINT "AIControlAssessment_aiSystemId_fkey" FOREIGN KEY ("aiSystemId") REFERENCES "AISystem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIControlAssessment" ADD CONSTRAINT "AIControlAssessment_controlId_fkey" FOREIGN KEY ("controlId") REFERENCES "Control"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIControlAssessment" ADD CONSTRAINT "AIControlAssessment_testerId_fkey" FOREIGN KEY ("testerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Test" ADD CONSTRAINT "Test_aiSystemId_fkey" FOREIGN KEY ("aiSystemId") REFERENCES "AISystem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Test" ADD CONSTRAINT "Test_testerId_fkey" FOREIGN KEY ("testerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Issue" ADD CONSTRAINT "Issue_aiSystemId_fkey" FOREIGN KEY ("aiSystemId") REFERENCES "AISystem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Issue" ADD CONSTRAINT "Issue_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Approval" ADD CONSTRAINT "Approval_aiSystemId_fkey" FOREIGN KEY ("aiSystemId") REFERENCES "AISystem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Approval" ADD CONSTRAINT "Approval_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditEvent" ADD CONSTRAINT "AuditEvent_aiSystemId_fkey" FOREIGN KEY ("aiSystemId") REFERENCES "AISystem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditEvent" ADD CONSTRAINT "AuditEvent_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
