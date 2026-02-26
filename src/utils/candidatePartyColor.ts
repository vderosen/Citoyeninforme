const PARTY_COLORS: Record<string, string> = {
  "david-belliard": "#00A650",       // EELV — green
  "emmanuel-gregoire": "#FF8080",    // PS — rose/pink
  "sophia-chikirou": "#7B13D6",      // LFI — purple
  "rachida-dati": "#0066CC",         // LR — blue
  "pierre-yves-bournazel": "#00B0F0", // Horizons — sky blue
  "sarah-knafo": "#FFC000",          // Reconquête — yellow
  "thierry-mariani": "#002395",      // RN — navy blue
};

export function getCandidatePartyColor(candidateId: string): string {
  return PARTY_COLORS[candidateId] ?? "#9CA3AF";
}
