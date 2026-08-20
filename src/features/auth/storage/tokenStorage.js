const SESSION_KEY = 'ssah.session'

export const tokenStorage = {
  get() {
    try {
      const value = sessionStorage.getItem(SESSION_KEY)
      return value ? JSON.parse(value) : null
    } catch {
      return null
    }
  },
  set: (session) => sessionStorage.setItem(SESSION_KEY, JSON.stringify(session)),
  clear: () => sessionStorage.removeItem(SESSION_KEY),
}
