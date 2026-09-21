// Template data shared by the live server (src/routes/site.js) and the static build (scripts/build-static.js).
import { marked } from 'marked';
import { getSite, projects } from './db.js';

marked.setOptions({ gfm: true, breaks: false });
const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
export const headlineHtml = (h) => esc(h).replace(/\*([^*]+)\*/g, '<em>$1</em>');
export const md = (s) => marked.parse(s || '');

export function homeLocals(siteUrl, opts = {}) {
  const site = getSite(), list = projects.all();
  return { site, projects: list, clientProjects: list.map(p => ({ ...p, bodyHtml: md(p.body) })), headlineHtml: headlineHtml(site.headline), ...opts,
    meta: { title: `${site.name} — ${site.title}`, description: site.seo?.description || '', url: siteUrl + '/', image: siteUrl + '/og/default.png', type: 'website' } };
}
export function projectLocals(p, siteUrl, opts = {}) {
  const site = getSite(), others = projects.all().filter(x => x.id !== p.id).slice(0, 2);
  return { site, p, others, bodyHtml: md(p.body), ...opts,
    meta: { title: `${p.title} — ${site.name}`, description: p.summary, url: `${siteUrl}/work/${p.slug}`, image: `${siteUrl}/og/${p.slug}.png`, type: 'article' } };
}
export function notFoundLocals(path, siteUrl, opts = {}) {
  const site = getSite();
  return { site, path, ...opts, meta: { title: `Page not found — ${site.name}`, description: '', url: siteUrl + path, image: siteUrl + '/og/default.png', type: 'website' } };
}
export function sitemapXml(siteUrl) {
  const urls = [{ loc: siteUrl + '/', pri: '1.0' }, ...projects.all().map(p => ({ loc: `${siteUrl}/work/${p.slug}`, pri: '0.7', mod: p.updated_at }))];
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(u => `  <url><loc>${u.loc}</loc>${u.mod ? `<lastmod>${u.mod.slice(0, 10)}</lastmod>` : ''}<priority>${u.pri}</priority></url>`).join('\n')}\n</urlset>`;
}
export const robotsTxt = (siteUrl) => `User-agent: *\nAllow: /\nDisallow: /admin\nSitemap: ${siteUrl}/sitemap.xml\n`;
