import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import { DEFAULT_SITE, DEFAULT_PROJECTS } from './content.js';

export const DATA_DIR = path.resolve(process.env.DATA_DIR || './data');
for (const d of [DATA_DIR, path.join(DATA_DIR, 'uploads'), path.join(DATA_DIR, 'og')]) fs.mkdirSync(d, { recursive: true });

export const db = new DatabaseSync(path.join(DATA_DIR, 'portfolio.db'));
db.exec('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');

db.exec(`
CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  kicker TEXT DEFAULT '',
  year TEXT DEFAULT '',
  tags TEXT DEFAULT '[]',
  summary TEXT DEFAULT '',
  body TEXT DEFAULT '',
  role TEXT DEFAULT '', team TEXT DEFAULT '', duration TEXT DEFAULT '',
  result_value TEXT DEFAULT '', result_label TEXT DEFAULT '',
  cover TEXT DEFAULT '',
  gallery TEXT DEFAULT '[]',
  links TEXT DEFAULT '{}',
  seed INTEGER DEFAULT 1, hue TEXT DEFAULT 'a',
  featured INTEGER DEFAULT 0,
  status TEXT DEFAULT 'published',
  sort_order INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT, email TEXT, subject TEXT, body TEXT,
  ip_hash TEXT, read INTEGER DEFAULT 0, emailed INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL, path TEXT DEFAULT '', ref TEXT DEFAULT '', ua TEXT DEFAULT '',
  visitor TEXT DEFAULT '', created_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_events_type_time ON events(type, created_at);
CREATE INDEX IF NOT EXISTS idx_projects_order ON projects(status, sort_order);
`);

const J = (v) => JSON.stringify(v);
const P = (s, fallback) => { try { return JSON.parse(s); } catch { return fallback; } };

export const settings = {
  get(key, fallback = null) { const r = db.prepare('SELECT value FROM settings WHERE key = ?').get(key); return r ? P(r.value, fallback) : fallback; },
  set(key, value) { db.prepare('INSERT INTO settings(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value = excluded.value').run(key, J(value)); }
};

export function getSite() { return { ...DEFAULT_SITE, ...(settings.get('site', {}) || {}) }; }

function inflate(row) {
  if (!row) return null;
  return { ...row, tags: P(row.tags, []), gallery: P(row.gallery, []), links: P(row.links, {}), featured: !!row.featured };
}

export const projects = {
  all(includeDrafts = false) {
    const rows = includeDrafts ? db.prepare('SELECT * FROM projects ORDER BY sort_order, id').all()
      : db.prepare("SELECT * FROM projects WHERE status = 'published' ORDER BY sort_order, id").all();
    return rows.map(inflate);
  },
  bySlug(slug, includeDrafts = false) {
    const r = db.prepare('SELECT * FROM projects WHERE slug = ?').get(slug);
    return r && (includeDrafts || r.status === 'published') ? inflate(r) : null;
  },
  byId(id) { return inflate(db.prepare('SELECT * FROM projects WHERE id = ?').get(id)); },
  create(p) {
    const max = db.prepare('SELECT COALESCE(MAX(sort_order),0) m FROM projects').get().m;
    const info = db.prepare(`INSERT INTO projects(slug,title,kicker,year,tags,summary,body,role,team,duration,result_value,result_label,cover,gallery,links,seed,hue,featured,status,sort_order)
      VALUES(@slug,@title,@kicker,@year,@tags,@summary,@body,@role,@team,@duration,@result_value,@result_label,@cover,@gallery,@links,@seed,@hue,@featured,@status,@sort_order)`)
      .run({ ...norm(p), sort_order: p.sort_order ?? max + 1 });
    return Number(info.lastInsertRowid);
  },
  update(id, p) {
    db.prepare(`UPDATE projects SET slug=@slug,title=@title,kicker=@kicker,year=@year,tags=@tags,summary=@summary,body=@body,role=@role,team=@team,duration=@duration,
      result_value=@result_value,result_label=@result_label,cover=@cover,gallery=@gallery,links=@links,seed=@seed,hue=@hue,featured=@featured,status=@status,updated_at=datetime('now') WHERE id=@id`)
      .run({ ...norm(p), id });
  },
  remove(id) { db.prepare('DELETE FROM projects WHERE id = ?').run(id); },
  reorder(ids) { const st = db.prepare('UPDATE projects SET sort_order = ? WHERE id = ?'); ids.forEach((id, i) => st.run(i + 1, id)); }
};
function norm(p) {
  return { slug: p.slug, title: p.title, kicker: p.kicker || '', year: p.year || '', tags: J(p.tags || []), summary: p.summary || '', body: p.body || '',
    role: p.role || '', team: p.team || '', duration: p.duration || '', result_value: p.result_value || '', result_label: p.result_label || '',
    cover: p.cover || '', gallery: J(p.gallery || []), links: J(p.links || {}), seed: Number(p.seed) || 1, hue: p.hue || 'a',
    featured: p.featured ? 1 : 0, status: p.status === 'draft' ? 'draft' : 'published' };
}

