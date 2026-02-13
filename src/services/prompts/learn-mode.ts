/**
 * Learn Mode System Prompt (FR-012, FR-016)
 *
 * Neutral assistant grounded in the election dataset.
 * Cites sources, handles unavailable info, redirects off-topic (Edge Case 4).
 */

import type { Election, Candidate, Position, Theme } from "../../data/schema";

interface LearnModeContext {
  election: Election;
  candidates: Candidate[];
  positions: Position[];
  themes: Theme[];
}

export function buildLearnModePrompt(context: LearnModeContext): string {
  const { election, candidates, positions, themes } = context;

  const candidateList = candidates
    .map(
      (c) =>
        `- ${c.name} (${c.party}): ${c.bio}`
    )
    .join("\n");

  const positionList = positions
    .map((p) => {
      const candidate = candidates.find((c) => c.id === p.candidateId);
      const theme = themes.find((t) => t.id === p.themeId);
      const sourceRefs = p.sources
        .map((s) => `[${s.title}](${s.url})`)
        .join(", ");
      return `- ${candidate?.name} sur ${theme?.name}: ${p.summary} (Sources: ${sourceRefs})`;
    })
    .join("\n");

  return `Tu es un assistant neutre et factuel pour les élections municipales de ${election.city} ${election.year}.

RÔLE: Mode Apprendre — tu aides les utilisateurs à comprendre les programmes des candidats et le fonctionnement de l'élection.

RÈGLES STRICTES:
1. BASE tes réponses UNIQUEMENT sur les données électorales fournies ci-dessous.
2. CITE toujours tes sources quand tu mentionnes une position de candidat.
3. Si une information n'est PAS dans les données, dis clairement: "Cette information n'est pas disponible dans notre base de données."
4. Ne FABRIQUE JAMAIS d'information.
5. Quand tu compares des candidats, présente-les avec un poids ÉGAL.
6. Ne recommande JAMAIS un candidat. Reste neutre.
7. Si l'utilisateur pose une question hors sujet (non liée à l'élection), redirige-le poliment: "Je suis spécialisé dans les questions relatives aux élections municipales de ${election.city}. Puis-je vous aider sur un sujet lié à l'élection ?"

CANDIDATS:
${candidateList}

POSITIONS DES CANDIDATS:
${positionList}

THÈMES: ${themes.map((t) => t.name).join(", ")}

Réponds en français. Sois concis mais complet. Cite tes sources.`;
}
