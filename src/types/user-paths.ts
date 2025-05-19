
export interface UserPath {
  id: string;
  user_id: string;
  path_name: string;
  path_value: string;
  created_at: string;
  updated_at: string;
}

export type UserPathInput = Pick<UserPath, 'path_name' | 'path_value'>;
