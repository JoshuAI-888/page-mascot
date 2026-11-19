export type Frame = { sheet: 'directions' | 'reactions' | 'actions' | 'expressions' | 'behaviours'; index: number }
export type Step = Frame & { ms: number }
const d = (index: number, ms: number): Step => ({ sheet: 'directions', index, ms })
const r = (index: number, ms: number): Step => ({ sheet: 'reactions', index, ms })
const a = (index: number, ms: number): Step => ({ sheet: 'actions', index, ms })
const e = (index: number, ms: number): Step => ({ sheet: 'expressions', index, ms })
const b = (index: number, ms: number): Step => ({ sheet: 'behaviours', index, ms })
export const sequences = {
  Smile: [a(6, 160), a(7, 360), a(8, 1000), a(6, 180)],
  Blink: [r(0, 150), d(4, 180), r(0, 110), d(4, 200)],
  Scratch: [a(0, 220), a(1, 160), a(2, 160), a(1, 160), a(2, 160), a(1, 160), a(0, 220)],
  'Look around': [d(4, 250), d(3, 650), d(4, 350), d(5, 650), d(4, 350)],
  Bored: [r(6, 1800), r(0, 280), r(6, 700)],
  Excited: [a(3, 200), a(4, 400), a(5, 200), a(4, 400), a(3, 200), r(8, 600)],
  Heart: [r(0, 120), r(1, 900)], Sparkle: [r(0, 120), r(2, 900)],
  Surprised: [r(3, 1000)], Wink: [r(4, 700)], Bashful: [r(5, 1100)],
  Sleepy: [r(6, 1400), r(0, 400)], Dizzy: [r(7, 1100)], Delighted: [r(8, 1000)],
  Curious: [d(4, 180), e(0, 1200), d(5, 400), e(0, 600)],
  Thinking: [d(1, 280), e(1, 1500), d(4, 250)],
  Listening: [d(4, 180), e(2, 1500), r(0, 110), e(2, 500)],
  Understanding: [e(2, 350), e(3, 700), d(4, 230), e(3, 500)],
  Unsure: [d(4, 180), e(4, 1400), e(0, 500)],
  Encouraging: [e(2, 250), e(5, 1500), e(3, 450)],
  Proud: [d(4, 200), e(6, 1600), d(4, 200)],
  Concerned: [e(2, 250), e(7, 1600), e(2, 350)],
  Welcoming: [d(4, 180), e(8, 650), d(4, 180), e(8, 700)],
  Celebrating: [b(0, 250), b(1, 500), b(2, 300), b(1, 500), b(2, 450)],
  Reading: [d(7, 200), b(3, 650), b(4, 650), b(3, 650), b(4, 550)],
  'Waiting patiently': [d(4, 180), b(5, 1600), r(0, 110), b(5, 650)],
  'Noticing something': [b(6, 300), b(7, 950), b(6, 450)],
  Pointing: [b(7, 250), b(8, 1600), b(7, 350)],
} satisfies Record<string, Step[]>
export type MaiaExpression = keyof typeof sequences
export const MAIA_EXPRESSIONS = Object.freeze(Object.keys(sequences) as MaiaExpression[])
export function isMaiaExpression(value: string): value is MaiaExpression {
  return Object.hasOwn(sequences, value)
}
export const directionNames = ['Up left', 'Up', 'Up right', 'Left', 'Centre', 'Right', 'Down left', 'Down', 'Down right']
export const primary = ['Smile', 'Blink', 'Scratch', 'Look around', 'Bored', 'Excited']
export const secondary = ['Heart', 'Sparkle', 'Surprised', 'Wink', 'Bashful', 'Sleepy', 'Dizzy', 'Delighted']
export const expressions = ['Curious', 'Thinking', 'Listening', 'Understanding', 'Unsure', 'Encouraging', 'Proud', 'Concerned', 'Welcoming', 'Celebrating']
export const pageActions = ['Reading', 'Waiting patiently', 'Noticing something', 'Pointing']
export const stories: Record<string, string> = {
  Idle: 'A little curiosity. A lot of character.', Smile: 'A warm welcome, with a smile in her eyes.',
  Blink: 'A natural double blink, then back to you.', Scratch: 'A quick feather fix. Even collaborators need a moment.',
  'Look around': 'A small glance each way, then her attention returns to you.', Bored: 'A quiet pause while she waits for the next idea.',
  Excited: 'A little wing-led enthusiasm for a good idea.',
  Curious: 'A head tilt, then a closer look.', Thinking: 'Taking a moment to consider the idea.',
  Listening: 'You have her full attention.', Understanding: 'A small nod: she’s following along.',
  Unsure: 'A gentle wing shrug while she works it out.', Encouraging: 'An open wing and a little reassurance.',
  Proud: 'Quiet satisfaction in a job well done.', Concerned: 'A softer posture when something needs care.',
  Welcoming: 'Kia ora. Come on in.', Celebrating: 'A bright wing flourish to mark the moment.',
  Reading: 'Following a few lines, left to right.', 'Waiting patiently': 'Ready when you are. No hurry.',
  'Noticing something': 'Something to the right has caught her attention.', Pointing: 'A wing gesture towards the controls beside her.',
}
