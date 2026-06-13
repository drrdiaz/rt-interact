import React, { useMemo } from 'react'
import { getUniqueSites, getSubsitesForSite } from '@/data/loaders'
import type { RTSiteSelection } from '@/data/types'

interface RTSiteSelectorProps {
  value: RTSiteSelection | null
  onChange: (selection: RTSiteSelection | null) => void
}

export function RTSiteSelector({
  value,
  onChange,
}: RTSiteSelectorProps): React.ReactElement {
  const uniqueSites = useMemo(() => getUniqueSites(), [])
  const subsites = useMemo(
    () => (value?.rtSite ? getSubsitesForSite(value.rtSite) : []),
    [value?.rtSite],
  )

  function handleSiteChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const rtSite = e.target.value
    if (!rtSite) {
      onChange(null)
      return
    }
    const firstSubsite = getSubsitesForSite(rtSite)[0]
    if (firstSubsite) {
      onChange({
        siteId: firstSubsite.site_id,
        rtSite: firstSubsite.rt_site,
        rtSubsite: firstSubsite.rt_subsite,
      })
    }
  }

  function handleSubsiteChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const siteId = e.target.value
    const found = subsites.find((s) => s.site_id === siteId)
    if (found) {
      onChange({
        siteId: found.site_id,
        rtSite: found.rt_site,
        rtSubsite: found.rt_subsite,
      })
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Parent site */}
      <div>
        <label
          htmlFor="rt-site-select"
          className="mb-1.5 block text-sm font-semibold text-slate-700"
        >
          RT site
        </label>
        <select
          id="rt-site-select"
          value={value?.rtSite ?? ''}
          onChange={handleSiteChange}
          className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3
                     text-base text-slate-800
                     focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200
                     appearance-none"
        >
          <option value="">Select RT site…</option>
          {uniqueSites.map((site) => (
            <option key={site} value={site}>
              {site}
            </option>
          ))}
        </select>
      </div>

      {/* Subsite — shown only when a parent site is selected and >1 subsite exists */}
      {subsites.length > 1 && (
        <div>
          <label
            htmlFor="rt-subsite-select"
            className="mb-1.5 block text-sm font-semibold text-slate-700"
          >
            Subsite / field
          </label>
          <select
            id="rt-subsite-select"
            value={value?.siteId ?? ''}
            onChange={handleSubsiteChange}
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3
                       text-base text-slate-800
                       focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200
                       appearance-none"
          >
            {subsites.map((s) => (
              <option key={s.site_id} value={s.site_id}>
                {s.rt_subsite}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  )
}
