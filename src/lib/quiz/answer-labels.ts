/**
 * Display labels shared by the quiz source loaders (which put them on items
 * as answers) and the authored templates (which list them as fixed
 * options). Both sides MUST use these exact strings, or a correct answer
 * would never match its option — so they live in one place.
 */

export const CASE_LABELS = {
  nominative: "Marfūʿ — مَرْفُوع (nominative)",
  accusative: "Manṣūb — مَنْصُوب (accusative)",
  genitive: "Majrūr — مَجْرُور (genitive)",
} as const;

export const ASPECT_LABELS = {
  perfect: "Māḍī — مَاضٍ (past)",
  imperfect: "Muḍāriʿ — مُضَارِع (present/future)",
  imperative: "Amr — أَمْر (command)",
} as const;

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];

/** "Form IV (أَفْعَلَ)" — pattern supplied by the caller from verb_forms / wazn.ts. */
export function verbFormLabel(formNumber: number, pattern: string): string {
  return `Form ${ROMAN[formNumber - 1]} (${pattern})`;
}

/** "Noun — اسم" */
export function posLabel(nameEn: string, nameAr: string): string {
  return `${nameEn} — ${nameAr}`;
}
