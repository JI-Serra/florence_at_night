import express from 'express'
import multer from 'multer'
import session from 'express-session'
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, unlinkSync, statSync } from 'fs'
import { join, dirname, extname } from 'path'
import { fileURLToPath } from 'url'
import crypto from 'crypto'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Global error handlers for debugging
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION:', err)
})
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION:', err)
})

// ── Load .env manually (no dotenv dependency) ─────────────────────
function loadEnv() {
  const envPath = join(__dirname, '.env')
  if (!existsSync(envPath)) return
  const lines = readFileSync(envPath, 'utf-8').split('\n')
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const idx = trimmed.indexOf('=')
    if (idx === -1) continue
    const key = trimmed.slice(0, idx).trim()
    const val = trimmed.slice(idx + 1).trim()
    if (!process.env[key]) process.env[key] = val
  }
}
loadEnv()

// ── Config ─────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000
const ADMIN_USER = process.env.ADMIN_USER || 'admin'
const ADMIN_PASS = process.env.ADMIN_PASS || 'florenceatnight2026'
const SESSION_SECRET = process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex')

const UPLOADS_DIR = join(__dirname, 'uploads')
const DIST_DIR = join(__dirname, 'dist')
const ADMIN_DIR = join(__dirname, 'admin')
const DATA_DIR = join(__dirname, 'data')

// Ensure directories exist
for (const dir of [UPLOADS_DIR, DATA_DIR]) {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
}

