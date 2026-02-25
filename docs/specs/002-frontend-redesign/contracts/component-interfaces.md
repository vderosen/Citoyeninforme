# Component Interface Contracts: Frontend Redesign

**Feature**: 002-frontend-redesign
**Date**: 2026-02-15

## Shared Components

### TrustBadge

Consistent badge for source attribution across all screens.

```typescript
interface TrustBadgeProps {
  variant: "source" | "non_documente" | "incertain";
  source?: SourceReference;    // Required when variant is "source"
  onPress?: () => void;        // Opens source link (for "source" variant)
}
```

**Visual contract**:
- "source": Green-tinted badge with link icon. Tappable → opens source URL.
- "non_documente": Gray badge with "Non documente" text. Not tappable.
- "incertain": Yellow/amber badge with "Incertain" text. Not tappable.
- All badges: Same height, consistent font, `accessibilityRole="text"` or `"link"`.

---

### EmptyState

Generic empty state with explanatory message and call-to-action.

```typescript
interface EmptyStateProps {
  icon?: string;               // Icon name or component
  title: string;               // e.g., "Aucun candidat disponible"
  description: string;         // e.g., "Les donnees ne sont pas encore chargees."
  action?: {
    label: string;             // e.g., "Recharger"
    onPress: () => void;
  };
}
```

**Accessibility**: `accessibilityRole="alert"`, action button has `minHeight: 44`.

---

### LoadingState

Calm loading indicator with optional message.

```typescript
interface LoadingStateProps {
  message?: string;            // e.g., "Chargement des candidats..."
}
```

---

### ErrorState

Error display with recovery action.

```typescript
interface ErrorStateProps {
  title: string;               // e.g., "Une erreur est survenue"
  description: string;         // e.g., "Impossible de charger les donnees."
  action?: {
    label: string;             // e.g., "Reessayer"
    onPress: () => void;
  };
}
```

---

### FeedbackAction

"Signal unclear/missing info" button.

```typescript
interface FeedbackActionProps {
  screen: "candidate" | "assistant" | "comparison" | "survey";
  entityId?: string;           // Candidate ID, theme ID, etc.
}
```

**Behavior**: Opens a small form (bottom sheet or inline) with feedback type selector and optional text input. Calls `submitFeedback()` on submit.

---

### SourceReference

Clickable source link (refactored from existing).

```typescript
interface SourceReferenceProps {
  source: SourceReference;
  compact?: boolean;           // Inline vs. expanded display
}
```

---

## Shell Components

### ContextBar

Persistent top bar showing election context.

```typescript
interface ContextBarProps {
  // No props — reads from useElectionStore
}
```

**Displays**: `{election.city} - {election.type} {election.year}` | `Mis a jour le {election.lastUpdated}`

**Behavior**: Always visible above tab content. Fixed position. Does not scroll.

---

## Home Components

### HeroBlock

```typescript
interface HeroBlockProps {
  election: Election;
}
```

**Displays**: City name large, election type and year, 1-2 sentence app description.

---

### PrimaryShortcuts

```typescript
interface PrimaryShortcutsProps {
  surveyStatus: SurveyStatus;
  onStartSurvey: () => void;
  onViewCandidates: () => void;
  onAskQuestion: () => void;
}
```

**Displays**: 3 large tappable cards. Survey card label changes based on `surveyStatus`:
- `"not_started"`: "Commencer le sondage"
- `"questionnaire"`: "Reprendre le sondage"
- `"completed"` or `"results_ready"`: "Refaire le sondage"

---

### VotingInfoCard

```typescript
interface VotingInfoCardProps {
  logistics: ElectionLogistics;
}
```

**Displays**: Key dates, eligibility checklist, voting methods. Expandable details on tap.

---

### TrustCard

```typescript
interface TrustCardProps {
  // No props — static content from i18n
}
```

**Displays**: Neutrality statement, source policy summary, badge legend (Source / Non documente / Incertain).

---

### ResumeCard

```typescript
interface ResumeCardProps {
  surveyStatus: SurveyStatus;
  hasConversation: boolean;
  onResumeSurvey: () => void;
  onResumeChat: () => void;
}
```

**Behavior**: Renders only if `surveyStatus` is "civic_context" or "questionnaire" (incomplete survey) OR `hasConversation` is true. Shows relevant resume action(s).

