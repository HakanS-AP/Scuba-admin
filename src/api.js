const BASE_URL = window.__ENV__?.API_URL || import.meta.env.VITE_API_URL || ''

// All admin requests use credentials: 'include' so the browser automatically
// attaches the HttpOnly session cookie. The cookie is set by the server and is
// never readable by JavaScript — document.cookie will not show it.
export async function adminFetch(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    credentials: 'include', // Send the HttpOnly cookie with every request
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  if (res.status === 401) {
    window.location.href = '/login'
    throw new Error('Session expired — redirecting to login.')
  }

  if (!res.ok) {
    throw new Error(`Request failed with status ${res.status}`)
  }

  return res.json()
}

// Sends the password to the backend. On success the server sets an HttpOnly
// cookie — this function never sees or stores the session token.
export async function adminLogin(password) {
  const res = await fetch(`${BASE_URL}/api/admin/auth/verify`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  })

  if (res.status === 401) throw new Error('Invalid password.')
  if (!res.ok) throw new Error(`Login failed with status ${res.status}`)
  // No token to store — the browser holds the HttpOnly cookie automatically.
}

// Asks the server to clear the session cookie.
export async function adminLogout() {
  await fetch(`${BASE_URL}/api/admin/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  })
}

// Checks if a session cookie is likely present by attempting a lightweight
// authenticated request. We cannot read the cookie directly from JS.
export async function isLoggedIn() {
  try {
    const res = await fetch(`${BASE_URL}/api/admin/session`, {
      credentials: 'include',
    })
    return res.ok
  } catch {
    return false
  }
}
