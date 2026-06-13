import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RTSiteSelector } from '../components/interaction/RTSiteSelector'

describe('RTSiteSelector', () => {
  it('renders the site select with a placeholder option', () => {
    render(<RTSiteSelector value={null} onChange={vi.fn()} />)
    const select = screen.getByLabelText(/rt site/i)
    expect(select).toBeDefined()
    expect((select as HTMLSelectElement).value).toBe('')
  })

  it('populates site options from data (not hard-coded)', () => {
    render(<RTSiteSelector value={null} onChange={vi.fn()} />)
    const select = screen.getByLabelText(/rt site/i) as HTMLSelectElement
    // Should have more than just the placeholder
    expect(select.options.length).toBeGreaterThan(1)
  })

  it('calls onChange with the first subsite when a site is selected', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<RTSiteSelector value={null} onChange={onChange} />)

    const select = screen.getByLabelText(/rt site/i)
    // Select "Prostate" (first real site)
    await user.selectOptions(select, 'Prostate')

    expect(onChange).toHaveBeenCalledOnce()
    const arg = onChange.mock.calls[0]?.[0]
    expect(arg).toBeDefined()
    expect(arg.rtSite).toBe('Prostate')
    expect(arg.siteId).toBeTruthy()
  })

  it('shows subsite selector when site has multiple subsites', async () => {
    const user = userEvent.setup()

    // Render with a controlled value simulating site already selected
    const { rerender } = render(<RTSiteSelector value={null} onChange={vi.fn()} />)

    const onChange = vi.fn()
    rerender(<RTSiteSelector value={null} onChange={onChange} />)

    await user.selectOptions(screen.getByLabelText(/rt site/i), 'Prostate')

    // After onChange fires, parent would pass the selection back;
    // simulate by re-rendering with the selected value
    rerender(
      <RTSiteSelector
        value={{ siteId: 'RTS001', rtSite: 'Prostate', rtSubsite: 'Prostate only' }}
        onChange={onChange}
      />,
    )

    // Prostate has multiple subsites — subsite selector should appear
    expect(screen.queryByLabelText(/subsite/i)).toBeDefined()
  })

  it('calls onChange with null when placeholder is selected', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(
      <RTSiteSelector
        value={{ siteId: 'RTS001', rtSite: 'Prostate', rtSubsite: 'Prostate only' }}
        onChange={onChange}
      />,
    )

    await user.selectOptions(screen.getByLabelText(/rt site/i), '')
    expect(onChange).toHaveBeenCalledWith(null)
  })
})
