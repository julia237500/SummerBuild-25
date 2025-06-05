import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

<<<<<<< HEAD
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
=======
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;
>>>>>>> 1f10736925bcf75d717938419800fc0e885342a9
