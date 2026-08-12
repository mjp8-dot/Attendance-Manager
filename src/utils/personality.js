// Small line-pickers for the app's "slightly sarcastic" personality.
// Pure functions: given settings + a seed, return a message. No randomness
// leaks into calculation logic — this is presentation-only flavor text.

const GREETINGS = {
  mild: ['Good morning.', 'Welcome back.', "Here's today."],
  normal: ['Good morning. Let’s see the damage.', 'Back again. Bold of you.', 'Rise and attend.'],
  unhinged: [
    'Oh, you’re here. Attendance won’t fix itself.',
    'Good morning to those who show up. Barely you, lately.',
    'Another day, another chance to not get debarred.',
  ],
}

const VACANCY_LINES = {
  mild: ['Free period.', 'No class scheduled.', 'Break time.'],
  normal: [
    'The institution has accidentally given you free time.',
    'Academic productivity window unavailable.',
    'Congratulations. You have been temporarily released.',
    'A gap in the timetable. Use it wisely, or don’t.',
  ],
  unhinged: [
    'The timetable blinked and you got away with it.',
    'Free time. Suspicious, but take it.',
    'Nobody scheduled anything here. Not your problem.',
    'Enjoy this. It will not last.',
  ],
}

const SAFE_LINES = {
  mild: ['On track.', 'Comfortably above target.'],
  normal: ['On track. Nothing to worry about here.', 'Safely above target — for now.'],
  unhinged: ['Flying above target. Try not to get cocky.', 'You’re fine. Suspiciously fine.'],
}

const DANGER_LINES = {
  mild: ['Below target.', 'Needs attention.'],
  normal: ['Below target. This is the part where you show up.', 'Danger zone. Attendance, not vibes, fixes this.'],
  unhinged: [
    'This subject is circling the drain.',
    'One more skip and it’s a debarment origin story.',
    'The professor has started remembering your face. Not a good sign.',
  ],
}

function pick(pool, seed) {
  if (!pool || pool.length === 0) return ''
  const idx = Math.abs(seed) % pool.length
  return pool[idx]
}

function seedFromString(str) {
  let h = 0
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0
  return h
}

export function greeting(settings, seed = new Date().getDate()) {
  if (!settings.sarcasm) return 'Good morning.'
  return pick(GREETINGS[settings.intensity] ?? GREETINGS.normal, seed)
}

export function vacancyLine(settings, key = '') {
  if (!settings.sarcasm) return 'Vacant period.'
  return pick(VACANCY_LINES[settings.intensity] ?? VACANCY_LINES.normal, seedFromString(key))
}

export function statusLine(settings, status, key = '') {
  if (!settings.sarcasm) return status === 'danger' ? 'Below target.' : 'On track.'
  const pool = status === 'danger' ? DANGER_LINES : SAFE_LINES
  return pick(pool[settings.intensity] ?? pool.normal, seedFromString(key))
}
