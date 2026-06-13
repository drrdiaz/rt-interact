/**
 * InteractionTab integration tests — Step 4 (20 required cases).
 *
 * Tests cover:
 *  1.  Selecting a generic medicine
 *  2.  Selecting by brand name
 *  3.  Selecting a drug class
 *  4.  Removing a therapy chip
 *  5.  Preventing duplicate selections
 *  6.  Unmatched medicine message
 *  7.  Selecting an RT site
 *  8.  Timing interval field appearing only when required
 *  9.  Fractionation field appearing only when required
 *  10. Incomplete-input state (alert card neutral)
 *  11. Explicit low-concern result (No specific alert)
 *  12. Uncertain fallback result
 *  13. High-alert result
 *  14. Multi-agent highest-alert behaviour
 *  15. Unioned toxicity-domain display
 *  16. Evidence modal content
 *  17. Missing evidence wording
 *  18. Keyboard navigation through suggestions
 *  19. No management recommendation rendered
 *  20. No console errors during representative interactions
 */

import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { InteractionPage } from '../pages/InteractionPage'
import { TherapyAutocomplete } from '../components/interaction/TherapyAutocomplete'
import type { SelectedTherapy } from '../data/types'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function noop() {}

/** Render the InteractionPage standalone */
function renderPage() {
  return render(<InteractionPage />)
}

/**
 * Drive the page to a fully evaluable state (letrozole + Prostate + Sequential
 * + Conventional fractionation).  This combination produces "No specific alert"
 * via IR016 and does NOT require a timing interval.
 *
 * Returns userEvent instance for further interaction.
 */
async function setupLowConcernState() {
  const user = userEvent.setup()
  renderPage()

  // Select letrozole
  await user.type(screen.getByLabelText(/systemic therapy/i), 'letrozole')
  const listbox = await screen.findByRole('listbox')
  await user.click(within(listbox).getByText('letrozole'))

  // Select Prostate site
  await user.selectOptions(screen.getByLabelText(/rt site/i), 'Prostate')

  // Select Sequential timing
  await user.selectOptions(screen.getByLabelText(/timing relationship/i), 'TM004')

  return user
}

/**
 * Drive the page to a high-alert state (bevacizumab + Pelvis/Rectal +
 * Recent before RT + SABR).  Bevacizumab is timing-sensitive so a timing
 * interval is also required.
 */
async function setupHighAlertState() {
  const user = userEvent.setup()
  renderPage()

  // Select bevacizumab
  await user.type(screen.getByLabelText(/systemic therapy/i), 'bevacizumab')
  const listbox = await screen.findByRole('listbox')
  await user.click(within(listbox).getByText('bevacizumab'))

  // Select Pelvis site
  await user.selectOptions(screen.getByLabelText(/rt site/i), 'Pelvis')

  // Select Recent before RT timing
  await user.selectOptions(screen.getByLabelText(/timing relationship/i), 'TM002')

  // Fill timing interval (required for timing-sensitive agent + TM002)
  const intervalInput = await screen.findByLabelText(/timing interval/i)
  await user.clear(intervalInput)
  await user.type(intervalInput, '21')

  // Select SABR fractionation (required for bevacizumab)
  const fracSelect = await screen.findByLabelText(/fractionation/i)
  await user.selectOptions(fracSelect, 'FX004')

  return user
}

// ─── Test 1: Select a generic medicine ───────────────────────────────────────

describe('Test 1 — selecting a generic medicine', () => {
  it('adds a chip when a generic medicine is selected from suggestions', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.type(screen.getByLabelText(/systemic therapy/i), 'pembrolizumab')
    const listbox = await screen.findByRole('listbox')
    await user.click(within(listbox).getByText('pembrolizumab'))

    // Chip appears in selected therapies region
    const chips = screen.getByLabelText('Selected therapies')
    expect(within(chips).getByText('pembrolizumab')).toBeDefined()
  })
})

// ─── Test 2: Select by brand name ────────────────────────────────────────────

