import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

if (!url || !key) {
  // eslint-disable-next-line no-console
  console.warn(
    "VITE_SUPABASE_URL ou VITE_SUPABASE_PUBLISHABLE_KEY não configurados no .env",
  );
}

export const supabase = createClient(url, key);
