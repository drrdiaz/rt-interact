/**
 * Reporting repository — storage interface and mock local persistence.
 *
 * The storage layer is designed to be replaceable with a governed backend.
 * The current implementation persists to an in-memory array (prototype only).
 *
 * Constraints:
 * - No real backend, no external data transmission
 * - Stores only the structured ToxicityReport fields
 * - Does NOT store IP address, device data or browser fingerprint
 * - Storage logic is kept entirely separate from UI
 */

import type { ToxicityReport } from './reportModel'

// ── Repository interface (replaceable) ───────────────────────────────────────

export interface ReportRepository {
  /** Persist a validated report. Resolves on success, rejects on failure. */
  save(report: ToxicityReport): Promise<{ reportId: string }>
  /** Retrieve all stored reports (prototype use only). */
  getAll(): Promise<ToxicityReport[]>
  /** Count of stored reports */
  count(): Promise<number>
}

// ── Deep-copy helper ─────────────────────────────────────────────────────────

function cloneReport(report: ToxicityReport): ToxicityReport {
  return {
    reportId: report.reportId,
    submissionMonth: report.submissionMonth,
    therapyIds: [...report.therapyIds],
    rtSiteId: report.rtSiteId,
    timingId: report.timingId,
    fractionationId: report.fractionationId,
    toxicityDomainIds: [...report.toxicityDomainIds],
    approximateOnset: report.approximateOnset,
    severity: report.severity,
    treatmentInterrupted: report.treatmentInterrupted,
    hospitalAdmission: report.hospitalAdmission,
  }
}

// ── Mock in-memory factory ────────────────────────────────────────────────────

function createInMemoryRepository(): ReportRepository & { _reset(): void } {
  const store: ToxicityReport[] = []

  return {
    async save(report: ToxicityReport) {
      await Promise.resolve()
      store.push(cloneReport(report))
      return { reportId: report.reportId }
    },

    async getAll() {
      await Promise.resolve()
      return store.map(cloneReport)
    },

    async count() {
      await Promise.resolve()
      return store.length
    },

    _reset() {
      store.length = 0
    },
  }
}

// ── Singleton export ──────────────────────────────────────────────────────────

/**
 * Module-level singleton.
 * Swap this binding for a governed backend implementation when deploying.
 */
export const reportRepository: ReportRepository & { _reset?: () => void } =
  createInMemoryRepository()
