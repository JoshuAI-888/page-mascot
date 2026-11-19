import { useCallback, useEffect, useRef, useState } from 'react'
import { sequences, isMaiaExpression } from './animation.js'
import type { Frame, Step } from './animation.js'

type Options = { ready: boolean; reduced: boolean; paused: boolean; active: boolean; auto: boolean; speed: number; preload: (sheets: Frame['sheet'][]) => Promise<unknown> }
export function usePlayback({ ready, reduced, paused, active, auto, speed, preload }: Options) {
  const [name, setName] = useState('Idle')
  const [frame, setFrame] = useState<Frame | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const current = useRef({ steps: [] as Step[], index: 0, remaining: 0, active: false })
  const request = useRef(0)
  const boops = useRef({ count: 0, at: 0 })
  const idleCount = useRef(0)
  const play = useCallback(async (next: string, override?: Step[]) => {
    if (!isMaiaExpression(next)) return
    const steps = override || sequences[next]
    if (!steps || !ready) return
    const ticket = ++request.current
    current.current.active = false
    setLoading(true); setError(false)
    try { await preload([...new Set(steps.map(step => step.sheet))]) }
    catch { if (ticket === request.current) { setError(true); setLoading(false); setFrame(null); setName('Idle') }; return }
    if (ticket !== request.current) return
    const selected = reduced ? steps[Math.min(1, steps.length - 1)]! : steps[0]!
    current.current = { steps, index: 0, remaining: reduced ? 1200 : selected.ms, active: true }
    setFrame({ ...selected }); setName(next); setLoading(false)
  }, [ready, reduced, preload])
  const reset = useCallback(() => {
    ++request.current; current.current.active = false
    boops.current = { count: 0, at: 0 }
    setFrame(null); setName('Idle'); setLoading(false); setError(false)
  }, [])
  const inspect = (next: Frame, label: string) => {
    ++request.current; current.current.active = false
    setLoading(false); setFrame(next); setName(label)
  }
  const boop = () => {
    const now = performance.now()
    const count = now - boops.current.at < 1600 ? boops.current.count + 1 : 1
    boops.current = { count: count >= 4 ? 0 : count, at: now }
    const next = count >= 4 ? 'Dizzy' : ['Heart', 'Sparkle', 'Delighted'][count - 1]!
    void play(next, !reduced && count < 4 ? [{ sheet: 'reactions', index: 0, ms: 120 }, { sheet: 'reactions', index: [1, 2, 8][count - 1]!, ms: 440 }] : undefined)
  }
  useEffect(() => {
    if (paused || !active || !ready || loading) return
    const p = current.current
    if (!p.active) {
      if (!auto || reduced || frame !== null) return
      const timer = setTimeout(() => {
        const cycle = ['Blink', 'Curious', 'Listening', 'Waiting patiently', 'Look around', 'Scratch', 'Smile']
        void play(cycle[idleCount.current++ % cycle.length]!)
      }, 6500)
      return () => clearTimeout(timer)
    }
    const start = performance.now()
    const timer = setTimeout(() => {
      p.index++
      if (reduced || p.index >= p.steps.length) { p.active = false; setFrame(null); setName('Idle') }
      else { const next = p.steps[p.index]!; p.remaining = next.ms; setFrame(next) }
    }, Math.max(0, p.remaining / speed))
    const index = p.index
    return () => {
      clearTimeout(timer)
      if (p.active && p.index === index) p.remaining = Math.max(0, p.remaining - (performance.now() - start) * speed)
    }
  }, [paused, active, ready, loading, reduced, auto, speed, frame, play])
  useEffect(() => () => { ++request.current }, [])
  return { name, frame, loading, error, play, reset, inspect, boop }
}
