import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from './supabaseClient'

/* ─── Data ───────────────────────────────────────── */
const HERO_VIDEOS = [
  'https://danielcotlar-ops.github.io/lifesong-assets/14092529_3840_2160_30fps.mp4',
  'https://danielcotlar-ops.github.io/lifesong-assets/3704443-uhd_4096_2160_25fps.mp4',
  'https://danielcotlar-ops.github.io/lifesong-assets/3704252-uhd_4096_2160_25fps.mp4',
  'https://danielcotlar-ops.github.io/lifesong-assets/4873447-hd_1920_1080_25fps.mp4',
  'https://danielcotlar-ops.github.io/lifesong-assets/5617146-uhd_3840_2160_25fps.mp4',
]

const TICKER_WORDS = [
  'BIRTHDAY',
  'ANNIVERSARY',
  "I'M SORRY",
  "MOTHER'S DAY",
  'CONGRATULATIONS',
  'NEW BABY',
  'GRADUATION',
]

const NAV_LINKS = [
  { href: '#how-it-works', label: 'How It Works' },
  { href: '#inspiration', label: 'Inspiration' },
  { href: '#artists', label: 'Our Artists' },
  { href: '#faq', label: 'FAQ' },
]

const STEPS = [
  {
    num: '01',
    title: 'Tell Us the Occasion',
    body: 'Select the moment you want to celebrate and set the tone.',
    hasOccasionPills: true,
  },
  {
    num: '02',
    title: 'Choose Your Genre',
    body: 'Choose your genre. You can add sub-genres or mix later.',
    hasGenreScroller: true,
  },
  {
    num: '03',
    title: 'Answer a Few Questions',
    body: 'Expertly designed questions help you express those favorite memories, inside jokes, and personal feelings. Our songwriters use these for the perfect lyrics and style.',
  },
  {
    num: '04',
    title: 'Receive Your Song',
    body: 'We\u2019ll send you the song 24 hours later \u2014 or 12 hours or less if you choose Accelerated Delivery.',
  },
]

const GENRES = ['Folk', 'Pop', 'Country', 'R&B', 'Rock', 'Hip-Hop', 'Jazz', 'Classical', 'Blues', 'Indie', 'Soul', 'Reggae', 'Latin', 'Electronic']

const ARTISTS = [
  {
    name: 'Maya R.',
    genre: 'Nashville Folk',
    bio: 'Specializes in raw, emotional storytelling.',
    songs: '3,200+',
    photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=face',
    quote: '\u201CEvery song starts with listening. The best lyrics come from the smallest details people share.\u201D',
  },
  {
    name: 'Julian V.',
    genre: 'Modern Pop',
    bio: 'Known for catchy melodies and high-energy production.',
    songs: '2,800+',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
    quote: '\u201CI want every song to feel like it could be on the radio \u2014 but the lyrics are just for you.\u201D',
  },
  {
    name: 'Sarah Beth',
    genre: 'Classic Country',
    bio: 'A warm, vintage voice for timeless memories.',
    songs: '2,100+',
    photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face',
    quote: '\u201CThere\u2019s nothing like watching someone hear their story set to music for the first time.\u201D',
  },
]

const TESTIMONIALS = [
  {
    quote: 'My husband sobbed the moment it started playing. I will never forget the look on his face.',
    name: 'Rachel M.',
    songTitle: 'Our Twenty Years',
    genre: 'Anniversary Folk',
    duration: '3:42',
    stars: 5,
    wave: [4,8,14,10,20,28,18,24,30,22,26,20,28,18,24,16,20,12,18,8,14,20,26,18,28,22,16,24,30,20,26,18,22,14,18,10,14,6,10,4],
  },
  {
    quote: 'My mom played it at her 60th birthday and the whole room went quiet. Pure magic.',
    name: 'Daniel K.',
    songTitle: 'For the Woman Who Made Me',
    genre: 'Country Ballad',
    duration: '4:15',
    stars: 5,
    wave: [10,14,18,22,20,24,22,26,24,22,20,24,22,26,24,22,20,18,20,22,24,22,20,18,20,22,24,22,20,18,16,18,20,22,20,18,16,14,12,10],
  },
  {
    quote: 'Worth every penny. She still listens to it every morning. Best gift I have ever given.',
    name: 'Sophie T.',
    songTitle: 'Little One, Welcome Home',
    genre: 'Baby Lullaby',
    duration: '3:18',
    stars: 5,
    wave: [4,6,10,8,12,10,14,12,16,14,12,10,14,12,16,14,12,10,8,10,12,14,12,10,8,10,12,10,8,10,8,6,8,10,12,10,8,6,8,4],
  },
]

const FAQS = [
  {
    q: 'How much does a custom song cost?',
    a: 'Songs start at $99 for standard delivery. Accelerated delivery and add-ons like extra verses or multiple revisions are available at checkout.',
  },
  {
    q: 'How long does it take to receive my song?',
    a: 'Standard delivery is 24 hours from the moment you complete your questionnaire. We also offer rush delivery in as little as 6 hours for an additional fee — perfect for last-minute gifts.',
  },
  {
    q: "What if I don't like my song?",
    a: 'We offer unlimited revisions until you are completely satisfied. We stand behind every song we create. Your happiness is our guarantee — no exceptions, no fine print.',
  },
  {
    q: 'What format will I receive?',
    a: 'You will receive a high-quality MP3 and WAV file delivered directly to your inbox, along with a beautifully formatted PDF of the full lyrics to frame or keep.',
  },
  {
    q: 'Can I request a specific artist?',
    a: 'Absolutely. You can request any artist from our roster, or let us match you with the best fit for your chosen genre. Either way, you are in good hands.',
  },
  {
    q: 'Are these AI-generated songs?',
    a: 'No. Every LifeSong has a real human artist helping craft your song. They use tools and instruments they\u2019re most comfortable with, including AI to polish the result, but their human ingenuity and creativity is what will make your song great.',
  },
]

