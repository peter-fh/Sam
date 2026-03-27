import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

const supabase = createClient(
  supabaseUrl ? supabaseUrl : "https://qjdmulkugvgxzitgxcae.supabase.co",       // Production URL
  supabaseKey ? supabaseKey : "sb_publishable_5N2iVFJbte-Gccz-A9AYog_d0Imw7nX", // Production anonymous key, publishable since DB has RLS
)

export default supabase