// ── Media Slots Definition ─────────────────────────────────────────
const MEDIA_SLOTS = [
  // ── Images: Hero ──
  {
    id: 'mainevent',
    label: 'Main Event (Hero)',
    description: 'Imagen principal del DJ o artista destacado. Aparece en el header de la página principal.',
    filename: 'mainevent.png',
    width: 800,
    height: 800,
    section: 'hero',
    type: 'image',
    format: 'PNG o JPG'
  },
  // ── Images: Booking Flyers ──
  {
    id: 'lunes',
    label: 'Lunes — YAB',
    description: 'Flyer del evento del Lunes. Aparece en la página de booking cuando se selecciona YAB (Monday).',
    filename: 'LUNES.jpeg',
    width: 1080,
    height: 1920,
    section: 'booking',
    type: 'image',
    format: 'JPG o PNG (vertical/story)'
  },
  {
    id: 'martes',
    label: 'Martes — Babylon',
    description: 'Flyer del evento del Martes. Aparece en la página de booking cuando se selecciona Babylon (Tuesday).',
    filename: 'MARTES.jpeg',
    width: 1168,
    height: 2048,
    section: 'booking',
    type: 'image',
    format: 'JPG o PNG (vertical/story)'
  },
  {
    id: 'miercoles',
    label: 'Miércoles — Space Club',
    description: 'Flyer del evento del Miércoles. Aparece en la página de booking cuando se selecciona Space Club (Wednesday).',
    filename: 'MIERCOLES.jpeg',
    width: 1080,
    height: 1920,
    section: 'booking',
    type: 'image',
    format: 'JPG o PNG (vertical/story)'
  },
  {
    id: 'jueves',
    label: 'Jueves — XO Club',
    description: 'Flyer del evento del Jueves. Aparece en la página de booking cuando se selecciona XO Club (Thursday).',
    filename: 'JUEVES.jpeg',
    width: 1168,
    height: 2048,
    section: 'booking',
    type: 'image',
    format: 'JPG o PNG (vertical/story)'
  },
  {
    id: 'viernes_space',
    label: 'Viernes — Space Club',
    description: 'Flyer del evento del Viernes en Space Club. Aparece en la página de booking (Friday - Space).',
    filename: 'VIERNES SPACE.jpeg',
    width: 1168,
    height: 2048,
    section: 'booking',
    type: 'image',
    format: 'JPG o PNG (vertical/story)'
  },
  {
    id: 'viernes_xo',
    label: 'Viernes — XO Club',
    description: 'Flyer del evento del Viernes en XO Club. Aparece en la página de booking (Friday - XO).',
    filename: 'VIERNES XO.png',
    width: 1168,
    height: 2048,
    section: 'booking',
    type: 'image',
    format: 'PNG o JPG (vertical/story)'
  },
  {
    id: 'sabado',
    label: 'Sábado — Babylon & XO',
    description: 'Flyer del evento del Sábado. Aparece en la página de booking cuando se selecciona Saturday.',
    filename: 'Sabado.png',
    width: 1168,
    height: 2048,
    section: 'booking',
    type: 'image',
    format: 'PNG o JPG (vertical/story)'
  },
  // ── Videos: Weekly Agenda ──
  {
    id: 'video_lunes',
    label: 'Video Lunes — YAB',
    description: 'Video de fondo de la tarjeta del Lunes en la Weekly Agenda. Se reproduce al hacer hover (desktop) o tap (mobile).',
    filename: 'videos weekly/FAN_Lunes.mp4',
    width: 1080,
    height: 1920,
    section: 'weekly_videos',
    type: 'video',
    format: 'MP4 (vertical, máx 50MB)'
  },
  {
    id: 'video_martes',
    label: 'Video Martes — Babylon',
    description: 'Video de fondo de la tarjeta del Martes en la Weekly Agenda. Se reproduce al hacer hover (desktop) o tap (mobile).',
    filename: 'videos weekly/FAN_Martes.mp4',
    width: 1080,
    height: 1920,
    section: 'weekly_videos',
    type: 'video',
    format: 'MP4 (vertical, máx 50MB)'
  },
  {
    id: 'video_miercoles',
    label: 'Video Miércoles — Space Club',
    description: 'Video de fondo de la tarjeta del Miércoles en la Weekly Agenda. Se reproduce al hacer hover (desktop) o tap (mobile).',
    filename: 'videos weekly/FAN_Miercoles.mp4',
    width: 1080,
    height: 1920,
    section: 'weekly_videos',
    type: 'video',
    format: 'MP4 (vertical, máx 50MB)'
  },
  {
    id: 'video_jueves',
    label: 'Video Jueves — XO Club',
    description: 'Video de fondo de la tarjeta del Jueves en la Weekly Agenda. Se reproduce al hacer hover (desktop) o tap (mobile).',
    filename: 'videos weekly/FAN_Jueves.mp4',
    width: 1080,
    height: 1920,
    section: 'weekly_videos',
    type: 'video',
    format: 'MP4 (vertical, máx 50MB)'
  },
  {
    id: 'video_viernes',
    label: 'Video Viernes — Space Club',
    description: 'Video de fondo de la tarjeta del Viernes en la Weekly Agenda. Se reproduce al hacer hover (desktop) o tap (mobile).',
    filename: 'videos weekly/SpaceClub_Viernes.mp4',
    width: 1080,
    height: 1920,
    section: 'weekly_videos',
    type: 'video',
    format: 'MP4 (vertical, máx 50MB)'
  },
  {
    id: 'video_sabado',
    label: 'Video Sábado — Babylon & XO',
    description: 'Video de fondo de la tarjeta del Sábado en la Weekly Agenda. Se reproduce al hacer hover (desktop) o tap (mobile).',
    filename: 'videos weekly/Saturday_FAN.mp4',
    width: 1080,
    height: 1920,
    section: 'weekly_videos',
    type: 'video',
    format: 'MP4 (vertical, máx 50MB)'
  }
]

// ── Ensure upload subdirectories exist ────────��─────────────────────
const uploadSubdirs = new Set(
  MEDIA_SLOTS.filter(s => s.filename.includes('/'))
    .map(s => join(UPLOADS_DIR, dirname(s.filename)))
)
for (const dir of uploadSubdirs) {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
}

// ── Multer config ──────────────────────────��───────────────────────
const storage = multer.diskStorage({
  destination: (req, _file, cb) => {
    const slot = MEDIA_SLOTS.find(s => s.id === req.params.slotId)
    if (!slot) return cb(new Error('Slot inválido'))
    const dir = join(UPLOADS_DIR, dirname(slot.filename))
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
    cb(null, dir)
  },
  filename: (req, _file, cb) => {
    const slot = MEDIA_SLOTS.find(s => s.id === req.params.slotId)
    if (!slot) return cb(new Error('Slot inválido'))
    // Only the basename (without subdirectory)
    const parts = slot.filename.split('/')
    cb(null, parts[parts.length - 1])
  }
})

