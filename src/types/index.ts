
export interface Channel {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  created_at: string;
  updated_at?: string;
  created_by?: string;
}

export interface Message {
  id: string;
  content: string;
  channel_id: string;
  user_id: string;
  created_at: string;
  updated_at?: string;
  reactions?: Record<string, string[]>;
  reply_to?: string;
  user_profiles?: {
    display_name?: string;
    avatar_url?: string;
    role?: string;
    email?: string;
  };
  reply_message?: {
    content: string;
    user_profiles?: {
      display_name?: string;
    };
  };
  attachments?: {
    id: string;
    file_name: string;
    file_type: string;
    file_size: number;
    file_url: string;
  }[];
  user?: string;
  avatar?: string;
  message?: string;
  timestamp?: string;
  role?: 'admin' | 'mod' | 'user';
  replyTo?: {
    user: string;
    message: string;
  };
}
