import { Router } from 'express';
import multer from 'multer';
import rateLimit from 'express-rate-limit';
import { getSite, settings, projects, messages, events } from '../db.js';
import { hasAdmin, setPassword, checkPassword, requireAuth, csrf, csrfCheck, passwordVersion } from '../auth.js';
import { storeImage, removeImage } from '../images.js';
import { mailConfigured } from '../mailer.js';
import { DEFAULT_SITE } from '../content.js';

const r = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024, files: 12 }, fileFilter: (req, f, cb) => cb(null, /^image\/(png|jpe?g|webp|gif|avif|heic|heif)$/i.test(f.mimetype)) });
const resumeUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 }, fileFilter: (req, f, cb) => cb(null, f.mimetype === 'application/pdf') });
const slugify = (s) => String(s).toLowerCase().normalize('NFKD').replace(/[^\w\s-]/g, '').trim().replace(/[\s_]+/g, '-').replace(/-+/g, '-').slice(0, 80);
const lines = (s) => String(s || '').split(/\r?\n/).map(x => x.trim()).filter(Boolean);
const csv = (s) => String(s || '').split(',').map(x => x.trim()).filter(Boolean);

r.use((req, res, next) => { res.locals.site = getSite(); res.locals.unread = messages.unread(); res.locals.path = req.path; res.locals.user = req.session?.user; next(); });

/* ── First-run setup & login ── */
const loginLimit = rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: 'draft-7', legacyHeaders: false, message: 'Too many attempts. Try again in 15 minutes.' });
r.get('/setup', csrf, (req, res) => hasAdmin() ? res.redirect('/admin/login') : res.render('admin/setup', { error: null }));
r.post('/setup', csrf, async (req, res) => {
  if (hasAdmin()) return res.redirect('/admin/login');
  const { password = '', confirm = '' } = req.body;
  if (password.length < 10) return res.render('admin/setup', { error: 'Use at least 10 characters.' });
  if (password !== confirm) return res.render('admin/setup', { error: 'Passwords do not match.' });
  await setPassword(password); req.session.user = 'admin'; req.session.pv = passwordVersion(); res.redirect('/admin');
});
r.get('/login', csrf, (req, res) => hasAdmin() ? res.render('admin/login', { error: null, next: req.query.next || '/admin' }) : res.redirect('/admin/setup'));
r.post('/login', loginLimit, csrf, async (req, res) => {
  if (await checkPassword(req.body.password || '')) { req.session.user = 'admin'; req.session.pv = passwordVersion(); const n = String(req.body.next || '/admin'); return res.redirect(n.startsWith('/admin') ? n : '/admin'); }
  res.status(401).render('admin/login', { error: 'Wrong password.', next: req.body.next || '/admin' });
});
r.post('/logout', csrf, (req, res) => { req.session = null; res.redirect('/admin/login'); });

r.use(requireAuth, csrf);

/* ── Dashboard ── */
r.get('/', (req, res) => {
  const all = projects.all(true), s = events.summary(30);
  res.render('admin/dashboard', { title: 'Dashboard', all, published: all.filter(p => p.status === 'published').length, drafts: all.filter(p => p.status === 'draft').length, stats: s, recent: messages.all().slice(0, 5), mail: mailConfigured() });
});

/* ── Projects ── */
r.get('/projects', (req, res) => res.render('admin/projects', { title: 'Projects', all: projects.all(true) }));
r.get('/projects/new', (req, res) => res.render('admin/project-form', { title: 'New project', p: { tags: [], gallery: [], links: {}, status: 'published', hue: 'a', seed: Date.now() % 7 + 1, featured: false }, isNew: true, error: null }));
r.get('/projects/:id', (req, res, next) => { const p = projects.byId(req.params.id); if (!p) return next(); res.render('admin/project-form', { title: `Edit: ${p.title}`, p, isNew: false, error: null }); });

