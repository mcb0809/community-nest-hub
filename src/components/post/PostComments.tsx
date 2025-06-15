
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trash2, MessageCircle, Send } from 'lucide-react';
import { PostComment } from '@/hooks/usePostInteractions';
import { useAuth } from '@/hooks/useAuth';

interface PostCommentsProps {
  comments: PostComment[];
  onAddComment: (content: string) => Promise<void>;
  onDeleteComment: (commentId: string) => Promise<void>;
  showInput: boolean;
  onToggleInput: () => void;
}

const PostComments = ({ 
  comments, 
  onAddComment, 
  onDeleteComment, 
  showInput, 
  onToggleInput 
}: PostCommentsProps) => {
  const { user } = useAuth();
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      await onAddComment(newComment);
      setNewComment('');
      onToggleInput(); // Close the input after submitting
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-4">
      {/* Comments List */}
      {comments.length > 0 && (
        <div className="space-y-3 max-h-60 overflow-y-auto">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-3 p-3 bg-slate-800/30 rounded-lg border border-slate-700/50">
              <Avatar className="w-8 h-8 ring-2 ring-purple-500/30">
                <AvatarImage src={comment.user_profiles?.avatar_url} />
                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-cyan-500 text-white text-xs">
                  {comment.user_profiles?.display_name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-white text-sm">
                      {comment.user_profiles?.display_name || 'Unknown User'}
                    </span>
                    <span className="text-xs text-slate-400">
                      {formatDate(comment.created_at)}
                    </span>
                  </div>
                  
                  {user?.id === comment.user_id && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDeleteComment(comment.id)}
                      className="text-slate-400 hover:text-red-400 p-1 h-auto"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  )}
                </div>
                
                <p className="text-slate-300 text-sm mt-1 leading-relaxed">
                  {comment.content}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Comment Input */}
      {showInput && user && (
        <form onSubmit={handleSubmit} className="space-y-3 p-4 bg-slate-800/50 rounded-lg border border-slate-600">
          <div className="flex gap-3">
            <Avatar className="w-8 h-8 ring-2 ring-purple-500/30">
              <AvatarImage src={user.user_metadata?.avatar_url} />
              <AvatarFallback className="bg-gradient-to-br from-purple-500 to-cyan-500 text-white text-xs">
                {user.user_metadata?.display_name?.charAt(0) || user.email?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Viết bình luận của bạn..."
                className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 resize-none focus:outline-none focus:border-purple-500 text-sm"
                rows={3}
                disabled={submitting}
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onToggleInput}
              disabled={submitting}
              className="text-slate-400 hover:text-white"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={!newComment.trim() || submitting}
              className="bg-purple-500 hover:bg-purple-600 text-white"
            >
              <Send className="w-3 h-3 mr-1" />
              {submitting ? 'Đang đăng...' : 'Đăng'}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};

export default PostComments;
