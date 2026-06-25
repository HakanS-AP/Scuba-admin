// Minimal static file server for the admin SPA on Azure Linux App Service.
// Oryx starts this with `npm start` after installing dependencies.
const express = require('express')
const path    = require('path')

const app  = express()
const port = process.env.PORT || 8080

// Serve compiled static files from the same directory as this file.
app.use(express.static(__dirname))

// Fall back to index.html for any path React Router doesn't recognise —
// this is what makes client-side navigation work on a direct URL hit.
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'))
})

app.listen(port, () => console.log(`Admin frontend listening on port ${port}`))