async function readProjectForm(req, existing) {
  const b = req.body;
  const p = { title: String(b.title || '').trim(), slug: slugify(b.slug || b.title), kicker: b.kicker, year: b.year, tags: csv(b.tags), summary: b.summary, body: b.body,
    role: b.role, team: b.team, duration: b.duration, result_value: b.result_value, result_label: b.result_label, seed: b.seed, hue: b.hue, featured: !!b.featured, status: b.status,
    links: Object.fromEntries([['live', b.link_live], ['repo', b.link_repo], ['paper', b.link_paper]].filter(([, v]) => v && v.trim()).map(([k, v]) => [k, v.trim()])),
    cover: existing?.cover || '', gallery: existing?.gallery || [] };
  const files = req.files || {};
  if (b.remove_cover && p.cover) { await removeImage(p.cover); p.cover = ''; }
  if (files.cover?.[0]) { if (p.cover) await removeImage(p.cover); p.cover = await storeImage(files.cover[0].buffer); }
  const removeG = new Set([].concat(b.remove_gallery || []));
  for (const g of p.gallery.filter(g => removeG.has(g))) await removeImage(g);
  p.gallery = p.gallery.filter(g => !removeG.has(g));
  for (const f of files.gallery || []) p.gallery.push(await storeImage(f.buffer));
  return p;
}
const formFiles = upload.fields([{ name: 'cover', maxCount: 1 }, { name: 'gallery', maxCount: 10 }]);

r.post('/projects/new', formFiles, csrfCheck, async (req, res, next) => {
  try { const p = await readProjectForm(req, null);
    if (!p.title || !p.slug) return res.render('admin/project-form', { title: 'New project', p, isNew: true, error: 'Title is required.' });
    if (projects.bySlug(p.slug, true)) return res.render('admin/project-form', { title: 'New project', p, isNew: true, error: `The URL slug "${p.slug}" is already used by another project.` });
    const id = projects.create(p); req.session.flash = 'Project created.'; res.redirect(`/admin/projects/${id}`);
  } catch (e) { next(e); }
});
r.post('/projects/:id', formFiles, csrfCheck, async (req, res, next) => {
  try { const existing = projects.byId(req.params.id); if (!existing) return next();
    const p = await readProjectForm(req, existing);
    if (!p.title || !p.slug) return res.render('admin/project-form', { title: 'Edit project', p: { ...p, id: existing.id }, isNew: false, error: 'Title is required.' });
    const clash = projects.bySlug(p.slug, true); if (clash && clash.id !== existing.id) return res.render('admin/project-form', { title: 'Edit project', p: { ...p, id: existing.id }, isNew: false, error: `The URL slug "${p.slug}" is already used by another project.` });
    projects.update(existing.id, p); req.session.flash = 'Saved.'; res.redirect(`/admin/projects/${existing.id}`);
  } catch (e) { next(e); }
});
r.post('/projects/:id/delete', async (req, res, next) => {
  const p = projects.byId(req.params.id); if (!p) return next();
  await removeImage(p.cover); for (const g of p.gallery) await removeImage(g);
  projects.remove(p.id); req.session.flash = `Deleted "${p.title}".`; res.redirect('/admin/projects');
});
r.post('/projects/reorder', (req, res) => { const ids = [].concat(req.body.ids || []).map(Number).filter(Boolean); projects.reorder(ids); res.json({ ok: true }); });
r.post('/projects/:id/toggle', (req, res, next) => { const p = projects.byId(req.params.id); if (!p) return next(); projects.update(p.id, { ...p, status: p.status === 'draft' ? 'published' : 'draft' }); res.redirect('/admin/projects'); });