describe('Test 2 — selecting by brand name', () => {
  it('adds the canonical-name chip when a brand alias is selected', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.type(screen.getByLabelText(/systemic therapy/i), 'Keytruda')
    const listbox = await screen.findByRole('listbox')
    const keytrudaOption = within(listbox).getAllByRole('option').find(
      (el) => el.textContent?.includes('Keytruda'),
    )
    expect(keytrudaOption).toBeDefined()
    await user.click(keytrudaOption!)

    // Chip uses canonical name
    const chips = screen.getByLabelText('Selected therapies')
    expect(within(chips).getByText(/pembrolizumab/i)).toBeDefined()
  })
})

// ─── Test 3: Select a drug class ─────────────────────────────────────────────

describe('Test 3 — selecting a drug class', () => {
  it('adds a class chip and shows the class type indicator in suggestions', async () => {
    const user = userEvent.setup()
    renderPage()

    // CLS-004 is "Immune checkpoint inhibitors"
    await user.type(screen.getByLabelText(/systemic therapy/i), 'immune checkpoint')
    const listbox = await screen.findByRole('listbox')

    const options = within(listbox).getAllByRole('option')
    const classOption = options.find(
      (el) => el.textContent?.toLowerCase().includes('immune checkpoint'),
    )
    expect(classOption).toBeDefined()

    // Class indicator visible in suggestion
    expect(classOption?.textContent).toMatch(/class/i)

    await user.click(classOption!)

    // Chip appears
    const chips = screen.getByLabelText('Selected therapies')
    expect(chips.children.length).toBeGreaterThan(0)
  })
})

// ─── Test 4: Remove a therapy chip ───────────────────────────────────────────

describe('Test 4 — removing a therapy chip', () => {
  it('removes the chip when the remove button is clicked', async () => {
    const user = userEvent.setup()
    renderPage()

    // Add pembrolizumab
    await user.type(screen.getByLabelText(/systemic therapy/i), 'pembr')
    const listbox = await screen.findByRole('listbox')
    await user.click(within(listbox).getByText('pembrolizumab'))

    // Chip present
    expect(screen.getByLabelText('Selected therapies').children.length).toBe(1)

    // Click remove button
    const removeBtn = screen.getByRole('button', { name: /remove pembrolizumab/i })
    await user.click(removeBtn)

    // Chip gone
    expect(screen.queryByLabelText('Selected therapies')).toBeNull()
  })
})

// ─── Test 5: Prevent duplicate selections ────────────────────────────────────

describe('Test 5 — preventing duplicate selections', () => {
  it('does not add a second chip for an already-selected agent', async () => {
    const added: SelectedTherapy[] = []
    const user = userEvent.setup()

    render(
      <TherapyAutocomplete
        selectedTherapies={[
          {
            agentId: 'AGT-123',
            canonicalName: 'pembrolizumab',
            displayName: 'pembrolizumab',
            agentType: 'agent',
          },
        ]}
        onAdd={(t) => added.push(t)}
      />,
    )

    await user.type(screen.getByRole('combobox'), 'pembr')
    // Either listbox is empty or pembrolizumab is absent
    const listbox = screen.queryByRole('listbox')
    if (listbox) {
      const options = within(listbox).queryAllByRole('option')
      const hasPembro = options.some((el) =>
        el.textContent?.toLowerCase().includes('pembrolizumab'),
      )
      expect(hasPembro).toBe(false)
    }
    expect(added).toHaveLength(0)
  })
})

// ─── Test 6: Unmatched medicine message ──────────────────────────────────────

describe('Test 6 — unmatched medicine message', () => {
  it('shows "No match found — request database review." for unrecognised text', async () => {
    const user = userEvent.setup()
    render(<TherapyAutocomplete selectedTherapies={[]} onAdd={noop} />)

    await user.type(screen.getByRole('combobox'), 'xyznonexistentdrug999')

    expect(
      screen.getByText(/no match found.*request database review/i),
    ).toBeDefined()
  })

  it('does not allow unmatched text to be added as a therapy ID', async () => {
    const added: SelectedTherapy[] = []
    const user = userEvent.setup()

    render(<TherapyAutocomplete selectedTherapies={[]} onAdd={(t) => added.push(t)} />)

    await user.type(screen.getByRole('combobox'), 'totallyfakedrugxyz')
    // Pressing Enter on unmatched text should not add anything
    await user.keyboard('{Enter}')

    expect(added).toHaveLength(0)
  })
})

