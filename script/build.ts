import { build as esbuild } from "esbuild";
import { rm, readFile } from "fs/promises";

const allowlist = [
  "@google/generative-ai",
  "axios",
  "connect-pg-simple",
  "cors",
  "date-fns",
  "drizzle-orm",
  "drizzle-zod",
  "express",
  "express-rate-limit",
  "express-session",
  "jsonwebtoken",
  "memorystore",
  "multer",
  "nanoid",
  "nodemailer",
  "openai",
  "passport",
  "passport-local",
  "pg",
  "stripe",
  "uuid",
  "ws",
  "xlsx",
  "zod",
  "zod-validation-error",
];

async function buildAll() {
  // Clean previous build
  await rm("dist", { recursive: true, force: true });

  console.log("building client...");
  const { build: viteBuild } = await import("vite");
  await viteBuild();

  console.log("building server...");
  const pkg = JSON.parse(await readFile("package.json", "utf-8"));
  const allDeps = [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.devDependencies || {}),
  ];
  const externals = allDeps.filter((dep) => !allowlist.includes(dep));

  // ✅ Build server as ESM instead of CJS
  await esbuild({
  entryPoints: ["server/index.ts"],
  platform: "node",
  bundle: true,
  format: "esm",
  outfile: "dist/index.mjs",
  define: {
    "process.env.NODE_ENV": '"production"',
  },
  minify: true,
  external: [
    ...externals,
    // 👇 Add all native Node built-ins here
    "path",
    "url",
    "fs",
    "os",
    "crypto",
    "http",
    "https",
    "stream",
    "zlib",
    "util",
    "events",
    "querystring",
    "child_process",
    "net",
    "tls",
  ],
  logLevel: "info",
  target: ["node20"],
});

}

buildAll().catch((err) => {
  console.error(err);
  process.exit(1);
});
