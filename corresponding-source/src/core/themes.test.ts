import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { chartSeparation, contrastChecks, darkRestraint, DARK_THEMES, DEFAULT_DARK_THEME, DEFAULT_LIGHT_THEME, deriveTokens, elevation, guardStageColour, LIGHT_THEMES, resolveThemeTokens, stageColourValid, stageSeparation, STAGE_KEYS, THEMES, themeStages, type NavTone, type Tokens } from './themes'
import { contrast } from './themeColor'

const approved = JSON.parse(readFileSync(join(__dirname, '../../docs/design/theme-system-2026/tokens/themes.json'), 'utf8')) as { themes: { id: string; semantic: Tokens }[] }
const failures = (t: Tokens): string[] => contrastChecks(t).filter((r) => !r.pass).map((r) => `${r.fg} on ${r.bg} ${r.ratio.toFixed(2)} < ${r.min}`)
const minCvd = (sep: Record<string, number>): number => Math.min(sep.protan, sep.deutan, sep.tritan)

describe('approved theme library', () => {
  it('defaults to the T3 monochrome pair and preserves the theme library', () => {
    expect(LIGHT_THEMES).toHaveLength(12)
    expect(DARK_THEMES).toHaveLength(17)
    expect(DEFAULT_LIGHT_THEME).toBe('t3-light')
    expect(DEFAULT_DARK_THEME).toBe('t3-dark')
  })
  it('preserves the approved tokens of all 26 original themes', () => {
    for (const entry of approved.themes) { const s = THEMES.find(s=>s.id===entry.id)!; expect(deriveTokens(s, themeStages(s)), s.id).toEqual(entry.semantic) }
  })
  it.each(['black', 't3-light', 't3-dark'])('keeps %s neutral, including actions, timeline, charts and brand tokens',(themeId)=>{
    const tokens=resolveThemeTokens({themeId,mode:themeId==='t3-light'?'light':'dark'})
    for(const [key,value] of Object.entries(tokens))if(/^#[0-9a-f]{6}$/i.test(value)){
      expect(value.slice(1,3),key).toBe(value.slice(3,5))
      expect(value.slice(3,5),key).toBe(value.slice(5,7))
    }
    if(themeId==='black') {
      expect(tokens['accent.default']).toBe('#D4D4D4')
      expect(tokens['text.onAccent']).toBe('#101010')
    }
  })
})

describe.each(THEMES.map((s) => [s.id, s] as const))('%s', (_id, s) => {
  const t = resolveThemeTokens({ themeId: s.id, mode: s.mode })
  it('passes every contrast check', () => expect(failures(t)).toEqual([]))
  it('keeps the four stages apart in normal and colour-deficient vision', () => {
    const sep = stageSeparation(t)
    if(s.chart.chroma===0){
      expect(sep.normal).toBeGreaterThanOrEqual(7)
      expect(minCvd(sep)).toBeGreaterThanOrEqual(7)
      return
    }
    // Darkroom (low blue by intent) keeps its documented 13.8 normal / 7.2 CVD.
    expect(sep.normal).toBeGreaterThanOrEqual(s.id === 'darkroom' ? 13 : 15)
    expect(minCvd(sep)).toBeGreaterThanOrEqual(s.id === 'darkroom' ? 7 : 8)
  })
  it('keeps the first five chart series distinguishable', () => {
    const sep = chartSeparation(t, 5)
    if(s.chart.chroma===0){
      expect(sep.normal).toBeGreaterThanOrEqual(6)
      expect(minCvd(sep)).toBeGreaterThanOrEqual(6)
      return
    }
    // Darkroom's series vary mostly in lightness (documented trade-off in QUALITY_REPORT.md).
    if (s.id === 'darkroom') {
      // Approved low-blue exception, not an untested exemption. Direct labels
      // remain essential: the weakest tritan pair is only about 2.47 delta E.
      expect(sep.normal).toBeGreaterThanOrEqual(5.8)
      expect(sep.protan).toBeGreaterThanOrEqual(8)
      expect(sep.deutan).toBeGreaterThanOrEqual(7.5)
      expect(sep.tritan).toBeGreaterThanOrEqual(2.4)
      return
    }
    expect(sep.normal).toBeGreaterThanOrEqual(15)
    expect(minCvd(sep)).toBeGreaterThanOrEqual(9)
  })
  if (s.mode === 'dark') {
    it('stays dim and muted (owner restraint check) with rising elevation', () => {
      expect(darkRestraint(s, t).ok).toBe(true)
      // T3 uses a black canvas with lifted input wells; check that explicit hierarchy.
      const L = s.id === 't3-dark' ? [elevation(t)[1], elevation(t)[0], ...elevation(t).slice(2)] : elevation(t)
      for (let i = 1; i < L.length; i++) expect(L[i] - L[i - 1]).toBeGreaterThanOrEqual(0.015)
    })
  }
  it('stays readable under high contrast and every sidebar colour', () => {
    for (const navTone of ['theme', 'inverse', 'accent'] as NavTone[]) for (const highContrast of [false, true]) {
      const v = resolveThemeTokens({ themeId: s.id, mode: s.mode, navTone, highContrast })
      expect(failures(v), `${navTone}${highContrast ? ' high contrast' : ''}`).toEqual([])
      if (highContrast) {
        for (const bg of ['bg.canvas', 'surface.base', 'surface.raised']) expect(contrast(v['text.secondary'], v[bg])).toBeGreaterThanOrEqual(7)
        expect(contrast(v['border.default'], v['surface.base'])).toBeGreaterThanOrEqual(4.5)
        for (const k of STAGE_KEYS) expect(contrast(v[`stage.${k}`], v['surface.base'])).toBeGreaterThanOrEqual(4.5)
      }
    }
  })
  it('guards and re-derives any custom stage colour, also as the accent', () => {
    for (const color of ['#FFFFFF', '#000000', '#FFFF00', '#808080', '#86A9DB', '#C0392B', '#2E506D']) for (const k of STAGE_KEYS) {
      const v = resolveThemeTokens({ themeId: s.id, mode: s.mode, stageOverrides: { [k]: color }, focusIsAccent: true })
      expect(stageColourValid(v[`stage.${k}`], s), `${k} ${color}`).toBe(true)
      expect(failures(v), `${k} ${color}`).toEqual([])
    }
  })
})