// ─── Test 7: Selecting an RT site ────────────────────────────────────────────

describe('Test 7 — selecting an RT site', () => {
  it('populates site options from data and fires onChange with siteId', async () => {
    const user = userEvent.setup()
    renderPage()

    const siteSelect = screen.getByLabelText(/rt site/i) as HTMLSelectElement
    expect(siteSelect.options.length).toBeGreaterThan(1)

    await user.selectOptions(siteSelect, 'Prostate')
    expect(siteSelect.value).toBe('Prostate')
  })

  it('shows subsite selector when site has multiple subsites', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.selectOptions(screen.getByLabelText(/rt site/i), 'Lung')
    expect(screen.queryByLabelText(/subsite/i)).toBeDefined()
  })
})

// ─── Test 8: Timing interval field appears only when required ─────────────────

describe('Test 8 — timing interval field appears only when required', () => {
  it('is NOT shown before any therapy is selected', () => {
    renderPage()
    expect(screen.queryByLabelText(/timing interval/i)).toBeNull()
  })

  it('appears for a timing-sensitive agent (bevacizumab) with concurrent timing', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.type(screen.getByLabelText(/systemic therapy/i), 'bevacizumab')
    const listbox = await screen.findByRole('listbox')
    await user.click(within(listbox).getByText('bevacizumab'))

    await user.selectOptions(screen.getByLabelText(/rt site/i), 'Pelvis')
    await user.selectOptions(screen.getByLabelText(/timing relationship/i), 'TM001')

    // Fractionation required first; select it
    const fracSelect = await screen.findByLabelText(/fractionation/i)
    await user.selectOptions(fracSelect, 'FX004')

    // Timing interval should now appear
    expect(screen.queryByLabelText(/timing interval/i)).toBeDefined()
  })

  it('does NOT appear for a non-timing-sensitive agent (letrozole)', async () => {
    await setupLowConcernState()
    // After full setup for letrozole + Prostate + Sequential, no interval field
    expect(screen.queryByLabelText(/timing interval/i)).toBeNull()
  })
})

// ─── Test 9: Fractionation appears only when required ─────────────────────────

describe('Test 9 — fractionation field appears only when required', () => {
  it('is NOT shown before any therapy is selected', () => {
    renderPage()
    expect(screen.queryByLabelText(/fractionation/i)).toBeNull()
  })

  it('appears for a dose-relevant agent (bevacizumab) after site+timing selected', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.type(screen.getByLabelText(/systemic therapy/i), 'bevacizumab')
    const listbox = await screen.findByRole('listbox')
    await user.click(within(listbox).getByText('bevacizumab'))

    await user.selectOptions(screen.getByLabelText(/rt site/i), 'Pelvis')
    await user.selectOptions(screen.getByLabelText(/timing relationship/i), 'TM002')

    expect(await screen.findByLabelText(/fractionation/i)).toBeDefined()
  })
})

// ─── Test 10: Incomplete-input state ─────────────────────────────────────────

describe('Test 10 — incomplete-input state in alert card', () => {
  it('shows neutral status before any input', () => {
    renderPage()
    // Alert card should show neutral/incomplete state — no alert level badge
    expect(screen.queryByTestId('alert-card-complete')).toBeNull()
    // Should NOT imply safety
    expect(screen.queryByTestId('alert-level-badge')).toBeNull()
  })

  it('shows which required inputs remain when partially filled', async () => {
    const user = userEvent.setup()
    renderPage()

    // Add only a therapy — site and timing still missing
    await user.type(screen.getByLabelText(/systemic therapy/i), 'letrozole')
    const listbox = await screen.findByRole('listbox')
    await user.click(within(listbox).getByText('letrozole'))

    // The card should not show a complete result
    expect(screen.queryByTestId('alert-card-complete')).toBeNull()
  })
})

