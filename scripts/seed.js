// Re-seeds site content and the default projects. Existing projects are kept unless --force.
import 'dotenv/config';
import { settings, projects, db } from '../src/db.js';
import { DEFAULT_SITE, DEFAULT_PROJECTS } from '../src/content.js';
const force = process.argv.includes('--force');
settings.set('site', DEFAULT_SITE);
if (force) db.exec('DELETE FROM projects');
const n = db.prepare('SELECT COUNT(*) c FROM projects').get().c;
if (n === 0) DEFAULT_PROJECTS.forEach((p, i) => projects.create({ ...p, sort_order: i + 1 }));
console.log(`Seeded site content${n === 0 ? ' and ' + DEFAULT_PROJECTS.length + ' projects' : ' (projects kept: ' + n + ')'}.`);
