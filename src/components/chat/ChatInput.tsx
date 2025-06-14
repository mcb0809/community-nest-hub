
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Send, 
  Smile, 
  Paperclip,
  Mic,
  X,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  selectedChannel: string;
  onSendMessage: (message: string) => void;
  replyTo?: {
    user: string;
    message: string;
  };
  onCancelReply?: () => void;
}

const ChatInput = ({ selectedChannel, onSendMessage, replyTo, onCancelReply }: ChatInputProps) => {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="p-6 glass-card border-t border-purple-500/20">
      {/* Reply indicator */}
      {replyTo && (
        <div className="mb-3 flex items-center justify-between p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
          <div className="flex-1">
            <div className="text-xs text-purple-300 font-semibold mb-1">
              Replying to {replyTo.user}
            </div>
            <div className="text-sm text-slate-400 truncate">
              {replyTo.message}
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancelReply}
            className="h-6 w-6 p-0 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* AI Suggestion */}
      <div className="mb-3 p-3 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 rounded-lg border border-purple-500/20">
        <div className="flex items-center space-x-2 text-xs text-purple-300 mb-1">
          <Sparkles className="w-4 h-4" />
          <span className="font-semibold">AI Assistant</span>
        </div>
        <div className="text-sm text-slate-300">
          💡 Try asking: "Explain React hooks" or "Best practices for TypeScript"
        </div>
      </div>
      
      {/* Input Area */}
      <div className="relative">
        <div className="flex items-end space-x-3">
          {/* Main Input */}
          <div className="flex-1 relative">
            <Input 
              placeholder={`Message #${selectedChannel}`}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className={cn(
                "bg-slate-800/50 border-slate-600/50 text-white placeholder-slate-400 pr-24 min-h-[44px] resize-none",
                "focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 neon-purple transition-all duration-300",
                "font-inter"
              )}
            />
            
            {/* Input Actions */}
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex space-x-1">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0 text-slate-400 hover:text-purple-400 hover:bg-purple-500/20"
              >
                <Paperclip className="w-4 h-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0 text-slate-400 hover:text-purple-400 hover:bg-purple-500/20"
              >
                <Smile className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          {/* Voice/Send Button */}
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-11 w-11 p-0 rounded-full transition-all duration-300",
                isRecording 
                  ? "bg-red-500 hover:bg-red-600 text-white animate-pulse" 
                  : "text-slate-400 hover:text-purple-400 hover:bg-purple-500/20"
              )}
              onClick={() => setIsRecording(!isRecording)}
            >
              <Mic className="w-5 h-5" />
            </Button>
            
            <Button
              onClick={handleSend}
              disabled={!message.trim()}
              className={cn(
                "h-11 w-11 p-0 rounded-full transition-all duration-300",
                message.trim()
                  ? "bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 neon-purple text-white"
                  : "bg-slate-700 text-slate-400 cursor-not-allowed"
              )}
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </div>
        
        {/* Character count */}
        <div className="flex justify-between items-center mt-2 text-xs text-slate-500">
          <div>
            {isRecording && (
              <span className="text-red-400 animate-pulse">🔴 Recording...</span>
            )}
          </div>
          <div>
            {message.length}/2000
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;
