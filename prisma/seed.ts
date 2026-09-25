import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, type Prisma } from "../src/generated/prisma/client";
import { CASE_SIGNS, GRAMMATICAL_ROLES } from "../src/constants/data/grammaticalRoles";
import { QUIZ_TEMPLATES as AUTHORED_TEMPLATES } from "../src/helpers/quiz/templates";

/**
 * Idempotent seed data: lookup tables that mirror the TS registries in
 * src/constants/data/grammaticalRoles.ts (single source of truth for both).
 * Safe to re-run. Users are no longer seeded — accounts come from /signup
 * (see src/server/lib/auth.ts); scripts/set-password.ts can claim a legacy seeded
 * dev user's data.
 */

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const db = new PrismaClient({ adapter });

async function main() {
  for (const role of Object.values(GRAMMATICAL_ROLES)) {
    await db.grammatical_roles.upsert({
      where: { code: role.code },
      update: {
        name_ar: role.nameAr,
        name_en: role.nameEn,
        category: role.category,
        rule_reference: role.ruleReference,
      },
      create: {
        code: role.code,
        name_ar: role.nameAr,
        name_en: role.nameEn,
        category: role.category,
        rule_reference: role.ruleReference,
      },
    });
  }
  console.log(`Seeded ${Object.keys(GRAMMATICAL_ROLES).length} grammatical_roles`);

  for (const sign of Object.values(CASE_SIGNS)) {
    const existing = await db.case_signs.findFirst({ where: { case_type: sign.caseType } });
    if (existing) {
      await db.case_signs.update({
        where: { id: existing.id },
        data: { sign_ar: sign.signAr, sign_en: sign.signEn },
      });
    } else {
      await db.case_signs.create({
        data: { case_type: sign.caseType, sign_ar: sign.signAr, sign_en: sign.signEn },
      });
    }
  }
  console.log(`Seeded ${Object.keys(CASE_SIGNS).length} case_signs`);

  // Legacy per-type templates: attempts logged by quiz *type* (book quizzes,
  // the curated I'rab/wazn banks, meaning-matching) resolve to these. Their
  // code is their quiz_type (see db/migrations/003_quiz_template_engine.sql).
  const LEGACY_TEMPLATES: { quiz_type: string; difficulty_tier: string; rule_reference?: string }[] = [
    { quiz_type: "vocab_recall", difficulty_tier: "beginner" },
    { quiz_type: "irab_reconstruction", difficulty_tier: "beginner", rule_reference: "Al-Ajurrumiyyah" },
    { quiz_type: "wazn_identification", difficulty_tier: "beginner" },
    { quiz_type: "book_comprehension", difficulty_tier: "beginner" },
    { quiz_type: "fawaid_recall", difficulty_tier: "beginner" },
    { quiz_type: "sentence_meaning_match", difficulty_tier: "beginner" },
  ];
  for (const t of LEGACY_TEMPLATES) {
    await db.quiz_templates.upsert({
      where: { code: t.quiz_type },
      update: {},
      create: { code: t.quiz_type, ...t, template_body: {} },
    });
  }

  // Authored engine templates (src/helpers/quiz/templates.ts) — the file is the
  // source of truth, so re-seeding overwrites DB edits to these rows.
  for (const t of AUTHORED_TEMPLATES) {
    const data = {
      quiz_type: t.quizType,
      difficulty_tier: t.difficultyTier,
      rule_reference: t.ruleReference,
      template_body: t.body as unknown as Prisma.InputJsonValue,
    };
    await db.quiz_templates.upsert({ where: { code: t.code }, update: data, create: { code: t.code, ...data } });
  }
  const QUIZ_TEMPLATES = [...LEGACY_TEMPLATES, ...AUTHORED_TEMPLATES];
  console.log(`Seeded ${QUIZ_TEMPLATES.length} quiz_templates`);
}

main()
  .then(async () => {
    await db.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await db.$disconnect();
    process.exit(1);
  });
