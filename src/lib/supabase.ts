import { createClient } from '@/utils/supabase/client';

export const supabase = createClient();

export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
  });
  if (error) console.error('Google Auth Error:', error.message);
  return { data, error };
}

export async function signInWithGithub() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
  });
  if (error) console.error('GitHub Auth Error:', error.message);
  return { data, error };
}
