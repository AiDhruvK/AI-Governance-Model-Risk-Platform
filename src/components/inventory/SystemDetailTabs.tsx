"use client";

import { useState } from "react";
import { RiskBadge } from "@/components/ui/RiskBadge";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Panel } from "@/components/ui/Panel";
import { GovernanceScorePanel } from "@/components/ui/GovernanceScorePanel";
import { ApprovalWorkflow } from "@/components/ui/ApprovalWorkflow";
import { formatDate, ratingFromScore, titleCase } from "@/lib/utils";

const tabs = [
  "Overview",
  "Risk Assessment",
  "Controls",
  "Testing",
  "Issues",
  "Approvals",
  "Audit History",
] as const;

type Tab = (typeof tabs)[number];

export function SystemDetailTabs({ data }: { data: any }) {
  const [tab, setTab] = useState<Tab>("Overview");
  const assessment = data.assessments[0];

  const riskDimensions = assessment
    ? [
        ["Privacy", assessment.privacyScore, assessment.privacyComment],
        ["Security", assessment.securityScore, assessment.securityComment],
        ["Bias/Fairness", assessment.biasScore, assessment.biasComment],
        ["Explainability", assessment.explainabilityScore, assessment.explainabilityComment],
        ["Reliability", assessment.reliabilityScore, assessment.reliabilityComment],
        ["Regulatory Risk", assessment.regulatoryScore, assessment.regulatoryComment],
        ["Human Oversight", assessment.humanOversightScore, assessment.humanOversightComment],
        ["Data Quality", assessment.dataQualityScore, assessment.dataQualityComment],
        ["Third-Party Risk", assessment.thirdPartyScore, assessment.thirdPartyComment],
        ["Reputational Risk", assessment.reputationalScore, assessment.reputationalComment],
      ]
    : [];

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <Meta label="System Name" value={data.name} />
        <Meta label="Business Unit" value={data.businessUnit.name} />
        <Meta label="AI Type" value={data.aiType.name} />
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">Risk Level</p>
          <div className="mt-1">
            <RiskBadge level={data.riskLevel} />
          </div>
        </div>
        <Meta label="Business Owner" value={data.businessOwner.name} />
        <Meta label="Technical Owner" value={data.technicalOwner.name} />
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">Production Status</p>
          <div className="mt-1">
            <StatusBadge status={data.productionStatus} />
          </div>
        </div>
        <Meta label="Customer Facing" value={data.customerFacing ? "Yes" : "No"} />
        <Meta label="Data Sensitivity" value={titleCase(data.dataSensitivity)} />
      </div>

      <GovernanceScorePanel
        score={data.governanceScore}
        breakdown={[
          { label: "Documentation", value: data.documentationPct, weight: "15%" },
          { label: "Controls", value: data.controlsPct, weight: "25%" },
          { label: "Testing", value: data.testingPct, weight: "20%" },
          { label: "Approvals", value: data.approvalsPct, weight: "20%" },
          { label: "Issue Management", value: data.issueMgmtPct, weight: "20%" },
        ]}
      />

      <div className="mt-4 border-b border-slate-200">
        <nav className="-mb-px flex flex-wrap gap-1">
          {tabs.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setTab(item)}
              className={`border-b-2 px-3 py-2 text-sm font-medium ${
                tab === item
                  ? "border-teal-700 text-teal-800"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              {item}
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-4">
        {tab === "Overview" && (
          <div className="grid gap-4 lg:grid-cols-2">
            <Panel title="Business Purpose">
              <p className="text-sm text-slate-700">{data.businessPurpose}</p>
            </Panel>
            <Panel title="AI Description">
              <p className="text-sm text-slate-700">{data.description}</p>
            </Panel>
            <Panel title="Business Impact">
              <p className="text-sm text-slate-700">{data.businessImpact}</p>
            </Panel>
            <Panel title="Users">
              <p className="text-sm text-slate-700">{data.users}</p>
            </Panel>
            <Panel title="Deployment Environment">
              <p className="text-sm text-slate-700">{data.deploymentEnv}</p>
            </Panel>
            <Panel title="Model / Provider">
              <p className="text-sm text-slate-700">{data.modelProvider}</p>
            </Panel>
            <Panel title="Data Sources">
              <p className="text-sm text-slate-700">{data.dataSources}</p>
            </Panel>
            <Panel title="Downstream Systems">
              <p className="text-sm text-slate-700">{data.downstreamSystems}</p>
            </Panel>
          </div>
        )}

        {tab === "Risk Assessment" && (
          <Panel
            title="Risk Dimension Scores"
            description={
              assessment
                ? `Overall score ${assessment.overallScore}/100 · ${titleCase(assessment.riskLevel)} · ${titleCase(assessment.status)}`
                : "No assessment on record"
            }
          >
            {assessment ? (
              <div className="grid gap-3 md:grid-cols-2">
                {riskDimensions.map(([label, score, comment]) => (
                  <div key={label as string} className="rounded-md border border-slate-200 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-slate-900">{label}</p>
                      <RiskBadge level={ratingFromScore(score as number).toUpperCase()} />
                    </div>
                    <p className="mt-1 text-lg font-semibold tabular-nums text-slate-800">{score as number}/100</p>
                    <p className="mt-1 text-xs text-slate-500">{comment as string}</p>
                  </div>
                ))}
                {assessment.factorNotes ? (
                  <div className="md:col-span-2 rounded-md bg-slate-50 p-3 text-sm text-slate-700">
                    <strong>Contributing factors:</strong> {assessment.factorNotes}
                  </div>
                ) : null}
              </div>
            ) : (
              <p className="text-sm text-slate-500">No risk assessment has been completed for this system.</p>
            )}
          </Panel>
        )}

        {tab === "Controls" && (
          <Panel title="Associated Governance Controls">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs uppercase text-slate-500">
                    <th className="py-2 pr-3">Control ID</th>
                    <th className="py-2 pr-3">Name</th>
                    <th className="py-2 pr-3">Effectiveness</th>
                    <th className="py-2 pr-3">Tester</th>
                    <th className="py-2 pr-3">Test Date</th>
                    <th className="py-2">Next Test</th>
                  </tr>
                </thead>
                <tbody>
                  {data.controlAssessments.map((ca: any) => (
                    <tr key={ca.id} className="border-b border-slate-50">
                      <td className="py-2 pr-3 font-medium">{ca.control.controlId}</td>
                      <td className="py-2 pr-3">{ca.control.name}</td>
                      <td className="py-2 pr-3">
                        <StatusBadge status={ca.effectiveness} />
                      </td>
                      <td className="py-2 pr-3">{ca.tester?.name ?? "—"}</td>
                      <td className="py-2 pr-3">{formatDate(ca.testDate)}</td>
                      <td className="py-2">{formatDate(ca.nextTestingDate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        )}

        {tab === "Testing" && (
          <Panel title="Model Validation & Testing">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs uppercase text-slate-500">
                    <th className="py-2 pr-3">Test ID</th>
                    <th className="py-2 pr-3">Type</th>
                    <th className="py-2 pr-3">Tester</th>
                    <th className="py-2 pr-3">Date</th>
                    <th className="py-2 pr-3">Result</th>
                    <th className="py-2">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {data.tests.map((test: any) => (
                    <tr key={test.id} className="border-b border-slate-50">
                      <td className="py-2 pr-3 font-medium">{test.testId}</td>
                      <td className="py-2 pr-3">{test.testType}</td>
                      <td className="py-2 pr-3">{test.tester?.name ?? "—"}</td>
                      <td className="py-2 pr-3">{formatDate(test.testDate)}</td>
                      <td className="py-2 pr-3">
                        <StatusBadge status={test.result} />
                      </td>
                      <td className="py-2 tabular-nums">{test.score ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        )}

        {tab === "Issues" && (
          <Panel title="Governance Issues">
            <div className="space-y-3">
              {data.issues.length === 0 ? (
                <p className="text-sm text-slate-500">No open or historical issues for this system.</p>
              ) : (
                data.issues.map((issue: any) => (
                  <div key={issue.id} className="rounded-md border border-slate-200 p-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-slate-900">
                        {issue.issueId}: {issue.title}
                      </span>
                      <RiskBadge level={issue.severity} />
                      <StatusBadge status={issue.status} />
                    </div>
                    <p className="mt-1 text-sm text-slate-600">{issue.description}</p>
                    <p className="mt-2 text-xs text-slate-500">
                      Owner: {issue.owner?.name ?? "—"} · Due: {formatDate(issue.dueDate)} · Category: {issue.category}
                    </p>
                  </div>
                ))
              )}
            </div>
          </Panel>
        )}

        {tab === "Approvals" && (
          <Panel title="Governance Approval History">
            <ApprovalWorkflow approvals={data.approvals} />
          </Panel>
        )}

        {tab === "Audit History" && (
          <Panel title="Audit History">
            <ol className="relative space-y-4 border-l border-slate-200 pl-4">
              {data.auditEvents.map((event: any) => (
                <li key={event.id}>
                  <div className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full bg-teal-700" />
                  <p className="text-xs text-slate-500">{formatDate(event.createdAt)}</p>
                  <p className="text-sm font-semibold text-slate-900">{titleCase(event.action)}</p>
                  <p className="text-sm text-slate-600">{event.details}</p>
                  <p className="text-xs text-slate-500">Actor: {event.actor?.name ?? "System"}</p>
                </li>
              ))}
            </ol>
          </Panel>
        )}
      </div>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-medium text-slate-900">{value}</p>
    </div>
  );
}
