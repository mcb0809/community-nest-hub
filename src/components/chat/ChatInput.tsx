
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  ArrowUp, 
  Smile, 
  Paperclip,
  Mic,
  X,
  Sparkles,
  Image,
  Upload
} from 'lucide-react';
import { cn } from '@/lib/utils';
import VoiceRecorder from './VoiceRecorder';
import FileAttachment from './FileAttachment';
import { useFileUpload } from '@/hooks/useFileUpload';

interface ChatInputProps {
  selectedChannel: string;
  onSendMessage: (message: string, replyTo?: string, attachments?: any[]) => void;
  replyTo?: {
    user: string;
    message: string;
  };
  onCancelReply?: () => void;
}

const ChatInput = ({ selectedChannel, onSendMessage, replyTo, onCancelReply }: ChatInputProps) => {
  const [message, setMessage] = useState('');
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [attachments, setAttachments] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadFile, uploading } = useFileUpload();

  const handleSend = () => {
    if (message.trim() || attachments.length > 0) {
      onSendMessage(message.trim() || '', undefined, attachments);
      setMessage('');
      setAttachments([]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    for (const file of Array.from(files)) {
      // Check file size (50MB limit)
      if (file.size > 50 * 1024 * 1024) {
        alert(`File ${file.name} is too large. Maximum size is 50MB.`);
        continue;
      }

      const attachment = await uploadFile(file);
      if (attachment) {
        setAttachments(prev => [...prev, attachment]);
      }
    }
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveAttachment = (attachmentId: string) => {
    setAttachments(prev => prev.filter(att => att.id !== attachmentId));
  };

  const handleVoiceMessage = (attachment: any) => {
    onSendMessage('', undefined, [attachment]);
  };

  if (showVoiceRecorder) {
    return (
      <div className="p-6 glass-card border-t border-purple-500/20">
        <VoiceRecorder
          onSendVoiceMessage={handleVoiceMessage}
          onClose={() => setShowVoiceRecorder(false)}
        />
      </div>
    );
  }

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

      {/* Attachments Preview */}
      {attachments.length > 0 && (
        <div className="mb-3 space-y-2">
          {attachments.map((attachment) => (
            <div key={attachment.id} className="relative">
              <FileAttachment
                fileName={attachment.file_name}
                fileType={attachment.file_type}
                fileSize={attachment.file_size}
                fileUrl={attachment.file_url}
              />
              <Button
                onClick={() => handleRemoveAttachment(attachment.id)}
                variant="ghost"
                size="sm"
                className="absolute top-1 right-1 h-6 w-6 p-0 bg-red-500/80 hover:bg-red-500 text-white rounded-full"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
      
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
                "bg-slate-800/50 border-slate-600/50 text-white placeholder-slate-400 pr-24 min-h-[44px]",
                "focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 neon-purple transition-all duration-300",
                "font-inter"
              )}
              disabled={uploading}
            />
            
            {/* Input Actions */}
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex space-x-1">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileSelect}
                accept="image/*,.json,.txt,audio/*"
                className="hidden"
              />
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0 text-slate-400 hover:text-purple-400 hover:bg-purple-500/20"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
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
              className="h-11 w-11 p-0 rounded-full text-slate-400 hover:text-purple-400 hover:bg-purple-500/20 transition-all duration-300"
              onClick={() => setShowVoiceRecorder(true)}
            >
              <Mic className="w-5 h-5" />
            </Button>
            
            <Button
              onClick={handleSend}
              disabled={(!message.trim() && attachments.length === 0) || uploading}
              className={cn(
                "h-11 w-11 p-0 rounded-full transition-all duration-300",
                (message.trim() || attachments.length > 0) && !uploading
                  ? "bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 neon-purple text-white"
                  : "bg-slate-700 text-slate-400 cursor-not-allowed"
              )}
            >
              <ArrowUp className="w-5 h-5" />
            </Button>
          </div>
        </div>
        
        {/* Character count and upload status */}
        <div className="flex justify-between items-center mt-2 text-xs text-slate-500">
          <div>
            {uploading && (
              <span className="text-purple-400">📎 Uploading...</span>
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
