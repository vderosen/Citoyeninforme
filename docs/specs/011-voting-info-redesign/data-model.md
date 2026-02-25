# Data Model: Voting Info Cards Redesign

**Feature**: 011-voting-info-redesign
**Date**: 2026-02-19

## Existing Entities (NO CHANGES)

The feature consumes existing data types without modification. Listed here for reference.

### LogisticsDate

```typescript
interface LogisticsDate {
  label: string;        // Event name (e.g., "Premier tour")
  date: string;         // ISO date (e.g., "2026-03-15")
  description?: string; // Optional longer description
}
```

### EligibilityStep

```typescript
interface EligibilityStep {
  order: number;  // Sequence number (1, 2, 3...)
  text: string;   // Eligibility requirement text
}
```

### VotingMethod

```typescript
interface VotingMethod {
  type: "in-person" | "proxy" | "mail";  // Voting method type
  description: string;                     // Method description
  requirements?: string;                   // Optional requirements text
}
```

### ElectionLogistics (parent)

```typescript
interface ElectionLogistics {
  electionId: string;
  keyDates: LogisticsDate[];
  eligibility: EligibilityStep[];
  votingMethods: VotingMethod[];
  locations: VotingLocation[];
  officialSources: SourceReference[];
}
```

## View-Layer Derived Types (NEW)

These types exist only in the component layer as intermediate representations for rendering. They are NOT persisted or stored.

### TimelineEntry (derived from LogisticsDate[])

```typescript
type TemporalStatus = "past" | "next" | "future";

interface TimelineEntry {
  date: string;          // ISO date (group key)
  formattedDate: string; // Display string (e.g., "6 FÉV 2026")
  labels: string[];      // Merged labels from source entries sharing this date
  status: TemporalStatus;
}
```

**Derivation rules**:
1. Group `LogisticsDate[]` by `date` field
2. Merge `label` values into `labels` array per group
3. Sort groups chronologically by `date`
4. Classify each group by comparing `date` to current device date:
   - `past`: date < today
   - `next`: first date >= today
   - `future`: date >= today, not the first

### VotingMethodDisplay (derived from VotingMethod)

```typescript
interface VotingMethodDisplay {
  type: VotingMethod["type"];
  icon: string;         // Ionicons name
  titleKey: string;     // i18n translation key
  description: string;  // From source data
  requirements?: string; // From source data (optional)
}
```

**Mapping rules**:

| Source `type` | `icon` | `titleKey` |
|---------------|--------|------------|
| `"in-person"` | `"business-outline"` | `"votingMethod.inPerson"` |
| `"proxy"` | `"people-outline"` | `"votingMethod.proxy"` |
| `"mail"` | `"mail-outline"` | `"votingMethod.mail"` |
| other | `"help-circle-outline"` | `"votingMethod.other"` |

## Data Flow

```
logistics.json (bundled)
    ↓ loaded at app start
SQLite / in-memory
    ↓ Zustand election store
ElectionLogistics (unchanged)
    ↓ passed as prop to VotingInfoCard
TimelineEntry[] ← groupAndClassify(keyDates)     [computed in component]
EligibilityStep[] ← unchanged pass-through        [direct from prop]
VotingMethodDisplay[] ← mapMethods(votingMethods) [computed in component]
    ↓
Rendered JSX
```
