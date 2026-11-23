// @deno-types="npm:@types/express@4"
import express, { type Request, type Response } from 'express';
// @deno-types="npm:@types/cors@2"
import cors from 'cors';
import postgres from 'postgres';
import { createApp } from './app.mjs';
import { deleteIdentity, identitiesForRequest } from './identities.ts';

const databaseUrl = Deno.env.get('SUPABASE_DB_URL');
if (!databaseUrl) throw new Error('Falta la conexión de PostgreSQL.');
const db = postgres(databaseUrl, {
  max: 1,
  prepare: false,
  connect_timeout: 8,
  idle_timeout: 5,
});

type Snapshot = Record<string, unknown>;
type EndArguments = [chunk?: unknown, encoding?: unknown, callback?: unknown];
type Row = { key: string; payload: Snapshot };

function runRoute(app: ReturnType<typeof express>, req: Request, res: Response): Promise<EndArguments> {
  return new Promise((resolve, reject) => {
    const originalEnd = res.end;
    const closed = () => {
      res.end = originalEnd;
      reject(new Error('La solicitud se cerró antes de responder.'));
    };
    res.once('close', closed);
    res.end = ((...args: EndArguments) => {
      res.off('close', closed);
      res.end = originalEnd;
      resolve(args);
      return res;
    }) as typeof res.end;
    app(req, res);
  });
}

async function cleanDeletedAccounts() {
  const pending = await db<{ user_id: string }[]>`
    select user_id from aura_private.auth_removals order by created_at limit 5
  `;
  for (const { user_id } of pending) {
    try {
      await deleteIdentity(user_id);
      await db`delete from aura_private.auth_removals where user_id = ${user_id}`;
    } catch (error) {
      console.error('Supabase Auth: eliminación pendiente', (error as Error).name);
    }
  }
}

async function handleRequest(req: Request, res: Response) {
  const readOnly = req.method === 'GET' || req.method === 'HEAD';
  const rollbackActions: (() => Promise<void>)[] = [];
  const removals = new Set<string>();
  let result: EndArguments;
  try {
    result = await db.begin(async (tx) => {
      // Serializa toda escritura antes de leer. El mismo especialista o cliente
      // no puede aprobar dos reservas simultáneas desde instancias distintas.
      if (!readOnly) {
        await tx`set local lock_timeout = '8s'`;
        await tx`select pg_advisory_xact_lock(694206, 1)`;
      }
      const rows = await tx<Row[]>`select key, payload from aura_private.state`;
      const [{ signing_key }] = await tx<{ signing_key: string }[]>`
        select signing_key from aura_private.api_config where singleton
      `;
      const snapshots = new Map(rows.map(({ key, payload }) => [key, payload]));
      const pending = new Map<string, Snapshot>();
      const app = createApp({
        signingKey: signing_key,
        state: {
          read: (key: string, fallback: Snapshot) => snapshots.get(key) ?? fallback,
          write: (key: string, value: Snapshot) => pending.set(key, value),
        },
        identities: identitiesForRequest((action) => rollbackActions.push(action), (id) => removals.add(id)),
      });

      const output = await runRoute(app, req, res);
      if (!readOnly && res.statusCode < 400) {
        for (const [key, payload] of pending) {
          await tx`update aura_private.state set payload = ${JSON.stringify(payload)}::text::jsonb where key = ${key}`;
        }
        for (const id of removals) {
          await tx`insert into aura_private.auth_removals (user_id) values (${id}) on conflict do nothing`;
        }
      }
      return output;
    });
  } catch (error) {
    const code = (error as { code?: string }).code;
    console.error('Supabase: falló una operación de Aura Spa', (error as Error).name, code);
    const unavailable = code === '55P03';
    res.removeHeader('Content-Length');
    res.removeHeader('ETag');
    res.status(unavailable ? 503 : 500);
    result = [JSON.stringify({ message: 'No se pudo guardar la operación. Intenta de nuevo.' })];
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
  }

  if (res.statusCode >= 400) {
    for (const action of rollbackActions.reverse()) {
      try { await action(); } catch (error) {
        console.error('Supabase Auth: reversión pendiente', (error as Error).name);
      }
    }
  } else if (!readOnly) {
    try { await cleanDeletedAccounts(); } catch (error) {
      console.error('Supabase: eliminación pendiente', (error as Error).name);
    }
  }
  if (!res.destroyed) Reflect.apply(res.end, res, result);
}

const gateway = express();
gateway.disable('x-powered-by');
gateway.use(cors());
gateway.use(express.json({ limit: '32kb' }));
gateway.use('/aura-api', handleRequest);
gateway.use(handleRequest);
gateway.listen(3000);
