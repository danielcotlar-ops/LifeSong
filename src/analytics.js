import mixpanel from 'mixpanel-browser'

const token = import.meta.env.VITE_MIXPANEL_TOKEN

export function initAnalytics() {
  if (!token) {
    console.warn('[analytics] VITE_MIXPANEL_TOKEN not set, skipping init')
    return
  }
  mixpanel.init(token, {
    track_pageview: false,
    persistence: 'localStorage',
  })
}

export function track(event, properties = {}) {
  if (!token) return
  mixpanel.track(event, properties)
}

export function identify(id, traits = {}) {
  if (!token) return
  mixpanel.identify(id)
  if (Object.keys(traits).length) mixpanel.people.set(traits)
}
