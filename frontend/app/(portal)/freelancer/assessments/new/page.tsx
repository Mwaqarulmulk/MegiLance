// @AI-HINT: Route page for skill assessment wizard
import SkillAssessmentWizard from '@/src/components/wizards/SkillAssessmentWizard';

export default function SkillAssessmentPage({
  searchParams
}: {
  searchParams: { skillId: string; skillName: string; userId: string }
}) {
  return (
    <SkillAssessmentWizard
      skillId={searchParams.skillId}
      skillName={searchParams.skillName}
      userId={searchParams.userId}
    />
  );
}
