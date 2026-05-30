export interface ExplanationHistoryItem {
  id: string;
  medicineName: string;
  language: string;
  explanation: string;
  timestamp: string;
  personalNotes?: string;
  isBookmarked?: boolean;
}

export interface GlossaryItem {
  term: string;
  simpleDefinition: string;
  category: string;
}

export interface SafetyCheckResult {
  hasAllergies: boolean | null;
  isPregnantOrFeeding: boolean | null;
  hasMedicalConditions: boolean | null;
  takingOtherMeds: boolean | null;
  hasConsultedDoctor: boolean | null;
}
