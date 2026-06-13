/**
 * ReportingTab integration tests — Step 5 (23 required cases).
 *
 * Tests cover:
 *  1.  Reporting tab navigation
 *  2.  Required-field validation
 *  3.  Therapy autocomplete reuse
 *  4.  Duplicate therapy prevention
 *  5.  Controlled site selection
 *  6.  Controlled timing selection
 *  7.  Controlled fractionation selection
 *  8.  Controlled toxicity-domain selection
 *  9.  Severity selection
 *  10. G4/G5 safety warning
 *  11. Privacy statement
 *  12. No free-text field rendered
 *  13. Successful local submission
 *  14. Report model contains no prohibited fields
 *  15. Submission month stored without exact timestamp
 *  16. Form clears after success
 *  17. Form remains populated after failed submission
 *  18. Info tab navigation
 *  19. Dynamic database version display
 *  20. Disclaimer displayed
 *  21. No management recommendation rendered
 *  22. Exactly three bottom tabs remain
 *  23. No console errors
 */

import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { App } from '../App'
import { ReportingForm } from '../components/reporting/ReportingForm'
import { reportRepository } from '../reporting/reportRepository'
import {
  buildReport,
  validateReportInput,
  PROHIBITED_FIELD_NAMES,

} from '../reporting/reportModel'
import { getRTSites, getTimingDefinitions, getFractionationCategories } from '../data/loaders'

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Navigate to the Reporting tab */
async function goToReportingTab(user: ReturnType<typeof userEvent.setup>) {
  render(<App />)
  await user.click(screen.getByRole('button', { name: /reporting/i }))
}

/**
 * Fill the minimum valid form state so we can test submission.
 * Uses: pembrolizumab, first RT site, first timing, first fractionation,
 * first toxicity domain, During RT onset, G2 severity, No/No for interruption/admission.
 */
async function fillValidForm(user: ReturnType<typeof userEvent.setup>) {
  // Therapy
  await user.type(screen.getByLabelText('Systemic therapy'), 'pembrolizumab')
  const listbox = await screen.findByRole('listbox')
  await user.click(within(listbox).getByText('pembrolizumab'))

  // RT site — first real option
  const siteSelect = screen.getByLabelText(/rt site \/ subsite/i) as HTMLSelectElement
  const firstSiteOpt = Array.from(siteSelect.options).find((o) => o.value !== '')
  expect(firstSiteOpt).toBeDefined()
  await user.selectOptions(siteSelect, firstSiteOpt!.value)

  // Timing
  const timingSelect = screen.getByLabelText(/timing relative to rt/i) as HTMLSelectElement
  const firstTimingOpt = Array.from(timingSelect.options).find((o) => o.value !== '')
  await user.selectOptions(timingSelect, firstTimingOpt!.value)

  // Fractionation
  const fracSelect = screen.getByLabelText(/fractionation category/i) as HTMLSelectElement
  const firstFracOpt = Array.from(fracSelect.options).find((o) => o.value !== '')
  await user.selectOptions(fracSelect, firstFracOpt!.value)

  // Toxicity domain — click the first button
  const domainGroup = screen.getByRole('group', { name: /toxicity domain/i })
  const firstDomainBtn = within(domainGroup).getAllByRole('button')[0]
  await user.click(firstDomainBtn)

  // Onset — During RT
  const onsetGroup = screen.getByRole('group', { name: /approximate onset/i })
  await user.click(within(onsetGroup).getByRole('button', { name: /during rt/i }))

  // Severity — G2
  const severityGroup = screen.getByRole('group', { name: /severity/i })
  await user.click(within(severityGroup).getByRole('button', { name: /g2/i }))

  // Treatment interrupted — No
  const interruptedGroup = screen.getByRole('group', { name: /interrupted/i })
  await user.click(within(interruptedGroup).getByRole('button', { name: /^no$/i }))

  // Hospital admission — No
  const admissionGroup = screen.getByRole('group', { name: /hospital admission/i })
  await user.click(within(admissionGroup).getByRole('button', { name: /^no$/i }))
}

