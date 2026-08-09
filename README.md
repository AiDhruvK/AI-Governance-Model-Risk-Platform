# AI Governance & Model Risk Platform

Enterprise web application for inventorying, assessing, governing, monitoring, and approving AI/ML systems across a large organization.

Designed as a realistic internal Fortune 500-style governance platform for executives, risk leaders, technology leaders, auditors, and consulting demonstrations.

## Purpose

Business, risk, compliance, data science, and technology teams can:

- Register AI/ML systems and assign ownership
- Classify AI risk and complete governance assessments
- Track controls and model testing evidence
- Manage approvals and remediation issues
- View enterprise AI risk through dashboards and reports

## Technology Stack

- **Next.js** (App Router) + **React** + **TypeScript**
- **Tailwind CSS**
- **PostgreSQL**
- **Prisma ORM**
- **Recharts** for dashboard visualizations

## Architecture

```
prisma/                 Database schema, migrations, seed data
src/app/(platform)/     Application pages (dashboard, inventory, assessments, ...)
src/components/         Reusable UI, charts, layout, forms
src/lib/                Prisma client, scoring logic, auth simulation, constants
```

Key design choices:

- Server Components fetch governance data directly via Prisma
- Business scoring logic lives in `src/lib/scoring.ts` (separated from UI)
- Authentication is simulated with a role switcher (cookie-based)
- Seeded data enables full demos without external AI services

## Database Schema

Core entities:

| Model | Purpose |
|-------|---------|
| User / BusinessUnit | People and org structure |
| AISystem / AIType | AI inventory |
| RiskAssessment / AssessmentResponse / AssessmentQuestion | Risk workflow |
| Control / AIControlAssessment | Control library + effectiveness |
| Test | Validation evidence |
| Issue | Governance findings |
| Approval | Multi-stage approval workflow |
| AuditEvent | Chronological decision history |
| ComplianceTrend | Dashboard trend series |
| RiskCategory | Risk dimension catalog |

## Major Features

1. **Executive Dashboard** — KPIs, risk/unit/type charts, compliance trend, top risks
2. **AI Inventory** — searchable/filterable inventory + create form
3. **AI System Detail** — overview, risk, controls, testing, issues, approvals, audit tabs + governance score
4. **Risk Assessments** — weighted questionnaire with live 0–100 score
5. **Controls** — control library and per-system assessments
6. **Testing & Validation** — performance, bias, GenAI safety, security, etc.
7. **Issues** — severity/status tracking with overdue highlighting
8. **Approvals** — 7-stage visual workflow
9. **Reports** — high-risk systems, missing assessments, failed controls, unit scores, etc.
10. **Administration** — business units, users, roles, AI types, risk categories, controls, questions

## Roles (Simulated)

Use the header role switcher:

- Executive
- AI Governance Manager
- Business Owner
- Data Scientist / Technical Owner
- Risk / Compliance Reviewer
- Auditor

Permissions are enforced lightly (e.g., create forms hidden/blocked for read-only roles).

## Setup Instructions

### Prerequisites

- Node.js 20+
- PostgreSQL 14+

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Update `DATABASE_URL` for your PostgreSQL instance.

### 3. Migrate and seed

```bash
npx prisma migrate dev
npm run db:seed
```

### 4. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Useful scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run db:seed` | Reseed sample data |
| `npm run db:reset` | Reset DB + migrate + seed |

## Seed Data

The seed loads **22 realistic AI systems**, including:

- Customer Support GenAI Assistant
- Employee Resume Screening Model
- Fraud Detection Engine
- Loan Risk Scoring Model
- Autonomous IT Support Agent
- and more

Systems vary by risk level, business unit, governance score, open issues, approvals, and testing status so dashboards are visually meaningful.

## Extensibility

The structure is ready for future AI integrations and APIs:

- Add route handlers under `src/app/api/`
- Keep domain scoring/validation in `src/lib/`
- Extend Prisma models without rewriting UI shells

## Implementation Plan

See `IMPLEMENTATION_PLAN.md` for folder structure, model overview, routes, and development sequence.
