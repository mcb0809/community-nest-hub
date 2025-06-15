
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
  Play
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
    <Card className={`w-full transition-shadow hover:shadow-md ${post.is_pinned ? 'ring-2 ring-blue-200 bg-blue-50/20' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={post.user_profiles?.avatar_url} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                {post.user_profiles?.display_name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-sm">{post.user_profiles?.display_name || 'Unknown User'}</p>
              <p className="text-xs text-gray-500">{formatDate(post.created_at)}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {post.is_pinned && (
              <div className="flex items-center gap-1 text-blue-600">
                <Pin className="w-4 h-4 fill-current" />
                <span className="text-xs font-medium">Ghim</span>
              </div>
            )}
            {getVisibilityBadge(post.visibility)}
            
            {canManage && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => onEdit?.(post)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Chỉnh sửa
                  </DropdownMenuItem>
                  {isAdmin() && (
                    <DropdownMenuItem onClick={() => onTogglePin?.(post.id, !post.is_pinned)}>
                      <Pin className="w-4 h-4 mr-2" />
                      {post.is_pinned ? 'Bỏ ghim' : 'Ghim bài viết'}
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem 
                    onClick={() => onDelete?.(post.id)}
                    className="text-red-600"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Xóa
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        <h3 className="text-lg font-semibold mt-2 leading-tight">{post.title}</h3>
      </CardHeader>

      <CardContent className="space-y-4">
        {displayContent && (
          <div className="prose prose-sm max-w-none">
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{displayContent}</p>
          </div>
        )}

        {/* YouTube Videos */}
        {youtubeVideos.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Youtube className="w-4 h-4 text-red-500" />
              Video ({youtubeVideos.length})
            </h4>
            <div className="grid gap-3">
              {youtubeVideos.map((videoId, index) => (
                <div key={index} className="relative">
                  <div className="aspect-video bg-black rounded-lg overflow-hidden">
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
          <div className="flex flex-wrap gap-1">
            {post.tags.map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs hover:bg-gray-100 cursor-pointer">
                #{tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Attachments */}
        {post.attachments && post.attachments.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">📎 Đính kèm ({post.attachments.length})</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {post.attachments.map((attachment) => (
                <div
                  key={attachment.id}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center space-x-2 flex-1 min-w-0">
                    <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center flex-shrink-0">
                      {attachment.type === 'file' ? (
                        <Download className="w-4 h-4 text-blue-600" />
                      ) : (
                        <ExternalLink className="w-4 h-4 text-blue-600" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{attachment.name}</p>
                      {attachment.meta?.size && (
                        <p className="text-xs text-gray-500">
                          {Math.round(attachment.meta.size / 1024)} KB
                        </p>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDownloadAttachment(attachment.url, attachment.name)}
                    className="hover:bg-blue-100"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 border-t">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" className="flex items-center gap-1 hover:bg-red-50 hover:text-red-600 transition-colors">
              <Heart className="w-4 h-4" />
              <span className="text-sm">0</span>
            </Button>
            <Button variant="ghost" size="sm" className="flex items-center gap-1 hover:bg-blue-50 hover:text-blue-600 transition-colors">
              <MessageCircle className="w-4 h-4" />
              <span className="text-sm">0</span>
            </Button>
          </div>
          <Button variant="ghost" size="sm" className="flex items-center gap-1 hover:bg-green-50 hover:text-green-600 transition-colors">
            <Share2 className="w-4 h-4" />
            Chia sẻ
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PostCard;
