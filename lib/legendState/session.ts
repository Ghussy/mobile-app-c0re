import { observable } from "@legendapp/state";
import { supabase } from "../supabaseClient";

/**
 * States:
 *   user === undefined  →  Supabase session still hydrating
 *   user === null       →  Hydrated, but no authenticated user
 *   user === User       →  Logged‑in session
 */
export const session$ = observable<{ user: any | null | undefined }>({
  user: undefined,
});

supabase.auth.onAuthStateChange((_evt, session) => {
  session$.user.set(session?.user ?? null);
});
