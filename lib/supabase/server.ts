import { createServerClient } from "@supabase/ssr";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import type { Database } from "./types";

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server component — middleware handles refresh
          }
        },
      },
    }
  );
}

let _adminClient: ReturnType<typeof createServiceClient<Database>> | null = null;

export function getSupabaseAdmin() {
  if (!_adminClient) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) throw new Error(`Supabase env vars missing. URL=${url} KEY=${key?.slice(0, 10)}`);
    _adminClient = createServiceClient<Database>(url, key, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }
  return _adminClient;
}

export const supabaseAdmin = new Proxy({} as ReturnType<typeof createServiceClient<Database>>, {
  get(_t, prop) {
    return getSupabaseAdmin()[prop as keyof ReturnType<typeof createServiceClient<Database>>];
  },
});
