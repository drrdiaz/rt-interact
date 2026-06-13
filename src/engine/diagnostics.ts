/**
 * Developer diagnostics assembler.
 *
 * Builds the EngineDiagnostics record that is embedded in every EngineOutput.
 * Contains no clinical logic — only bookkeeping for debugging and audit.
 */

import type { EngineDiagnostics, RuleConflict, EvidenceStatus } from './types'

export function buildDiagnostics(params: {
  agentCount: number
  totalRulesInspected: number
  totalRulesMatched: number
  conflicts: RuleConflict[]
  unrecognisedAgentIds: string[]
  evidenceStatuses: EvidenceStatus[]
}): EngineDiagnostics {
  return {
    evaluatedAt: new Date().toISOString(),
    ...params,
  }
}
