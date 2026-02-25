# Navigation Contracts: Frontend Redesign

**Feature**: 002-frontend-redesign
**Date**: 2026-02-15

## Route Map

All routes use Expo Router file-based routing. Routes map 1:1 to files in `src/app/`.

### Tab Routes (persistent, always mounted)

| Route | File | Tab Label | Tab Position | Description |
|-------|------|-----------|-------------|-------------|
| `/` | `(tabs)/index.tsx` | Accueil | Left | Home screen with hero, shortcuts, cards, theme feed |
| `/assistant` | `(tabs)/assistant.tsx` | Assistant | Center | Chat UI with mode selector |
| `/candidates` | `(tabs)/candidates.tsx` | Candidats | Right | Candidate gallery with theme filter |

### Stack Routes (pushed above tabs)

| Route | File | Presented From | Description |
|-------|------|----------------|-------------|
| `/candidate/[id]` | `candidate/[id].tsx` | Candidates tab, Home, Comparison | Single candidate profile with positions, sources, actions |
| `/comparison` | `comparison.tsx` | Candidate profile, Candidates tab | Side-by-side comparison for 2+ candidates on selected theme |
| `/survey/intro` | `survey/intro.tsx` | Home shortcut, Resume card | Civic primer before survey questions |
| `/survey/questions` | `survey/questions.tsx` | Survey intro | Questionnaire with progress bar |
| `/survey/results` | `survey/results.tsx` | Survey questions (on completion) | Alignment results, contradictions, retake |
| `/onboarding` | `onboarding.tsx` | Root layout (first launch only) | First-time user orientation |

---

## Deep Link Contracts

### "Ask about this" → Assistant

**Trigger**: User taps "Ask about this" from a candidate profile or theme card.

**Before navigation**:
```
assistantStore.setPreloadedContext({
  type: "candidate" | "theme",
  candidateId: string | null,
  themeId: string | null,
  promptText: string          // e.g., "Que propose Alice Dupont sur le transport ?"
})
assistantStore.setMode("comprendre")
```

**Navigation**: `router.push("/(tabs)/assistant")`

**On arrival**: Assistant tab checks `preloadedContext`, displays contextual starter prompt, clears after use.

---

### "Comparer" → Comparison

**Trigger**: User taps "Comparer" from a candidate profile.

**Navigation**: `router.push("/comparison?selected=candidateId")`

**On arrival**: Comparison screen pre-selects the passed candidate. User selects additional candidates to begin comparison.

---

### "Debattre" → Assistant (Debate Mode)

**Trigger**: User taps "Debattre" from a candidate profile.

**Before navigation**:
```
assistantStore.setMode("debattre")
assistantStore.setPreloadedContext({
  type: "candidate",
  candidateId: string,
  themeId: null,
  promptText: null
})
```

**Navigation**: `router.push("/(tabs)/assistant")`

---

### Home Shortcut → Survey

**Trigger**: User taps "Commencer le sondage" or "Refaire le sondage" on Home.

**Navigation**:
- If survey not started: `router.push("/survey/intro")`
- If survey in progress: `router.push("/survey/questions")` (resume)
- If "Refaire": `surveyStore.reset()` then `router.push("/survey/intro")`

---

### Home Shortcut → Candidates

**Trigger**: User taps "Voir les candidats" on Home.

**Navigation**: `router.push("/(tabs)/candidates")`

---

### Home Shortcut → Assistant

**Trigger**: User taps "Poser une question" on Home.

**Navigation**: `router.push("/(tabs)/assistant")`

---

### Theme Feed → Candidates (Filtered)

**Trigger**: User taps a theme in the Home theme feed.

**Navigation**: `router.push("/(tabs)/candidates?theme=themeId")`

**On arrival**: Candidates tab applies theme filter automatically.

---

## Screen Param Contracts

### `/candidate/[id]`

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | Yes | Candidate ID from election dataset |

### `/comparison`

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| selected | string | No | Comma-separated candidate IDs to pre-select |

### `/(tabs)/candidates`

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| theme | string | No | Theme ID to auto-apply as filter |

---

## Tab Bar Configuration

```
Tab Bar Position: Bottom, fixed
Tab Count: 3
Tab Order: Accueil (index 0) | Assistant (index 1) | Candidats (index 2)
Active Indicator: Filled icon + bold label + primary color
Inactive Indicator: Outline icon + regular label + muted color
Badge: None (no notification badges in MVP)
Safe Area: Respects device safe area (notch, home indicator)
```
