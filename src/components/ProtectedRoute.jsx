import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { isLoggedIn } from '../api'

// Checks the session with the server before rendering the protected page.
// Because the session is an HttpOnly cookie, we can't read it from JS —
// we have to ask the server if it's still valid.
export default function ProtectedRoute({ children }) {
  const [status, setStatus] = useState('checking') // 'checking' | 'ok' | 'denied'

  useEffect(() => {
    isLoggedIn()
      .then(ok => setStatus(ok ? 'ok' : 'denied'))
      .catch(() => setStatus('denied'))
  }, [])

  if (status === 'checking') return null  // Brief blank while verifying
  if (status === 'denied')   return <Navigate to="/login" replace />
  return children
}
