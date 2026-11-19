'use client'
import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { Mascot } from '../mascot.js'
import { maiaSheets } from './assets.js'
import { loadArt } from './load-art.js'
import { usePlayback } from './use-playback.js'
import { isMaiaExpression } from './animation.js'
import type { Frame, MaiaExpression } from './animation.js'

export type MaiaHandle = {
  /** Queue a state, or replay the same state. Runs once the initial art is ready. */
  play: (expression: MaiaExpression) => void
  reset: () => void
}
export type MaiaCompanionProps = {
  expression?: MaiaExpression
  size?: number
  idle?: boolean
  tracking?: boolean
  paused?: boolean
  reducedMotion?: boolean
  className?: string
  style?: CSSProperties
  label?: string
  /** Optional served directory containing the five WebP sheets. */
  assetsBaseUrl?: string
  onError?: (error: Error) => void
}

/** SSR-safe placeholder; artwork and browser listeners start after mounting. */
export const MaiaCompanion = forwardRef<MaiaHandle, MaiaCompanionProps>(function MaiaCompanion({
  expression, size = 118, idle = true, tracking = true, paused = false,
  reducedMotion = false, className, style, label = 'Māia', assetsBaseUrl, onError,
}, ref) {
  const wrapper = useRef<HTMLDivElement>(null)
  const [readyFor, setReadyFor] = useState<typeof maiaSheets | null>(null)
  const [visible, setVisible] = useState(false)
  const [inView, setInView] = useState(false)
  const [systemReduced, setSystemReduced] = useState(false)
  const [assetError, setAssetError] = useState(false)
  const [retry, setRetry] = useState(0)
  const [manual, setManual] = useState<{ expression: MaiaExpression } | null>(null)
  const errorHandler = useRef(onError)
  useEffect(() => { errorHandler.current = onError }, [onError])
  const sheets = useMemo(() => assetsBaseUrl === undefined ? maiaSheets : Object.fromEntries(
    Object.keys(maiaSheets).map(key => [key, `${assetsBaseUrl.replace(/\/$/, '')}/${key}.webp`]),
  ) as typeof maiaSheets, [assetsBaseUrl])
  const ready = readyFor === sheets
  const reduced = systemReduced || reducedMotion
  const preload = useCallback((names: Frame['sheet'][]) => Promise.all(names.map(name => loadArt(sheets[name]))), [sheets])
  const { frame, name, loading, error, play, reset, boop } = usePlayback({ ready, reduced, paused, active: visible && inView, auto: idle, speed: 1, preload })
  useImperativeHandle(ref, () => ({
    play: next => { if (isMaiaExpression(next)) setManual({ expression: next }) },
    reset: () => { setManual(null); reset() },
  }), [reset])
  useEffect(() => {
    // Synchronize browser state after hydration; SSR must use the same placeholder.
    // oxlint-disable-next-line react/set-state-in-effect
    setVisible(!document.hidden)
    const media = matchMedia('(prefers-reduced-motion: reduce)')
    setSystemReduced(media.matches)
    const preference = () => { setSystemReduced(media.matches); reset() }
    const visibility = () => setVisible(!document.hidden)
    const observer = typeof IntersectionObserver === 'undefined' ? null : new IntersectionObserver(entries => setInView(entries.some(entry => entry.isIntersecting)))
    if (observer && wrapper.current) observer.observe(wrapper.current)
    else setInView(true)
    document.addEventListener('visibilitychange', visibility)
    media.addEventListener('change', preference)
    return () => { observer?.disconnect(); document.removeEventListener('visibilitychange', visibility); media.removeEventListener('change', preference) }
  }, [reset])
  useEffect(() => { reset() }, [sheets, reducedMotion, reset])
  useEffect(() => {
    if (!inView || !visible || ready) return
    let live = true
    void preload(['directions', 'reactions']).then(() => { if (live) { setReadyFor(sheets); setAssetError(false) } }).catch(cause => {
      if (live) { setAssetError(true); errorHandler.current?.(new Error('Māia artwork could not be loaded', { cause })) }
    })
    return () => { live = false }
  }, [inView, visible, ready, sheets, preload, retry])
  useEffect(() => { if (expression && ready) void play(expression) }, [expression, ready, play])
  useEffect(() => { if (manual && ready) void play(manual.expression) }, [manual, ready, play])
  useEffect(() => { if (error) errorHandler.current?.(new Error('Māia expression artwork could not be loaded')) }, [error])
  const retryArt = () => {
    if (ready) { if (manual) void play(manual.expression); else if (expression) void play(expression); else boop() }
    else setRetry(value => value + 1)
  }
  return <div ref={wrapper} className={className} style={{ width: size, height: size, ...style }} data-maia-state={name} aria-busy={loading || (!ready && !assetError)}>
    {ready && <Mascot {...sheets} atlases={sheets} lazy size={size} frame={frame} tracking={tracking && visible && inView && !paused && !reduced && frame === null} motion={!reduced} onBoop={boop} label={label} />}
    {(assetError || error) && <button type="button" onClick={retryArt} aria-label="Retry Māia artwork">Retry Māia</button>}
  </div>
})
