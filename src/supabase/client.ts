import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://gepwhrotbupiypuudupu.supabase.co";
const supabaseKey =
  "sb_publishable_9H0ZrzdigMqXyIzHxiTDjw_DWW1aQIP";

export const supabase = createClient(supabaseUrl, supabaseKey);