// Soft, dusty colours for subjects and categories, matched to the app's
// sand, lavender and sage accents. They read on both light and dark bases
// and stay clear of the timeline's distraction colours (see the tests).
export const ITEM_PALETTE = [
  '#7E9CC2', // dusty blue
  '#5FA8A4', // teal
  '#8AAA82', // sage
  '#A3AE6A', // olive
  '#E0A458', // honey
  '#D27D5F', // clay
  '#D0687F', // rose
  '#A88BC9', // lavender
  '#6C72B0', // indigo
  '#949DA6' // slate
] as const

/** The earlier default colours, in the same order as ITEM_PALETTE (for moving saved colours over). */
export const OLD_ITEM_PALETTE = ['#5B8DEF', '#4FA3A5', '#6BAA75', '#A3A84F', '#D9A441', '#D9825B', '#C96B7E', '#A77BCA', '#7C7FD6', '#8A9BA8'] as const

export function nextPaletteColor(used: string[]): string {
  const lower = new Set(used.map((c) => c.toLowerCase()))
  return ITEM_PALETTE.find((c) => !lower.has(c.toLowerCase())) ?? ITEM_PALETTE[used.length % ITEM_PALETTE.length]
}

export function isHexColor(value: string): boolean {
  return /^#[0-9a-fA-F]{6}$/.test(value)
}
