// Dumps the database (site content + projects) and uploaded images into content/ so they can be
// committed and used by CI builds (GitHub Actions) that have no database.
import 'dotenv/config';
import fs from 'node:fs/promises';
import path from 'node:path';
import { DATA_DIR, getSite, projects } from '../src/db.js';
const dir = path.resolve('content');
await fs.mkdir(dir, { recursive: true });
await fs.writeFile(path.join(dir, 'export.json'), JSON.stringify({ site: getSite(), projects: projects.all(true), exported: new Date().toISOString() }, null, 2));
try { await fs.rm(path.join(dir, 'uploads'), { recursive: true, force: true }); await fs.cp(path.join(DATA_DIR, 'uploads'), path.join(dir, 'uploads'), { recursive: true, filter: s => !s.endsWith('.gitkeep') }); } catch {}
console.log('Exported site content and projects to content/export.json (plus content/uploads/). Commit the content/ folder.');
