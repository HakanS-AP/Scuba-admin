const express = require('express')
const path    = require('path')
const fs      = require('fs')

const app  = express()
const port = process.env.PORT || 8080

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
