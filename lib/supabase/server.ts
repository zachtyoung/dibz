import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

let _client: ReturnType<typeof createClient<Database>> | null = null;

export function getSupabaseAdmin() {
  if (!_client) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) throw new Error(`Supabase env vars missing. URL=${url} KEY=${key?.slice(0, 10)}`);
    _client = createClient<Database>(url, key, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }
  return _client;
}

export const supabaseAdmin = new Proxy({} as ReturnType<typeof createClient<Database>>, {
  get(_t, prop) {
    return getSupabaseAdmin()[prop as keyof ReturnType<typeof createClient<Database>>];
  },
});