/* ─── Intake Engine Config ─── */
const FORM_CONFIG = [
  {
    id: 'recipient',
    questionText: "First things first, who is the lucky person?",
    subtext: "Just a first name is perfect.",
    fields: [
      { id: 'recipientName', type: 'text_input', placeholder: 'e.g. Sarah', required: true }
    ]
  },
  {
    id: 'occasion',
    questionText: "What are we celebrating?",
    subtext: "Pick the occasion that fits best.",
    fields: [
      { id: 'occasion', type: 'card_select', required: true, options: [
        { value: 'birthday', label: 'Birthday', emoji: '🎂' },
        { value: 'mothers-day', label: "Mother's Day", emoji: '💐' },
        { value: 'valentines', label: "Valentine's Day", emoji: '❤️' },
        { value: 'anniversary', label: 'Anniversary', emoji: '💍' },
        { value: 'celebration-of-life', label: 'Celebration of Life', emoji: '🌟' },
        { value: 'general', label: 'General story / no occasion', emoji: '📖', fullWidth: true },
      ]}
    ]
  },
  {
    id: 'vibe',
    questionText: "Set the vibe.",
    subtext: "How should the song feel? Pick the closest match.",
    fields: [
      { id: 'tone', type: 'pill_select', required: true, options: [
        { value: 'emotional', label: 'Emotional / Heartfelt' },
        { value: 'happy', label: 'Happy / Upbeat' },
        { value: 'calm', label: 'Calm / Reflective' },
        { value: 'romantic', label: 'Romantic' },
        { value: 'fun', label: 'Fun / Playful' },
      ]},
      { id: 'energy', type: 'segmented_control', label: 'Energy level', required: true, options: [
        { value: 'soft', label: '☁️ Soft' },
        { value: 'medium', label: '🎵 Medium' },
        { value: 'high', label: '⚡ High' },
      ]}
    ]
  },
  {
    id: 'emotion',
    questionText: "How should the listener feel by the end?",
    subtext: "Pick all that resonate.",
    fields: [
      { id: 'feelings', type: 'multi_select', required: true, options: [
        { value: 'loved', label: 'Loved' },
        { value: 'appreciated', label: 'Appreciated' },
        { value: 'proud', label: 'Proud' },
        { value: 'emotional', label: 'Emotional / Teary' },
        { value: 'inspired', label: 'Inspired' },
        { value: 'humorous', label: 'Humorous' },
      ]},
      { id: 'relationship', type: 'pill_select', label: 'What is your relationship to them?', required: true, options: [
        { value: 'partner', label: 'Partner' },
        { value: 'parent', label: 'Parent' },
        { value: 'child', label: 'Child' },
        { value: 'friend', label: 'Friend' },
        { value: 'self', label: 'Self' },
      ]}
    ]
  },
  {
    id: 'themes',
    questionText: "Pick up to 3 themes to weave into the lyrics.",
    subtext: "These guide the songwriter's direction.",
    fields: [
      { id: 'themes', type: 'multi_select', required: true, maxSelect: 3, options: [
        { value: 'gratitude', label: 'Gratitude' },
        { value: 'support', label: 'Support' },
        { value: 'shared-memories', label: 'Shared Memories' },
        { value: 'growth', label: 'Growth' },
        { value: 'future-hopes', label: 'Future Hopes' },
        { value: 'celebration', label: 'Celebration' },
        { value: 'resilience', label: 'Resilience' },
      ]}
    ]
  },
  {
    id: 'personal',
    questionText: "Make it personal.",
    subtext: "All optional — but the more you share, the better the song.",
    fields: [
      { id: 'chorusHook', type: 'text_input', label: "The 'Chorus' Hook", placeholder: 'e.g. The Best Mom in Brooklyn', required: false },
      { id: 'goldenMemory', type: 'textarea', label: "A 'Golden Memory' or inside joke", placeholder: 'A specific moment, inside joke, or detail that makes them smile...', maxLength: 300, required: false },
      { id: 'avoid', type: 'text_input', label: 'Anything we should steer clear of?', placeholder: 'Sensitive topics or names to avoid', required: false },
    ]
  },
  {
    id: 'review',
    questionText: "Here's what we've got.",
    subtext: "Review your answers before we send this to our songwriters.",
    fields: []
  },
]

/* ─── Ticker ─────────────────────────────────────── */
const TICKER_DURATIONS = { 0: 2000 } // index 0 = BIRTHDAY stays 2s, rest 3s

function Ticker() {
  const [state, setState] = useState({ current: 0, prev: null })
  const measRef = useRef(null)
  const [width, setWidth] = useState(0)
  const timerRef = useRef(null)

  useEffect(() => {
    if (!measRef.current) return
    let max = 0
    const spans = measRef.current.querySelectorAll('[data-measure]')
    spans.forEach(s => { if (s.offsetWidth > max) max = s.offsetWidth })
    setWidth(max + 20)
  }, [])

  useEffect(() => {
    function tick() {
      setState(s => {
        const next = (s.current + 1) % TICKER_WORDS.length
        const delay = TICKER_DURATIONS[next] || 3000
        timerRef.current = setTimeout(tick, delay)
        return { current: next, prev: s.current }
      })
    }
    timerRef.current = setTimeout(tick, TICKER_DURATIONS[0] || 3000)
    return () => clearTimeout(timerRef.current)
  }, [])

  return (
    <>
      <span ref={measRef} aria-hidden="true" className="absolute opacity-0 pointer-events-none whitespace-nowrap" style={{ visibility: 'hidden' }}>
        {TICKER_WORDS.map(w => (
          <span key={w} data-measure className="font-serif italic inline-block" style={{ fontSize: 'inherit' }}>{w}<span className="not-italic" style={{ fontSize: '0.55em' }}> Song</span></span>
        ))}
      </span>

      <span
        aria-live="polite"
        className="relative inline-block align-baseline"
        style={{ height: '1.2em', width: width || 'auto', maxWidth: '92vw', minWidth: width ? undefined : '6ch', verticalAlign: 'baseline', overflow: 'visible', clipPath: 'inset(-5% -12% -5% -12%)' }}
      >
        {TICKER_WORDS.map((word, i) => {
          const isActive = i === state.current
          const isPrev = i === state.prev
          return (
            <span
              key={word}
              aria-hidden={!isActive}
              className="absolute inset-0 flex items-baseline justify-center font-serif italic text-gold-gradient whitespace-nowrap"
              style={{
                transform: isActive
                  ? 'translateY(0) scale(1)'
                  : isPrev
                  ? 'translateY(-120%) scale(0.92)'
                  : 'translateY(120%) scale(0.92)',
                opacity: isActive ? 1 : 0,
                filter: isActive ? 'blur(0px)' : 'blur(6px)',
                transition:
                  isActive || isPrev
                    ? 'transform 520ms cubic-bezier(0.34,1.56,0.64,1), opacity 350ms ease, filter 400ms ease'
                    : 'none',
              }}
            >
              {word}<span className="not-italic font-medium text-cream" style={{ fontSize: '0.55em' }}> Song</span>
            </span>
          )
        })}
      </span>
    </>
  )
}

