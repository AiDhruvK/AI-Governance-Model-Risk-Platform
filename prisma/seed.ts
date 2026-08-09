import {
  PrismaClient,
  UserRole,
  RiskLevel,
  ProductionStatus,
  GovernanceStatus,
  DataSensitivity,
  ControlEffectiveness,
  TestResult,
  IssueSeverity,
  IssueStatus,
  ApprovalStage,
  ApprovalStatus,
  AssessmentStatus,
} from "@prisma/client";

const prisma = new PrismaClient();

const APPROVAL_STAGES: ApprovalStage[] = [
  "BUSINESS_OWNER_REVIEW",
  "TECHNICAL_REVIEW",
  "AI_RISK_REVIEW",
  "PRIVACY_REVIEW",
  "SECURITY_REVIEW",
  "LEGAL_COMPLIANCE_REVIEW",
  "FINAL_GOVERNANCE_APPROVAL",
];

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function daysFromNow(n: number) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
}

function scoreToRisk(score: number): RiskLevel {
  if (score >= 80) return "CRITICAL";
  if (score >= 60) return "HIGH";
  if (score >= 30) return "MEDIUM";
  return "LOW";
}

async function main() {
  await prisma.auditEvent.deleteMany();
  await prisma.approval.deleteMany();
  await prisma.issue.deleteMany();
  await prisma.test.deleteMany();
  await prisma.aIControlAssessment.deleteMany();
  await prisma.assessmentResponse.deleteMany();
  await prisma.riskAssessment.deleteMany();
  await prisma.control.deleteMany();
  await prisma.assessmentQuestion.deleteMany();
  await prisma.aISystem.deleteMany();
  await prisma.aIType.deleteMany();
  await prisma.riskCategory.deleteMany();
  await prisma.complianceTrend.deleteMany();
  await prisma.user.deleteMany();
  await prisma.businessUnit.deleteMany();

  const units = await Promise.all(
    [
      ["Finance", "FIN", "Corporate finance, FP&A, and treasury"],
      ["Human Resources", "HR", "People operations and talent"],
      ["Customer Service", "CS", "Customer operations and support"],
      ["Marketing", "MKT", "Brand, growth, and campaigns"],
      ["Operations", "OPS", "Enterprise operations"],
      ["Cybersecurity", "SEC", "Security operations and threat intel"],
      ["Supply Chain", "SCM", "Procurement and logistics"],
      ["Legal & Compliance", "LEG", "Legal, privacy, and compliance"],
      ["Insurance", "INS", "Claims and underwriting"],
      ["Lending", "LND", "Credit and lending products"],
    ].map(([name, code, description]) =>
      prisma.businessUnit.create({ data: { name, code, description } })
    )
  );

  const unit = (code: string) => units.find((u) => u.code === code)!;

  const usersData: Array<{
    email: string;
    name: string;
    title: string;
    role: UserRole;
    bu: string;
  }> = [
    { email: "elena.vasquez@contoso.com", name: "Elena Vasquez", title: "Chief Risk Officer", role: "EXECUTIVE", bu: "LEG" },
    { email: "marcus.chen@contoso.com", name: "Marcus Chen", title: "AI Governance Manager", role: "AI_GOVERNANCE_MANAGER", bu: "LEG" },
    { email: "sarah.mitchell@contoso.com", name: "Sarah Mitchell", title: "VP Customer Operations", role: "BUSINESS_OWNER", bu: "CS" },
    { email: "david.chen@contoso.com", name: "David Chen", title: "Principal ML Engineer", role: "TECHNICAL_OWNER", bu: "CS" },
    { email: "priya.nair@contoso.com", name: "Priya Nair", title: "Head of Credit Risk", role: "BUSINESS_OWNER", bu: "LND" },
    { email: "james.okafor@contoso.com", name: "James Okafor", title: "Data Science Lead", role: "TECHNICAL_OWNER", bu: "LND" },
    { email: "amanda.brooks@contoso.com", name: "Amanda Brooks", title: "VP People Analytics", role: "BUSINESS_OWNER", bu: "HR" },
    { email: "leo.park@contoso.com", name: "Leo Park", title: "ML Engineer", role: "TECHNICAL_OWNER", bu: "HR" },
    { email: "nina.hoffman@contoso.com", name: "Nina Hoffman", title: "CFO Analytics Lead", role: "BUSINESS_OWNER", bu: "FIN" },
    { email: "carlos.mendez@contoso.com", name: "Carlos Mendez", title: "Quant Engineer", role: "TECHNICAL_OWNER", bu: "FIN" },
    { email: "rachel.kim@contoso.com", name: "Rachel Kim", title: "CISO Deputy", role: "BUSINESS_OWNER", bu: "SEC" },
    { email: "tom.nguyen@contoso.com", name: "Tom Nguyen", title: "Security ML Lead", role: "TECHNICAL_OWNER", bu: "SEC" },
    { email: "olivia.grant@contoso.com", name: "Olivia Grant", title: "VP Marketing Science", role: "BUSINESS_OWNER", bu: "MKT" },
    { email: "ethan.wu@contoso.com", name: "Ethan Wu", title: "Recommendation Engineer", role: "TECHNICAL_OWNER", bu: "MKT" },
    { email: "sofia.alvarez@contoso.com", name: "Sofia Alvarez", title: "Supply Chain Director", role: "BUSINESS_OWNER", bu: "SCM" },
    { email: "mike.patel@contoso.com", name: "Mike Patel", title: "Forecasting Engineer", role: "TECHNICAL_OWNER", bu: "SCM" },
    { email: "grace.liu@contoso.com", name: "Grace Liu", title: "Claims Operations Lead", role: "BUSINESS_OWNER", bu: "INS" },
    { email: "hassan.ali@contoso.com", name: "Hassan Ali", title: "NLP Engineer", role: "TECHNICAL_OWNER", bu: "INS" },
    { email: "claire.dubois@contoso.com", name: "Claire Dubois", title: "Privacy Counsel", role: "RISK_COMPLIANCE", bu: "LEG" },
    { email: "robert.hayes@contoso.com", name: "Robert Hayes", title: "Internal Auditor", role: "AUDITOR", bu: "LEG" },
    { email: "maya.singh@contoso.com", name: "Maya Singh", title: "Security Reviewer", role: "RISK_COMPLIANCE", bu: "SEC" },
    { email: "andrew.cole@contoso.com", name: "Andrew Cole", title: "Operations Director", role: "BUSINESS_OWNER", bu: "OPS" },
    { email: "julia.ross@contoso.com", name: "Julia Ross", title: "Platform Engineer", role: "TECHNICAL_OWNER", bu: "OPS" },
  ];

  const users = await Promise.all(
    usersData.map((u) =>
      prisma.user.create({
        data: {
          email: u.email,
          name: u.name,
          title: u.title,
          role: u.role,
          businessUnitId: unit(u.bu).id,
        },
      })
    )
  );

  const user = (email: string) => users.find((u) => u.email === email)!;

  const aiTypes = await Promise.all(
    [
      ["Predictive ML", "Supervised/unsupervised predictive models"],
      ["Generative AI", "Large language and generative models"],
      ["NLP", "Natural language processing systems"],
      ["Computer Vision", "Image and video analysis models"],
      ["Recommendation System", "Personalization and ranking engines"],
      ["AI Agent", "Autonomous or semi-autonomous agents"],
      ["Optimization Model", "Operations research / optimization"],
    ].map(([name, description]) => prisma.aIType.create({ data: { name, description } }))
  );

  const type = (name: string) => aiTypes.find((t) => t.name === name)!;

  await Promise.all(
    [
      ["Privacy", "Personal data and privacy risk", 1.2],
      ["Security", "Cyber and model security risk", 1.2],
      ["Bias / Fairness", "Discriminatory outcome risk", 1.3],
      ["Explainability", "Interpretability requirements", 1.0],
      ["Reliability", "Performance and availability", 1.0],
      ["Regulatory Risk", "Legal/regulatory exposure", 1.3],
      ["Human Oversight", "Human-in-the-loop adequacy", 1.1],
      ["Data Quality", "Training and inference data quality", 1.0],
      ["Third-Party Risk", "Vendor and model provider risk", 1.0],
      ["Reputational Risk", "Brand and public trust impact", 1.1],
    ].map(([name, description, weight]) =>
      prisma.riskCategory.create({
        data: { name: name as string, description: description as string, weight: weight as number },
      })
    )
  );

  const questions = [
    ["Business Impact", "Does the AI influence material business decisions?", 8],
    ["Business Impact", "Does the AI directly interact with customers?", 7],
    ["Business Impact", "Could an incorrect result cause financial loss?", 9],
    ["Business Impact", "Could an incorrect result negatively affect an individual?", 9],
    ["Data Risk", "Does the system process PII?", 8],
    ["Data Risk", "Does it process sensitive data?", 8],
    ["Data Risk", "Is external data used?", 5],
    ["Data Risk", "Is training data documented?", 4],
    ["Data Risk", "Has data quality been validated?", 5],
    ["AI Risk", "Is model explainability required?", 6],
    ["AI Risk", "Can hallucinations occur?", 7],
    ["AI Risk", "Is output independently validated?", 6],
    ["AI Risk", "Is human review required?", 7],
    ["AI Risk", "Could the AI generate discriminatory outcomes?", 9],
    ["Security", "Has prompt injection testing been completed?", 6],
    ["Security", "Are AI inputs sanitized?", 6],
    ["Security", "Is sensitive information protected?", 8],
    ["Security", "Are model endpoints access controlled?", 7],
    ["Compliance", "Does the system operate in a regulated business process?", 8],
    ["Compliance", "Has Legal reviewed the system?", 5],
    ["Compliance", "Has Privacy reviewed the system?", 5],
    ["Compliance", "Are regulatory requirements documented?", 6],
  ] as const;

  const createdQuestions = await Promise.all(
    questions.map(([section, question, weight], i) =>
      prisma.assessmentQuestion.create({
        data: { section, question, weight, sortOrder: i + 1 },
      })
    )
  );

  const controlsData = [
    ["AI-GOV-001", "AI System Ownership", "Ownership accountability for production AI", "Every production AI system must have an identified business owner and technical owner.", "HIGH", "Annual"],
    ["AI-GOV-002", "Model Documentation", "Documentation completeness control", "AI systems must maintain documented purpose, architecture, datasets, limitations, and intended use.", "MEDIUM", "Semi-Annual"],
    ["AI-GOV-003", "Human Oversight", "Human review for high-risk decisions", "High-risk AI decisions require appropriate human review.", "HIGH", "Quarterly"],
    ["AI-GOV-004", "Bias Testing", "Fairness and bias evaluation", "Models affecting individuals must undergo fairness and bias testing.", "HIGH", "Semi-Annual"],
    ["AI-GOV-005", "Data Privacy", "Privacy compliance for sensitive data", "Sensitive data must comply with organizational privacy requirements.", "HIGH", "Quarterly"],
    ["AI-GOV-006", "Security Testing", "Security assurance for AI applications", "AI applications must undergo appropriate security testing.", "HIGH", "Quarterly"],
    ["AI-GOV-007", "Model Monitoring", "Production performance monitoring", "Production models must have performance monitoring.", "MEDIUM", "Monthly"],
    ["AI-GOV-008", "GenAI Safety", "Generative AI safety evaluations", "Generative AI applications must be evaluated for hallucinations, unsafe outputs, prompt injection, and sensitive-data leakage.", "HIGH", "Quarterly"],
  ] as const;

  const controls = await Promise.all(
    controlsData.map(([controlId, name, description, requirement, risk, freq]) =>
      prisma.control.create({
        data: {
          controlId,
          name,
          description,
          requirement,
          ownerId: user("marcus.chen@contoso.com").id,
          applicableRiskLevel: risk as RiskLevel,
          testingFrequency: freq,
        },
      })
    )
  );

  const systemsSpec = [
    {
      systemId: "AI-001",
      name: "Customer Support GenAI Assistant",
      description: "Generative AI assistant that drafts customer support responses and knowledge answers.",
      businessPurpose: "Reduce handle time and improve consistency of customer support responses.",
      businessImpact: "High volume customer interactions; incorrect guidance can affect satisfaction and compliance.",
      users: "Customer support agents (4,200)",
      deploymentEnv: "AWS EKS / Production VPC",
      modelProvider: "OpenAI GPT-4.1 via enterprise gateway",
      dataSources: "Knowledge base, ticket history, CRM snippets",
      downstreamSystems: "ServiceNow, Zendesk, CRM",
      aiType: "Generative AI",
      bu: "CS",
      biz: "sarah.mitchell@contoso.com",
      tech: "david.chen@contoso.com",
      risk: "HIGH" as RiskLevel,
      customerFacing: true,
      sensitivity: "CONFIDENTIAL" as DataSensitivity,
      prod: "PRODUCTION" as ProductionStatus,
      gov: "UNDER_MONITORING" as GovernanceStatus,
      score: 72,
      docs: 90,
      ctrls: 75,
      testing: 65,
      approvals: 80,
      issuesPct: 50,
      assessmentScore: 68,
      lastAssess: 40,
      nextReview: 50,
    },
    {
      systemId: "AI-002",
      name: "Employee Resume Screening Model",
      description: "ML model that ranks candidate resumes for open roles.",
      businessPurpose: "Accelerate recruiting screening while maintaining fair hiring practices.",
      businessImpact: "Affects candidate progression; bias risk is material.",
      users: "Talent acquisition (180)",
      deploymentEnv: "Azure ML / HR VPC",
      modelProvider: "Internal XGBoost ensemble",
      dataSources: "ATS resumes, job descriptions, historical hire outcomes",
      downstreamSystems: "Workday ATS",
      aiType: "Predictive ML",
      bu: "HR",
      biz: "amanda.brooks@contoso.com",
      tech: "leo.park@contoso.com",
      risk: "CRITICAL" as RiskLevel,
      customerFacing: false,
      sensitivity: "RESTRICTED" as DataSensitivity,
      prod: "PRODUCTION" as ProductionStatus,
      gov: "CONDITIONAL" as GovernanceStatus,
      score: 58,
      docs: 70,
      ctrls: 55,
      testing: 50,
      approvals: 70,
      issuesPct: 40,
      assessmentScore: 82,
      lastAssess: 70,
      nextReview: 20,
    },
    {
      systemId: "AI-003",
      name: "Customer Churn Prediction Model",
      description: "Predicts likelihood of customer churn within 90 days.",
      businessPurpose: "Prioritize retention campaigns for at-risk customers.",
      businessImpact: "Influences marketing spend and retention offers.",
      users: "Retention analysts (45)",
      deploymentEnv: "Databricks + Snowflake",
      modelProvider: "Internal LightGBM",
      dataSources: "Usage telemetry, billing, support tickets",
      downstreamSystems: "Marketing automation, CRM",
      aiType: "Predictive ML",
      bu: "MKT",
      biz: "olivia.grant@contoso.com",
      tech: "ethan.wu@contoso.com",
      risk: "MEDIUM" as RiskLevel,
      customerFacing: false,
      sensitivity: "CONFIDENTIAL" as DataSensitivity,
      prod: "PRODUCTION" as ProductionStatus,
      gov: "APPROVED" as GovernanceStatus,
      score: 84,
      docs: 88,
      ctrls: 85,
      testing: 80,
      approvals: 95,
      issuesPct: 75,
      assessmentScore: 45,
      lastAssess: 20,
      nextReview: 160,
    },
    {
      systemId: "AI-004",
      name: "Fraud Detection Engine",
      description: "Real-time transaction fraud scoring engine.",
      businessPurpose: "Detect and prevent fraudulent payment activity.",
      businessImpact: "Direct financial loss prevention; false positives impact customers.",
      users: "Fraud ops analysts (120)",
      deploymentEnv: "Kafka + Kubernetes streaming",
      modelProvider: "Internal gradient boosting + rules",
      dataSources: "Transactions, device fingerprint, historical fraud labels",
      downstreamSystems: "Payment gateway, case management",
      aiType: "Predictive ML",
      bu: "FIN",
      biz: "nina.hoffman@contoso.com",
      tech: "carlos.mendez@contoso.com",
      risk: "HIGH" as RiskLevel,
      customerFacing: true,
      sensitivity: "RESTRICTED" as DataSensitivity,
      prod: "PRODUCTION" as ProductionStatus,
      gov: "UNDER_MONITORING" as GovernanceStatus,
      score: 78,
      docs: 85,
      ctrls: 80,
      testing: 75,
      approvals: 90,
      issuesPct: 60,
      assessmentScore: 71,
      lastAssess: 15,
      nextReview: 100,
    },
    {
      systemId: "AI-005",
      name: "Dynamic Pricing Model",
      description: "Optimization model for product and service pricing.",
      businessPurpose: "Maximize margin while remaining competitively priced.",
      businessImpact: "Material revenue impact; regulatory scrutiny in some markets.",
      users: "Pricing desk (28)",
      deploymentEnv: "GCP Vertex AI",
      modelProvider: "Internal optimization solver + ML demand model",
      dataSources: "Demand history, competitor pricing, inventory",
      downstreamSystems: "Commerce platform, ERP",
      aiType: "Optimization Model",
      bu: "OPS",
      biz: "andrew.cole@contoso.com",
      tech: "julia.ross@contoso.com",
      risk: "HIGH" as RiskLevel,
      customerFacing: true,
      sensitivity: "CONFIDENTIAL" as DataSensitivity,
      prod: "PILOT" as ProductionStatus,
      gov: "IN_ASSESSMENT" as GovernanceStatus,
      score: 61,
      docs: 65,
      ctrls: 60,
      testing: 55,
      approvals: 50,
      issuesPct: 70,
      assessmentScore: 64,
      lastAssess: 10,
      nextReview: 30,
    },
    {
      systemId: "AI-006",
      name: "Marketing Recommendation Engine",
      description: "Personalized product and content recommendations.",
      businessPurpose: "Increase conversion and engagement through personalization.",
      businessImpact: "Customer experience and revenue uplift.",
      users: "Digital marketing (60)",
      deploymentEnv: "AWS Personalize hybrid stack",
      modelProvider: "Internal two-tower recommender",
      dataSources: "Clickstream, purchase history, catalog",
      downstreamSystems: "Web/app personalization layer",
      aiType: "Recommendation System",
      bu: "MKT",
      biz: "olivia.grant@contoso.com",
      tech: "ethan.wu@contoso.com",
      risk: "MEDIUM" as RiskLevel,
      customerFacing: true,
      sensitivity: "INTERNAL" as DataSensitivity,
      prod: "PRODUCTION" as ProductionStatus,
      gov: "APPROVED" as GovernanceStatus,
      score: 81,
      docs: 82,
      ctrls: 78,
      testing: 85,
      approvals: 90,
      issuesPct: 70,
      assessmentScore: 42,
      lastAssess: 55,
      nextReview: 120,
    },
    {
      systemId: "AI-007",
      name: "Supply Chain Demand Forecasting Model",
      description: "Forecasts SKU-level demand across regions.",
      businessPurpose: "Improve inventory planning and reduce stockouts.",
      businessImpact: "Operations efficiency and working capital.",
      users: "Supply planners (95)",
      deploymentEnv: "Azure Databricks",
      modelProvider: "Internal Prophet + deepAR hybrid",
      dataSources: "Orders, promotions, seasonality, external macro indicators",
      downstreamSystems: "ERP, warehouse management",
      aiType: "Predictive ML",
      bu: "SCM",
      biz: "sofia.alvarez@contoso.com",
      tech: "mike.patel@contoso.com",
      risk: "MEDIUM" as RiskLevel,
      customerFacing: false,
      sensitivity: "INTERNAL" as DataSensitivity,
      prod: "PRODUCTION" as ProductionStatus,
      gov: "APPROVED" as GovernanceStatus,
      score: 86,
      docs: 90,
      ctrls: 88,
      testing: 82,
      approvals: 95,
      issuesPct: 80,
      assessmentScore: 38,
      lastAssess: 25,
      nextReview: 140,
    },
    {
      systemId: "AI-008",
      name: "Invoice Processing AI",
      description: "OCR + NLP pipeline for invoice extraction and coding.",
      businessPurpose: "Automate AP invoice processing.",
      businessImpact: "Finance ops efficiency; miscoding can cause accounting errors.",
      users: "Accounts payable (70)",
      deploymentEnv: "On-prem GPU cluster + AP workflow",
      modelProvider: "Azure Document Intelligence + internal classifier",
      dataSources: "Vendor invoices, PO history, GL codes",
      downstreamSystems: "SAP AP",
      aiType: "Computer Vision",
      bu: "FIN",
      biz: "nina.hoffman@contoso.com",
      tech: "carlos.mendez@contoso.com",
      risk: "MEDIUM" as RiskLevel,
      customerFacing: false,
      sensitivity: "CONFIDENTIAL" as DataSensitivity,
      prod: "PRODUCTION" as ProductionStatus,
      gov: "UNDER_MONITORING" as GovernanceStatus,
      score: 74,
      docs: 78,
      ctrls: 70,
      testing: 72,
      approvals: 85,
      issuesPct: 65,
      assessmentScore: 48,
      lastAssess: 33,
      nextReview: 90,
    },
    {
      systemId: "AI-009",
      name: "Cybersecurity Threat Detection Model",
      description: "Detects anomalous network and endpoint behavior.",
      businessPurpose: "Accelerate threat detection and triage.",
      businessImpact: "Security posture; missed detections increase breach risk.",
      users: "SOC analysts (55)",
      deploymentEnv: "SecOps VPC / Splunk + model service",
      modelProvider: "Internal anomaly detection ensemble",
      dataSources: "SIEM logs, EDR telemetry, threat intel",
      downstreamSystems: "SOAR playbooks",
      aiType: "Predictive ML",
      bu: "SEC",
      biz: "rachel.kim@contoso.com",
      tech: "tom.nguyen@contoso.com",
      risk: "HIGH" as RiskLevel,
      customerFacing: false,
      sensitivity: "RESTRICTED" as DataSensitivity,
      prod: "PRODUCTION" as ProductionStatus,
      gov: "APPROVED" as GovernanceStatus,
      score: 83,
      docs: 88,
      ctrls: 85,
      testing: 78,
      approvals: 92,
      issuesPct: 72,
      assessmentScore: 62,
      lastAssess: 18,
      nextReview: 110,
    },
    {
      systemId: "AI-010",
      name: "Loan Risk Scoring Model",
      description: "Credit risk scoring for consumer loan applications.",
      businessPurpose: "Support underwriting decisions with consistent risk scores.",
      businessImpact: "Material credit decisions affecting individuals and capital.",
      users: "Underwriters (210)",
      deploymentEnv: "Private cloud model serving",
      modelProvider: "Internal scorecard + gradient boosting",
      dataSources: "Credit bureau, application data, payment history",
      downstreamSystems: "Loan origination system",
      aiType: "Predictive ML",
      bu: "LND",
      biz: "priya.nair@contoso.com",
      tech: "james.okafor@contoso.com",
      risk: "CRITICAL" as RiskLevel,
      customerFacing: true,
      sensitivity: "RESTRICTED" as DataSensitivity,
      prod: "PRODUCTION" as ProductionStatus,
      gov: "CONDITIONAL" as GovernanceStatus,
      score: 66,
      docs: 80,
      ctrls: 68,
      testing: 60,
      approvals: 75,
      issuesPct: 45,
      assessmentScore: 85,
      lastAssess: 12,
      nextReview: 15,
    },
    {
      systemId: "AI-011",
      name: "Claims Processing AI",
      description: "Assists claims adjusters with triage and document extraction.",
      businessPurpose: "Accelerate claims handling and improve consistency.",
      businessImpact: "Affects claim outcomes and customer experience.",
      users: "Claims adjusters (320)",
      deploymentEnv: "Hybrid cloud",
      modelProvider: "Internal NLP + rules engine",
      dataSources: "Claim forms, photos, policy data",
      downstreamSystems: "Claims management system",
      aiType: "NLP",
      bu: "INS",
      biz: "grace.liu@contoso.com",
      tech: "hassan.ali@contoso.com",
      risk: "HIGH" as RiskLevel,
      customerFacing: true,
      sensitivity: "CONFIDENTIAL" as DataSensitivity,
      prod: "PRODUCTION" as ProductionStatus,
      gov: "PENDING_REVIEW" as GovernanceStatus,
      score: 59,
      docs: 60,
      ctrls: 55,
      testing: 50,
      approvals: 45,
      issuesPct: 55,
      assessmentScore: 70,
      lastAssess: 95,
      nextReview: -5,
    },
    {
      systemId: "AI-012",
      name: "Contract Analysis Assistant",
      description: "Generative AI assistant for contract clause extraction and risk flags.",
      businessPurpose: "Support legal review of vendor and commercial contracts.",
      businessImpact: "Legal risk identification; incorrect extraction can miss obligations.",
      users: "Legal ops (40)",
      deploymentEnv: "Private GenAI gateway",
      modelProvider: "Anthropic Claude Enterprise",
      dataSources: "Contract repository, clause library",
      downstreamSystems: "CLM platform",
      aiType: "Generative AI",
      bu: "LEG",
      biz: "claire.dubois@contoso.com",
      tech: "david.chen@contoso.com",
      risk: "HIGH" as RiskLevel,
      customerFacing: false,
      sensitivity: "RESTRICTED" as DataSensitivity,
      prod: "PILOT" as ProductionStatus,
      gov: "IN_ASSESSMENT" as GovernanceStatus,
      score: 63,
      docs: 72,
      ctrls: 60,
      testing: 58,
      approvals: 55,
      issuesPct: 70,
      assessmentScore: 66,
      lastAssess: 8,
      nextReview: 40,
    },
    {
      systemId: "AI-013",
      name: "Financial Forecasting Model",
      description: "FP&A forecasting model for revenue and expense projections.",
      businessPurpose: "Improve planning accuracy for executive financial reviews.",
      businessImpact: "Influences budgeting and capital allocation.",
      users: "FP&A analysts (35)",
      deploymentEnv: "Snowflake + internal notebook service",
      modelProvider: "Internal time-series ensemble",
      dataSources: "GL, pipeline, macro indicators",
      downstreamSystems: "Planning system",
      aiType: "Predictive ML",
      bu: "FIN",
      biz: "nina.hoffman@contoso.com",
      tech: "carlos.mendez@contoso.com",
      risk: "MEDIUM" as RiskLevel,
      customerFacing: false,
      sensitivity: "CONFIDENTIAL" as DataSensitivity,
      prod: "PRODUCTION" as ProductionStatus,
      gov: "APPROVED" as GovernanceStatus,
      score: 88,
      docs: 92,
      ctrls: 90,
      testing: 85,
      approvals: 95,
      issuesPct: 85,
      assessmentScore: 35,
      lastAssess: 30,
      nextReview: 150,
    },
    {
      systemId: "AI-014",
      name: "Internal Knowledge Assistant",
      description: "Enterprise RAG assistant for internal policies and procedures.",
      businessPurpose: "Help employees find approved policy guidance quickly.",
      businessImpact: "Incorrect answers may create compliance confusion.",
      users: "All employees (~28,000)",
      deploymentEnv: "Private RAG platform",
      modelProvider: "Azure OpenAI + internal retriever",
      dataSources: "Policy corpus, intranet, SharePoint",
      downstreamSystems: "Service portal",
      aiType: "Generative AI",
      bu: "OPS",
      biz: "andrew.cole@contoso.com",
      tech: "julia.ross@contoso.com",
      risk: "MEDIUM" as RiskLevel,
      customerFacing: false,
      sensitivity: "INTERNAL" as DataSensitivity,
      prod: "PRODUCTION" as ProductionStatus,
      gov: "APPROVED" as GovernanceStatus,
      score: 79,
      docs: 85,
      ctrls: 76,
      testing: 70,
      approvals: 88,
      issuesPct: 75,
      assessmentScore: 44,
      lastAssess: 22,
      nextReview: 130,
    },
    {
      systemId: "AI-015",
      name: "Sales Lead Scoring Model",
      description: "Scores inbound and outbound leads for sales prioritization.",
      businessPurpose: "Improve sales productivity by ranking likely converters.",
      businessImpact: "Influences sales attention allocation.",
      users: "Sales ops (150)",
      deploymentEnv: "Salesforce Einstein hybrid + internal model",
      modelProvider: "Internal logistic regression + boosting",
      dataSources: "CRM activities, firmographics, web engagement",
      downstreamSystems: "Salesforce",
      aiType: "Predictive ML",
      bu: "MKT",
      biz: "olivia.grant@contoso.com",
      tech: "ethan.wu@contoso.com",
      risk: "LOW" as RiskLevel,
      customerFacing: false,
      sensitivity: "INTERNAL" as DataSensitivity,
      prod: "PRODUCTION" as ProductionStatus,
      gov: "APPROVED" as GovernanceStatus,
      score: 91,
      docs: 95,
      ctrls: 90,
      testing: 88,
      approvals: 100,
      issuesPct: 90,
      assessmentScore: 22,
      lastAssess: 45,
      nextReview: 170,
    },
    {
      systemId: "AI-016",
      name: "Employee Attrition Prediction Model",
      description: "Predicts employee attrition risk for retention planning.",
      businessPurpose: "Enable proactive retention conversations.",
      businessImpact: "Sensitive workforce decisions; privacy and fairness concerns.",
      users: "HR business partners (85)",
      deploymentEnv: "HR analytics sandbox / limited production",
      modelProvider: "Internal random forest",
      dataSources: "HRIS, engagement surveys, compensation bands",
      downstreamSystems: "HR dashboards",
      aiType: "Predictive ML",
      bu: "HR",
      biz: "amanda.brooks@contoso.com",
      tech: "leo.park@contoso.com",
      risk: "HIGH" as RiskLevel,
      customerFacing: false,
      sensitivity: "RESTRICTED" as DataSensitivity,
      prod: "PILOT" as ProductionStatus,
      gov: "PENDING_REVIEW" as GovernanceStatus,
      score: 54,
      docs: 55,
      ctrls: 50,
      testing: 45,
      approvals: 40,
      issuesPct: 50,
      assessmentScore: 73,
      lastAssess: 100,
      nextReview: -10,
    },
    {
      systemId: "AI-017",
      name: "Computer Vision Quality Inspection System",
      description: "Detects manufacturing defects from production line imagery.",
      businessPurpose: "Reduce defective product escape rates.",
      businessImpact: "Quality and safety for manufactured goods.",
      users: "Plant quality engineers (40)",
      deploymentEnv: "Edge GPUs + plant MES",
      modelProvider: "Internal CNN / YOLO variant",
      dataSources: "Line camera feeds, defect labels",
      downstreamSystems: "MES, quality system",
      aiType: "Computer Vision",
      bu: "OPS",
      biz: "andrew.cole@contoso.com",
      tech: "julia.ross@contoso.com",
      risk: "MEDIUM" as RiskLevel,
      customerFacing: false,
      sensitivity: "INTERNAL" as DataSensitivity,
      prod: "PRODUCTION" as ProductionStatus,
      gov: "APPROVED" as GovernanceStatus,
      score: 85,
      docs: 87,
      ctrls: 84,
      testing: 86,
      approvals: 90,
      issuesPct: 80,
      assessmentScore: 40,
      lastAssess: 28,
      nextReview: 145,
    },
    {
      systemId: "AI-018",
      name: "AI Procurement Assistant",
      description: "Generative assistant for sourcing research and RFP drafting.",
      businessPurpose: "Accelerate procurement research and supplier comparison.",
      businessImpact: "Influences vendor selection and negotiation prep.",
      users: "Procurement specialists (65)",
      deploymentEnv: "Private GenAI workspace",
      modelProvider: "Google Gemini Enterprise",
      dataSources: "Supplier catalog, contracts, spend data",
      downstreamSystems: "Procurement suite",
      aiType: "Generative AI",
      bu: "SCM",
      biz: "sofia.alvarez@contoso.com",
      tech: "mike.patel@contoso.com",
      risk: "MEDIUM" as RiskLevel,
      customerFacing: false,
      sensitivity: "CONFIDENTIAL" as DataSensitivity,
      prod: "DEVELOPMENT" as ProductionStatus,
      gov: "DRAFT" as GovernanceStatus,
      score: 42,
      docs: 40,
      ctrls: 35,
      testing: 30,
      approvals: 20,
      issuesPct: 60,
      assessmentScore: 50,
      lastAssess: null,
      nextReview: 60,
    },
    {
      systemId: "AI-019",
      name: "Autonomous IT Support Agent",
      description: "AI agent that resolves common IT support requests end-to-end.",
      businessPurpose: "Deflect Tier-1 IT tickets and accelerate employee support.",
      businessImpact: "Access provisioning actions require strong controls.",
      users: "Employees via IT portal",
      deploymentEnv: "ServiceNow + agent orchestration layer",
      modelProvider: "Multi-tool agent on Azure OpenAI",
      dataSources: "ITKB, CMDB, identity directory (read)",
      downstreamSystems: "ServiceNow, Okta workflows",
      aiType: "AI Agent",
      bu: "OPS",
      biz: "andrew.cole@contoso.com",
      tech: "julia.ross@contoso.com",
      risk: "HIGH" as RiskLevel,
      customerFacing: false,
      sensitivity: "CONFIDENTIAL" as DataSensitivity,
      prod: "PILOT" as ProductionStatus,
      gov: "IN_ASSESSMENT" as GovernanceStatus,
      score: 57,
      docs: 62,
      ctrls: 52,
      testing: 48,
      approvals: 50,
      issuesPct: 55,
      assessmentScore: 69,
      lastAssess: 6,
      nextReview: 25,
    },
    {
      systemId: "AI-020",
      name: "Customer Sentiment Analysis Model",
      description: "NLP model classifying customer sentiment from surveys and chats.",
      businessPurpose: "Monitor customer experience signals at scale.",
      businessImpact: "Influences CX prioritization; limited direct decisions.",
      users: "CX insights team (25)",
      deploymentEnv: "Snowflake ML",
      modelProvider: "Internal transformer classifier",
      dataSources: "Surveys, chat transcripts, social mentions",
      downstreamSystems: "CX dashboards",
      aiType: "NLP",
      bu: "CS",
      biz: "sarah.mitchell@contoso.com",
      tech: "david.chen@contoso.com",
      risk: "LOW" as RiskLevel,
      customerFacing: false,
      sensitivity: "INTERNAL" as DataSensitivity,
      prod: "PRODUCTION" as ProductionStatus,
      gov: "APPROVED" as GovernanceStatus,
      score: 93,
      docs: 95,
      ctrls: 92,
      testing: 90,
      approvals: 100,
      issuesPct: 95,
      assessmentScore: 18,
      lastAssess: 60,
      nextReview: 180,
    },
    {
      systemId: "AI-021",
      name: "Vendor Risk Screening Model",
      description: "Screens third-party vendors for elevated risk indicators.",
      businessPurpose: "Prioritize third-party due diligence workload.",
      businessImpact: "Influences vendor onboarding risk treatment.",
      users: "Third-party risk team (22)",
      deploymentEnv: "GRC platform integration",
      modelProvider: "Internal classifier + external risk feeds",
      dataSources: "Vendor questionnaires, adverse media, financial signals",
      downstreamSystems: "Archer GRC",
      aiType: "Predictive ML",
      bu: "LEG",
      biz: "claire.dubois@contoso.com",
      tech: "james.okafor@contoso.com",
      risk: "MEDIUM" as RiskLevel,
      customerFacing: false,
      sensitivity: "CONFIDENTIAL" as DataSensitivity,
      prod: "PRODUCTION" as ProductionStatus,
      gov: "UNDER_MONITORING" as GovernanceStatus,
      score: 76,
      docs: 80,
      ctrls: 74,
      testing: 70,
      approvals: 85,
      issuesPct: 68,
      assessmentScore: 52,
      lastAssess: 35,
      nextReview: 95,
    },
    {
      systemId: "AI-022",
      name: "Call Center Speech Analytics",
      description: "Transcribes and analyzes call center conversations for quality and compliance.",
      businessPurpose: "Improve QA coverage and identify coaching opportunities.",
      businessImpact: "Processes customer conversations including potential PII.",
      users: "Contact center QA (48)",
      deploymentEnv: "Contact center cloud + analytics lake",
      modelProvider: "Speech-to-text vendor + internal NLP",
      dataSources: "Call audio, metadata, QA rubrics",
      downstreamSystems: "QA scoring platform",
      aiType: "NLP",
      bu: "CS",
      biz: "sarah.mitchell@contoso.com",
      tech: "david.chen@contoso.com",
      risk: "HIGH" as RiskLevel,
      customerFacing: true,
      sensitivity: "CONFIDENTIAL" as DataSensitivity,
      prod: "PRODUCTION" as ProductionStatus,
      gov: "PENDING_REVIEW" as GovernanceStatus,
      score: 64,
      docs: 68,
      ctrls: 62,
      testing: 58,
      approvals: 60,
      issuesPct: 55,
      assessmentScore: 67,
      lastAssess: 80,
      nextReview: 10,
    },
  ];

  const systems = [];
  for (const s of systemsSpec) {
    const created = await prisma.aISystem.create({
      data: {
        systemId: s.systemId,
        name: s.name,
        description: s.description,
        businessPurpose: s.businessPurpose,
        businessImpact: s.businessImpact,
        users: s.users,
        deploymentEnv: s.deploymentEnv,
        modelProvider: s.modelProvider,
        dataSources: s.dataSources,
        downstreamSystems: s.downstreamSystems,
        aiTypeId: type(s.aiType).id,
        businessUnitId: unit(s.bu).id,
        businessOwnerId: user(s.biz).id,
        technicalOwnerId: user(s.tech).id,
        riskLevel: s.risk,
        customerFacing: s.customerFacing,
        dataSensitivity: s.sensitivity,
        productionStatus: s.prod,
        governanceStatus: s.gov,
        governanceScore: s.score,
        documentationPct: s.docs,
        controlsPct: s.ctrls,
        testingPct: s.testing,
        approvalsPct: s.approvals,
        issueMgmtPct: s.issuesPct,
        lastAssessmentAt: s.lastAssess === null ? null : daysAgo(s.lastAssess),
        nextReviewAt: daysFromNow(s.nextReview),
      },
    });
    systems.push({ ...created, assessmentScore: s.assessmentScore, lastAssess: s.lastAssess });
  }

  const testTypes = [
    "Model Performance",
    "Bias / Fairness",
    "Explainability",
    "Hallucination Testing",
    "Prompt Injection",
    "Security",
    "Privacy",
    "Data Quality",
    "Model Drift",
    "Stress Testing",
  ];

  let testCounter = 1;
  let issueCounter = 1;

  for (const system of systems) {
    const assessStatus: AssessmentStatus =
      system.lastAssess === null
        ? "NOT_STARTED"
        : system.nextReviewAt && system.nextReviewAt < new Date()
          ? "OVERDUE"
          : system.assessmentScore >= 30
            ? "COMPLETED"
            : "IN_PROGRESS";

    const assessment = await prisma.riskAssessment.create({
      data: {
        aiSystemId: system.id,
        status: assessStatus,
        overallScore: system.assessmentScore,
        riskLevel: scoreToRisk(system.assessmentScore),
        leadId: user("marcus.chen@contoso.com").id,
        dueDate: system.nextReviewAt,
        completedAt: assessStatus === "COMPLETED" || assessStatus === "OVERDUE" ? system.lastAssessmentAt : null,
        summary: `Structured AI risk assessment for ${system.name}.`,
        factorNotes: "Top contributors include customer impact, sensitive data processing, and regulatory exposure.",
        privacyScore: Math.min(100, system.assessmentScore + 5),
        securityScore: Math.min(100, system.assessmentScore - 2),
        biasScore: Math.min(100, system.assessmentScore + (system.riskLevel === "CRITICAL" ? 10 : 0)),
        explainabilityScore: Math.max(10, system.assessmentScore - 8),
        reliabilityScore: Math.max(10, system.assessmentScore - 5),
        regulatoryScore: Math.min(100, system.assessmentScore + 6),
        humanOversightScore: Math.max(10, system.assessmentScore - 3),
        dataQualityScore: Math.max(10, system.assessmentScore - 10),
        thirdPartyScore: Math.max(10, system.assessmentScore - 12),
        reputationalScore: Math.min(100, system.assessmentScore + 4),
        privacyComment: "PII handling and retention controls reviewed.",
        securityComment: "Endpoint auth and input validation assessed.",
        biasComment: "Fairness metrics evaluated against protected attributes where applicable.",
        explainabilityComment: "Explainability artifacts available for key decisions.",
        reliabilityComment: "SLA and fallback behavior documented.",
        regulatoryComment: "Regulatory mapping completed for applicable processes.",
        humanOversightComment: "Human review thresholds defined for high-risk outputs.",
        dataQualityComment: "Training data lineage partially documented.",
        thirdPartyComment: "Vendor due diligence on model provider recorded.",
        reputationalComment: "Customer trust and media exposure considered.",
      },
    });

    if (assessStatus !== "NOT_STARTED") {
      for (const q of createdQuestions) {
        const answer = Math.random() > 0.35;
        await prisma.assessmentResponse.create({
          data: {
            assessmentId: assessment.id,
            questionId: q.id,
            answer,
            comments: answer ? "Affirmative based on current design." : "Control gap or residual risk noted.",
          },
        });
      }
    }

    for (const control of controls) {
      const roll = Math.random();
      let effectiveness: ControlEffectiveness = "EFFECTIVE";
      if (roll > 0.85) effectiveness = "INEFFECTIVE";
      else if (roll > 0.7) effectiveness = "PARTIALLY_EFFECTIVE";
      else if (roll > 0.6) effectiveness = "NOT_TESTED";
      else if (roll > 0.55) effectiveness = "NOT_APPLICABLE";

      if (control.controlId === "AI-GOV-008" && system.name.includes("GenAI") === false && !system.name.includes("Assistant") && !system.name.includes("Agent") && !system.name.includes("Contract")) {
        effectiveness = "NOT_APPLICABLE";
      }

      await prisma.aIControlAssessment.create({
        data: {
          aiSystemId: system.id,
          controlId: control.id,
          effectiveness,
          testerId: user("marcus.chen@contoso.com").id,
          testDate: effectiveness === "NOT_TESTED" ? null : daysAgo(Math.floor(Math.random() * 90)),
          evidence: effectiveness === "NOT_TESTED" ? null : "Control evidence uploaded to GRC repository.",
          comments: effectiveness === "INEFFECTIVE" ? "Remediation required before next review." : "Assessed during governance cycle.",
          remediationAction:
            effectiveness === "INEFFECTIVE" || effectiveness === "PARTIALLY_EFFECTIVE"
              ? "Owner to remediate gaps and retest within 30 days."
              : null,
          nextTestingDate: daysFromNow(30 + Math.floor(Math.random() * 120)),
        },
      });
    }

    const systemTestTypes = testTypes.filter((_, idx) => idx % 2 === system.systemId.charCodeAt(4) % 2 || idx < 4);
    for (const testType of systemTestTypes.slice(0, 5)) {
      const resultRoll = Math.random();
      const result: TestResult =
        resultRoll > 0.85 ? "FAILED" : resultRoll > 0.65 ? "PASSED_WITH_CONDITIONS" : "PASSED";
      await prisma.test.create({
        data: {
          testId: `TST-${String(testCounter++).padStart(4, "0")}`,
          aiSystemId: system.id,
          testType,
          testerId: user("james.okafor@contoso.com").id,
          testDate: daysAgo(Math.floor(Math.random() * 100)),
          result,
          score: result === "PASSED" ? 85 + Math.floor(Math.random() * 15) : result === "FAILED" ? 40 + Math.floor(Math.random() * 20) : 65 + Math.floor(Math.random() * 15),
          evidence: "Test report stored in model validation repository.",
          comments: result === "FAILED" ? "Failed acceptance criteria; remediation ticket opened." : "Within governance thresholds.",
        },
      });
    }

    // Issues for higher-risk / lower-score systems
    if (system.governanceScore < 80 || system.riskLevel === "HIGH" || system.riskLevel === "CRITICAL") {
      const issueCount = system.governanceScore < 60 ? 2 : 1;
      for (let i = 0; i < issueCount; i++) {
        const severity: IssueSeverity =
          system.riskLevel === "CRITICAL" && i === 0
            ? "CRITICAL"
            : system.riskLevel === "HIGH"
              ? "HIGH"
              : i === 0
                ? "MEDIUM"
                : "LOW";
        const status: IssueStatus =
          Math.random() > 0.75 ? "IN_PROGRESS" : Math.random() > 0.9 ? "PENDING_VALIDATION" : "OPEN";
        const overdue = system.governanceScore < 65 && i === 0;
        await prisma.issue.create({
          data: {
            issueId: `ISS-${String(issueCounter++).padStart(4, "0")}`,
            aiSystemId: system.id,
            title:
              severity === "CRITICAL"
                ? "Fairness testing incomplete for high-impact decisions"
                : severity === "HIGH"
                  ? "Control evidence outdated for production release"
                  : "Documentation gaps in model card",
            description:
              "Governance review identified residual risk requiring remediation prior to next approval cycle.",
            severity,
            category: severity === "CRITICAL" ? "Bias / Fairness" : "Controls",
            ownerId: system.businessOwnerId,
            dateIdentified: daysAgo(20 + i * 10),
            dueDate: overdue ? daysAgo(3 + i) : daysFromNow(14 + i * 7),
            status,
            remediationPlan: "Owner to remediate, attach evidence, and request validation.",
          },
        });
      }
    }

    for (let i = 0; i < APPROVAL_STAGES.length; i++) {
      const stage = APPROVAL_STAGES[i];
      let status: ApprovalStatus = "PENDING";
      if (system.approvalsPct >= 90) status = "APPROVED";
      else if (system.approvalsPct >= 70 && i < 5) status = "APPROVED";
      else if (system.approvalsPct >= 50 && i < 3) status = "APPROVED";
      else if (system.approvalsPct < 40 && i === 2) status = "CHANGES_REQUESTED";
      else if (system.governanceStatus === "REJECTED") status = i === 0 ? "REJECTED" : "PENDING";

      const reviewer =
        stage === "BUSINESS_OWNER_REVIEW"
          ? system.businessOwnerId
          : stage === "TECHNICAL_REVIEW"
            ? system.technicalOwnerId
            : stage === "PRIVACY_REVIEW" || stage === "LEGAL_COMPLIANCE_REVIEW"
              ? user("claire.dubois@contoso.com").id
              : stage === "SECURITY_REVIEW"
                ? user("maya.singh@contoso.com").id
                : user("marcus.chen@contoso.com").id;

      await prisma.approval.create({
        data: {
          aiSystemId: system.id,
          stage,
          reviewerId: reviewer,
          status,
          reviewDate: status === "PENDING" ? null : daysAgo(5 + i),
          comments:
            status === "APPROVED"
              ? "Review completed; no material objections."
              : status === "CHANGES_REQUESTED"
                ? "Additional testing evidence required."
                : status === "REJECTED"
                  ? "Does not meet governance standards."
                  : null,
          sortOrder: i + 1,
        },
      });
    }

    await prisma.auditEvent.createMany({
      data: [
        {
          aiSystemId: system.id,
          actorId: user("marcus.chen@contoso.com").id,
          action: "SYSTEM_REGISTERED",
          details: `${system.name} registered in AI inventory.`,
          createdAt: daysAgo(120),
        },
        {
          aiSystemId: system.id,
          actorId: system.businessOwnerId,
          action: "OWNERSHIP_CONFIRMED",
          details: "Business and technical ownership confirmed.",
          createdAt: daysAgo(100),
        },
        {
          aiSystemId: system.id,
          actorId: user("marcus.chen@contoso.com").id,
          action: "ASSESSMENT_UPDATED",
          details: `Risk assessment status set to ${assessStatus}.`,
          createdAt: daysAgo(system.lastAssess ?? 10),
        },
        {
          aiSystemId: system.id,
          actorId: user("robert.hayes@contoso.com").id,
          action: "AUDIT_REVIEW",
          details: "Auditor reviewed governance artifacts.",
          createdAt: daysAgo(7),
        },
      ],
    });
  }

  const trends = [
    ["2025-09", 71],
    ["2025-10", 73],
    ["2025-11", 74],
    ["2025-12", 76],
    ["2026-01", 77],
    ["2026-02", 78],
    ["2026-03", 79],
    ["2026-04", 80],
    ["2026-05", 81],
    ["2026-06", 82],
    ["2026-07", 83],
    ["2026-08", 84],
  ];

  await prisma.complianceTrend.createMany({
    data: trends.map(([month, percentage]) => ({
      month: month as string,
      percentage: percentage as number,
    })),
  });

  console.log(`Seeded ${systems.length} AI systems with governance data.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