const ALLOWED_IMAGE_MIME = ['image/jpeg', 'image/png', 'image/webp']
const ALLOWED_VIDEO_MIME = ['video/mp4', 'video/quicktime', 'video/webm', 'application/octet-stream']
const ALLOWED_VIDEO_EXT  = ['.mp4', '.mov', '.webm']

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max (videos can be ~25MB)
  fileFilter: (req, file, cb) => {
    const slot = MEDIA_SLOTS.find(s => s.id === req.params.slotId)
    if (!slot) return cb(new Error('Slot inválido'))

    const ext = extname(file.originalname).toLowerCase()

    if (slot.type === 'video') {
      if (ALLOWED_VIDEO_MIME.includes(file.mimetype) || ALLOWED_VIDEO_EXT.includes(ext)) cb(null, true)
      else cb(new Error('Solo se permiten videos (MP4, MOV, WebM)'))
    } else {
      if (ALLOWED_IMAGE_MIME.includes(file.mimetype)) cb(null, true)
      else cb(new Error('Solo se permiten imágenes (JPG, PNG, WebP)'))
    }
  }
})

// ── Express App ────────────────────────────────────────────────────
const app = express()
app.use(express.json())

// Session
app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}))

// ── Auth middleware ─────────────────────────────────────────────────
function requireAuth(req, res, next) {
  if (req.session && req.session.authenticated) return next()
  res.status(401).json({ error: 'No autorizado' })
}

// ── API Routes ─────────────────────────────────────────────────────

// Login
app.post('/api/login', (req, res) => {
  const { user, pass } = req.body
  if (user === ADMIN_USER && pass === ADMIN_PASS) {
    req.session.authenticated = true
    res.json({ ok: true })
  } else {
    res.status(401).json({ error: 'Credenciales incorrectas' })
  }
})

// Check auth status
app.get('/api/me', (req, res) => {
  res.json({ authenticated: !!(req.session && req.session.authenticated) })
})

// Logout
app.post('/api/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ ok: true })
  })
})

// ── Text config (artist name, etc.) ────────────────────────────────
const TEXT_CONFIG_PATH = join(DATA_DIR, 'texts.json')

function loadTexts() {
  if (existsSync(TEXT_CONFIG_PATH)) {
    return JSON.parse(readFileSync(TEXT_CONFIG_PATH, 'utf-8'))
  }
  return {}
}

function saveTexts(data) {
  writeFileSync(TEXT_CONFIG_PATH, JSON.stringify(data, null, 2), 'utf-8')
}

// Diagnostic endpoint — check server paths and file visibility
app.get('/api/debug', requireAuth, (_req, res) => {
  const uploadFiles = existsSync(UPLOADS_DIR) ? readdirSync(UPLOADS_DIR) : []
  const videosDir = join(UPLOADS_DIR, 'videos weekly')
  const videoFiles = existsSync(videosDir) ? readdirSync(videosDir) : []
  res.json({
    __dirname,
    UPLOADS_DIR,
    DIST_DIR,
    slots: MEDIA_SLOTS.map(s => {
      const uploadedPath = join(UPLOADS_DIR, s.filename)
      return { id: s.id, filename: s.filename, uploadedPath, found: existsSync(uploadedPath) }
    }),
    upload_dir_files: uploadFiles,
    videos_dir_files: videoFiles
  })
})

// List all media slots with current status
app.get('/api/media', requireAuth, (_req, res) => {
  const texts = loadTexts()
  const result = MEDIA_SLOTS.map(slot => {
    const uploadedPath = join(UPLOADS_DIR, slot.filename)
    const hasUpload = existsSync(uploadedPath)
    let updatedAt = null
    if (hasUpload) {
      const stat = statSync(uploadedPath)
      updatedAt = stat.mtime.toISOString()
    }
    // Build preview URL — encode each path segment separately for subdirs
    const encodedPath = slot.filename.split('/').map(encodeURIComponent).join('/')
    return {
      ...slot,
      hasUpload,
      updatedAt,
      previewUrl: `/${encodedPath}?t=${hasUpload ? Date.now() : 'default'}`
    }
  })
  res.json({ slots: result, texts })
})

// Get texts (public, no auth — used by the website)
app.get('/api/texts', (_req, res) => {
  res.json(loadTexts())
})

