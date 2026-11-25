import type Database from 'better-sqlite3'
import { ITEM_PALETTE, OLD_ITEM_PALETTE } from '@core/palette'

/**
 * Moves subjects and categories still on an earlier default colour to the
 * matching new one. Colours someone picked themselves stay as they are.
 * Safe to run on every start: once moved there is nothing left to change.
 */
export function refreshDefaultColours(db: Database.Database): void {
  for (const table of ['categories', 'items'] as const) {
    const exists = db.prepare("SELECT 1 FROM sqlite_master WHERE type='table' AND name=?").get(table)
    if (!exists) continue
    const update = db.prepare(`UPDATE ${table} SET color = ? WHERE upper(color) = ?`)
    db.transaction(() => OLD_ITEM_PALETTE.forEach((old, i) => update.run(ITEM_PALETTE[i], old.toUpperCase())))()
  }
}
