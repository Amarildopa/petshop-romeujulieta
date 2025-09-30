import { supabase } from '../lib/supabase';

export interface User {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
}

export const authService = {
  async getCurrentUser(): Promise<User | null> {
    const { data, error } = await supabase.auth.getUser();
    
    if (error || !data.user) {
      return null;
    }
    
    return {
      id: data.user.id,
      email: data.user.email || '',
      name: data.user.user_metadata?.name,
      avatar_url: data.user.user_metadata?.avatar_url
    };
  },
  
  async signIn(email: string, password: string) {
    return await supabase.auth.signInWithPassword({ email, password });
  },
  
  async signOut() {
    return await supabase.auth.signOut();
  }
};