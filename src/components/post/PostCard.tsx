
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Pin, 
  Edit, 
  Trash2, 
  MoreHorizontal,
  Download,
  ExternalLink,
  Crown,
  Youtube,
  Play,
  Sparkles
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Post } from '@/hooks/usePosts';
import { useAuth } from '@/hooks/useAuth';

interface PostCardProps {
  post: Post;
  onEdit?: (post: Post) => void;
  onDelete?: (postId: string) => void;
  onTogglePin?: (postId: string, isPinned: boolean) => void;
}

const PostCard = ({ post, onEdit, onDelete, onTogglePin }: PostCardProps) => {
  const { user, isAdmin } = useAuth();
  const isOwner = user?.id === post.user_id;
  const canManage = isOwner || isAdmin();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getVisibilityBadge = (visibility: string) => {
    switch (visibility) {
      case 'vip':
        return <Badge className="bg-purple-100 text-purple-800"><Crown className="w-3 h-3 mr-1" />VIP</Badge>;
      case 'draft':
        return <Badge variant="outline">📝 Bản nháp</Badge>;
      default:
        return <Badge variant="secondary">🌍 Công khai</Badge>;
    }
  };

  const handleDownloadAttachment = (url: string, name: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Extract YouTube videos from content
  const extractYouTubeVideos = (content: string) => {
    const regex = /\[YOUTUBE:([a-zA-Z0-9_-]{11})\]/g;
    const matches = [];
    let match;
    while ((match = regex.exec(content)) !== null) {
      matches.push(match[1]);
    }
    return matches;
  };

  // Remove YouTube markers from content for display
  const cleanContent = (content: string) => {
    return content.replace(/\[YOUTUBE:[a-zA-Z0-9_-]{11}\]/g, '').trim();
  };

  const youtubeVideos = post.content ? extractYouTubeVideos(post.content) : [];
  const displayContent = post.content ? cleanContent(post.content) : '';

  return (
    <Card className={`glass-card border border-slate-700/50 hover:border-purple-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10 ${
      post.is_pinned ? 'ring-2 ring-purple-500/50 bg-gradient-to-br from-purple-500/5 to-cyan-500/5' : ''
    }`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Avatar className="w-12 h-12 ring-2 ring-purple-500/30">
                <AvatarImage src={post.user_profiles?.avatar_url} />
                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-cyan-500 text-white font-semibold">
                  {post.user_profiles?.display_name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-slate-800"></div>
            </div>
            <div>
              <p className="font-semibold text-white">{post.user_profiles?.display_name || 'Unknown User'}</p>
              <p className="text-sm text-slate-400">{formatDate(post.created_at)}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {post.is_pinned && (
              <div className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full border border-blue-500/30">
                <Pin className="w-3 h-3 text-blue-400 fill-current" />
                <span className="text-xs font-medium text-blue-300">Ghim</span>
              </div>
            )}
            {getVisibilityBadge(post.visibility)}
            
            {canManage && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white hover:bg-slate-700">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-slate-800 border-slate-600">
                  <DropdownMenuItem onClick={() => onEdit?.(post)} className="text-slate-300 hover:bg-slate-700">
                    <Edit className="w-4 h-4 mr-2" />
                    Chỉnh sửa
                  </DropdownMenuItem>
                  {isAdmin() && (
                    <DropdownMenuItem onClick={() => onTogglePin?.(post.id, !post.is_pinned)} className="text-slate-300 hover:bg-slate-700">
                      <Pin className="w-4 h-4 mr-2" />
                      {post.is_pinned ? 'Bỏ ghim' : 'Ghim bài viết'}
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem 
                    onClick={() => onDelete?.(post.id)}
                    className="text-red-400 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Xóa
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        <h3 className="text-xl font-bold mt-4 leading-tight text-white group-hover:text-purple-200 transition-colors">
          {post.title}
        </h3>
      </CardHeader>

      <CardContent className="space-y-6">
        {displayContent && (
          <div className="prose prose-slate prose-invert max-w-none">
            <p className="text-slate-300 whitespace-pre-wrap leading-relaxed text-base">
              {displayContent}
            </p>
          </div>
        )}

        {/* YouTube Videos */}
        {youtubeVideos.length > 0 && (
          <div className="space-y-4">
            <h4 className="text-sm font-medium flex items-center gap-2 text-slate-300">
              <Youtube className="w-4 h-4 text-red-500" />
              Video ({youtubeVideos.length})
            </h4>
            <div className="grid gap-4">
              {youtubeVideos.map((videoId, index) => (
                <div key={index} className="relative group">
                  <div className="aspect-video bg-slate-900 rounded-lg overflow-hidden border border-slate-600 hover:border-purple-500/50 transition-colors">
                    <iframe
                      src={`https://www.youtube.com/embed/${videoId}`}
                      className="w-full h-full"
                      frameBorder="0"
                      allowFullScreen
                      title={`YouTube video ${index + 1}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag, index) => (
              <Badge 
                key={index} 
                variant="outline" 
                className="text-xs border-slate-600 text-slate-300 hover:bg-purple-500/20 hover:border-purple-500/50 cursor-pointer transition-all duration-200"
              >
                #{tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Attachments */}
        {post.attachments && post.attachments.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-slate-300">📎 Đính kèm ({post.attachments.length})</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {post.attachments.map((attachment) => (
                <div
                  key={attachment.id}
                  className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-600 hover:border-purple-500/50 transition-colors"
                >
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 rounded flex items-center justify-center flex-shrink-0">
                      {attachment.type === 'file' ? (
                        <Download className="w-4 h-4 text-purple-400" />
                      ) : (
                        <ExternalLink className="w-4 h-4 text-cyan-400" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate text-white">{attachment.name}</p>
                      {attachment.meta?.size && (
                        <p className="text-xs text-slate-400">
                          {Math.round(attachment.meta.size / 1024)} KB
                        </p>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDownloadAttachment(attachment.url, attachment.name)}
                    className="hover:bg-purple-500/20 text-purple-400 hover:text-purple-300"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-700">
          <div className="flex items-center space-x-6">
            <Button variant="ghost" size="sm" className="flex items-center gap-2 hover:bg-red-500/10 hover:text-red-400 text-slate-400 transition-colors">
              <Heart className="w-4 h-4" />
              <span className="text-sm">0</span>
            </Button>
            <Button variant="ghost" size="sm" className="flex items-center gap-2 hover:bg-blue-500/10 hover:text-blue-400 text-slate-400 transition-colors">
              <MessageCircle className="w-4 h-4" />
              <span className="text-sm">0</span>
            </Button>
          </div>
          <Button variant="ghost" size="sm" className="flex items-center gap-2 hover:bg-green-500/10 hover:text-green-400 text-slate-400 transition-colors">
            <Share2 className="w-4 h-4" />
            Chia sẻ
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PostCard;
