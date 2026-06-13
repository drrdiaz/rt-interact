import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { App } from '../App'

describe('Bottom navigation', () => {
  it('renders all three tabs', () => {
    render(<App />)
    expect(screen.getByRole('button', { name: /interaction/i })).toBeDefined()
    expect(screen.getByRole('button', { name: /reporting/i })).toBeDefined()
    expect(screen.getByRole('button', { name: /info/i })).toBeDefined()
  })

  it('defaults to the Interaction tab', () => {
    render(<App />)
    const interactionBtn = screen.getByRole('button', { name: /interaction/i })
    expect(interactionBtn.getAttribute('aria-current')).toBe('page')
  })

  it('switches to Reporting tab on click', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: /reporting/i }))

    expect(
      screen.getByRole('button', { name: /reporting/i }).getAttribute('aria-current'),
    ).toBe('page')
    // Interaction tab no longer active
    expect(
      screen.getByRole('button', { name: /interaction/i }).getAttribute('aria-current'),
    ).toBeNull()
  })

  it('switches to Info tab on click', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: /^info$/i }))

    expect(
      screen.getByRole('button', { name: /^info$/i }).getAttribute('aria-current'),
    ).toBe('page')
  })

  it('shows the header title on all tabs', async () => {
    const user = userEvent.setup()
    render(<App />)

    expect(screen.getByText('RT Interact')).toBeDefined()

    await user.click(screen.getByRole('button', { name: /reporting/i }))
    expect(screen.getByText('RT Interact')).toBeDefined()

    await user.click(screen.getByRole('button', { name: /^info$/i }))
    expect(screen.getByText('RT Interact')).toBeDefined()
  })
})