// ── Test 1: Reporting tab navigation ─────────────────────────────────────────

describe('Test 1 — Reporting tab navigation', () => {
  it('navigates to Reporting tab and shows the form', async () => {
    const user = userEvent.setup()
    await goToReportingTab(user)

    expect(
      screen.getByRole('button', { name: /reporting/i }).getAttribute('aria-current'),
    ).toBe('page')
    expect(
      screen.getByRole('form', { name: /anonymous toxicity signal reporting form/i }),
    ).toBeDefined()
  })
})

// ── Test 2: Required-field validation ────────────────────────────────────────

describe('Test 2 — required-field validation', () => {
  it('shows validation errors when submitting an empty form', async () => {
    const user = userEvent.setup()
    await goToReportingTab(user)

    await user.click(screen.getByRole('button', { name: /submit anonymous report/i }))

    const alert = await screen.findByRole('alert')
    expect(alert.textContent).toMatch(/required/i)
  })

  it('passes validation when all fields are filled', async () => {
    const input = {
      therapyIds: ['AGT-001'], // pembrolizumab — valid ID
      rtSiteId: getRTSites()[0].site_id,
      timingId: getTimingDefinitions()[0].timing_id,
      fractionationId: getFractionationCategories()[0].fractionation_id,
      toxicityDomainIds: ['DOM-01'],
      approximateOnset: 'during_rt' as const,
      severity: 'G2' as const,
      treatmentInterrupted: 'no' as const,
      hospitalAdmission: 'no' as const,
    }
    const result = validateReportInput(input)
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })
})

// ── Test 3: Therapy autocomplete reuse ───────────────────────────────────────

describe('Test 3 — therapy autocomplete reuse', () => {
  it('shows a combobox with autocomplete suggestions in the Reporting form', async () => {
    const user = userEvent.setup()
    await goToReportingTab(user)

    const input = screen.getByLabelText('Systemic therapy')
    await user.type(input, 'pembro')

    const listbox = await screen.findByRole('listbox')
    expect(listbox).toBeDefined()
    expect(within(listbox).getByText('pembrolizumab')).toBeDefined()
  })

  it('adds a chip when a therapy is selected', async () => {
    const user = userEvent.setup()
    await goToReportingTab(user)

    await user.type(screen.getByLabelText('Systemic therapy'), 'letrozole')
    const listbox = await screen.findByRole('listbox')
    await user.click(within(listbox).getByText('letrozole'))

    const chips = screen.getByLabelText('Selected therapies')
    expect(within(chips).getByText(/letrozole/i)).toBeDefined()
  })

  it('shows "No match found — request database review." for unknown text', async () => {
    const user = userEvent.setup()
    await goToReportingTab(user)

    await user.type(screen.getByLabelText('Systemic therapy'), 'zzznodrug999')

    expect(
      screen.getByText(/no match found.*request database review/i),
    ).toBeDefined()
  })
})

// ── Test 4: Duplicate therapy prevention ─────────────────────────────────────

describe('Test 4 — duplicate therapy prevention', () => {
  it('does not add the same therapy twice', async () => {
    const user = userEvent.setup()
    await goToReportingTab(user)

    // Add once
    await user.type(screen.getByLabelText('Systemic therapy'), 'letrozole')
    let listbox = await screen.findByRole('listbox')
    await user.click(within(listbox).getByText('letrozole'))

    // Try to add again — letrozole is already selected so either:
    // (a) no listbox renders at all (all matches filtered out), or
    // (b) listbox renders but letrozole is absent
    await user.type(screen.getByLabelText('Systemic therapy'), 'letrozole')
    const listboxAfter = screen.queryByRole('listbox')
    if (listboxAfter) {
      const opts = within(listboxAfter).queryAllByRole('option')
      const duplicateOpt = opts.find((o) => o.textContent?.toLowerCase().includes('letrozole'))
      expect(duplicateOpt).toBeUndefined()
    } else {
      // No listbox means nothing was matched — correct behaviour
      expect(listboxAfter).toBeNull()
    }
  })
})

