import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('Initializing Supabase with URL:', supabaseUrl ? 'URL present' : 'URL missing');

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Test the connection
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Supabase auth event:', event);
});

// Initialize storage bucket
async function initializeStorage() {
  try {
    // Check if bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('Error listing buckets:', listError.message);
      return;
    }

    const recipeImagesBucket = buckets?.find(bucket => bucket.name === 'recipe-images');
    
    if (!recipeImagesBucket) {
      console.warn('recipe-images bucket not found. Please create it manually in the Supabase dashboard with the following settings:\n' +
        '- Name: recipe-images\n' +
        '- Public bucket: Yes\n' +
        '- File size limit: 2MB\n' +
        '- Allowed mime types: image/jpeg, image/png, image/gif, image/webp');
    }
  } catch (error) {
    console.error('Error checking storage bucket:', error);
  }
}

// Initialize storage when the app starts
initializeStorage();

export default supabase;

