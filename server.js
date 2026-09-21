import 'dotenv/config';
import express from 'express';
import cookieSession from 'cookie-session';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { DATA_DIR, seedIfEmpty, events } from './src/db.js';
import siteRoutes from './src/routes/site.js';
import adminRoutes from './src/routes/admin.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = Number(process.env.PORT || 3000);
const SECRET = process.env.SESSION_SECRET || (console.warn('[warn] SESSION_SECRET not set; using a random secret (logins reset on restart)'), crypto.randomBytes(32).toString('hex'));

seedIfEmpty();
events.prune(); setInterval(() => events.prune(), 3600 * 1000).unref();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('trust proxy', 1);
app.disable('x-powered-by');
app.locals.siteUrl = (process.env.SITE_URL || `http://localhost:${PORT}`).replace(/\/$/, '');

app.use((req, res, next) => {
  res.set('X-Content-Type-Options', 'nosniff'); res.set('X-Frame-Options', 'SAMEORIGIN'); res.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(express.json({ limit: '64kb' }));
app.use(cookieSession({ name: 'ps', keys: [SECRET], maxAge: 7 * 24 * 3600 * 1000, sameSite: 'lax', httpOnly: true, secure: process.env.NODE_ENV === 'production' }));

app.use('/uploads', express.static(path.join(DATA_DIR, 'uploads'), { maxAge: '30d', immutable: true, setHeaders: (res, p) => { if (p.endsWith('.pdf')) res.set('Content-Security-Policy', "default-src 'none'; style-src 'unsafe-inline'"); } }));
app.use(express.static(path.join(__dirname, 'public'), { maxAge: '1h', redirect: false }));

app.use('/admin', adminRoutes);
app.use('/', siteRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  if (res.headersSent) return next(err);
  res.status(err.status || 500).type('text').send(err.expose ? err.message : 'Something went wrong.');
});

app.listen(PORT, () => console.log(`Portfolio running on http://localhost:${PORT}  (admin: /admin)`));
