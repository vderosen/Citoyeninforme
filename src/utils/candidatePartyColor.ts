const PARTY_COLORS: Record<string, string> = {
  "david-belliard": "#00A650",
  "emmanuel-gregoire": "#ED1C24",
  "sophia-chikirou": "#C9452E",
  "rachida-dati": "#0066CC",
  "pierre-yves-bournazel": "#FF8C00",
  "sarah-knafo": "#1B2A4A",
  "thierry-mariani": "#0D2240",
};

export function getCandidatePartyColor(candidateId: string): string {
  return PARTY_COLORS[candidateId] ?? "#9CA3AF";
}