---

### ThemeFeed

```typescript
interface ThemeFeedProps {
  themes: Theme[];
  onThemePress: (themeId: string) => void;
}
```

**Displays**: Horizontal scrollable list of theme chips/cards. Tap navigates to Candidates tab with theme filter applied.

---

## Assistant Components

### ModeSelector

```typescript
interface ModeSelectorProps {
  activeMode: AssistantMode;
  onModeChange: (mode: AssistantMode) => void;
}
```

**Displays**: 3 segmented buttons: Comprendre | Parler avec un candidat | Debattre. Active mode highlighted.

**Accessibility**: `accessibilityRole="tablist"`, each button is `accessibilityRole="tab"` with `accessibilityState={{ selected }}`.

---

### ChatArea

```typescript
interface ChatAreaProps {
  messages: ChatMessage[];
  isStreaming: boolean;
  onSend: (text: string) => void;
}
```

**Displays**: Scrollable message list + text input at bottom. Auto-scrolls on new messages. Shows typing indicator during streaming.

---

### ContextPrompts

```typescript
interface ContextPromptsProps {
  context: AssistantContext | null;
  mode: AssistantMode;
  onPromptSelect: (text: string) => void;
}
```

**Displays**: Suggested starter prompts based on context. Shown when conversation is empty. Tapping a prompt sends it as a message.

---

### CandidateSelector

```typescript
interface CandidateSelectorProps {
  candidates: Candidate[];
  selectedId: string | null;
  onSelect: (candidateId: string) => void;
}
```

**Displays**: Horizontal list of candidate photos/names. Shown only in "parler" mode. Selecting a candidate updates the assistant store.

---

## Candidate Components

### CandidateGallery

```typescript
interface CandidateGalleryProps {
  candidates: Candidate[];
  onCandidatePress: (candidateId: string) => void;
  activeThemeFilter?: string;
}
```

**Displays**: 2-column FlatList grid of equal-weight candidate cards. Order is shuffled deterministically (daily seed). If `activeThemeFilter` is set, each card shows a brief position snippet for that theme.

---

### CandidateProfileCard

Used on the candidate detail screen `candidate/[id].tsx`.

```typescript
interface CandidateProfileCardProps {
  candidate: Candidate;
  positions: Position[];
  themes: Theme[];
  onCompare: () => void;
  onDebate: () => void;
  onAskAbout: (context: AssistantContext) => void;
}
```

**Sections**:
1. Photo + name + party header
2. "En bref" summary (bio)
3. Positions by theme (collapsible sections)
4. Action buttons: Comparer, Debattre
5. FeedbackAction at bottom

---

### ComparisonView

```typescript
interface ComparisonViewProps {
  candidates: Candidate[];
  selectedCandidateIds: string[];
  positions: Position[];
  themes: Theme[];
  activeThemeId: string;
  onThemeChange: (themeId: string) => void;
  onCandidateToggle: (candidateId: string) => void;
}
```

**Displays**: Equal-width columns per selected candidate. Each column shows the candidate's position on `activeThemeId` with source badges. Disabled state when < 2 candidates selected or no positions available.

---

## Survey Components

### CivicPrimer

```typescript
interface CivicPrimerProps {
  facts: CivicFact[];
  onContinue: () => void;
}
```

---

### ProgressBar

```typescript
interface ProgressBarProps {
  current: number;             // 0-indexed current question
  total: number;               // Total questions
}
```

**Accessibility**: `accessibilityRole="progressbar"`, `accessibilityValue={{ min: 0, max: total, now: current + 1 }}`.

---

### AlignmentRanking

```typescript
interface AlignmentRankingProps {
  ranking: CandidateMatch[];
  candidates: Candidate[];
  onCandidatePress: (candidateId: string) => void;
}
```

**Displays**: Ordered list of candidates with alignment percentage. Equal visual weight per card (no size difference based on score). Tapping opens candidate profile.

---

### TieExplanation

```typescript
interface TieExplanationProps {
  tiedCandidates: CandidateMatch[];
  candidates: Candidate[];
}
```

**Displays**: When 2+ candidates share the same alignment score, shows a clear explanation that the tie exists and why differentiation is limited.
