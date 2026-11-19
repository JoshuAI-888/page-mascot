import { useCallback, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { Mascot } from '../src/mascot'
import { directionNames, primary, secondary, expressions, pageActions, stories } from './animation'
import type { Frame } from './animation'
import { stageSheets } from './assets'
import { smallSheets } from './small-assets'
import { loadArt } from './load-art'
import { usePlayback } from './use-playback'
import reference from './assets/approved-reference.png'
import logo from './assets/milford-logo.svg'
import './style.css'

export function App() {
  const [paused, setPaused] = useState(false)
  const [auto, setAuto] = useState(true)
  const [tracking, setTracking] = useState(true)
  const [dock, setDock] = useState(true)
  const [dark, setDark] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [systemReduced, setSystemReduced] = useState(matchMedia('(prefers-reduced-motion: reduce)').matches)
  const [quiet, setQuiet] = useState(false)
  const [visible, setVisible] = useState(!document.hidden)
  const [ready, setReady] = useState(false)
  const [assetError, setAssetError] = useState(false)
  const reduced = systemReduced || quiet
  const [group, setGroup] = useState('Expressions')
  const [showReference, setShowReference] = useState(false)
  const groups: Record<string, string[]> = { Everyday: primary, Expressions: expressions, 'On the page': pageActions }
  const preload = useCallback((sheets: Frame['sheet'][]) => Promise.all(sheets.flatMap(sheet => [loadArt(stageSheets[sheet]), ...(dock ? [loadArt(smallSheets[sheet])] : [])])), [dock])
  const { name, frame, loading, error, play, reset: resetPlayback, inspect, boop } = usePlayback({ ready, reduced, paused, active: visible, auto, speed, preload })
  const reset = () => { resetPlayback(); setPaused(false) }
  useEffect(() => {
    let live = true
    Promise.all([stageSheets.directions, stageSheets.reactions, smallSheets.directions, smallSheets.reactions].map(loadArt)).then(() => { if (live) setReady(true) }).catch(() => { if (live) setAssetError(true) })
    const media = matchMedia('(prefers-reduced-motion: reduce)')
    const preference = () => {
      setSystemReduced(media.matches)
      if (media.matches) resetPlayback()
    }
    const visibility = () => setVisible(!document.hidden)
    media.addEventListener('change', preference)
    document.addEventListener('visibilitychange', visibility)
    return () => { live = false; media.removeEventListener('change', preference); document.removeEventListener('visibilitychange', visibility) }
  }, [resetPlayback])
  const mascotProps = { frame, lazy: true, tracking: tracking && !paused && !reduced && visible && frame === null, motion: !reduced, onBoop: boop }
  return <>
    <header className="top"><img src={logo} alt="Milford" /><div className="divider" /><span>Character studio</span><span className="internal">Internal use only</span></header>
    <main>
      <div className="intro"><div><p className="eyebrow">MĀIA 02 / THE COLLABORATOR</p><h1>A familiar face<br />A little more life</h1><p className="lead">Meet Māia, your curious kea companion.<br className="desktop" /> Explore her expressions, or let her watch the page.</p></div><div className="edition"><span className="dot" /> Interactive motion study<span>Based on the approved film character</span></div></div>
      <section className="studio" aria-label="Animation studio">
        <div className={`stage ${dark ? 'dark' : ''}`}>
          <div className="stage-top"><span className="caps">MĀIA IN MOTION</span><button className="subtle" onClick={() => setDark(!dark)} aria-label="Change stage background">{dark ? 'Light stage' : 'Dark stage'} <span aria-hidden="true">◐</span></button></div>
          <div className="portrait"><div className="halo" /><div className="stage-bird"><Mascot {...mascotProps} {...stageSheets} atlases={stageSheets} size={340} label="Māia on the stage" /></div><div className="perch" /></div>
          <div className="stage-copy"><span className="state" data-testid="state" aria-live="polite">{assetError || error ? 'Artwork unavailable · try again' : !ready || loading ? 'Loading artwork…' : paused ? `${name} · Paused` : name}</span><p>{stories[name] || 'A small reaction, with the same familiar character.'}</p></div>
          <div className="stage-footer"><span>Move your pointer · Click to say hello</span><span>01 / CHARACTER STUDY</span></div>
        </div>
        <aside className="controls"><div className="section-title"><span className="number">01</span><h2>Give her a moment</h2></div><p className="muted">Choose an action to see Māia respond.</p>
          <div className="group-tabs" aria-label="Animation groups">{Object.keys(groups).map(key => <button key={key} aria-pressed={group === key} onClick={() => setGroup(key)}>{key}</button>)}</div>
          <div className="action-grid">{groups[group]!.map((action, i) => <button disabled={!ready} key={action} aria-label={action} data-action={action} aria-pressed={name === action} className={name === action ? 'selected' : ''} onClick={() => play(action)}><span className="action-number">{String(i + 1).padStart(2, '0')}</span>{action}<span className="arrow" aria-hidden="true">↗</span></button>)}</div>
          <div className="transport"><button onClick={() => setPaused(!paused)} aria-pressed={paused}>{paused ? 'Resume' : 'Pause'}</button><button onClick={reset}>Reset</button><label>Speed<select aria-label="Animation speed" value={speed} onChange={e => setSpeed(Number(e.target.value))}><option value={0.5}>0.5×</option><option value={1}>1×</option><option value={1.5}>1.5×</option></select></label></div>
          <div className="settings"><label><span>Automatic idle moments<small>A blink, a glance, a little patience</small></span><input type="checkbox" checked={auto} onChange={e => setAuto(e.target.checked)} /></label><label><span>Follow the pointer<small>Gentle gaze on mouse devices</small></span><input type="checkbox" checked={tracking} onChange={e => setTracking(e.target.checked)} /></label><label><span>Corner companion<small>Māia joins the page</small></span><input type="checkbox" checked={dock} onChange={e => setDock(e.target.checked)} /></label><label><span>Reduced motion<small>{systemReduced ? 'Enabled by your device preference' : 'Still poses, with no automatic actions'}</small></span><input type="checkbox" checked={reduced} disabled={systemReduced} onChange={e => { setQuiet(e.target.checked); reset() }} /></label></div>
        </aside>
      </section>
      <section className="lower"><div className="panel"><div className="section-title"><span className="number">02</span><h2>The page-mascot repertoire</h2></div><p className="muted">Every original reaction is here. Four quick clicks bring out a dizzy Māia.</p><div className="chips">{secondary.map(action => <button disabled={!ready} key={action} aria-label={action} data-action={action} aria-pressed={name === action} onClick={() => play(action)}>{action}</button>)}</div><details><summary>Inspect the nine gaze directions</summary><div className="gaze-grid">{directionNames.map((label, index) => <button key={label} onClick={() => inspect({ sheet: 'directions', index }, label)}>{label}</button>)}</div><p className="small">Reset returns to pointer tracking. Diagonal eye direction is subtle; down-right needs further art refinement.</p></details></div>
      <div className="panel note"><div className="section-title"><span className="number">03</span><h2>One character, throughout</h2></div><p>Olive-bronze feathers. Amber eyes. A compact curved beak. Her familiar two-tone scarf.</p><p className="small">These generated poses are a <strong>review candidate</strong>, not an approved production rig. Feather shapes, proportions and scarf lettering vary slightly between frames. Scratch uses three distinct poses, not continuous joint animation.</p><details className="reference-details" onToggle={e => setShowReference(e.currentTarget.open)}><summary>View the original character sheet</summary>{showReference && <img src={reference} alt="Approved Māia 02 character sheet showing front, three-quarter, profile, rear, portrait and flight views" />}</details></div></section>
      <footer>Built with page-mascot · Māia 02 motion exploration <a href="https://github.com/JoshuAI-888/page-mascot" target="_blank" rel="noreferrer">View repository ↗</a><p>Prototype artwork · No audio · Original character reference retained</p></footer>
    </main>
    {dock && <div className="dock"><button className="dock-close" onClick={() => setDock(false)} aria-label="Hide corner companion">×</button><span className="dock-label">Kia ora, I’m Māia</span><Mascot {...mascotProps} {...smallSheets} atlases={smallSheets} size={118} label="Māia in the corner" /></div>}
  </>
}
createRoot(document.getElementById('root')!).render(<App />)
