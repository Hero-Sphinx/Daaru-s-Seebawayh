export const dashboardStats = {
  cardsDueToday: 12,
  documentsInLibrary: 4,
  quizAccuracy7d: 0.82,
};

export const recentDocuments = [
  { id: "doc-1", title: "Riyad as-Salihin", processingStatus: "completed" as const, pageCount: 512 },
  { id: "doc-2", title: "Al-Ajurrumiyyah — annotated", processingStatus: "completed" as const, pageCount: 48 },
  { id: "doc-3", title: "Fiqh al-Sunnah, vol. 1", processingStatus: "processing" as const, pageCount: 340 },
];

export const recentFawaid = [
  { id: 1, title: "بَلَاغَة: الالتفات في سورة يوسف", category: "balaghah" as const },
  { id: 2, title: "Rare word: غَاسِق (encroaching darkness)", category: "vocabulary" as const },
];
