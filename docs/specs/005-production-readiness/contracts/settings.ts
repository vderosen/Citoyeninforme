/**
 * Settings Screen Contract
 *
 * Defines the structure and behavior of the settings screen.
 * FR-027, FR-028.
 */

// ---------------------------------------------------------------------------
// Navigation contract
// ---------------------------------------------------------------------------

/**
 * Access pattern:
 * - Gear icon (Ionicons "settings-outline" / "settings") in the Home tab header
 * - Only visible on the Home tab (index screen), not on Assistant or Candidates tabs
 * - Tapping the gear icon navigates to /settings (stack screen)
 * - Back navigation returns to the previous screen
 *
 * Implementation:
 * - Add headerLeft or headerRight to the Home tab's screen options in (tabs)/_layout.tsx
 * - Register settings.tsx as a Stack.Screen in _layout.tsx
 */

// ---------------------------------------------------------------------------
// Screen sections
// ---------------------------------------------------------------------------

export interface SettingsSection {
  id: string;
  title: string;
  items: SettingsItem[];
}

export type SettingsItem =
  | { type: "link"; label: string; onPress: () => void }
  | { type: "toggle"; label: string; value: boolean; onToggle: (value: boolean) => void }
  | { type: "button"; label: string; variant: "default" | "destructive"; onPress: () => void }
  | { type: "info"; label: string; value: string };

/**
 * Section layout:
 *
 * 1. Privacy
 *    - "Privacy Policy" → link → opens privacy policy URL in browser
 *    - "Consent status" → info → shows accepted version and date
 *
 * 2. Data
 *    - "Export my data" → button (default) → generates JSON export, opens share sheet
 *    - "Delete all my data" → button (destructive) → confirmation dialog → full reset
 *
 * 3. Crash Reporting
 *    - "Send crash reports" → toggle → updates crashReportingOptIn in app store
 *    - Description text: "Help improve Lucide by sending anonymous crash reports.
 *      No personal data is included."
 *
 * 4. About
 *    - "Version" → info → shows app version from expo-constants
 *    - "Build" → info → shows build number from expo-constants
 *    - "Credits" → info or link → shows attribution / "Made for civic engagement"
 */

// ---------------------------------------------------------------------------
// Translations required (src/i18n/locales/fr/settings.json)
// ---------------------------------------------------------------------------

/**
 * Required translation keys:
 * {
 *   "title": "Paramètres",
 *   "privacy": {
 *     "title": "Confidentialité",
 *     "policy": "Politique de confidentialité",
 *     "consentStatus": "Consentement accepté",
 *     "consentDate": "Accepté le {{date}}",
 *     "policyVersion": "Version {{version}}"
 *   },
 *   "data": {
 *     "title": "Données",
 *     "export": "Exporter mes données",
 *     "exportDescription": "Télécharger toutes vos données au format JSON",
 *     "delete": "Supprimer toutes mes données",
 *     "deleteDescription": "Efface définitivement toutes vos données de l'appareil",
 *     "deleteConfirmTitle": "Supprimer toutes les données ?",
 *     "deleteConfirmMessage": "Cette action est irréversible. Toutes vos réponses au questionnaire, conversations et préférences seront supprimées.",
 *     "deleteConfirmButton": "Supprimer",
 *     "deleteCancel": "Annuler",
 *     "exportSuccess": "Export généré avec succès",
 *     "exportError": "Erreur lors de l'export"
 *   },
 *   "crashReporting": {
 *     "title": "Rapports de crash",
 *     "toggle": "Envoyer les rapports de crash",
 *     "description": "Aidez à améliorer Lucide en envoyant des rapports de crash anonymes. Aucune donnée personnelle n'est incluse."
 *   },
 *   "about": {
 *     "title": "À propos",
 *     "version": "Version",
 *     "build": "Build",
 *     "credits": "Conçu pour l'engagement civique"
 *   }
 * }
 */
