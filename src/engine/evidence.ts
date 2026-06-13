/**
 * Evidence resolver.
 *
 * Checks whether referenced evidence IDs are present in the evidence
 * catalogue and flags any that are absent as 'pending'.
 *
 * Missing evidence does NOT suppress the alert — the alert is retained
 * and the UI shows "Evidence pending / requires review" for that ID.
 */

import type { EvidenceStatus } from './types'

/**
 * Build a unique, sorted list of evidence IDs from any number of arrays.
 */
export function deduplicateIds(arrays: string[][]): string[] {
  const seen = new Set<string>()
  const result: string[] = []
  for (const arr of arrays) {
    for (const id of arr) {
      if (!seen.has(id)) {
        seen.add(id)
        result.push(id)
      }
    }
  }
  return result
}

/**
 * Resolve a list of evidence IDs against the known catalogue.
 *
 * @param ids            Evidence IDs referenced in matched rules.
 * @param knownIds       Set of IDs present in evidence_links.json.
 * @returns Array of EvidenceStatus records.
 */
export function resolveEvidence(
  ids: string[],
  knownIds: Set<string>,
): EvidenceStatus[] {
  return ids.map((id) => ({
    evidenceId: id,
    status: knownIds.has(id) ? 'present' : 'pending',
  }))
}

/**
 * Returns true if any evidence status is 'pending'.
 */
export function hasEvidencePending(statuses: EvidenceStatus[]): boolean {
  return statuses.some((s) => s.status === 'pending')
}
