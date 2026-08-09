export type AssessmentAnswerInput = {
  weight: number;
  answer: boolean;
  section: string;
  question: string;
};

export type RiskScoreResult = {
  overallScore: number;
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  sectionScores: Record<string, number>;
  topFactors: Array<{ question: string; section: string; weight: number; contribution: number }>;
  explanation: string;
};

/**
 * Yes answers increase risk. Score normalized to 0–100.
 */
export function calculateRiskScore(answers: AssessmentAnswerInput[]): RiskScoreResult {
  if (answers.length === 0) {
    return {
      overallScore: 0,
      riskLevel: "LOW",
      sectionScores: {},
      topFactors: [],
      explanation: "No assessment responses provided.",
    };
  }

  const totalWeight = answers.reduce((sum, a) => sum + a.weight, 0);
  const riskWeight = answers.reduce((sum, a) => sum + (a.answer ? a.weight : 0), 0);
  const overallScore = Math.round((riskWeight / totalWeight) * 100);

  const sections = Array.from(new Set(answers.map((a) => a.section)));
  const sectionScores: Record<string, number> = {};
  for (const section of sections) {
    const sectionAnswers = answers.filter((a) => a.section === section);
    const tw = sectionAnswers.reduce((s, a) => s + a.weight, 0);
    const rw = sectionAnswers.reduce((s, a) => s + (a.answer ? a.weight : 0), 0);
    sectionScores[section] = tw === 0 ? 0 : Math.round((rw / tw) * 100);
  }

  const topFactors = answers
    .filter((a) => a.answer)
    .map((a) => ({
      question: a.question,
      section: a.section,
      weight: a.weight,
      contribution: Math.round((a.weight / totalWeight) * 100),
    }))
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 5);

  const riskLevel =
    overallScore >= 80 ? "CRITICAL" : overallScore >= 60 ? "HIGH" : overallScore >= 30 ? "MEDIUM" : "LOW";

  const explanation =
    topFactors.length === 0
      ? "No elevated risk factors were indicated."
      : `Primary contributors: ${topFactors.map((f) => f.question).slice(0, 3).join("; ")}.`;

  return { overallScore, riskLevel, sectionScores, topFactors, explanation };
}

export type GovernanceInputs = {
  documentationPct: number;
  controlsPct: number;
  testingPct: number;
  approvalsPct: number;
  issueMgmtPct: number;
};

export function calculateGovernanceScore(input: GovernanceInputs) {
  const weights = {
    documentationPct: 0.15,
    controlsPct: 0.25,
    testingPct: 0.2,
    approvalsPct: 0.2,
    issueMgmtPct: 0.2,
  };

  const score = Math.round(
    input.documentationPct * weights.documentationPct +
      input.controlsPct * weights.controlsPct +
      input.testingPct * weights.testingPct +
      input.approvalsPct * weights.approvalsPct +
      input.issueMgmtPct * weights.issueMgmtPct
  );

  return {
    score,
    breakdown: [
      { label: "Documentation", value: input.documentationPct, weight: "15%" },
      { label: "Controls", value: input.controlsPct, weight: "25%" },
      { label: "Testing", value: input.testingPct, weight: "20%" },
      { label: "Approvals", value: input.approvalsPct, weight: "20%" },
      { label: "Issue Management", value: input.issueMgmtPct, weight: "20%" },
    ],
  };
}