/* ─── Nav ────────────────────────────────────────── */
function Nav({ onStart }) {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 30)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <header className={`nav-glass fixed inset-x-0 top-0 z-50 ${scrolled ? 'scrolled' : ''}`}>
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <a href="#" className="font-serif text-xl tracking-wide text-gold">
          LifeSong
        </a>

        {/* Desktop links */}
        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map(l => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-light tracking-wide text-cream/60 transition-colors hover:text-gold"
            >
              {l.label}
            </a>
          ))}
        </nav>

        {/* Desktop CTA */}
        <a href="#" onClick={e=>{e.preventDefault();onStart&&onStart()}} className="btn-gold hidden text-sm px-5 py-2.5 md:inline-flex">
          Start My Song
        </a>

        {/* Mobile hamburger */}
        <button
          onClick={() => setOpen(o => !o)}
          className="flex h-9 w-9 items-center justify-center text-cream/70 md:hidden"
          aria-label="Toggle menu"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
            {open ? (
              <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      <div
        className={`overflow-hidden transition-all duration-300 md:hidden ${
          open ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0'
        }`}
        style={{ background: 'rgba(15,23,42,0.97)', borderTop: '1px solid rgba(212,175,55,0.1)' }}
      >
        <div className="flex flex-col gap-0 px-6 py-4">
          {NAV_LINKS.map(l => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="border-b border-white/5 py-3.5 text-sm text-cream/60 hover:text-gold"
            >
              {l.label}
            </a>
          ))}
          <a href="#" onClick={e=>{e.preventDefault();setOpen(false);onStart&&onStart()}} className="btn-gold mt-4 text-sm">
            Start My Song
          </a>
        </div>
      </div>
    </header>
  )
}

/* ─── Hero ───────────────────────────────────────── */
function Hero({ onStart }) {
  const [active, setActive] = useState(0)
  const videoRefs = useRef([])

  useEffect(() => {
    const id = setInterval(() => {
      setActive(a => (a + 1) % HERO_VIDEOS.length)
    }, 7000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    videoRefs.current.forEach((v, i) => {
      if (!v) return
      if (i === active) { v.currentTime = 0; v.play().catch(() => {}) }
      else { v.pause() }
    })
  }, [active])

  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden">
      {/* Background videos — crossfade carousel */}
      {HERO_VIDEOS.map((src, i) => (
        <video
          key={src}
          ref={el => videoRefs.current[i] = el}
          muted
          loop
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
          style={{
            opacity: i === active ? 1 : 0,
            transition: 'opacity 1.2s ease-in-out',
          }}
        >
          <source src={src} type="video/mp4" />
        </video>
      ))}

      {/* Dark tint overlay */}
      <div className="absolute inset-0 bg-black/[0.45]" />

      {/* Film grain */}
      <div className="grain" />

      {/* Bottom fade to navy */}
      <div
        className="pointer-events-none absolute bottom-0 inset-x-0 h-56"
        style={{ background: 'linear-gradient(to top, #0F172A, transparent)' }}
      />

      {/* ── Content ── */}
      <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
        {/* Badge */}
        <div className="anim-1 mb-8 inline-flex max-w-[90vw] items-center gap-2.5 rounded-full border border-gold/35 bg-gold/[0.08] px-4 py-1.5 backdrop-blur-sm">
          <span className="h-1.5 w-1.5 flex-shrink-0 animate-pulse rounded-full bg-gold" />
          <span className="text-[clamp(0.58rem,1.8vw,0.7rem)] font-normal uppercase tracking-[clamp(0.1em,0.5vw,0.22em)] text-gold/90">
            Studio Quality · 24-Hour Delivery
          </span>
        </div>

        {/* Headline — balanced sizing so the full phrase reads as one thought */}
        <h1 className="anim-2 font-serif font-bold text-cream leading-[1.15] text-center">
          <span className="block text-2xl sm:text-3xl md:text-4xl font-medium tracking-wide text-cream mb-1">A Custom</span>
          <span className="block text-4xl sm:text-6xl md:text-7xl my-[0.1em]"><Ticker /></span>
          <span className="block text-2xl sm:text-3xl md:text-4xl font-medium tracking-wide text-cream mt-1">Written Just for <em className="font-normal italic text-cream/70">Them.</em></span>
        </h1>

        {/* CTA row */}
        <div className="anim-3 mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <button onClick={onStart} className="btn-gold px-8 py-4 text-base">
            Start My Song&nbsp;→
          </button>
          <button className="btn-ghost px-8 py-4 text-base">
            🎧&nbsp; Listen to Examples
          </button>
        </div>

        {/* Social proof */}
        <p className="anim-4 mt-10 text-[0.75rem] font-normal tracking-widest text-cream/55 uppercase">
          5,000+ Memories Created &nbsp;·&nbsp; ★★★★★ 4.9 / 5
        </p>
      </div>

      {/* Scroll cue */}
      <div className="absolute bottom-8 inset-x-0 flex flex-col items-center gap-1">
        <span className="text-[0.6rem] uppercase tracking-[0.25em] text-cream/25">Scroll</span>
        <div className="scroll-line" />
      </div>
    </section>
  )
}

/* ─── Occasion Pills ─────────────────────────────── */
const OCCASIONS = ['Birthday', 'Anniversary', 'Apology', 'Engagement', 'Memorial', 'Graduation', 'Just Because']

function OccasionPills({ onStart }) {
  return (
    <div className="flex flex-wrap gap-1.5 justify-center mt-3">
      {OCCASIONS.map(o => (
        <a
          key={o}
          href="#"
          onClick={e=>{e.preventDefault();onStart&&onStart()}}
          className="rounded-full border border-gold/30 bg-gold/[0.06] px-3 py-1 text-[0.68rem] tracking-wide text-gold/85 no-underline whitespace-nowrap transition-all hover:bg-gold/[0.18] hover:border-gold/60 hover:text-gold hover:scale-105"
        >
          {o}
        </a>
      ))}
    </div>
  )
}

/* ─── Genre Scroller ─────────────────────────────── */
function GenreScroller() {
  return (
    <div className="relative mt-4 max-w-full overflow-hidden">
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
        {GENRES.map(g => (
          <span
            key={g}
            className="flex-shrink-0 cursor-pointer rounded-full border border-gold/30 bg-gold/[0.06] px-4 py-1.5 text-xs tracking-wide text-gold/85 transition-all hover:border-gold/60 hover:bg-gold/[0.18] hover:text-gold inline-flex items-center gap-1.5"
          >
            <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor" className="flex-shrink-0"><polygon points="1,0 7,4 1,8"/></svg>
            {g}
          </span>
        ))}
      </div>
      <div className="pointer-events-none absolute top-0 right-0 bottom-2 w-12 bg-gradient-to-l from-navy to-transparent" />
    </div>
  )
}