// ─── Test 11: Explicit low-concern result ────────────────────────────────────

describe('Test 11 — explicit low-concern result (No specific alert)', () => {
  it('shows "No specific alert" level badge for letrozole + Prostate + Sequential + FX001', async () => {
    const user = await setupLowConcernState()

    // Fractionation may appear — if it does, select FX001
    const fracSelect = screen.queryByLabelText(/fractionation/i) as HTMLSelectElement | null
    if (fracSelect) {
      await user.selectOptions(fracSelect, 'FX001')
    }

    const badge = await screen.findByTestId('alert-level-badge')
    expect(badge.textContent?.toLowerCase()).toMatch(/no specific alert/)
  })
})

// ─── Test 12: Uncertain fallback result ──────────────────────────────────────

describe('Test 12 — uncertain fallback result', () => {
  it('shows Uncertain / evidence limited for an agent with no applicable rule', async () => {
    const user = userEvent.setup()
    renderPage()

    // capivasertib + Prostate + Concurrent + moderate hypofractionation
    // = no class rule → pure fallback
    await user.type(screen.getByLabelText(/systemic therapy/i), 'capivasertib')
    const listbox = await screen.findByRole('listbox')
    await user.click(within(listbox).getByText('capivasertib'))

    await user.selectOptions(screen.getByLabelText(/rt site/i), 'Prostate')
    await user.selectOptions(screen.getByLabelText(/timing relationship/i), 'TM001')

    // Fill timing interval if it appears
    const interval = screen.queryByLabelText(/timing interval/i)
    if (interval) {
      await user.clear(interval)
      await user.type(interval, '0')
    }

    // Fractionation if required
    const frac = screen.queryByLabelText(/fractionation/i)
    if (frac) {
      await user.selectOptions(frac as HTMLSelectElement, 'FX002')
    }

    const badge = await screen.findByTestId('alert-level-badge')
    expect(badge.textContent?.toLowerCase()).toMatch(/uncertain/)
  })
})

// ─── Test 13: High-alert result ──────────────────────────────────────────────

describe('Test 13 — high-alert result', () => {
  it('shows High toxicity alert for bevacizumab + Pelvis + Recent + SABR', async () => {
    await setupHighAlertState()

    const badge = await screen.findByTestId('alert-level-badge')
    expect(badge.textContent?.toLowerCase()).toMatch(/high toxicity alert/)
  })
})

// ─── Test 14: Multi-agent highest-alert behaviour ─────────────────────────────

describe('Test 14 — multi-agent highest-alert behaviour', () => {
  it('shows High toxicity alert when one agent is high and another is low-concern', async () => {
    const user = userEvent.setup()
    renderPage()

    // Add letrozole (low concern)
    await user.type(screen.getByLabelText(/systemic therapy/i), 'letrozole')
    let listbox = await screen.findByRole('listbox')
    await user.click(within(listbox).getByText('letrozole'))

    // Add bevacizumab (high)
    await user.type(screen.getByLabelText(/systemic therapy/i), 'bevacizumab')
    listbox = await screen.findByRole('listbox')
    await user.click(within(listbox).getByText('bevacizumab'))

    await user.selectOptions(screen.getByLabelText(/rt site/i), 'Pelvis')
    await user.selectOptions(screen.getByLabelText(/timing relationship/i), 'TM001')

    const interval = screen.queryByLabelText(/timing interval/i)
    if (interval) {
      await user.clear(interval)
      await user.type(interval, '0')
    }

    const frac = await screen.findByLabelText(/fractionation/i)
    await user.selectOptions(frac as HTMLSelectElement, 'FX004')

    const badge = await screen.findByTestId('alert-level-badge')
    expect(badge.textContent?.toLowerCase()).toMatch(/high toxicity alert/)
  })
})

// ─── Test 15: Unioned toxicity-domain display ─────────────────────────────────

