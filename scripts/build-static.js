// Renders the site to plain files in dist/ for static hosting (GitHub Pages, Netlify, Cloudflare Pages).
// Content comes from the local database if it exists, otherwise from content/export.json or the defaults.
import 'dotenv/config';
import fs from 'node:fs/promises';
import path from 'node:path';
import ejs from 'ejs';
import { fileURLToPath } from 'node:url';
import { DATA_DIR, seedIfEmpty, projects, getSite } from '../src/db.js';
import { homeLocals, projectLocals, notFoundLocals, sitemapXml, robotsTxt } from '../src/pages.js';
import { ogImage } from '../src/og.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, 'dist');
// SITE_URL in .env is often the local dev URL; the static build is for the real domain, so PUBLIC_URL wins, then a non-local SITE_URL, then the default.
const envUrl = process.env.PUBLIC_URL || process.env.SITE_URL || '';
const siteUrl = (/^https?:\/\/(localhost|127\.)/.test(envUrl) || !envUrl ? 'https://nikhilsolomon.com' : envUrl).replace(/\/$/, '');
const domain = new URL(siteUrl).hostname;

seedIfEmpty();
await fs.rm(out, { recursive: true, force: true });
await fs.mkdir(path.join(out, 'work'), { recursive: true });
const render = (view, locals) => ejs.renderFile(path.join(root, 'views', view + '.ejs'), { ...locals, staticMode: true }, { root: path.join(root, 'views') });
const write = async (rel, content) => { const f = path.join(out, rel); await fs.mkdir(path.dirname(f), { recursive: true }); await fs.writeFile(f, content); };

const site = getSite(), list = projects.all();
await write('index.html', await render('site', homeLocals(siteUrl)));
for (const p of list) await write(`work/${p.slug}/index.html`, await render('project', projectLocals(p, siteUrl)));
await write('404.html', await render('404', notFoundLocals('', siteUrl)));
await write('sitemap.xml', sitemapXml(siteUrl));
await write('robots.txt', robotsTxt(siteUrl));
await write('CNAME', domain + '\n');            // GitHub Pages custom domain
await write('.nojekyll', '');                     // let GitHub serve files/folders starting with _ or .

// Social preview images
await fs.mkdir(path.join(out, 'og'), { recursive: true });
const v = Date.now().toString(36);
await fs.copyFile(await ogImage({ key: 'default', name: site.name, title: site.headline.replace(/\*/g, ''), kicker: site.title, version: v }), path.join(out, 'og', 'default.png'));
for (const p of list) await fs.copyFile(await ogImage({ key: p.slug, name: site.name, title: p.title, kicker: p.kicker, version: v }), path.join(out, 'og', `${p.slug}.png`));

// Public assets (without the admin panel) and uploaded images
for (const f of ['site.css', 'site.js']) await fs.copyFile(path.join(root, 'public', f), path.join(out, f));
for (const dir of [path.join(DATA_DIR, 'uploads'), path.join(root, 'content', 'uploads')]) {
  try { await fs.cp(dir, path.join(out, 'uploads'), { recursive: true, filter: s => !s.endsWith('.gitkeep') }); } catch {}
}
const count = async (d) => { let n = 0; for (const e of await fs.readdir(d, { withFileTypes: true })) n += e.isDirectory() ? await count(path.join(d, e.name)) : 1; return n; };
console.log(`Static site written to dist/ (${await count(out)} files, ${list.length} projects, domain ${domain}).`);
