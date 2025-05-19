
import { supabase } from '@/integrations/supabase/client';
import { UserPath, UserPathInput } from '@/types/user-paths';

/**
 * Fetches all paths for the current authenticated user
 */
export async function getUserPaths() {
  const { data, error } = await supabase
    .from('user_paths')
    .select('*')
    .order('path_name', { ascending: true });

  if (error) {
    console.error('Error fetching user paths:', error);
    throw error;
  }

  return data as UserPath[];
}

/**
 * Creates a new path for the current authenticated user
 */
export async function createUserPath(path: UserPathInput) {
  const { data, error } = await supabase
    .from('user_paths')
    .insert(path)
    .select()
    .single();

  if (error) {
    console.error('Error creating user path:', error);
    throw error;
  }

  return data as UserPath;
}

/**
 * Updates an existing path
 */
export async function updateUserPath(id: string, path: Partial<UserPathInput>) {
  const { data, error } = await supabase
    .from('user_paths')
    .update(path)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating user path:', error);
    throw error;
  }

  return data as UserPath;
}

/**
 * Deletes a user path
 */
export async function deleteUserPath(id: string) {
  const { error } = await supabase
    .from('user_paths')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting user path:', error);
    throw error;
  }

  return true;
}

/**
 * Gets a single path by name for the current user
 */
export async function getUserPathByName(pathName: string) {
  const { data, error } = await supabase
    .from('user_paths')
    .select()
    .eq('path_name', pathName)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 is "No rows returned" which is ok
    console.error('Error fetching user path:', error);
    throw error;
  }

  return data as UserPath | null;
}
