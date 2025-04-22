
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          updated_at: string
          username: string | null
          full_name: string | null
          avatar_url: string | null
          employee_id: string | null
          company: string | null
          department: string | null
          division: string | null
          role: 'fa_admin' | 'requester' | 'receiver'
        }
        Insert: {
          id: string
          updated_at?: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          employee_id?: string | null
          company?: string | null
          department?: string | null
          division?: string | null
          role: 'fa_admin' | 'requester' | 'receiver'
        }
        Update: {
          id?: string
          updated_at?: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          employee_id?: string | null
          company?: string | null
          department?: string | null
          division?: string | null
          role?: 'fa_admin' | 'requester' | 'receiver'
        }
      }
      requests: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          requester_id: string
          document_name: string
          receiver_email: string
          file_path: string | null
          status: 'pending' | 'approved' | 'rejected' | 'rework' | 'completed'
          tracking_number: string | null
          admin_feedback: string | null
          is_delivered: boolean
          approved_by: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          requester_id: string
          document_name: string
          receiver_email: string
          file_path?: string | null
          status?: 'pending' | 'approved' | 'rejected' | 'rework' | 'completed'
          tracking_number?: string | null
          admin_feedback?: string | null
          is_delivered?: boolean
          approved_by?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          requester_id?: string
          document_name?: string
          receiver_email?: string
          file_path?: string | null
          status?: 'pending' | 'approved' | 'rejected' | 'rework' | 'completed'
          tracking_number?: string | null
          admin_feedback?: string | null
          is_delivered?: boolean
          approved_by?: string | null
        }
      }
    }
  }
}
