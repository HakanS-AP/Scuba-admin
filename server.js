const express = require('express')
const path    = require('path')
const fs      = require('fs')
const { X509Certificate } = require('node:crypto')

const app  = express()
const port = process.env.PORT || 8080

// SHA-256 thumbprint of the pinned Cloudflare client certificate, normalized
// to uppercase hex with no separators so it matches cert.fingerprint256 below.
const EXPECTED_THUMBPRINT = (process.env.CF_CLIENT_THUMBPRINT || '')
  .replace(/:/g, '')
  .toUpperCase()

if (!EXPECTED_THUMBPRINT) {
  throw new Error('CF_CLIENT_THUMBPRINT is required')
}

app.use((req, res, next) => {
  const header = req.headers['x-arr-clientcert']
  if (!header) return res.sendStatus(403)
  try {
    const pem = `-----BEGIN CERTIFICATE-----\n${header}\n-----END CERTIFICATE-----`
    const cert = new X509Certificate(pem)
    const thumbprint = cert.fingerprint256.replace(/:/g, '').toUpperCase()
    const now = new Date()
    const valid = thumbprint === EXPECTED_THUMBPRINT && now >= new Date(cert.validFrom) && now <= new Date(cert.validTo)
    if (!valid) {
      return res.sendStatus(403)
    }
  }
  catch {
    return res.sendStatus(403)
  }
  next()
})
// index:false so a request for "/" is NOT auto-served as raw index.html —
// otherwise express.static short-circuits "/" before the injection handler
// below runs, and the SPA loads with an empty window.__ENV__ (empty API_URL).
app.use(express.static(__dirname, { index: false }))

// Inject runtime config into index.html so the SPA can read it from
// window.__ENV__ without needing a rebuild when the API URL changes.
app.get('*', (_req, res) => {
  const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8')
  const injected = html.replace(
    '<head>',
    `<head><script>window.__ENV__ = { API_URL: "${process.env.API_URL || ''}" }</script>`
  )
  res.send(injected)
})

app.listen(port, () => console.log(`Admin frontend listening on port ${port}`))
