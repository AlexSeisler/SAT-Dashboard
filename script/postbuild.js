import { mkdir, stat, readdir, copyFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function ensureDir(dir) {
  try {
    await mkdir(dir, { recursive: true });
  } catch (_err) {
    // ignore
  }
}

async function copyRecursive(src, dest) {
  const s = await stat(src);
  if (s.isDirectory()) {
    await ensureDir(dest);
    const items = await readdir(src);
    await Promise.all(items.map((it) => copyRecursive(path.join(src, it), path.join(dest, it))));
  } else {
    await ensureDir(path.dirname(dest));
    await copyFile(src, dest);
  }
}

async function main() {
  const src = path.resolve(__dirname, '..', 'dist', 'public');
  const dest = path.resolve('.vercel', 'output', 'static');

  try {
    await copyRecursive(src, dest);
    console.log('Copied', src, '->', dest);
  } catch (err) {
    console.error('postbuild copy failed:', err);
    process.exit(1);
  }
}

main();
