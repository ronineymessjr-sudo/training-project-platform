const TOKEN_KEY = 'auth-token'

export function get(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function set(value: string): void {
  try {
    localStorage.setItem(TOKEN_KEY, value)
  } catch { console.error('Operation failed') }
}

export function remove(): void {
  try {
    localStorage.removeItem(TOKEN_KEY)
  } catch { console.error('Operation failed') }
}