/* ─── How It Works ───────────────────────────────── */
function HowItWorks({ onStart }) {
  return (
    <section id="how-it-works" className="py-28 md:py-36 px-6">
      <div className="mx-auto max-w-[76rem]">
        {/* Header */}
        <div className="mb-20 text-center">
          <span className="section-label">The Process</span>
          <h2 className="font-serif text-4xl font-bold text-cream md:text-5xl">
            Simple.&nbsp;
            <em className="font-normal italic text-cream/70">Magical.</em>
            &nbsp;Yours.
          </h2>
        </div>

        {/* Steps */}
        <div className="grid gap-14 md:grid-cols-4 md:gap-6 relative">
          {STEPS.map((step, i) => (
            <div key={i} className="step-card group overflow-hidden">
              {/* Step circle */}
              <div className="relative mb-6">
                <div
                  className="mx-auto flex h-20 w-20 items-center justify-center rounded-full transition-all duration-300 group-hover:scale-105"
                  style={{
                    background: 'radial-gradient(circle, rgba(212,175,55,0.08) 0%, transparent 70%)',
                    border: '1px solid rgba(212,175,55,0.25)',
                    boxShadow: '0 0 0 8px rgba(212,175,55,0.04)',
                  }}
                >
                  <span className="text-step-number font-serif text-3xl font-bold">
                    {step.num}
                  </span>
                </div>
              </div>

              <h3 className="font-serif text-xl font-semibold text-cream mb-3">
                {step.title}
              </h3>
              <p className="mx-auto max-w-[16rem] text-[0.85rem] font-light leading-relaxed text-cream/50">
                {step.body}
              </p>
              {step.hasOccasionPills && <OccasionPills onStart={onStart} />}
              {step.hasGenreScroller && <GenreScroller />}
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 flex justify-center">
          <a href="#" onClick={e=>{e.preventDefault();onStart&&onStart()}} className="btn-gold px-8 py-3.5 text-sm">
            Start My Song&nbsp;→
          </a>
        </div>
      </div>
    </section>
  )
}

/* ─── Waveform ───────────────────────────────────── */
function Waveform({ bars }) {
  const W = 120
  const H = 32
  const count = bars.length
  const barW = W / count

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      className="waveform-svg w-full"
      style={{ height: '2rem' }}
      aria-hidden="true"
    >
      {bars.map((h, i) => (
        <rect
          key={i}
          x={i * barW + barW * 0.15}
          y={(H - h) / 2}
          width={barW * 0.7}
          height={h}
          rx="1"
          className="waveform-bar"
          style={{ animationDelay: `${(i * 0.07).toFixed(2)}s` }}
        />
      ))}
    </svg>
  )
}

/* ─── Inspiration (Testimonials) ─────────────────── */
function Inspiration() {
  return (
    <section id="inspiration" className="py-28 md:py-36 px-6" style={{ background: 'linear-gradient(to bottom, transparent, rgba(30,41,59,0.25), transparent)' }}>
      <div className="mx-auto max-w-6xl">
        <div className="mb-16 text-center">
          <span className="section-label">Inspiration</span>
          <h2 className="font-serif text-4xl font-bold text-cream md:text-5xl">
            Songs That Stopped Time.
          </h2>
          <p className="mx-auto mt-5 max-w-md text-sm font-light leading-relaxed text-cream/45">
            These are the moments our artists live for.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className="testimonial-card flex flex-col">
              {/* Top row: stars + genre tag */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex gap-0.5">
                  {Array.from({ length: t.stars }).map((_, j) => (
                    <span key={j} className="text-gold text-sm">★</span>
                  ))}
                </div>
                <span className="text-[0.6rem] font-normal tracking-wider uppercase text-gold/60 px-2.5 py-0.5 rounded-full border border-gold/20">
                  {t.genre}
                </span>
              </div>

              {/* Quote mark */}
              <p className="font-serif text-3xl leading-none text-gold/30 mb-2">"</p>

              <p className="font-serif italic text-cream/80 text-lg leading-relaxed mb-5 flex-1">
                {t.quote}
              </p>

              {/* Player row: play button + waveform + duration */}
              <div className="flex items-center gap-3 mb-4">
                <button className="w-10 h-10 rounded-full border-[1.5px] border-gold/40 bg-gold/[0.08] flex items-center justify-center flex-shrink-0 transition-all hover:bg-gold/20 hover:border-gold/70 hover:scale-[1.08]">
                  <svg width="12" height="14" viewBox="0 0 12 14" fill="none" className="ml-0.5">
                    <path d="M1 1.5V12.5L11 7L1 1.5Z" fill="#D4AF37" stroke="#D4AF37" strokeWidth="1" strokeLinejoin="round"/>
                  </svg>
                </button>
                <div className="flex-1"><Waveform bars={t.wave} /></div>
                <span className="text-[0.7rem] font-normal text-cream/35 tabular-nums">{t.duration}</span>
              </div>

              {/* Song title */}
              <p className="text-[0.8rem] font-medium italic text-gold/50 mb-3">"{t.songTitle}"</p>

              {/* Attribution */}
              <div className="border-t border-gold/10 pt-3">
                <p className="text-sm font-medium text-cream/70">{t.name}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── Artist Card ────────────────────────────────── */
function ArtistCard({ artist: a }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      className="artist-card relative overflow-hidden"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Photo */}
      <div
        className="mx-auto mb-6 h-24 w-24 overflow-hidden rounded-full transition-all duration-400"
        style={{
          border: `2px solid ${hovered ? 'rgba(212,175,55,0.6)' : 'rgba(212,175,55,0.3)'}`,
          boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
          transform: hovered ? 'scale(1.12)' : 'scale(1)',
          transitionTimingFunction: 'cubic-bezier(0.34,1.56,0.64,1)',
        }}
      >
        <img src={a.photo} alt={a.name} className="h-full w-full object-cover" />
      </div>

      <h3 className="font-serif text-2xl font-semibold text-cream">{a.name}</h3>
      <span className="mt-1 block text-[0.68rem] uppercase tracking-[0.22em] text-gold/55 font-light">
        {a.genre}
      </span>
      <p className="mx-auto mt-4 max-w-xs text-sm font-light leading-relaxed text-cream/55">
        {a.bio}
      </p>
      <div className="mt-6 flex items-center justify-center gap-2">
        <span className="text-gold text-sm">♪</span>
        <span className="text-xs font-light text-cream/40">{a.songs} songs written</span>
      </div>
      <div className="mt-4 flex justify-center gap-0.5">
        {Array.from({ length: 5 }).map((_, j) => (
          <span key={j} className="text-gold/70 text-xs">★</span>
        ))}
      </div>

      {/* Hover quote overlay */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center rounded-[1.25rem] p-8"
        style={{
          background: 'rgba(15,23,42,0.92)',
          backdropFilter: 'blur(8px)',
          opacity: hovered ? 1 : 0,
          transform: hovered ? 'translateY(0)' : 'translateY(8px)',
          transition: hovered ? 'opacity 0.35s ease 0.15s, transform 0.35s ease 0.15s' : 'opacity 0.25s ease, transform 0.25s ease',
          pointerEvents: hovered ? 'auto' : 'none',
        }}
      >
        <div className="mb-4 h-14 w-14 overflow-hidden rounded-full border-2 border-gold/40">
          <img src={a.photo} alt={a.name} className="h-full w-full object-cover" />
        </div>
        <p className="font-serif italic text-[0.95rem] leading-relaxed text-cream/85 text-center">
          {a.quote}
        </p>
        <span className="mt-4 text-[0.7rem] font-medium tracking-wider uppercase text-gold/70">
          {a.name}
        </span>
      </div>
    </div>
  )
}

/* ─── Artists ────────────────────────────────────── */
function Artists() {
  return (
    <section id="artists" className="py-28 md:py-36 px-6">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-16 text-center">
          <span className="section-label">The Talent</span>
          <h2 className="font-serif text-4xl font-bold text-cream md:text-5xl">
            Meet the Artists.
          </h2>
        </div>

        {/* Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          {ARTISTS.map((a, i) => (
            <ArtistCard key={i} artist={a} />
          ))}
        </div>

        {/* Trust line */}
        <p className="mt-12 text-center text-xs font-light uppercase tracking-widest text-cream/25">
          All artists are vetted professionals · Nashville, LA & NYC based
        </p>
      </div>
    </section>
  )
}

/* ─── FAQ ────────────────────────────────────────── */
function FAQ() {
  const [openIdx, setOpenIdx] = useState(null)

  return (
    <section id="faq" className="py-28 md:py-36 px-6">
      <div className="mx-auto max-w-2xl">
        <div className="mb-16 text-center">
          <span className="section-label">Questions</span>
          <h2 className="font-serif text-4xl font-bold text-cream md:text-5xl">
            Frequently Asked
          </h2>
        </div>

        <div>
          {FAQS.map((faq, i) => {
            const isOpen = openIdx === i
            return (
              <div key={i} className="faq-item">
                <button
                  onClick={() => setOpenIdx(isOpen ? null : i)}
                  className="flex w-full items-start justify-between gap-6 py-6 text-left group"
                >
                  <span className="font-serif text-lg text-cream/85 transition-colors group-hover:text-gold leading-snug">
                    {faq.q}
                  </span>
                  <span
                    className="flex-shrink-0 mt-0.5 text-xl text-gold/60 transition-transform duration-300"
                    style={{ transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)' }}
                  >
                    +
                  </span>
                </button>
                <div
                  className="overflow-hidden transition-all duration-300"
                  style={{ maxHeight: isOpen ? '200px' : '0px' }}
                >
                  <p className="pb-6 text-sm font-light leading-relaxed text-cream/50">
                    {faq.a}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

/* ─── Final CTA ──────────────────────────────────── */
function FinalCTA({ onStart }) {
  return (
    <section className="px-6 pb-28 md:pb-36">
      <div className="mx-auto max-w-4xl">
        <div
          className="rounded-3xl p-12 md:p-20 text-center"
          style={{
            background: 'radial-gradient(ellipse 90% 80% at 50% 50%, rgba(212,175,55,0.06) 0%, transparent 70%)',
            border: '1px solid rgba(212,175,55,0.2)',
          }}
        >
          <span className="section-label">Ready?</span>

          <h2 className="font-serif text-4xl font-bold text-cream md:text-5xl mb-4">
            Their Song Is Waiting
            <br />
            <em className="font-normal italic text-cream/60">to Be Written.</em>
          </h2>

          <p className="mx-auto mt-6 max-w-sm text-sm font-light leading-relaxed text-cream/45">
            Join 5,000+ people who gave the one gift that can never be
            forgotten, returned, or replaced.
          </p>

          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <button onClick={onStart} className="btn-gold px-10 py-4 text-base">
              Start My Song&nbsp;→
            </button>
            <p className="text-xs font-light text-cream/30">
              24-hour delivery · Unlimited revisions
            </p>
          </div>

          {/* Decorative musical staff */}
          <div className="mt-12 flex items-center justify-center gap-1 opacity-10">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-px w-12 bg-cream" />
            ))}
            <span className="mx-2 font-serif text-2xl text-gold">♩</span>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-px w-12 bg-cream" />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─── Footer ─────────────────────────────────────── */
function Footer() {
  return (
    <footer
      className="border-t px-6 py-10"
      style={{ borderColor: 'rgba(212,175,55,0.1)' }}
    >
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 md:flex-row">
        <a href="#" className="font-serif text-lg tracking-wide text-gold">
          LifeSong
        </a>
        <p className="text-xs font-light text-cream/25">
          © {new Date().getFullYear()} LifeSong Inc. All rights reserved.
        </p>
        <div className="flex gap-6">
          {['Privacy', 'Terms', 'Contact'].map(l => (
            <a
              key={l}
              href="#"
              className="text-xs font-light text-cream/30 transition-colors hover:text-cream/70"
            >
              {l}
            </a>
          ))}
        </div>
      </div>
    </footer>
  )
}

/* ─── Spin-to-Win SMS Popup ──────────────────────── */
const WHEEL_SEGMENTS = [
  { label: '$5 OFF', color: '#1E293B' },
  { label: 'NO LUCK', color: '#162032' },
  { label: '$15 OFF', color: '#1E293B' },
  { label: '$10 OFF', color: '#162032' },
  { label: 'TRY AGAIN', color: '#1E293B' },
  { label: '$30 OFF', color: '#162032' },
]
const WINNING_INDEX = 5

function SpinPopup() {
  const [visible, setVisible] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const [phase, setPhase] = useState('spin')
  const [rotation, setRotation] = useState(0)
  const [phone, setPhone] = useState('')

  useEffect(() => {
    if (dismissed) return
    let timer = null
    let ready = false
    let scrolled = false
    timer = setTimeout(() => { ready = true; if (scrolled) setVisible(true) }, 10000)
    const onScroll = () => { scrolled = true; if (ready) setVisible(true) }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => { clearTimeout(timer); window.removeEventListener('scroll', onScroll) }
  }, [dismissed])

  const handleSpin = () => {
    if (phase !== 'spin') return
    setPhase('spinning')
    const segDeg = 360 / WHEEL_SEGMENTS.length
    const targetAngle = 360 - (WINNING_INDEX * segDeg + segDeg / 2)
    setRotation(360 * 6 + targetAngle)
    setTimeout(() => setPhase('won'), 4500)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!phone.trim()) return
    setPhase('submitted')
  }

  const close = () => { setVisible(false); setDismissed(true) }

  if (!visible || dismissed) return null

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={close}
    >
      <div
        onClick={e => e.stopPropagation()}
        className="relative rounded-3xl p-8"
        style={{
          width: 'min(420px, 92vw)',
          background: 'linear-gradient(145deg, #1E293B, #0F172A)',
          border: '1px solid rgba(212,175,55,0.25)',
          boxShadow: '0 32px 80px rgba(0,0,0,0.6), 0 0 80px rgba(212,175,55,0.06)',
        }}
      >
        <button
          onClick={close}
          className="absolute top-3 left-3 bg-transparent border-none text-cream/30 text-sm cursor-pointer p-1 leading-none transition-colors hover:text-cream/70"
        >
          ✕
        </button>

        {phase === 'submitted' ? (
          <div className="text-center py-8">
            <div className="text-5xl mb-4">🎉</div>
            <h3 className="font-serif text-2xl font-bold text-cream mb-3">You're All Set!</h3>
            <p className="text-sm text-cream/60 leading-relaxed">
              Check your texts for your <span className="text-gold font-semibold">$30 OFF</span> discount code.
            </p>
          </div>
        ) : phase === 'won' ? (
          <div className="text-center">
            <div className="text-4xl mb-2">🎊</div>
            <h3 className="font-serif text-[1.75rem] font-bold text-cream mb-1">
              Congratulations, you won <span className="text-gold">$30 off!</span>
            </h3>
            <p className="text-[0.9rem] text-cream/60 mt-3 mb-5">Sign up for SMS to collect your discount</p>
            <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
              <input
                type="tel"
                placeholder="(555) 123-4567"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="flex-1 rounded-xl border border-gold/30 bg-navy/80 text-cream text-[0.9rem] px-4 py-3 outline-none focus:border-gold/60"
              />
              <button
                type="submit"
                className="rounded-xl bg-gold text-navy font-semibold text-sm px-5 py-3 border-none cursor-pointer whitespace-nowrap transition-colors hover:bg-gold-light"
              >
                Claim
              </button>
            </form>
            <p className="text-[0.6rem] leading-snug text-cream/30 text-left">
              By sharing your text number, you consent to receive texts with updates about your song (e.g. links to your song when done), as well as updates from Lifesong about our products and occasional promotions. Consent is not a condition of purchase. Message and data rates may apply. We don't sell or share your data with any 3rd parties. Msg frequency varies. Msg and data rates may apply. View{' '}
              <a href="#" className="text-gold/50 underline">Terms</a> &{' '}
              <a href="#" className="text-gold/50 underline">Privacy</a>.
            </p>
          </div>
        ) : (
          <div className="text-center">
            <h3 className="font-serif text-xl font-bold text-cream mb-1">Spin to Win!</h3>
            <p className="text-[0.8rem] text-cream/50 mb-6">Try your luck for a discount on your custom song</p>

            {/* Wheel */}
            <div className="relative mx-auto mb-6" style={{ width: 220, height: 220 }}>
              {/* Pointer */}
              <div
                className="absolute top-[-10px] left-1/2 -translate-x-1/2 z-10"
                style={{
                  width: 0, height: 0,
                  borderLeft: '10px solid transparent', borderRight: '10px solid transparent',
                  borderTop: '16px solid #D4AF37',
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))',
                }}
              />
              <svg
                viewBox="0 0 200 200"
                style={{
                  width: 220, height: 220,
                  transform: `rotate(${rotation}deg)`,
                  transition: phase === 'spinning' ? 'transform 4s cubic-bezier(0.17,0.67,0.12,0.99)' : 'none',
                }}
              >
                {WHEEL_SEGMENTS.map((seg, idx) => {
                  const angle = 360 / WHEEL_SEGMENTS.length
                  const startAngle = idx * angle - 90
                  const endAngle = startAngle + angle
                  const startRad = (startAngle * Math.PI) / 180
                  const endRad = (endAngle * Math.PI) / 180
                  const x1 = 100 + 95 * Math.cos(startRad)
                  const y1 = 100 + 95 * Math.sin(startRad)
                  const x2 = 100 + 95 * Math.cos(endRad)
                  const y2 = 100 + 95 * Math.sin(endRad)
                  const midAngle = startAngle + angle / 2
                  const midRad = (midAngle * Math.PI) / 180
                  const textX = 100 + 60 * Math.cos(midRad)
                  const textY = 100 + 60 * Math.sin(midRad)
                  const isWinner = idx === WINNING_INDEX
                  return (
                    <g key={idx}>
                      <path
                        d={`M100,100 L${x1},${y1} A95,95 0 0,1 ${x2},${y2} Z`}
                        fill={isWinner ? 'rgba(212,175,55,0.2)' : seg.color}
                        stroke="rgba(212,175,55,0.15)" strokeWidth="0.5"
                      />
                      <text
                        x={textX} y={textY}
                        fill={isWinner ? '#D4AF37' : 'rgba(253,251,247,0.6)'}
                        fontSize="8" fontWeight={isWinner ? '700' : '500'}
                        textAnchor="middle" dominantBaseline="middle"
                        transform={`rotate(${midAngle + 90},${textX},${textY})`}
                      >
                        {seg.label}
                      </text>
                    </g>
                  )
                })}
                {/* Center circle */}
                <circle cx="100" cy="100" r="20" fill="#0F172A" stroke="rgba(212,175,55,0.3)" strokeWidth="1" />
                <text x="100" y="101" fill="#D4AF37" fontSize="9" fontWeight="700" textAnchor="middle" dominantBaseline="middle">SPIN</text>
              </svg>
            </div>

            <button
              onClick={handleSpin}
              disabled={phase === 'spinning'}
              className="btn-gold w-full py-3.5 text-base disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {phase === 'spinning' ? 'Spinning...' : 'Spin the Wheel!'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

/* ─── Intake Engine ──────────────────────────────── */
function FormField({ field, value, onChange, onAutoAdvance }) {
  if (field.type === 'text_input') {
    const hasLabel = !!field.label
    return (
      <div className="mb-6">
        {field.label && <div className="mb-2 text-xs uppercase tracking-widest text-cream/40">{field.label}</div>}
        <input
          type="text"
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && value && onAutoAdvance) onAutoAdvance() }}
          placeholder={field.placeholder}
          className={hasLabel
            ? "w-full rounded-xl border border-gold/20 bg-gold/[0.04] p-4 text-sm text-cream outline-none transition-colors focus:border-gold"
            : "w-full border-b-2 border-gold/25 bg-transparent py-4 font-serif text-xl italic text-cream outline-none transition-colors focus:border-gold"
          }
        />
      </div>
    )
  }

  if (field.type === 'textarea') {
    const len = (value || '').length
    return (
      <div className="mb-6">
        {field.label && <div className="mb-2 text-xs uppercase tracking-widest text-cream/40">{field.label}</div>}
        <textarea
          value={value || ''}
          onChange={e => { if (!field.maxLength || e.target.value.length <= field.maxLength) onChange(e.target.value) }}
          placeholder={field.placeholder}
          rows={4}
          className="w-full rounded-xl border border-gold/20 bg-gold/[0.04] p-4 text-sm text-cream outline-none transition-colors focus:border-gold"
          style={{ resize: 'vertical' }}
        />
        {field.maxLength && (
          <div className={`mt-1 text-right text-[0.7rem] ${len > field.maxLength * 0.9 ? 'text-gold' : 'text-cream/25'}`}>
            {len}/{field.maxLength}
          </div>
        )}
      </div>
    )
  }

  if (field.type === 'card_select') {
    return (
      <div className="grid grid-cols-2 gap-3">
        {field.options.map(opt => (
          <div key={opt.value}
            onClick={() => { onChange(opt.value); if (onAutoAdvance) setTimeout(onAutoAdvance, 350); }}
            className={`cursor-pointer rounded-xl border p-5 text-center transition-all ${opt.fullWidth ? 'col-span-2' : ''} ${value === opt.value ? 'border-gold bg-gold/[0.12] shadow-[0_0_20px_rgba(212,175,55,0.1)]' : 'border-gold/15 bg-gold/[0.04] hover:border-gold/40 hover:-translate-y-0.5'}`}
          >
            <div className="mb-2 text-[1.75rem]">{opt.emoji}</div>
            <div className="text-sm font-medium text-cream">{opt.label}</div>
          </div>
        ))}
      </div>
    )
  }

  if (field.type === 'pill_select') {
    return (
      <div className="mb-6">
        {field.label && <div className="mb-2 text-xs uppercase tracking-widest text-cream/40">{field.label}</div>}
        <div className="flex flex-wrap gap-2">
          {field.options.map(opt => (
            <div key={opt.value}
              onClick={() => onChange(opt.value)}
              className={`cursor-pointer rounded-full px-4 py-2 text-sm transition-all ${value === opt.value ? 'border border-gold bg-gold/15 font-medium text-gold' : 'border border-gold/20 bg-gold/[0.04] text-cream/70 hover:border-gold/50'}`}
            >{opt.label}</div>
          ))}
        </div>
      </div>
    )
  }

  if (field.type === 'multi_select') {
    const selected = value || []
    const toggle = (v) => {
      if (selected.includes(v)) {
        onChange(selected.filter(x => x !== v))
      } else if (!field.maxSelect || selected.length < field.maxSelect) {
        onChange([...selected, v])
      }
    }
    return (
      <div className="mb-6">
        {field.label && <div className="mb-2 text-xs uppercase tracking-widest text-cream/40">{field.label}</div>}
        {field.maxSelect && (
          <div className="mb-2 text-[0.7rem] text-gold/50">
            {selected.length} / {field.maxSelect} selected
          </div>
        )}
        <div className="flex flex-wrap gap-2">
          {field.options.map(opt => {
            const isSelected = selected.includes(opt.value)
            const atMax = field.maxSelect && selected.length >= field.maxSelect && !isSelected
            return (
              <div key={opt.value}
                onClick={() => !atMax && toggle(opt.value)}
                className={`rounded-full px-4 py-2 text-sm transition-all ${isSelected ? 'border border-gold bg-gold/15 font-medium text-gold' : atMax ? 'cursor-not-allowed border border-gold/20 bg-gold/[0.04] text-cream/25 opacity-40' : 'cursor-pointer border border-gold/20 bg-gold/[0.04] text-cream/70'}`}
              >{opt.label}</div>
            )
          })}
        </div>
      </div>
    )
  }

  if (field.type === 'segmented_control') {
    return (
      <div className="mb-6">
        {field.label && <div className="mb-2 text-xs uppercase tracking-widest text-cream/40">{field.label}</div>}
        <div className="flex overflow-hidden rounded-lg border border-gold/15 bg-gold/[0.06]">
          {field.options.map(opt => (
            <div key={opt.value}
              onClick={() => onChange(opt.value)}
              className={`flex-1 cursor-pointer py-3 text-center text-sm font-medium tracking-wide transition-all ${value === opt.value ? 'bg-gold/[0.18] text-gold' : 'text-cream/50 hover:bg-gold/[0.06] hover:text-cream'}`}
            >{opt.label}</div>
          ))}
        </div>
      </div>
    )
  }

  return null
}

function ReviewScreen({ formData, config, onEdit }) {
  const getLabelForValue = (field, val) => {
    if (!field.options) return val
    const opt = field.options.find(o => o.value === val)
    return opt ? opt.label : val
  }

  return (
    <div>
      {config.slice(0, -1).map((stepCfg, idx) => {
        const hasData = stepCfg.fields.some(f => {
          const v = formData[f.id]
          return v !== undefined && v !== '' && (!Array.isArray(v) || v.length > 0)
        })
        if (!hasData && stepCfg.id === 'personal') return null
        return (
          <div key={stepCfg.id} className="mb-4 rounded-xl border border-gold/10 bg-gold/[0.04] p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[0.7rem] uppercase tracking-widest text-gold/60">
                {stepCfg.questionText.replace(/[?.]/g, '').substring(0, 30)}
              </span>
              <button onClick={() => onEdit(idx)} className="border-none bg-transparent text-xs text-gold underline underline-offset-2">Edit</button>
            </div>
            {stepCfg.fields.map(f => {
              const val = formData[f.id]
              if (val === undefined || val === '' || (Array.isArray(val) && val.length === 0)) return null
              return (
                <div key={f.id} className="mb-1 text-sm text-cream">
                  {Array.isArray(val)
                    ? val.map(v => getLabelForValue(f, v)).join(', ')
                    : f.options ? getLabelForValue(f, val) : val
                  }
                </div>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}

function IntakeEngine({ onClose }) {
  const [step, setStep] = useState(0)
  const [formData, setFormData] = useState({ energy: 'medium' })
  const [direction, setDirection] = useState('forward')
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const totalSteps = FORM_CONFIG.length
  const config = FORM_CONFIG[step]

  const goNext = () => { if (step < totalSteps - 1) { setDirection('forward'); setStep(s => s + 1) } }
  const goBack = () => { if (step > 0) { setDirection('back'); setStep(s => s - 1) } }
  const goToStep = (n) => { setDirection(n > step ? 'forward' : 'back'); setStep(n) }
  const setValue = (fieldId, value) => { setFormData(d => ({ ...d, [fieldId]: value })) }

  const canProceed = !config || config.fields.every(f => {
    if (!f.required) return true
    const val = formData[f.id]
    if (Array.isArray(val)) return val.length > 0
    return val !== undefined && val !== ''
  })

  const handleSubmit = async () => {
    if (submitting) return
    setSubmitting(true)
    const { error } = await supabase.from('song_requests').insert({
      recipient_name: formData.recipientName,
      occasion: formData.occasion,
      tone: formData.tone,
      energy: formData.energy,
      feelings: formData.feelings,
      relationship: formData.relationship,
      themes: formData.themes,
      chorus_hook: formData.chorusHook || null,
      golden_memory: formData.goldenMemory || null,
      avoid: formData.avoid || null,
    })
    if (error) {
      console.error('Supabase insert error:', error)
      setSubmitting(false)
      return
    }
    setSubmitted(true)
  }

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-navy">
      {/* Top bar */}
      <div className="border-b border-gold/[0.12] bg-navy/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[40rem] items-center justify-between px-6 py-3">
          <button onClick={onClose} className="border-none bg-transparent text-lg text-cream/50 cursor-pointer">✕</button>
          <span className="font-serif text-lg tracking-wide text-gold">LifeSong</span>
          <span className="flex items-center gap-1.5 text-[0.65rem] uppercase tracking-widest text-gold/75">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-gold" />
            24-Hour Delivery
          </span>
        </div>
        <div className="h-0.5 bg-gold/[0.12]">
          <div className="h-0.5 transition-all duration-500" style={{ background: 'linear-gradient(90deg,#D4AF37,#F0D060)', width: `${((step + 1) / totalSteps) * 100}%` }} />
        </div>
      </div>

      {submitted ? (
        <div className="flex flex-1 items-center justify-center p-8 text-center">
          <div>
            <div className="mb-4 text-5xl">🎶</div>
            <h2 className="mb-3 font-serif text-[clamp(1.5rem,4vw,2.25rem)] font-normal text-cream">We're on it!</h2>
            <p className="mx-auto mb-8 max-w-sm text-base leading-relaxed text-cream/55">
              Your custom song is being crafted by one of our talented artists. We'll have it in your inbox within 24 hours.
            </p>
            <button onClick={onClose} className="btn-gold px-8 py-4 text-base">Back to LifeSong</button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex flex-1 items-center justify-center overflow-auto">
            <div key={step} className="w-full max-w-[36rem] px-6 py-8" style={{ animation: `slideIn${direction === 'forward' ? 'Left' : 'Right'} 0.3s ease-out` }}>
              <div className="mb-3 text-[0.65rem] uppercase tracking-[0.2em] text-gold/60">Step {step + 1} of {totalSteps}</div>
              <h2 className="mb-2 font-serif text-[clamp(1.5rem,4vw,2rem)] font-normal leading-tight text-cream">{config.questionText}</h2>
              <p className="mb-8 text-sm leading-relaxed text-cream/45">{config.subtext}</p>

              {config.id === 'review' ? (
                <ReviewScreen formData={formData} config={FORM_CONFIG} onEdit={goToStep} />
              ) : (
                config.fields.map(field => (
                  <FormField key={field.id} field={field} value={formData[field.id]} onChange={v => setValue(field.id, v)} onAutoAdvance={config.fields.length === 1 ? goNext : null} />
                ))
              )}
            </div>
          </div>

          <div className="border-t border-gold/[0.08] bg-navy/95 px-6 py-4 backdrop-blur-xl">
            <div className="mx-auto flex max-w-[36rem] items-center justify-between">
              {step > 0 ? (
                <button onClick={goBack} className="border-none bg-transparent text-sm tracking-wide text-cream/40 cursor-pointer hover:text-cream">← Back</button>
              ) : <span />}

              {config.id === 'personal' ? (
                <button onClick={goNext} className="btn-gold rounded-full px-8 py-3 text-sm font-semibold">
                  {canProceed ? 'Continue →' : 'Skip →'}
                </button>
              ) : (
                <button
                  onClick={config.id === 'review' ? handleSubmit : goNext}
                  disabled={submitting || (!canProceed && config.id !== 'review')}
                  className="rounded-full px-8 py-3 text-sm font-semibold tracking-wide transition-all"
                  style={{
                    background: canProceed || config.id === 'review' ? 'linear-gradient(135deg,#D4AF37,#B8962E)' : 'rgba(212,175,55,0.15)',
                    color: canProceed || config.id === 'review' ? '#0F172A' : 'rgba(253,251,247,0.25)',
                    cursor: submitting || (!canProceed && config.id !== 'review') ? 'not-allowed' : 'pointer',
                    opacity: submitting ? 0.6 : 1,
                    border: 'none',
                  }}
                >{config.id === 'review' ? (submitting ? 'Submitting…' : 'Submit My Song →') : 'Continue →'}</button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

/* ─── App ────────────────────────────────────────── */
export default function App() {
  const [showIntake, setShowIntake] = useState(false)

  useEffect(() => {
    if (window.location.hash === '#start') setShowIntake(true)
    const onHash = () => { if (window.location.hash === '#start') setShowIntake(true) }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const openIntake = () => setShowIntake(true)
  const closeIntake = () => { setShowIntake(false); window.location.hash = '' }

  return (
    <div className="min-h-screen bg-navy">
      <Nav onStart={openIntake} />
      <Hero onStart={openIntake} />
      <HowItWorks onStart={openIntake} />
      <Inspiration />
      <Artists />
      <FAQ />
      <FinalCTA onStart={openIntake} />
      <Footer />
      {!showIntake && <SpinPopup />}
      {showIntake && <IntakeEngine onClose={closeIntake} />}
    </div>
  )
}