// Update a text value
app.post('/api/texts', requireAuth, (req, res) => {
  const { key, value } = req.body
  if (!key || typeof value !== 'string') {
    return res.status(400).json({ error: 'Falta key o value' })
  }
  const texts = loadTexts()
  texts[key] = value
  saveTexts(texts)
  res.json({ ok: true, message: `Texto "${key}" actualizado` })
})

// Upload file for a slot — always uses field name "file"
app.post('/api/upload/:slotId', requireAuth, (req, res) => {
  const slot = MEDIA_SLOTS.find(s => s.id === req.params.slotId)
  if (!slot) return res.status(400).json({ error: 'Slot no encontrado' })

  upload.single('file')(req, res, (err) => {
    if (err) {
      const msg = err instanceof multer.MulterError
        ? (err.code === 'LIMIT_FILE_SIZE' ? 'El archivo es demasiado grande (máx 50MB)' : err.message)
        : err.message
      console.error(`[upload] ERROR ${req.params.slotId}:`, msg)
      return res.status(400).json({ error: msg })
    }
    if (!req.file) {
      console.error(`[upload] NO FILE received for ${req.params.slotId}`)
      return res.status(400).json({ error: 'No se recibió ningún archivo' })
    }

    console.log(`[upload] OK ${req.params.slotId} → ${req.file.path} (${req.file.size} bytes)`)
    const mediaWord = slot.type === 'video' ? 'Video' : 'Imagen'
    res.json({
      ok: true,
      message: `${mediaWord} "${slot.label}" actualizado correctamente`,
      filename: slot.filename,
      updatedAt: new Date().toISOString()
    })
  })
})

// Delete uploaded file (restore to default)
app.delete('/api/upload/:slotId', requireAuth, (req, res) => {
  const slot = MEDIA_SLOTS.find(s => s.id === req.params.slotId)
  if (!slot) return res.status(400).json({ error: 'Slot no encontrado' })

  const uploadedPath = join(UPLOADS_DIR, slot.filename)
  if (existsSync(uploadedPath)) {
    unlinkSync(uploadedPath)
    const mediaWord = slot.type === 'video' ? 'Video' : 'Imagen'
    res.json({ ok: true, message: `${mediaWord} "${slot.label}" restaurado al original` })
  } else {
    res.json({ ok: true, message: 'No había archivo personalizado' })
  }
})

// ── Serve admin panel ──────────────────────────────────────────────
app.use('/admin', express.static(ADMIN_DIR))

// ── Serve media files: uploads override dist, never cached ────────
// Bypasses proxy-level caches (LiteSpeed, Apache mod_cache, etc.)
// that would otherwise ignore the uploads/ override after caching a dist/ response.
const MEDIA_EXTS = new Set(['.jpeg', '.jpg', '.png', '.webp', '.gif', '.mp4', '.mov', '.webm'])

app.use((req, res, next) => {
  const ext = extname(req.path).toLowerCase()
  if (!MEDIA_EXTS.has(ext)) return next()

  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
  res.setHeader('Surrogate-Control', 'no-store')
  res.setHeader('Pragma', 'no-cache')
  res.setHeader('Expires', '0')

  const filePath = decodeURIComponent(req.path).slice(1)
  const uploadedPath = join(UPLOADS_DIR, filePath)
  if (existsSync(uploadedPath)) return res.sendFile(uploadedPath)

  const distPath = join(DIST_DIR, filePath)
  if (existsSync(distPath)) return res.sendFile(distPath)

  next()
})

// ── Serve other static assets (JS, CSS, fonts) from dist/ ─────────
app.use(express.static(DIST_DIR, { maxAge: '1d' }))

// Fallback for SPA-like behavior (booking.html)
app.get('/booking.html', (_req, res) => {
  const uploadedBooking = join(UPLOADS_DIR, 'booking.html')
  const distBooking = join(DIST_DIR, 'booking.html')
  if (existsSync(uploadedBooking)) res.sendFile(uploadedBooking)
  else if (existsSync(distBooking)) res.sendFile(distBooking)
  else res.status(404).send('Not found')
})

// ── Start ──────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✦ Florence at Night — Server running on port ${PORT}`)
  console.log(`  Website:  http://localhost:${PORT}`)
  console.log(`  Admin:    http://localhost:${PORT}/admin`)
})
