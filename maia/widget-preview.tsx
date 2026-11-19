import { useState } from 'react'
import { createRoot } from 'react-dom/client'
import { MaiaCompanion } from './companion'
import type { MaiaExpression } from '../src/maia/index.js'
export function Preview() {
  const [expression, setExpression] = useState<MaiaExpression>()
  return <main><h1>Māia companion</h1><p>This fixture loads only the small companion, without studio artwork or fonts.</p><button onClick={() => setExpression('Curious')}>Curious</button><button onClick={() => setExpression('Reading')}>Reading</button><button onClick={() => setExpression('Scratch')}>Scratch</button><MaiaCompanion expression={expression} idle={false} /><div style={{ height: 1600 }} /></main>
}
createRoot(document.getElementById('root')!).render(<Preview />)