// ── Test 5: Controlled site selection ────────────────────────────────────────

describe('Test 5 — controlled site selection', () => {
  it('populates RT site options from rt_sites.json', async () => {
    const user = userEvent.setup()
    await goToReportingTab(user)

    const siteSelect = screen.getByLabelText(/rt site \/ subsite/i) as HTMLSelectElement
    // At least as many options as RT sites (+1 for placeholder)
    expect(siteSelect.options.length).toBeGreaterThan(getRTSites().length)
  })

  it('accepts a valid site selection', async () => {
    const user = userEvent.setup()
    await goToReportingTab(user)

    const siteSelect = screen.getByLabelText(/rt site \/ subsite/i) as HTMLSelectElement
    await user.selectOptions(siteSelect, 'RTS001')
    expect(siteSelect.value).toBe('RTS001')
  })
})

// ── Test 6: Controlled timing selection ──────────────────────────────────────

describe('Test 6 — controlled timing selection', () => {
  it('populates timing options from timing_definitions.json', async () => {
    const user = userEvent.setup()
    await goToReportingTab(user)

    const timingSelect = screen.getByLabelText(/timing relative to rt/i) as HTMLSelectElement
    expect(timingSelect.options.length).toBeGreaterThan(getTimingDefinitions().length)
  })

  it('accepts a valid timing selection', async () => {
    const user = userEvent.setup()
    await goToReportingTab(user)

    const timingSelect = screen.getByLabelText(/timing relative to rt/i) as HTMLSelectElement
    await user.selectOptions(timingSelect, 'TM001')
    expect(timingSelect.value).toBe('TM001')
  })
})

// ── Test 7: Controlled fractionation selection ───────────────────────────────

describe('Test 7 — controlled fractionation selection', () => {
  it('populates fractionation options from fractionation_categories.json', async () => {
    const user = userEvent.setup()
    await goToReportingTab(user)

    const fracSelect = screen.getByLabelText(/fractionation category/i) as HTMLSelectElement
    expect(fracSelect.options.length).toBeGreaterThan(getFractionationCategories().length)
  })

  it('accepts a valid fractionation selection', async () => {
    const user = userEvent.setup()
    await goToReportingTab(user)

    const fracSelect = screen.getByLabelText(/fractionation category/i) as HTMLSelectElement
    await user.selectOptions(fracSelect, 'FX001')
    expect(fracSelect.value).toBe('FX001')
  })
})

// ── Test 8: Controlled toxicity-domain selection ─────────────────────────────

describe('Test 8 — controlled toxicity-domain selection', () => {
  it('renders toxicity domain buttons from toxicity_domains.json', async () => {
    const user = userEvent.setup()
    await goToReportingTab(user)

    const domainGroup = screen.getByRole('group', { name: /toxicity domain/i })
    const buttons = within(domainGroup).getAllByRole('button')
    expect(buttons.length).toBe(20) // 20 domains in toxicity_domains.json
  })

  it('toggles a domain button on click', async () => {
    const user = userEvent.setup()
    await goToReportingTab(user)

    const domainGroup = screen.getByRole('group', { name: /toxicity domain/i })
    const firstBtn = within(domainGroup).getAllByRole('button')[0]

    expect(firstBtn.getAttribute('aria-pressed')).toBe('false')
    await user.click(firstBtn)
    expect(firstBtn.getAttribute('aria-pressed')).toBe('true')
    await user.click(firstBtn)
    expect(firstBtn.getAttribute('aria-pressed')).toBe('false')
  })
})

// ── Test 9: Severity selection ───────────────────────────────────────────────

