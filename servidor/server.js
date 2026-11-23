const { existsSync } = require('node:fs');
const { join } = require('node:path');
const { openState } = require('./state');
const { createApp } = require('../supabase/functions/aura-api/app.mjs');

for (const directory of new Set([__dirname, process.cwd()])) {
  for (const filename of ['.env.local', '.env']) {
    const path = join(directory, filename);
    if (existsSync(path)) process.loadEnvFile(path);
  }
}

const sandboxEnabled = process.env.FHS_SANDBOX === 'true' && process.env.NODE_ENV !== 'production';
const app = createApp({
  state: openState(sandboxEnabled),
  signingKey: process.env.JWT_SECRET,
  tokenExpiry: process.env.JWT_EXPIRES_IN,
  sandboxEnabled,
  bootstrapAdmin: {
    name: process.env.FHS_ADMIN_NAME,
    email: process.env.FHS_ADMIN_EMAIL,
    password: process.env.FHS_ADMIN_PASSWORD,
  },
});
const port = process.env.PORT || 4000;
const host = sandboxEnabled || process.env.FHS_LOOPBACK === 'true' ? '127.0.0.1' : '0.0.0.0';
app.listen(port, host, () => {
  console.log(`[Aura Spa] Escuchando en ${host}:${port}`);
  process.send?.('api-ready');
});
