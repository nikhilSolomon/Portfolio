// Usage: npm run reset-password   (prompts) or: node scripts/reset-password.js "new password"
import 'dotenv/config';
import readline from 'node:readline/promises';
import { setPassword } from '../src/auth.js';
let pw = process.argv[2];
if (!pw) { const rl = readline.createInterface({ input: process.stdin, output: process.stdout }); pw = await rl.question('New admin password (10+ chars): '); rl.close(); }
if (!pw || pw.length < 10) { console.error('Password must be at least 10 characters.'); process.exit(1); }
await setPassword(pw); console.log('Admin password updated.');
