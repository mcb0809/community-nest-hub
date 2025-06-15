
import React, { useState } from 'react';
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
  Sparkles,
  Image as ImageIcon
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Post } from '@/hooks/usePosts';
import { useAuth } from '@/hooks/useAuth';
import { useCommunityXP } from '@/hooks/useCommunityXP';

interface PostCardProps {
  post: Post;
  onEdit?: (post: Post) => void;
  onDelete?: (postId: string) => void;
  onTogglePin?: (postId: string, isPinned: boolean) => void;
}

const PostCard = ({ post, onEdit, onDelete, onTogglePin }: PostCardProps) => {
  const { user, isAdmin } = useAuth();
  const { handleLike, handleComment, handleShare } = useCommunityXP();
  const isOwner = user?.id === post.user_id;
  const canManage = isOwner || isAdmin();

  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [commentCount, setCommentCount] = useState(0);
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [commentText, setCommentText] = useState('');

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

  const handleLikeClick = async () => {
    if (!user?.id) return;

    try {
      await handleLike(post.id);
      setIsLiked(!isLiked);
      setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleCommentClick = () => {
    setShowCommentInput(!showCommentInput);
  };

  const handleCommentSubmit = async () => {
    if (!user?.id || !commentText.trim()) return;

    try {
      await handleComment(post.id);
      setCommentCount(prev => prev + 1);
      setCommentText('');
      setShowCommentInput(false);
    } catch (error) {
      console.error('Error commenting on post:', error);
    }
  };

  const handleShareClick = async () => {
    if (!user?.id) return;

    try {
      await handleShare(post.id);
      // Copy post link to clipboard
      const postUrl = `${window.location.origin}/community#post-${post.id}`;
      await navigator.clipboard.writeText(postUrl);
    } catch (error) {
      console.error('Error sharing post:', error);
    }
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

  // Handle YouTube thumbnail click
  const handleYouTubeClick = (videoId: string) => {
    const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;
    window.open(youtubeUrl, '_blank');
  };

  // Get image attachments
  const getImageAttachments = () => {
    return post.attachments?.filter(att => att.type === 'file' && att.meta?.type?.startsWith('image/')) || [];
  };

  const youtubeVideos = post.content ? extractYouTubeVideos(post.content) : [];
  const displayContent = post.content ? cleanContent(post.content) : '';
  const imageAttachments = getImageAttachments();

  // Create preview section with images/videos
  const renderPreviewMedia = () => {
    const hasYoutube = youtubeVideos.length > 0;
    const hasImages = imageAttachments.length > 0;
    
    if (!hasYoutube && !hasImages) return null;

    return (
      <div className="mb-4">
        {/* YouTube Thumbnails */}
        {hasYoutube && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
            {youtubeVideos.slice(0, 3).map((videoId, index) => (
              <div 
                key={index} 
                className="relative group cursor-pointer"
                onClick={() => handleYouTubeClick(videoId)}
              >
                <div className="aspect-video bg-slate-900 rounded-lg overflow-hidden border border-slate-600 hover:border-purple-500/50 transition-all duration-300">
                  <img
                    src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
                    alt={`YouTube thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
                    }}
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
                      <Play className="w-5 h-5 text-white ml-1" />
                    </div>
                  </div>
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ExternalLink className="w-4 h-4 text-white" />
                  </div>
                </div>
                {youtubeVideos.length > 3 && index === 2 && (
                  <div className="absolute inset-0 bg-black/60 rounded-lg flex items-center justify-center">
                    <span className="text-white font-semibold">+{youtubeVideos.length - 3}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Image Attachments */}
        {hasImages && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {imageAttachments.slice(0, 3).map((attachment, index) => (
              <div key={attachment.id} className="relative group cursor-pointer">
                <div className="aspect-square bg-slate-900 rounded-lg overflow-hidden border border-slate-600 hover:border-purple-500/50 transition-all duration-300">
                  <img
                    src={attachment.url}
                    alt={attachment.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <ImageIcon className="w-6 h-6 text-white" />
                  </div>
                </div>
                {imageAttachments.length > 3 && index === 2 && (
                  <div className="absolute inset-0 bg-black/60 rounded-lg flex items-center justify-center">
                    <span className="text-white font-semibold">+{imageAttachments.length - 3}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

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
        {/* Preview Media Section */}
        {renderPreviewMedia()}

        {displayContent && (
          <div className="prose prose-slate prose-invert max-w-none">
            <p className="text-slate-300 whitespace-pre-wrap leading-relaxed text-base line-clamp-3">
              {displayContent}
            </p>
          </div>
        )}

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {post.tags.slice(0, 5).map((tag, index) => (
              <Badge 
                key={index} 
                variant="outline" 
                className="text-xs border-slate-600 text-slate-300 hover:bg-purple-500/20 hover:border-purple-500/50 cursor-pointer transition-all duration-200"
              >
                #{tag}
              </Badge>
            ))}
            {post.tags.length > 5 && (
              <Badge variant="outline" className="text-xs border-slate-600 text-slate-400">
                +{post.tags.length - 5}
              </Badge>
            )}
          </div>
        )}

        {/* Media Count Indicators */}
        {(youtubeVideos.length > 0 || imageAttachments.length > 0 || (post.attachments && post.attachments.length > imageAttachments.length)) && (
          <div className="flex items-center gap-4 text-sm text-slate-400">
            {youtubeVideos.length > 0 && (
              <div className="flex items-center gap-1">
                <Youtube className="w-4 h-4 text-red-500" />
                <span>{youtubeVideos.length} video</span>
              </div>
            )}
            {imageAttachments.length > 0 && (
              <div className="flex items-center gap-1">
                <ImageIcon className="w-4 h-4 text-blue-500" />
                <span>{imageAttachments.length} ảnh</span>
              </div>
            )}
            {post.attachments && post.attachments.length > imageAttachments.length && (
              <div className="flex items-center gap-1">
                <Download className="w-4 h-4 text-green-500" />
                <span>{post.attachments.length - imageAttachments.length} file</span>
              </div>
            )}
          </div>
        )}

        {/* Comment Input */}
        {showCommentInput && (
          <div className="space-y-3 p-4 bg-slate-800/50 rounded-lg border border-slate-600">
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Viết bình luận của bạn..."
              className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 resize-none focus:outline-none focus:border-purple-500"
              rows={3}
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCommentInput(false)}
                className="text-slate-400 hover:text-white"
              >
                Hủy
              </Button>
              <Button
                size="sm"
                onClick={handleCommentSubmit}
                disabled={!commentText.trim()}
                className="bg-purple-500 hover:bg-purple-600 text-white"
              >
                Đăng
              </Button>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-700">
          <div className="flex items-center space-x-6">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleLikeClick}
              className={`flex items-center gap-2 transition-colors ${
                isLiked 
                  ? 'text-red-400 hover:text-red-300' 
                  : 'text-slate-400 hover:bg-red-500/10 hover:text-red-400'
              }`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
              <span className="text-sm">{likeCount}</span>
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleCommentClick}
              className="flex items-center gap-2 hover:bg-blue-500/10 hover:text-blue-400 text-slate-400 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span className="text-sm">{commentCount}</span>
            </Button>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleShareClick}
            className="flex items-center gap-2 hover:bg-green-500/10 hover:text-green-400 text-slate-400 transition-colors"
          >
            <Share2 className="w-4 h-4" />
            Chia sẻ
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PostCard;
