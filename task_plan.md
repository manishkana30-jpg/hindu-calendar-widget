# Task Plan: Product, UX/CRO, AEO/SEO, and Accessibility Optimization

**Target System:** Hindu Calendar & Live Panchang (`vikram-samvat-widget`)  
**Lead Architect:** Primary Architect (`gemini-3.1-pro` [High Thinking])  
**Execution Objective:** Resolve top conversion and utility bottlenecks, install comprehensive JSON-LD / AEO schemas, elevate WCAG 2.2 AA accessibility, and maximize PWA installs and daily retention.

---

## Model Assignment & Delegation Matrix

| Role | Model Assignment | Quota Impact | Delegated Responsibility |
| :--- | :--- | :--- | :--- |
| **Primary Architect** | `gemini-3.1-pro` *(High Thinking)* | Moderate (1×) | System audit, root-cause analysis, milestone decomposition, API contracts, generating `task_plan.md`. |
| **Feature Specialist** | `claude-sonnet-4.6` | Moderate | Complex React 19 UI state, interactive modal transitions, touch gestures, AST refactors. |
| **Autonomous Fixer** | `gemini-3.8-flash` *(Thinking: High)* | Low-Moderate | Self-healing test loops, terminal troubleshooting, interdependent astrometry/timezone fixes. |
| **Primary Worker** | `gemini-3-flash` *(Thinking: Low)* | Very Low | JSX scaffolding, markup corrections, standard CSS utilities, unit tests. |
| **Fast Reviewer** | `gemini-3-flash` *(Thinking: Minimal)* | Very Low | Linter checks (`npm run lint`), type verification (`tsc --noEmit`), diff sanity checks. |
| **Zero-Quota Utility** | `gpt-oss-120b` | Negligible / Free | JSON-LD schema generation, regex, OpenGraph meta tags, docstrings. |
| **Emergency Debugger**| `claude-opus-4.6` | Extreme (~8×) | Hydration race conditions, memory leaks, deep state deadlocks after 3 failed escalation passes. |

---

## Phase Breakdown & Milestone Schedule

### Phase 1: Metadata, Schemas & Viral Preview Surface (AEO/SEO)
- **Role / Model:** Zero-Quota Utility (`gpt-oss-120b`) & Primary Worker (`gemini-3-flash`)
- **Deliverables:**
  1. `WebApplication` + `SoftwareApplication` JSON-LD schema embedded in `app/layout.tsx`.
  2. `FAQPage` schema addressing high-volume search intents ("What is today's Tithi?", "What is Rahu Kaal?", "What is Choghadiya?").
  3. Dynamic OpenGraph (`og:image`, `og:title`, `og:description`, `og:type`) and Twitter Cards (`summary_large_image`) with rich metadata for WhatsApp/Telegram unfurling.
  4. Canonical URL link tags and explicit theme color declarations.

### Phase 2: UI/UX Glanceability & CRO Conversion Enhancements
- **Role / Model:** Feature Specialist (`claude-sonnet-4.6`) & Primary Worker (`gemini-3-flash`)
- **Deliverables:**
  1. **Card Glanceability Refactor (Column 2):** Swap visual hierarchy so active **Udaya Tithi** (`text-2xl font-extrabold`) is the primary focal point, and Ishta Kaal (Ghati/Pala) acts as secondary astrometric context.
  2. **Interactive Affordance Indicators:** Add visible "Tap for Monthly Almanac" pill on the Panchang card and "Tap for 24h Timetable" on the Muhurat card to eliminate discovery friction.
  3. **Floating Contextual PWA Install Banner:** Introduce a non-intrusive bottom pill ("⚡ Add Hindu Calendar to Home Screen • Works 100% Offline") with one-tap trigger.
  4. **Trust & Offline Badge:** Display "Drik Ganita • Swiss Ephemeris • 100% Offline" authority badge directly on the hero widget.

### Phase 3: Accessibility & WCAG 2.2 AA Compliance
- **Role / Model:** Autonomous Fixer (`gemini-3.8-flash`) & Primary Worker (`gemini-3-flash`)
- **Deliverables:**
  1. **Touch Target Enlargement:** Expand all header buttons, date navigation pills, and modal close triggers to minimum $48 \times 48\text{ px}$.
  2. **Screen Reader Live Region Optimization:** Isolate 1-second ticking clocks from `aria-live` containers; add `aria-haspopup="dialog"` and `aria-expanded` attributes to interactive cards.
  3. **Color Contrast Elevation:** Boost `text-neutral-400` / `text-neutral-500` / muted badges to meet $\ge 4.5:1$ contrast against `#050811` and `#090e1a` dark surfaces.

### Phase 4: Automated Verification & Fast Review Loop
- **Role / Model:** Fast Reviewer (`gemini-3-flash`) & Autonomous Fixer (`gemini-3.8-flash`)
- **Deliverables:**
  1. TypeScript compilation check (`npm run build` / `npx tsc --noEmit`).
  2. Automated test suite execution (`test/verify-dharmashastra.ts`, `test/verify-festivals.ts`, `test/test-notification-matrix.ts`).
  3. Lighthouse audit / schema validation sanity test.

### Phase 5: Escalation Protocol
- **Trigger Condition:** If any React 19 hydration mismatch, memory leak, or modal deadlock persists through 3 automated fix attempts.
- **Assigned Model:** Emergency Debugger (`claude-opus-4.6`).