describe('custom colours', () => {
  it('keeps migrated custom action colours coordinated with normal navigation without changing the saved stage request', () => {
    for (const s of THEMES) for (const highContrast of [false, true]) {
      const stageOverrides = { focus: '#245679' }
      const choice = { themeId: s.id, mode: s.mode, stageOverrides, focusIsAccent: true, highContrast }
      const t = resolveThemeTokens(choice)
      expect(t['nav.active.bg'], s.id).toBe(t['accent.default'])
      expect(contrast(t['nav.active.text'], t['nav.active.bg']), s.id).toBeGreaterThanOrEqual(4.5)
      expect(contrast(t['nav.bookmark'], t['nav.active.bg']), s.id).toBeGreaterThanOrEqual(2.2)
      expect(failures(t), s.id).toEqual([])
      expect(stageOverrides).toEqual({ focus: '#245679' })
    }
  })
  it('keeps stage-only custom colours and explicit sidebar palettes independent of action colours', () => {
    for (const s of THEMES) {
      const base = resolveThemeTokens({ themeId: s.id, mode: s.mode })
      const stageOnly = resolveThemeTokens({ themeId: s.id, mode: s.mode, stageOverrides: { focus: '#7A3E9D' }, focusIsAccent: false })
      expect(stageOnly['accent.default'], s.id).toBe(base['accent.default'])
      expect(stageOnly['nav.active.bg'], s.id).toBe(base['nav.active.bg'])
      for (const navTone of ['inverse', 'accent'] as const) {
        const t = resolveThemeTokens({ themeId: s.id, mode: s.mode, stageOverrides: { focus: '#7A3E9D' }, focusIsAccent: true, navTone })
        expect(failures(t), `${s.id}/${navTone}`).toEqual([])
        if (navTone === 'inverse') {
          const partner = THEMES.find(p => p.id === s.pairsWith)!
          expect(t['nav.active.bg']).toBe(resolveThemeTokens({ themeId: partner.id, mode: partner.mode })['nav.active.bg'])
        }
      }
    }
  })
  it('keeps a usable custom colour exactly and moves an illegible one only in lightness', () => {
    const ivory = THEMES.find((s) => s.id === 'ivory-ink')!
    expect(guardStageColour('#2E506D', ivory)).toBe('#2E506D')
    const pale = guardStageColour('#F0F0A0', ivory)
    expect(stageColourValid(pale, ivory)).toBe(true)
    expect(pale).not.toBe('#F0F0A0')
  })
  it('honours legacy custom surfaces while keeping text readable', () => {
    for (const [themeId, mode, o] of [['ivory-ink', 'light', { bg: '#ABCDEF', surface: '#FFFFFF', text: '#777777' }], ['ink-dim', 'dark', { bg: '#123456', surface: '#1A3A5A', muted: '#556677' }]] as const) {
      const t = resolveThemeTokens({ themeId, mode, surfaceOverrides: o })
      expect(t['bg.canvas']).toBe(o.bg)
      for (const bg of ['bg.canvas', 'surface.base', 'bg.sunken']) {
        expect(contrast(t['text.primary'], t[bg])).toBeGreaterThanOrEqual(7)
        expect(contrast(t['text.secondary'], t[bg])).toBeGreaterThanOrEqual(4.5)
      }
      for (const k of STAGE_KEYS) expect(contrast(t[`stage.${k}`], t['surface.base'])).toBeGreaterThanOrEqual(3)
    }
  })
})