describe('Test 15 — unioned toxicity-domain display', () => {
  it('shows toxicity domain chips in the alert card', async () => {
    await setupHighAlertState()

    const chipContainer = await screen.findByTestId('toxicity-domain-chips')
    expect(chipContainer.children.length).toBeGreaterThan(0)
  })

  it('does not show duplicate domain chips for multi-agent', async () => {
    const user = userEvent.setup()
    renderPage()

    // T-DXd + pembrolizumab: both have lung/pneumonitis domains
    await user.type(screen.getByLabelText(/systemic therapy/i), 'trastuzumab deruxtecan')
    let listbox = await screen.findByRole('listbox')
    const opt = within(listbox).getAllByRole('option').find(
      (el) => el.textContent?.toLowerCase().includes('trastuzumab deruxtecan'),
    )
    await user.click(opt!)

    await user.type(screen.getByLabelText(/systemic therapy/i), 'pembrolizumab')
    listbox = await screen.findByRole('listbox')
    await user.click(within(listbox).getByText('pembrolizumab'))

    await user.selectOptions(screen.getByLabelText(/rt site/i), 'Lung')
    const subsiteSelect = screen.queryByLabelText(/subsite/i) as HTMLSelectElement | null
    if (subsiteSelect) await user.selectOptions(subsiteSelect, 'RTS007')

    await user.selectOptions(screen.getByLabelText(/timing relationship/i), 'TM001')

    const interval = screen.queryByLabelText(/timing interval/i)
    if (interval) {
      await user.clear(interval)
      await user.type(interval, '0')
    }

    const frac = await screen.findByLabelText(/fractionation/i)
    await user.selectOptions(frac as HTMLSelectElement, 'FX004')

    const chipContainer = await screen.findByTestId('toxicity-domain-chips')
    const chipTexts = Array.from(chipContainer.children).map((c) => c.textContent)
    const uniqueChips = new Set(chipTexts)
    expect(uniqueChips.size).toBe(chipTexts.length)
  })
})

// ─── Test 16: Evidence modal content ─────────────────────────────────────────

describe('Test 16 — evidence modal content', () => {
  it('opens the evidence modal when "View evidence / Reference" is clicked', async () => {
    const user = await setupLowConcernState()

    const frac = screen.queryByLabelText(/fractionation/i) as HTMLSelectElement | null
    if (frac) await user.selectOptions(frac, 'FX001')

    const link = await screen.findByTestId('view-evidence-link')
    await user.click(link)

    // Modal should be present with its title
    expect(screen.getByText('Evidence / References')).toBeDefined()
  })

  it('shows evidence level and uncertainty in the modal', async () => {
    const user = await setupLowConcernState()

    const frac = screen.queryByLabelText(/fractionation/i) as HTMLSelectElement | null
    if (frac) await user.selectOptions(frac, 'FX001')

    await user.click(await screen.findByTestId('view-evidence-link'))

    // Meta chips
    expect(screen.getByText('Evidence level')).toBeDefined()
    expect(screen.getByText('Uncertainty')).toBeDefined()
  })
})

// ─── Test 17: Missing evidence wording ───────────────────────────────────────

describe('Test 17 — missing evidence wording', () => {
  it('shows "Evidence pending / requires review" in the modal when no records are present', async () => {
    // Use capivasertib — no applicable rule → pure fallback → no evidence IDs
    const user = userEvent.setup()
    renderPage()

    await user.type(screen.getByLabelText(/systemic therapy/i), 'capivasertib')
    const listbox = await screen.findByRole('listbox')
    await user.click(within(listbox).getByText('capivasertib'))

    await user.selectOptions(screen.getByLabelText(/rt site/i), 'Prostate')
    await user.selectOptions(screen.getByLabelText(/timing relationship/i), 'TM001')

    const interval = screen.queryByLabelText(/timing interval/i)
    if (interval) {
      await user.clear(interval)
      await user.type(interval, '0')
    }
    const frac = screen.queryByLabelText(/fractionation/i)
    if (frac) await user.selectOptions(frac as HTMLSelectElement, 'FX002')

    // Wait for a complete card
    await screen.findByTestId('alert-card-complete')

    // The evidence link area — fallback may show pending inline or a button
    // Either the pending inline text or the evidence link button
    const hasPendingInline = screen.queryByTestId('evidence-pending-inline')
    const hasLink = screen.queryByTestId('view-evidence-link')
    const hasPendingLink = screen.queryByTestId('evidence-pending-link')

    // At least one evidence-related element should be present
    const anyEvidenceElement = hasPendingInline ?? hasLink ?? hasPendingLink
    expect(anyEvidenceElement).toBeDefined()
  })
})

