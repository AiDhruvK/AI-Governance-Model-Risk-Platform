# AI Governance & Model Risk Platform — Implementation Plan

## Purpose

Enterprise-style internal platform for inventorying, assessing, governing, monitoring, and approving AI/ML systems across a large organization.

## Folder Structure

```
prisma/
  schema.prisma          # Relational data model
  seed.ts                # 20+ AI systems + related governance data
src/
  app/
    (platform)/          # Authenticated app shell (sidebar + header)
      page.tsx           # Executive Dashboard
      inventory/         # AI Inventory + detail + create
      assessments/       # Risk assessment list + workflow
      controls/          # Control library + assessments
      testing/           # Testing & validation
      issues/            # Governance issues
      approvals/         # Approval workflows
      reports/           # Governance reports
      admin/             # Administration pages
    api/                 # Optional future API integrations
  components/
    layout/              # Sidebar, Header, PageHeader
    ui/                  # KPI cards, badges, tables, filters, modals
    charts/              # Recharts wrappers
    forms/               # Assessment and inventory forms
  lib/
    prisma.ts            # Prisma client singleton
    scoring.ts           # Risk + governance score calculation
    types.ts             # Shared TypeScript types
    constants.ts         # Enums, nav items, labels
    utils.ts             # Formatting helpers
```

## Database Model (Prisma / PostgreSQL)

- **User** — name, email, role, business unit
- **BusinessUnit** — Finance, HR, Customer Service, etc.
- **AISystem** — inventory record with ownership, risk, status, governance score
- **RiskAssessment** + **AssessmentResponse** — structured questionnaire and scores
- **Control** + **AIControlAssessment** — control library and per-system effectiveness
- **Test** — model validation / testing evidence
- **Issue** — governance issues with severity and remediation
- **Approval** — multi-stage approval workflow
- **AuditEvent** — chronological governance history
- **AssessmentQuestion** — admin-managed questionnaire bank
- **RiskCategory** — privacy, bias, security, etc.
- **AIType** — generative, predictive, NLP, etc.

## Major Components

- `AppSidebar` / `AppHeader` — enterprise navigation + role switcher
- `KpiCard` — dashboard metrics
- `RiskBadge` / `StatusBadge` — consistent visual indicators
- `DataTable` — sortable/filterable tables
- `FilterBar` — multi-select filters
- `ChartCard` — bar/pie/line chart containers
- `GovernanceScorePanel` — score breakdown
- `ApprovalWorkflow` — staged visual workflow
- `Modal` / form primitives — create/edit flows

## Page Routes

| Route | Feature |
|-------|---------|
| `/` | Executive Dashboard |
| `/inventory` | AI Inventory |
| `/inventory/new` | Add AI System |
| `/inventory/[id]` | System detail (tabs) |
| `/assessments` | Risk assessments |
| `/assessments/new` | Assessment workflow |
| `/controls` | Control library |
| `/testing` | Testing & validation |
| `/issues` | Governance issues |
| `/approvals` | Approvals |
| `/reports` | Reports |
| `/admin/*` | Administration |

## Development Sequence

1. Schema + seed data
2. Layout / navigation / reusable UI
3. Executive Dashboard
4. AI Inventory + Detail
5. Risk Assessments, Controls, Testing, Issues, Approvals
6. Reports + Administration
7. README + verify end-to-end

## Assumptions

- Authentication is simulated via a role switcher (Executive, AI Governance Manager, Business Owner, Technical Owner, Risk/Compliance, Auditor).
- Initial data is fully seeded; no external AI APIs required.
- PostgreSQL runs locally for development.
