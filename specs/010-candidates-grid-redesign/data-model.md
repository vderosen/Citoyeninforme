# Data Model: Candidates Grid Redesign

**Branch**: `010-candidates-grid-redesign` | **Date**: 2026-02-19

## Overview

This feature is purely a UI/layout redesign. No changes to the `Candidate` entity schema or data storage. The existing `Candidate` interface in `src/data/schema.ts` already includes `partyColor?: string` which is sufficient.

## Entities (unchanged)

### Candidate (existing — no modifications)

| Field               | Type     | Required | Notes                          |
|---------------------|----------|----------|--------------------------------|
| id                  | string   | Yes      | Kebab-case slug                |
| electionId          | string   | Yes      | Links to election              |
| name                | string   | Yes      | Full display name              |
| party               | string   | Yes      | Party name                     |
| bio                 | string   | Yes      | Short biography                |
| communicationStyle  | string   | Yes      | For chatbot persona            |
| programSourceUrl    | string   | Yes      | URL to program document        |
| photoUrl            | string   | No       | Remote photo URL (fallback)    |
| partyColor          | string   | No       | Hex color (currently unpopulated) |

## New Presentation Layer Data

### Party Colors Map (new utility)

A static lookup table mapping candidate IDs to party brand colors, following the same pattern as `candidateImageSource.ts`. This is a presentation-layer concern, not a data schema change.

| Candidate ID            | Party Color | Party                                        |
|-------------------------|-------------|----------------------------------------------|
| david-belliard          | #00A650     | Les Écologistes (green)                      |
| emmanuel-gregoire        | #ED1C24     | Union de la gauche (PS red)                  |
| sophia-chikirou          | #C9452E     | La France insoumise (LFI red-brown)          |
| rachida-dati             | #0066CC     | Les Républicains (blue)                      |
| pierre-yves-bournazel    | #FF8C00     | 100% Paris (orange)                          |
| sarah-knafo              | #1B2A4A     | Sarah Knafo pour Paris (dark navy)           |
| thierry-mariani          | #0D2240     | Retrouvons Paris / RN (dark blue)            |

Colors are approximate representations of official party branding. The utility provides a `getCandidatePartyColor(candidateId: string): string` function that returns the party color or falls back to the `party-fallback` tailwind color (`#9CA3AF`).