/* ── Site content ── */
r.get('/content', (req, res) => res.render('admin/content', { title: 'Site content', s: getSite(), saved: req.session.flash, error: null }));
r.post('/content', resumeUpload.single('resume'), csrfCheck, async (req, res) => {
  const b = req.body, cur = getSite();
  let resumeUrl = cur.resume_url || '';
  if (req.file) { const { storeFile } = await import('../images.js'); resumeUrl = await storeFile(req.file.buffer, 'resume.pdf'); }
  const pairs = (names, urls) => [].concat(names || []).map((n, i) => ({ label: String(n).trim(), url: String([].concat(urls || [])[i] || '').trim() })).filter(x => x.label);
  const s = { ...cur,
    name: b.name?.trim() || cur.name, initials: (b.initials || '').trim().slice(0, 3) || cur.initials, title: b.title?.trim() || '', tagline: b.tagline?.trim() || '',
    eyebrow: b.eyebrow?.trim() || '', headline: b.headline?.trim() || cur.headline, roles: lines(b.roles), location: b.location?.trim() || '', timezone: b.timezone?.trim() || 'UTC',
    available: !!b.available, availability_text: b.availability_text?.trim() || '', email: b.email?.trim() || '', skills: csv(b.skills),
    about_heading: b.about_heading?.trim() || '', about: String(b.about || '').split(/\n\s*\n/).map(x => x.trim()).filter(Boolean),
    stats: pairs(b.stat_value, b.stat_label).map(x => ({ value: x.label, label: x.url })),
    what_i_do: [].concat(b.wid_title || []).map((t, i) => ({ title: String(t).trim(), text: String([].concat(b.wid_text || [])[i] || '').trim() })).filter(x => x.title),
    skill_groups: [].concat(b.sg_name || []).map((n, i) => ({ name: String(n).trim(), items: csv([].concat(b.sg_items || [])[i]) })).filter(x => x.name),
    approach: lines(b.approach), career_goal: b.career_goal?.trim() || '',
    timeline: [].concat(b.tl_when || []).map((w, i) => ({ when: String(w).trim(), title: String([].concat(b.tl_title || [])[i] || '').trim(), text: String([].concat(b.tl_text || [])[i] || '').trim() })).filter(x => x.title),
    socials: pairs(b.social_label, b.social_url),
    seo: { description: b.seo_description?.trim() || '', keywords: b.seo_keywords?.trim() || '' },
    resume_url: (b.resume_url?.trim() || resumeUrl || '')
  };
  if (b.remove_resume) s.resume_url = '';
  settings.set('site', s); req.session.flash = 'Content saved.'; res.redirect('/admin/content');
});
r.post('/content/reset', (req, res) => { settings.set('site', DEFAULT_SITE); req.session.flash = 'Content reset to defaults.'; res.redirect('/admin/content'); });

/* ── Messages ── */
r.get('/messages', (req, res) => res.render('admin/messages', { title: 'Messages', list: messages.all(), mail: mailConfigured() }));
r.post('/messages/:id/read', (req, res) => { messages.markRead(req.params.id); res.redirect('/admin/messages'); });
r.post('/messages/:id/delete', (req, res) => { messages.remove(req.params.id); res.redirect('/admin/messages'); });

/* ── Analytics ── */
r.get('/analytics', (req, res) => { const days = [7, 30, 90].includes(Number(req.query.days)) ? Number(req.query.days) : 30; res.render('admin/analytics', { title: 'Analytics', days, s: events.summary(days) }); });

/* ── Password ── */
r.get('/password', (req, res) => res.render('admin/password', { title: 'Change password', error: null, ok: false }));
r.post('/password', async (req, res) => {
  const { current = '', password = '', confirm = '' } = req.body;
  if (!await checkPassword(current)) return res.render('admin/password', { title: 'Change password', error: 'Current password is wrong.', ok: false });
  if (password.length < 10 || password !== confirm) return res.render('admin/password', { title: 'Change password', error: 'New password must be 10+ characters and match.', ok: false });
  await setPassword(password); req.session.pv = passwordVersion(); res.render('admin/password', { title: 'Change password', error: null, ok: true });
});

r.use((req, res) => res.status(404).render('admin/error', { title: 'Not found', message: 'That admin page does not exist.' }));
export default r;
