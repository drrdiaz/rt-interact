import { describe, it, expect } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TherapyAutocomplete } from '../components/interaction/TherapyAutocomplete'
import type { SelectedTherapy } from '../data/types'

function noop() {}

describe('TherapyAutocomplete', () => {
  it('renders the search input', () => {
    render(
      <TherapyAutocomplete
        selectedTherapies={[]}
        onAdd={noop}
      />,
    )
    expect(
      screen.getByRole('combobox'),
    ).toBeDefined()
  })

  it('shows suggestions when typing a known agent name', async () => {
    const user = userEvent.setup()
    render(
      <TherapyAutocomplete
        selectedTherapies={[]}
        onAdd={noop}
      />,
    )

    await user.type(screen.getByRole('combobox'), 'pembr')

    const listbox = screen.getByRole('listbox')
    expect(listbox).toBeDefined()
    // pembrolizumab should appear
    expect(within(listbox).getByText('pembrolizumab')).toBeDefined()
  })

  it('shows suggestions when typing a brand name alias', async () => {
    const user = userEvent.setup()
    render(
      <TherapyAutocomplete
        selectedTherapies={[]}
        onAdd={noop}
      />,
    )

    await user.type(screen.getByRole('combobox'), 'Keytr')

    const listbox = screen.getByRole('listbox')
    expect(listbox).toBeDefined()
    // Should show "Keytruda (pembrolizumab)"
    const items = within(listbox).getAllByRole('option')
    const keytrudaItem = items.find((el) =>
      el.textContent?.includes('Keytruda'),
    )
    expect(keytrudaItem).toBeDefined()
  })

  it('calls onAdd with canonical name when a suggestion is selected', async () => {
    const user = userEvent.setup()
    const addedTherapies: SelectedTherapy[] = []

    render(
      <TherapyAutocomplete
        selectedTherapies={[]}
        onAdd={(t) => addedTherapies.push(t)}
      />,
    )

    await user.type(screen.getByRole('combobox'), 'pembr')
    const listbox = screen.getByRole('listbox')
    const option = within(listbox).getByText('pembrolizumab')
    await user.click(option)

    expect(addedTherapies).toHaveLength(1)
    expect(addedTherapies[0]?.canonicalName).toBe('pembrolizumab')
  })

  it('clears the input after selection', async () => {
    const user = userEvent.setup()
    render(
      <TherapyAutocomplete
        selectedTherapies={[]}
        onAdd={noop}
      />,
    )

    const input = screen.getByRole('combobox')
    await user.type(input, 'pembr')
    const listbox = screen.getByRole('listbox')
    await user.click(within(listbox).getByText('pembrolizumab'))

    expect((input as HTMLInputElement).value).toBe('')
  })

  it('does not show already-selected agents in suggestions', async () => {
    const user = userEvent.setup()
    const existing: SelectedTherapy[] = [
      {
        agentId: 'AGT-123',
        canonicalName: 'pembrolizumab',
        displayName: 'pembrolizumab',
        agentType: 'agent',
      },
    ]

    render(
      <TherapyAutocomplete
        selectedTherapies={existing}
        onAdd={noop}
      />,
    )

    await user.type(screen.getByRole('combobox'), 'pembr')

    // If listbox appears, pembrolizumab should not be in it
    const listbox = screen.queryByRole('listbox')
    if (listbox) {
      const options = within(listbox).queryAllByRole('option')
      const hasPembro = options.some((el) =>
        el.textContent?.toLowerCase().includes('pembrolizumab'),
      )
      expect(hasPembro).toBe(false)
    }
  })
})