export const messages = {
  add(m) { db.prepare('DELETE FROM messages WHERE id <= (SELECT id FROM messages ORDER BY id DESC LIMIT 1 OFFSET 5000)').run(); return Number(db.prepare('INSERT INTO messages(name,email,subject,body,ip_hash) VALUES(?,?,?,?,?)').run(m.name, m.email, m.subject, m.body, m.ip_hash).lastInsertRowid); },
  markEmailed(id) { db.prepare('UPDATE messages SET emailed = 1 WHERE id = ?').run(id); },
  all() { return db.prepare('SELECT * FROM messages ORDER BY created_at DESC').all(); },
  unread() { return db.prepare('SELECT COUNT(*) c FROM messages WHERE read = 0').get().c; },
  markRead(id) { db.prepare('UPDATE messages SET read = 1 WHERE id = ?').run(id); },
  remove(id) { db.prepare('DELETE FROM messages WHERE id = ?').run(id); }
};

export const events = {
  add(e) { db.prepare('INSERT INTO events(type,path,ref,ua,visitor) VALUES(?,?,?,?,?)').run(e.type, (e.path || '').slice(0, 300), (e.ref || '').slice(0, 300), (e.ua || '').slice(0, 200), e.visitor || ''); },
  summary(days = 30) {
    const since = `-${days} days`;
    const q = (sql, ...a) => db.prepare(sql).all(...a);
    return {
      totals: db.prepare(`SELECT
        SUM(type='page_view') views, COUNT(DISTINCT CASE WHEN type='page_view' THEN visitor END) visitors,
        SUM(type='project_open') project_opens, SUM(type='not_found') not_found, SUM(type='contact') contacts
        FROM events WHERE created_at >= datetime('now', ?)`).get(since),
      daily: q(`SELECT date(created_at) day, SUM(type='page_view') views, COUNT(DISTINCT CASE WHEN type='page_view' THEN visitor END) visitors FROM events WHERE created_at >= datetime('now', ?) GROUP BY day ORDER BY day`, since),
      topProjects: q(`SELECT path, COUNT(*) n FROM events WHERE type='project_open' AND created_at >= datetime('now', ?) GROUP BY path ORDER BY n DESC LIMIT 10`, since),
      notFound: q(`SELECT path, COUNT(*) n, MAX(created_at) last FROM events WHERE type='not_found' AND created_at >= datetime('now', ?) GROUP BY path ORDER BY n DESC LIMIT 20`, since),
      referrers: q(`SELECT ref, COUNT(*) n FROM events WHERE type='page_view' AND ref <> '' AND created_at >= datetime('now', ?) GROUP BY ref ORDER BY n DESC LIMIT 10`, since),
      pages: q(`SELECT path, COUNT(*) n FROM events WHERE type='page_view' AND created_at >= datetime('now', ?) GROUP BY path ORDER BY n DESC LIMIT 10`, since)
    };
  },
  prune(days = 400, maxRows = 500000) {
    db.prepare("DELETE FROM events WHERE created_at < datetime('now', ?)").run(`-${days} days`);
    db.prepare('DELETE FROM events WHERE id <= (SELECT id FROM events ORDER BY id DESC LIMIT 1 OFFSET ?)').run(maxRows);
  }
};

export function seedIfEmpty() {
  // A committed content/export.json (from `npm run export`) wins over the built-in defaults on a fresh database.
  let exp = null; try { exp = JSON.parse(fs.readFileSync(path.resolve('content/export.json'), 'utf8')); } catch {}
  if (!settings.get('site')) settings.set('site', exp?.site || DEFAULT_SITE);
  const n = db.prepare('SELECT COUNT(*) c FROM projects').get().c;
  if (n === 0) (exp?.projects || DEFAULT_PROJECTS).forEach((p, i) => projects.create({ ...p, sort_order: p.sort_order ?? i + 1 }));
}
