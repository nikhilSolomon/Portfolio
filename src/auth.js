import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import { settings } from './db.js';

export const hasAdmin = () => !!settings.get('admin');
export async function setPassword(pw) { settings.set('admin', { hash: await bcrypt.hash(pw, 12), created: new Date().toISOString(), v: Date.now() }); }
export const passwordVersion = () => settings.get('admin')?.v || 0;
export async function checkPassword(pw) { const a = settings.get('admin'); return a ? bcrypt.compare(pw, a.hash) : false; }

export function requireAuth(req, res, next) {
  if (req.session?.user && req.session.pv === passwordVersion()) return next();
  if (req.session?.user) req.session = null; // password changed since this login
  if (!hasAdmin()) return res.redirect('/admin/setup');
  res.redirect('/admin/login?next=' + encodeURIComponent(req.originalUrl));
}

// Double-submit CSRF token stored in the signed session cookie.
export function csrf(req, res, next) {
  if (!req.session.csrf) req.session.csrf = crypto.randomBytes(24).toString('hex');
  res.locals.csrf = req.session.csrf;
  // Multipart bodies are parsed later by multer; those routes call csrfCheck after it.
  if (['POST', 'PUT', 'DELETE'].includes(req.method) && !req.is('multipart/form-data')) return csrfCheck(req, res, next);
  next();
}
export function csrfCheck(req, res, next) {
  const token = req.body?._csrf || req.get('x-csrf-token');
  if (!token || token !== req.session.csrf) return res.status(403).render('admin/error', { title: 'Session expired', message: 'Your form session expired. Go back, reload the page and try again.' });
  next();
}