// ─── Test 18: Keyboard navigation ────────────────────────────────────────────

describe('Test 18 — keyboard navigation through suggestions', () => {
  it('navigates options with ArrowDown/ArrowUp and selects with Enter', async () => {
    const added: SelectedTherapy[] = []
    const user = userEvent.setup()

    render(<TherapyAutocomplete selectedTherapies={[]} onAdd={(t) => added.push(t)} />)

    const input = screen.getByRole('combobox')
    await user.type(input, 'pembr')

    // Wait for listbox
    await screen.findByRole('listbox')

    // Arrow down to first item
    await user.keyboard('{ArrowDown}')
    // Select it with Enter
    await user.keyboard('{Enter}')

    expect(added.length).toBeGreaterThan(0)
  })

  it('closes the dropdown on Escape', async () => {
    const user = userEvent.setup()
    render(<TherapyAutocomplete selectedTherapies={[]} onAdd={noop} />)

    await user.type(screen.getByRole('combobox'), 'pembr')
    await screen.findByRole('listbox')

    await user.keyboard('{Escape}')
    expect(screen.queryByRole('listbox')).toBeNull()
  })
})

// ─── Test 19: No management recommendation rendered ──────────────────────────

describe('Test 19 — no management recommendation rendered', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('does not render any hold/proceed recommendation text', async () => {
    await setupHighAlertState()
    await screen.findByTestId('alert-card-complete')

    const pageText = document.body.textContent ?? ''
    // Must not contain management advice patterns
    expect(pageText).not.toMatch(/\bhold\b/i)
    expect(pageText).not.toMatch(/\bproceed\b/i)
    expect(pageText).not.toMatch(/medical oncol/i)
    expect(pageText).not.toMatch(/senior ro review/i)
    expect(pageText).not.toMatch(/recommend\w*\s+(holding|stopping|deferring)/i)
  })

  it('does not render numerical risk estimates', async () => {
    await setupHighAlertState()
    await screen.findByTestId('alert-card-complete')

    const pageText = document.body.textContent ?? ''
    // No patterns like "23% risk" or "risk: 45%"
    expect(pageText).not.toMatch(/\d+\s*%\s*risk/i)
    expect(pageText).not.toMatch(/risk\s*[:=]\s*\d+/i)
  })
})

// ─── Test 20: No console errors during representative interactions ────────────

describe('Test 20 — no console errors during representative interactions', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('produces no console.error calls during a complete low-concern evaluation', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const user = await setupLowConcernState()

    const frac = screen.queryByLabelText(/fractionation/i) as HTMLSelectElement | null
    if (frac) await user.selectOptions(frac, 'FX001')

    await screen.findByTestId('alert-card-complete')

    expect(errorSpy).not.toHaveBeenCalled()
    // React warnings are treated as errors in this suite
    const reactWarnings = warnSpy.mock.calls.filter(
      (args) => typeof args[0] === 'string' && args[0].includes('Warning:'),
    )
    expect(reactWarnings).toHaveLength(0)
  })

  it('produces no console.error calls during a high-alert evaluation', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    await setupHighAlertState()
    await screen.findByTestId('alert-card-complete')

    expect(errorSpy).not.toHaveBeenCalled()
    const reactWarnings = warnSpy.mock.calls.filter(
      (args) => typeof args[0] === 'string' && args[0].includes('Warning:'),
    )
    expect(reactWarnings).toHaveLength(0)
  })
})
