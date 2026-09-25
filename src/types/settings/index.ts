export interface SettingsPageData {
  user: { email: string; display_name: string | null; srs_algorithm: string };
  /** Cards per Leitner box (1-5). */
  boxCounts: { box: number; count: number }[];
}

export interface SettingsState {
  message?: string;
  error?: string;
}