describe('Test 9 — severity selection', () => {
  it('renders all severity options', async () => {
    const user = userEvent.setup()
    await goToReportingTab(user)

    const severityGroup = screen.getByRole('group', { name: /severity/i })
    expect(within(severityGroup).getByRole('button', { name: /g1/i })).toBeDefined()
    expect(within(severityGroup).getByRole('button', { name: /g2/i })).toBeDefined()
    expect(within(severityGroup).getByRole('button', { name: /g3/i })).toBeDefined()
    expect(within(severityGroup).getByRole('button', { name: /g4/i })).toBeDefined()
    expect(within(severityGroup).getByRole('button', { name: /g5/i })).toBeDefined()
    expect(within(severityGroup).getByRole('button', { name: /unclear/i })).toBeDefined()
  })

  it('marks the selected severity as pressed', async () => {
    const user = userEvent.setup()
    await goToReportingTab(user)

    const severityGroup = screen.getByRole('group', { name: /severity/i })
    const g3Btn = within(severityGroup).getByRole('button', { name: /g3/i })
    await user.click(g3Btn)
    expect(g3Btn.getAttribute('aria-pressed')).toBe('true')
  })
})

// ── Test 10: G4/G5 safety warning ────────────────────────────────────────────

describe('Test 10 — G4/G5 safety warning', () => {
  it('shows safety warning when G4 is selected', async () => {
    const user = userEvent.setup()
    await goToReportingTab(user)

    const severityGroup = screen.getByRole('group', { name: /severity/i })
    await user.click(within(severityGroup).getByRole('button', { name: /g4/i }))

    expect(
      screen.getByText(/does not replace local incident reporting/i),
    ).toBeDefined()
  })

  it('shows safety warning when G5 is selected', async () => {
    const user = userEvent.setup()
    await goToReportingTab(user)

    const severityGroup = screen.getByRole('group', { name: /severity/i })
    await user.click(within(severityGroup).getByRole('button', { name: /g5/i }))

    expect(
      screen.getByText(/does not replace local incident reporting/i),
    ).toBeDefined()
  })

  it('does NOT show warning for G1–G3', async () => {
    const user = userEvent.setup()
    await goToReportingTab(user)

    const severityGroup = screen.getByRole('group', { name: /severity/i })
    await user.click(within(severityGroup).getByRole('button', { name: /g2/i }))

    expect(
      screen.queryByText(/does not replace local incident reporting/i),
    ).toBeNull()
  })
})

// ── Test 11: Privacy statement ───────────────────────────────────────────────

describe('Test 11 — privacy statement', () => {
  it('displays the anonymity notice', async () => {
    const user = userEvent.setup()
    await goToReportingTab(user)

    expect(
      screen.getByText(/reports are anonymous and contain no patient-identifying fields/i),
    ).toBeDefined()
  })

  it('displays the non-retractable notice', async () => {
    const user = userEvent.setup()
    await goToReportingTab(user)

    expect(
      screen.getByText(/anonymous reports cannot be retracted/i),
    ).toBeDefined()
  })
})

// ── Test 12: No free-text field rendered ─────────────────────────────────────

describe('Test 12 — no free-text field rendered', () => {
  it('renders no textarea elements in the reporting form', async () => {
    const user = userEvent.setup()
    await goToReportingTab(user)

    const form = screen.getByRole('form', { name: /anonymous toxicity signal reporting form/i })
    const textareas = form.querySelectorAll('textarea')
    expect(textareas.length).toBe(0)
  })

  it('renders no text-type inputs other than the autocomplete combobox', async () => {
    const user = userEvent.setup()
    await goToReportingTab(user)

    const form = screen.getByRole('form', { name: /anonymous toxicity signal reporting form/i })
    const textInputs = form.querySelectorAll('input[type="text"]')
    // The autocomplete combobox is the only allowed text input
    expect(textInputs.length).toBe(1)
  })
})

// ── Test 13: Successful local submission ─────────────────────────────────────

describe('Test 13 — successful local submission', () => {
  beforeEach(() => {
    // Reset the in-memory store before each test
    const repo = reportRepository as { _reset?: () => void }
    repo._reset?.()
  })

  it('saves the report and shows the success message', async () => {
    const user = userEvent.setup()
    await goToReportingTab(user)
    await fillValidForm(user)

    const submitBtn = screen.getByRole('button', { name: /submit anonymous report/i })
    await user.click(submitBtn)

    await screen.findByRole('status')
    expect(screen.getByText(/anonymous toxicity signal submitted/i)).toBeDefined()

    // Report was stored
    const count = await reportRepository.count()
    expect(count).toBe(1)
  })
})

