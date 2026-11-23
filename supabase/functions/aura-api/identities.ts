import { createClient } from '@supabase/supabase-js';

type Identity = { id: string; email: string };
type AsyncAction = () => Promise<void>;

function env(name: string) {
  const value = Deno.env.get(name);
  if (!value) throw new Error(`Falta la variable ${name} de Supabase.`);
  return value;
}

const clientOptions = {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  global: {
    fetch: (input: RequestInfo | URL, init?: RequestInit) =>
      fetch(input, { ...init, signal: AbortSignal.timeout(8_000) }),
  },
};
const projectUrl = env('SUPABASE_URL');
const admin = createClient(projectUrl, env('SUPABASE_SERVICE_ROLE_KEY'), clientOptions).auth.admin;

export async function deleteIdentity(id: string) {
  const { error } = await admin.deleteUser(id);
  if (error && error.status !== 404) throw error;
}

export function identitiesForRequest(onRollback: (action: AsyncAction) => void, remove: (id: string) => void) {
  async function update(id: string, changes: { email?: string; email_confirm?: boolean; password?: string }) {
    const { error } = await admin.updateUserById(id, changes);
    if (error?.code === 'email_exists' || error?.code === 'user_already_exists') {
      throw Object.assign(new Error('Correo ya registrado.'), { code: 'EMAIL_ALREADY_EXISTS' });
    }
    if (error) throw error;
  }

  return {
    async create(email: string, password: string) {
      const { data, error } = await admin.createUser({ email, password, email_confirm: true });
      if (error?.code === 'email_exists' || error?.code === 'user_already_exists') {
        throw Object.assign(new Error('Correo ya registrado.'), { code: 'EMAIL_ALREADY_EXISTS' });
      }
      if (error) throw error;
      const id = data.user.id;
      onRollback(() => deleteIdentity(id));
      return { id };
    },
    async verify(user: Identity, password: string) {
      const auth = createClient(projectUrl, env('SUPABASE_ANON_KEY'), clientOptions).auth;
      const { data, error } = await auth.signInWithPassword({ email: user.email, password });
      if (error) {
        if (error.code === 'invalid_credentials' || error.code === 'user_banned') return false;
        throw error;
      }
      return data.user?.id === user.id;
    },
    async changePassword(user: Identity, password: string, currentPassword: string) {
      await update(user.id, { password });
      onRollback(() => update(user.id, { password: currentPassword }));
    },
    async changeEmail(user: Identity, email: string) {
      const oldEmail = user.email;
      await update(user.id, { email, email_confirm: true });
      onRollback(() => update(user.id, { email: oldEmail, email_confirm: true }));
    },
    remove,
  };
}
