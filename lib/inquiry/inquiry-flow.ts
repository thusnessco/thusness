import {
  formatInquirySummary,
  type InquiryChoice,
  type InquiryStep,
} from "@/lib/inquiry/inquiry-content";

export function stepAllowsFreeText(step: InquiryStep): boolean {
  return step.allowFreeText !== false;
}

/** Line for the “Seen so far” panel from the current step + text or choice. */
export function buildInquiryTrailLine(
  step: InquiryStep,
  text: string,
  choiceId: string | null
): string {
  const trimmed = text.replace(/\s+/g, " ").trim();
  const choices = step.choices ?? [];
  const choice =
    choiceId && choices.length > 0
      ? choices.find((c) => c.id === choiceId)
      : undefined;

  if (choice) {
    const label = choice.label.replace(/\s+/g, " ").trim();
    const st = choice.summaryText?.trim();
    if (st) {
      return st.includes("{answer}")
        ? st.replace(/\{answer\}/g, label)
        : st;
    }
    return formatInquirySummary(step.summaryTemplate, label);
  }
  return formatInquirySummary(step.summaryTemplate, trimmed);
}

/** Next step id after completing `step`, or null when the inquiry is finished. */
export function resolveInquiryNextStepId(
  step: InquiryStep,
  choiceId: string | null,
  visibleSteps: InquiryStep[]
): string | null {
  const allowed = new Set(visibleSteps.map((s) => s.id));
  const choices = step.choices ?? [];
  if (choiceId && choices.length > 0) {
    const ch = choices.find((c) => c.id === choiceId);
    if (ch?.nextStepId && allowed.has(ch.nextStepId)) return ch.nextStepId;
  }
  const i = visibleSteps.findIndex((s) => s.id === step.id);
  if (i < 0 || i >= visibleSteps.length - 1) return null;
  return visibleSteps[i + 1]!.id;
}

export function getInquiryStepById(
  steps: InquiryStep[],
  id: string
): InquiryStep | undefined {
  return steps.find((s) => s.id === id);
}
