import sharp from 'sharp';
import path from 'node:path';
import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import { DATA_DIR } from './db.js';

const UP = path.join(DATA_DIR, 'uploads');

// Resizes to a sensible max, converts to WebP, returns the public URL path.
export async function storeImage(buffer, { maxWidth = 1800, quality = 82 } = {}) {
  const id = `${Date.now().toString(36)}-${crypto.randomBytes(4).toString('hex')}`;
  const out = path.join(UP, `${id}.webp`);
  await sharp(buffer, { failOn: 'none' }).rotate().resize({ width: maxWidth, withoutEnlargement: true }).webp({ quality }).toFile(out);
  return `/uploads/${id}.webp`;
}

export async function removeImage(urlPath) {
  if (!urlPath || !urlPath.startsWith('/uploads/')) return;
  const file = path.join(UP, path.basename(urlPath));
  try { await fs.unlink(file); } catch {}
}

// Stores a non-image file (e.g. the résumé PDF) under a fixed name.
export async function storeFile(buffer, name) {
  const out = path.join(UP, name);
  await fs.writeFile(out, buffer);
  return `/uploads/${name}?v=${Date.now().toString(36)}`;
}