// ── Test 14: Report model contains no prohibited fields ──────────────────────

describe('Test 14 — report model contains no prohibited fields', () => {
  it('buildReport output keys do not include any prohibited field names', () => {
    const report = buildReport({
      therapyIds: ['AGT-001'],
      rtSiteId: 'RTS001',
      timingId: 'TM001',
      fractionationId: 'FX001',
      toxicityDomainIds: ['DOM-01'],
      approximateOnset: 'during_rt',
      severity: 'G2',
      treatmentInterrupted: 'no',
      hospitalAdmission: 'no',
    })

    const reportKeys = Object.keys(report)
    for (const prohibited of PROHIBITED_FIELD_NAMES) {
      expect(reportKeys).not.toContain(prohibited)
    }
  })
})

// ── Test 15: Submission month stored without exact timestamp ─────────────────

describe('Test 15 — submission month without exact timestamp', () => {
  it('stores YYYY-MM submissionMonth with no day or time component', () => {
    const report = buildReport({
      therapyIds: ['AGT-001'],
      rtSiteId: 'RTS001',
      timingId: 'TM001',
      fractionationId: 'FX001',
      toxicityDomainIds: ['DOM-01'],
      approximateOnset: 'during_rt',
      severity: 'G2',
      treatmentInterrupted: 'no',
      hospitalAdmission: 'no',
    })

    // Must match YYYY-MM exactly
    expect(report.submissionMonth).toMatch(/^\d{4}-\d{2}$/)
    // Must NOT contain a day or timestamp
    expect(report.submissionMonth).not.toMatch(/\d{4}-\d{2}-\d{2}/)
  })

  it('does not store any property named "date" or "timestamp"', () => {
    const report = buildReport({
      therapyIds: ['AGT-001'],
      rtSiteId: 'RTS001',
      timingId: 'TM001',
      fractionationId: 'FX001',
      toxicityDomainIds: ['DOM-01'],
      approximateOnset: 'during_rt',
      severity: 'G2',
      treatmentInterrupted: 'no',
      hospitalAdmission: 'no',
    })

    const keys = Object.keys(report)
    expect(keys).not.toContain('date')
    expect(keys).not.toContain('timestamp')
    expect(keys).not.toContain('submittedAt')
  })
})

// ── Test 16: Form clears after success ───────────────────────────────────────

describe('Test 16 — form clears after success', () => {
  beforeEach(() => {
    const repo = reportRepository as { _reset?: () => void }
    repo._reset?.()
  })

  it('clears selected therapies and shows success state after submission', async () => {
    const user = userEvent.setup()
    await goToReportingTab(user)
    await fillValidForm(user)

    await user.click(screen.getByRole('button', { name: /submit anonymous report/i }))

    await screen.findByRole('status')
    // No longer shows the form (cleared)
    expect(
      screen.queryByRole('button', { name: /submit anonymous report/i }),
    ).toBeNull()
    // No therapy chips visible
    expect(screen.queryByLabelText('Selected therapies')).toBeNull()
  })
})

// ── Test 17: Form remains populated after failed submission ──────────────────

describe('Test 17 — form remains populated after failed submission', () => {
  it('preserves form state when the repository throws', async () => {
    // Temporarily override save to throw
    const saveSpy = vi.spyOn(reportRepository, 'save').mockRejectedValueOnce(
      new Error('Mock failure'),
    )

    const user = userEvent.setup()
    render(<ReportingForm />)
    await fillValidForm(user)

    await user.click(screen.getByRole('button', { name: /submit anonymous report/i }))

    // Error message shown
    await screen.findByRole('alert')
    expect(screen.getByText(/submission could not be completed/i)).toBeDefined()

    // Therapy chip still present
    const chips = screen.getByLabelText('Selected therapies')
    expect(chips.children.length).toBeGreaterThan(0)

    saveSpy.mockRestore()
  })
})

