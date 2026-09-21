import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import crypto from 'node:crypto';
import { getSite, projects, messages, events } from '../db.js';
import { sendContactEmail } from '../mailer.js';
import { ogImage } from '../og.js';
import { homeLocals, projectLocals, notFoundLocals, sitemapXml, robotsTxt, md } from '../pages.js';

const r = Router();
const visitorId = (req) => crypto.createHash('sha256').update((req.ip || '') + '|' + (req.get('user-agent') || '') + '|' + new Date().toISOString().slice(0, 10)).digest('hex').slice(0, 16);
const ipHash = (req) => crypto.createHash('sha256').update(req.ip || '').digest('hex').slice(0, 16);
r.get('/', (req, res) => res.render('site', homeLocals(req.app.locals.siteUrl)));

r.get('/work/:slug', (req, res, next) => {
  const p = projects.bySlug(req.params.slug); if (!p) return next();
  res.render('project', projectLocals(p, req.app.locals.siteUrl));
});

// Project data for the in-page modal (rendered markdown included)
r.get('/api/projects', (req, res) => {
  res.set('Cache-Control', 'public, max-age=60');
  res.json(projects.all().map(p => ({ ...p, bodyHtml: md(p.body) })));
});

const contactLimit = rateLimit({ windowMs: 15 * 60 * 1000, limit: 5, standardHeaders: 'draft-7', legacyHeaders: false, message: { ok: false, error: 'Too many messages. Please try again later.' } });
r.post('/api/contact', contactLimit, async (req, res) => {
  const { name = '', email = '', subject = '', body = '', website = '', t = 0 } = req.body || {};
  if (website) return res.json({ ok: true }); // honeypot filled: pretend success
  if (Date.now() - Number(t) < 3000) return res.status(400).json({ ok: false, error: 'That was quick. Please try again.' });
  if (!name.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || body.trim().length < 10) return res.status(400).json({ ok: false, error: 'Please add your name, a valid email and a message of at least 10 characters.' });
  const clean = (s, n) => String(s).trim().slice(0, n);
  const id = messages.add({ name: clean(name, 120), email: clean(email, 200), subject: clean(subject, 200), body: clean(body, 5000), ip_hash: ipHash(req) });
  events.add({ type: 'contact', path: '/', visitor: visitorId(req) });
  try {
    const site = getSite(), to = process.env.CONTACT_TO || site.email;
    if (to && await sendContactEmail({ to, name: clean(name, 120), email: clean(email, 200), subject: clean(subject, 200), body: clean(body, 5000) })) messages.markEmailed(id);
  } catch (e) { console.error('[mail]', e.message); }
  res.json({ ok: true });
});

const eventLimit = rateLimit({ windowMs: 60 * 1000, limit: 60, standardHeaders: false, legacyHeaders: false });
r.post('/api/event', eventLimit, (req, res) => {
  const { type, path: p = '', ref = '' } = req.body || {};
  if (!['page_view', 'project_open', 'not_found', 'cta_click'].includes(type)) return res.status(400).end();
  if (/bot|crawl|spider|slurp|headless/i.test(req.get('user-agent') || '')) return res.status(204).end();
  events.add({ type, path: p, ref: ref.replace(/^https?:\/\//, '').split('/')[0], ua: req.get('user-agent'), visitor: visitorId(req) });
  res.status(204).end();
});

r.get('/og/:key.png', async (req, res, next) => {
  try {
    const site = getSite(); let file;
    if (req.params.key === 'default') file = await ogImage({ key: 'default', name: site.name, title: site.headline.replace(/\*/g, ''), kicker: site.title, version: crypto.createHash('md5').update(site.name + site.headline + site.title).digest('hex').slice(0, 8) });
    else { const p = projects.bySlug(req.params.key); if (!p) return next(); file = await ogImage({ key: p.slug, name: site.name, title: p.title, kicker: p.kicker, version: crypto.createHash('md5').update(p.title + p.kicker + p.updated_at).digest('hex').slice(0, 8) }); }
    res.set('Cache-Control', 'public, max-age=86400'); res.type('png').sendFile(file);
  } catch (e) { next(e); }
});

r.get('/sitemap.xml', (req, res) => res.type('application/xml').send(sitemapXml(req.app.locals.siteUrl)));
r.get('/robots.txt', (req, res) => res.type('text').send(robotsTxt(req.app.locals.siteUrl)));
r.get('/healthz', (req, res) => res.json({ ok: true }));

// 404: log it (skip obvious noise) and render the branded page
r.use((req, res) => {
  const ua = req.get('user-agent') || '';
  if (req.method === 'GET' && ua && !/bot|crawl|spider|scan|curl|python|go-http|headless/i.test(ua) && !/\.(php|env|git|xml|json|map|ico|png|jpg|txt|asp|aspx|cgi)$/i.test(req.path) && !/^\/(wp-|\.|cgi-bin|vendor|admin\/|phpmyadmin)/i.test(req.path)) events.add({ type: 'not_found', path: req.originalUrl, ref: req.get('referer') || '', ua: req.get('user-agent'), visitor: visitorId(req) });
  res.status(404).render('404', notFoundLocals(req.originalUrl, req.app.locals.siteUrl));
});

export default r;
