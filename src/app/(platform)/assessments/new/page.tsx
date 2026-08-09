import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/auth";
import { PageHeader } from "@/components/ui/PageHeader";
import { AssessmentForm } from "@/components/assessments/AssessmentForm";
import { calculateRiskScore } from "@/lib/scoring";

export const dynamic = "force-dynamic";

async function saveAssessment(formData: FormData) {
  "use server";
  const session = await getCurrentSession();
  if (!session.permissions.canEdit) throw new Error("Read-only role");

  const aiSystemId = String(formData.get("aiSystemId"));
  const questions = await prisma.assessmentQuestion.findMany({ where: { active: true } });
  const answers = questions.map((q) => ({
    weight: q.weight,
    answer: String(formData.get(`q_${q.id}`)) === "yes",
    section: q.section,
    question: q.question,
    questionId: q.id,
  }));

  const result = calculateRiskScore(answers);

  const assessment = await prisma.riskAssessment.create({
    data: {
      aiSystemId,
      status: "COMPLETED",
      overallScore: result.overallScore,
      riskLevel: result.riskLevel,
      leadId: session.user?.id,
      completedAt: new Date(),
      dueDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
      summary: `Assessment completed with score ${result.overallScore}.`,
      factorNotes: result.explanation,
      privacyScore: result.sectionScores["Data Risk"] ?? result.overallScore,
      securityScore: result.sectionScores["Security"] ?? result.overallScore,
      biasScore: result.sectionScores["AI Risk"] ?? result.overallScore,
      explainabilityScore: result.sectionScores["AI Risk"] ?? result.overallScore,
      reliabilityScore: result.sectionScores["Business Impact"] ?? result.overallScore,
      regulatoryScore: result.sectionScores["Compliance"] ?? result.overallScore,
      humanOversightScore: result.sectionScores["AI Risk"] ?? result.overallScore,
      dataQualityScore: result.sectionScores["Data Risk"] ?? result.overallScore,
      thirdPartyScore: Math.max(10, result.overallScore - 10),
      reputationalScore: result.sectionScores["Business Impact"] ?? result.overallScore,
      responses: {
        create: answers.map((a) => ({
          questionId: a.questionId,
          answer: a.answer,
          comments: a.answer ? "Risk factor present" : "Risk factor not indicated",
        })),
      },
    },
  });

  await prisma.aISystem.update({
    where: { id: aiSystemId },
    data: {
      riskLevel: result.riskLevel === "CRITICAL" ? "CRITICAL" : result.riskLevel,
      lastAssessmentAt: new Date(),
      nextReviewAt: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
      governanceStatus: "UNDER_MONITORING",
    },
  });

  await prisma.auditEvent.create({
    data: {
      aiSystemId,
      actorId: session.user?.id,
      action: "ASSESSMENT_COMPLETED",
      details: `Risk assessment completed with score ${result.overallScore} (${result.riskLevel}).`,
    },
  });

  revalidatePath("/assessments");
  revalidatePath(`/inventory/${aiSystemId}`);
  revalidatePath("/");
  redirect(`/assessments/${assessment.id}`);
}

export default async function NewAssessmentPage() {
  const session = await getCurrentSession();
  if (!session.permissions.canEdit) redirect("/assessments");

  const [questions, systems] = await Promise.all([
    prisma.assessmentQuestion.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } }),
    prisma.aISystem.findMany({ orderBy: { systemId: "asc" }, select: { id: true, name: true, systemId: true } }),
  ]);

  return (
    <div>
      <PageHeader
        title="AI Risk Assessment Workflow"
        description="Complete the structured questionnaire. The overall risk score is calculated from weighted responses."
      />
      <AssessmentForm questions={questions} systems={systems} action={saveAssessment} />
    </div>
  );
}