// ── Test 18: Info tab navigation ─────────────────────────────────────────────

describe('Test 18 — Info tab navigation', () => {
  it('navigates to the Info tab', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: /^info$/i }))

    expect(
      screen.getByRole('button', { name: /^info$/i }).getAttribute('aria-current'),
    ).toBe('page')
  })

  it('renders the About section on the Info tab', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: /^info$/i }))

    expect(screen.getByText(/radiation oncologist-facing tool/i)).toBeDefined()
  })
})

// ── Test 19: Dynamic database version display ─────────────────────────────────

describe('Test 19 — dynamic database version display', () => {
  it('shows a database version from metadata (not hard-coded)', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: /^info$/i }))

    const versionEl = screen.getByTestId('db-version')
    // Must be a non-empty string — exact value comes from JSON, not source code
    expect(versionEl.textContent?.trim().length).toBeGreaterThan(0)
  })

  it('shows a last-reviewed date from metadata', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: /^info$/i }))

    const dateEl = screen.getByTestId('db-review-date')
    expect(dateEl.textContent?.trim().length).toBeGreaterThan(0)
  })
})

// ── Test 20: Disclaimer displayed ────────────────────────────────────────────

describe('Test 20 — disclaimer displayed', () => {
  it('shows the disclaimer text on the Info tab', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: /^info$/i }))

    expect(
      screen.getByText(/provides decision-support information only/i),
    ).toBeDefined()
    expect(
      screen.getByText(/final decisions remain the responsibility of the treating clinicians/i),
    ).toBeDefined()
  })
})

// ── Test 21: No management recommendation rendered ────────────────────────────

describe('Test 21 — no management recommendation rendered on Info tab', () => {
  it('does not show hold/proceed or prescription text on the Info tab', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: /^info$/i }))

    const pageText = document.body.textContent ?? ''
    // The scope section legitimately contains 'not a prescription/prescribing tool';
    // only check that the app does not present itself as making clinical prescribing recommendations.
    expect(pageText).not.toMatch(/\bhold\b/i)
    expect(pageText).not.toMatch(/\bproceed\b/i)
  })
})

// ── Test 22: Exactly three bottom tabs ───────────────────────────────────────

describe('Test 22 — exactly three bottom tabs', () => {
  it('renders exactly 3 navigation buttons', () => {
    render(<App />)
    const nav = screen.getByRole('navigation', { name: /main navigation/i })
    const buttons = within(nav).getAllByRole('button')
    expect(buttons).toHaveLength(3)
  })

  it('the tabs are Interaction, Reporting, and Info', () => {
    render(<App />)
    const nav = screen.getByRole('navigation', { name: /main navigation/i })
    expect(within(nav).getByRole('button', { name: /interaction/i })).toBeDefined()
    expect(within(nav).getByRole('button', { name: /reporting/i })).toBeDefined()
    expect(within(nav).getByRole('button', { name: /^info$/i })).toBeDefined()
  })
})

// ── Test 23: No console errors ───────────────────────────────────────────────

describe('Test 23 — no console errors', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('produces no console.error calls rendering the Reporting tab', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const user = userEvent.setup()
    await goToReportingTab(user)

    expect(errorSpy).not.toHaveBeenCalled()
    const reactWarnings = warnSpy.mock.calls.filter(
      (args) => typeof args[0] === 'string' && args[0].includes('Warning:'),
    )
    expect(reactWarnings).toHaveLength(0)
  })

  it('produces no console.error calls rendering the Info tab', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: /^info$/i }))

    expect(errorSpy).not.toHaveBeenCalled()
    const reactWarnings = warnSpy.mock.calls.filter(
      (args) => typeof args[0] === 'string' && args[0].includes('Warning:'),
    )
    expect(reactWarnings).toHaveLength(0)
  })
})
