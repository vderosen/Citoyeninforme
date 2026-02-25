/**
 * Crash Reporting Contract
 *
 * Defines the interface for opt-in crash reporting via Sentry.
 * FR-017 through FR-022.
 */

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

/**
 * Sentry DSN is loaded from environment variable SENTRY_DSN.
 * It is NOT hardcoded in source code.
 *
 * For Expo managed workflow, the Sentry plugin is configured in app.json:
 * {
 *   "plugins": [
 *     ["@sentry/react-native/expo", { "organization": "...", "project": "..." }]
 *   ]
 * }
 */

// ---------------------------------------------------------------------------
// Service contract (src/services/crash-reporting.ts)
// ---------------------------------------------------------------------------

/**
 * initCrashReporting(optIn: boolean): void
 *
 * Called once at app startup (in _layout.tsx) after stores are hydrated.
 *
 * If optIn is true:
 *   - Initialize Sentry with DSN from environment
 *   - Configure beforeSend to strip PII
 *   - Set release and dist from expo-constants
 *
 * If optIn is false:
 *   - Do NOT initialize Sentry
 *   - Errors are only logged to console (development) or silently caught (production)
 */

/**
 * updateCrashReportingConsent(optIn: boolean): void
 *
 * Called when the user toggles crash reporting in settings.
 *
 * If optIn is true and Sentry is not initialized:
 *   - Initialize Sentry (same as initCrashReporting(true))
 *
 * If optIn is false and Sentry is initialized:
 *   - Call Sentry.close() to stop reporting
 *   - Note: cached/queued events may still be sent
 */

/**
 * captureException(error: Error, context?: Record<string, string>): void
 *
 * Wrapper around Sentry.captureException.
 * No-op if Sentry is not initialized (user opted out).
 *
 * Context may include:
 *   - screen: current route name
 *   - action: what the user was doing
 *   - component: which component failed
 *
 * Context MUST NOT include:
 *   - User-generated text content
 *   - Survey answers or preferences
 *   - Chat messages
 */

// ---------------------------------------------------------------------------
// PII scrubbing (beforeSend hook)
// ---------------------------------------------------------------------------

/**
 * The beforeSend hook MUST:
 *
 * 1. Remove any breadcrumb that contains user input text
 * 2. Remove request bodies from HTTP breadcrumbs
 * 3. Strip any custom context values longer than 200 chars (likely user content)
 * 4. Ensure no survey data, chat messages, or preference data appears in the event
 *
 * Allowed data:
 * - Stack traces (function names, file paths, line numbers)
 * - Device info (platform, OS version, screen size)
 * - App info (version, build number, release channel)
 * - Error type and message (native error messages only)
 * - Timestamps
 */

// ---------------------------------------------------------------------------
// Error Boundary contract (src/components/shared/ErrorBoundary.tsx)
// ---------------------------------------------------------------------------

/**
 * ErrorBoundary component:
 *
 * - React class component implementing componentDidCatch and getDerivedStateFromError
 * - Wraps the entire <Stack> navigator in _layout.tsx
 * - On error:
 *   1. Catches the error (prevents blank screen)
 *   2. Calls captureException(error) for Sentry reporting (if opted in)
 *   3. Renders a fallback UI with:
 *      - "Something went wrong" message (localized)
 *      - "Try again" button → resets error state, re-renders children
 *      - "Return home" button → navigates to /(tabs) and resets error state
 *   4. Uses existing ErrorState component styling for consistency
 *
 * Props:
 *   - children: ReactNode
 *   - fallback?: ReactNode (optional custom fallback, defaults to built-in)
 */

/**
 * Global promise rejection handler:
 *
 * In _layout.tsx or a dedicated setup file:
 *
 * - Override the global error handler via ErrorUtils (React Native)
 * - Catch unhandled promise rejections
 * - Call captureException() for each
 * - Do NOT crash the app — log and continue
 *
 * This catches errors outside the React component tree that ErrorBoundary cannot catch.
 */
