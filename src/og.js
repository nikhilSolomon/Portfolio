import sharp from 'sharp';
import path from 'node:path';
import fs from 'node:fs/promises';
import { DATA_DIR } from './db.js';

const OG = path.join(DATA_DIR, 'og');
const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Word-wrap into lines of roughly `max` characters.
function wrap(text, max, maxLines) {
  const words = String(text).split(/\s+/), lines = []; let cur = '';
  for (const w of words) { if ((cur + ' ' + w).trim().length > max && cur) { lines.push(cur); cur = w; } else cur = (cur + ' ' + w).trim(); }
  if (cur) lines.push(cur);
  if (lines.length > maxLines) { lines.length = maxLines; lines[maxLines - 1] = lines[maxLines - 1].replace(/\W*\s\S*$/, '') + '…'; }
  return lines;
}

// 1200×630 social preview: dark ground, accent orbs, name, title, kicker.
export async function ogImage({ key, name, title, kicker, version }) {
  const file = path.join(OG, `${key}-${version}.png`);
  try { await fs.access(file); return file; } catch {}
  const lines = wrap(title, 26, 3), size = lines.length > 2 ? 64 : 76;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
    <defs>
      <radialGradient id="a" cx="20%" cy="30%" r="60%"><stop offset="0" stop-color="#3D55FF" stop-opacity=".75"/><stop offset="1" stop-color="#0B0D15" stop-opacity="0"/></radialGradient>
      <radialGradient id="b" cx="85%" cy="90%" r="55%"><stop offset="0" stop-color="#FF6A4D" stop-opacity=".55"/><stop offset="1" stop-color="#0B0D15" stop-opacity="0"/></radialGradient>
      <radialGradient id="c" cx="70%" cy="10%" r="40%"><stop offset="0" stop-color="#E8B400" stop-opacity=".35"/><stop offset="1" stop-color="#0B0D15" stop-opacity="0"/></radialGradient>
    </defs>
    <rect width="1200" height="630" fill="#0B0D15"/>
    <rect width="1200" height="630" fill="url(#a)"/><rect width="1200" height="630" fill="url(#b)"/><rect width="1200" height="630" fill="url(#c)"/>
    <text x="80" y="110" font-family="Helvetica, Arial, sans-serif" font-size="22" font-weight="500" letter-spacing="3" fill="#A2A8C0">${esc((kicker || '').toUpperCase())}</text>
    ${lines.map((l, i) => `<text x="80" y="${230 + i * (size * 1.12)}" font-family="Helvetica, Arial, sans-serif" font-size="${size}" font-weight="700" letter-spacing="-2" fill="#EEF0F7">${esc(l)}</text>`).join('')}
    <circle cx="92" cy="548" r="10" fill="#6C7DFF"/>
    <text x="118" y="558" font-family="Helvetica, Arial, sans-serif" font-size="28" font-weight="700" fill="#EEF0F7">${esc(name)}</text>
    <rect x="80" y="585" width="1040" height="4" fill="#FFD23F"/>
  </svg>`;
  await sharp(Buffer.from(svg)).png().toFile(file);
  return file;
}
