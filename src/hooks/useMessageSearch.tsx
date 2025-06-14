
import { useState, useMemo } from 'react';
import { Message } from '@/hooks/useChat';

export const useMessageSearch = (messages: Message[]) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredMessages = useMemo(() => {
    if (!searchQuery.trim()) return messages;
    
    return messages.filter(message => 
      message.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (message.user_profiles?.display_name || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [messages, searchQuery]);

  return {
    searchQuery,
    setSearchQuery,
    filteredMessages,
    hasActiveSearch: searchQuery.trim().length > 0
  };
};
