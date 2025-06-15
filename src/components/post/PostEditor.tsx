
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Youtube, Eye } from 'lucide-react';
import { Post, usePosts } from '@/hooks/usePosts';
import TagSelector from './TagSelector';
import AttachmentUploader from './AttachmentUploader';

interface PostEditorProps {
  post?: Post;
  onSubmit?: (post: Post) => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

const PostEditor = ({ post, onSubmit, onCancel, isLoading }: PostEditorProps) => {
  const [title, setTitle] = useState(post?.title || '');
  const [content, setContent] = useState(post?.content || '');
  const [tags, setTags] = useState<string[]>(post?.tags || []);
  const [visibility, setVisibility] = useState<'public' | 'vip' | 'draft'>(post?.visibility || 'public');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [youtubeUrls, setYoutubeUrls] = useState<string[]>([]);
  const [currentYoutubeUrl, setCurrentYoutubeUrl] = useState('');
  
  const { createPost, updatePost } = usePosts();

  const extractYouTubeId = (url: string) => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const addYouTubeUrl = () => {
    if (currentYoutubeUrl.trim() && extractYouTubeId(currentYoutubeUrl)) {
      setYoutubeUrls([...youtubeUrls, currentYoutubeUrl.trim()]);
      setCurrentYoutubeUrl('');
    }
  };

  const removeYouTubeUrl = (index: number) => {
    setYoutubeUrls(youtubeUrls.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      let finalContent = content;
      
      // Add YouTube embeds to content
      if (youtubeUrls.length > 0) {
        const youtubeEmbeds = youtubeUrls.map(url => {
          const videoId = extractYouTubeId(url);
          return `\n\n[YOUTUBE:${videoId}]`;
        }).join('');
        finalContent += youtubeEmbeds;
      }

      const postData = {
        title,
        content: finalContent,
        tags,
        visibility
      };

      let result;
      if (post) {
        result = await updatePost(post.id, postData);
      } else {
        result = await createPost(postData);
      }

      // Upload attachments if any
      if (attachments.length > 0 && result) {
        // Handle attachment uploads here if needed
      }

      onSubmit?.(result);
    } catch (error) {
      console.error('Error saving post:', error);
    }
  };

  const handleSaveDraft = async () => {
    const draftData = {
      title: title || 'Untitled Draft',
      content,
      tags,
      visibility: 'draft' as const
    };

    try {
      if (post) {
        await updatePost(post.id, draftData);
      } else {
        await createPost(draftData);
      }
      onCancel?.();
    } catch (error) {
      console.error('Error saving draft:', error);
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="w-5 h-5" />
          {post ? 'Chỉnh sửa bài viết' : 'Tạo bài viết mới'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-2">Tiêu đề bài viết</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nhập tiêu đề hấp dẫn cho bài viết..."
              required
              className="text-lg font-medium"
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium mb-2">Nội dung bài viết</label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Viết nội dung chi tiết cho bài viết của bạn... Bạn có thể sử dụng Markdown để định dạng text."
              rows={10}
              className="resize-none min-h-[200px]"
            />
            <p className="text-xs text-gray-500 mt-1">
              Hỗ trợ Markdown: **bold**, *italic*, `code`, [link](url)
            </p>
          </div>

          {/* YouTube Videos */}
          <div>
            <label className="block text-sm font-medium mb-2 flex items-center gap-2">
              <Youtube className="w-4 h-4 text-red-500" />
              Video YouTube
            </label>
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  value={currentYoutubeUrl}
                  onChange={(e) => setCurrentYoutubeUrl(e.target.value)}
                  placeholder="Dán link YouTube vào đây (ví dụ: https://www.youtube.com/watch?v=...)"
                  className="flex-1"
                />
                <Button
                  type="button"
                  onClick={addYouTubeUrl}
                  disabled={!currentYoutubeUrl.trim() || !extractYouTubeId(currentYoutubeUrl)}
                  variant="outline"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Thêm
                </Button>
              </div>
              
              {youtubeUrls.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium">Video đã thêm:</h4>
                  {youtubeUrls.map((url, index) => {
                    const videoId = extractYouTubeId(url);
                    return (
                      <div key={index} className="border rounded-lg p-3 bg-gray-50">
                        <div className="flex justify-between items-start mb-2">
                          <p className="text-sm text-gray-600 break-all">{url}</p>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeYouTubeUrl(index)}
                            className="text-red-500 hover:text-red-700 ml-2"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                        {videoId && (
                          <div className="aspect-video bg-black rounded overflow-hidden">
                            <iframe
                              src={`https://www.youtube.com/embed/${videoId}`}
                              className="w-full h-full"
                              frameBorder="0"
                              allowFullScreen
                              title={`YouTube video ${index + 1}`}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium mb-2">Tags (từ khóa)</label>
            <TagSelector
              selectedTags={tags}
              onTagsChange={setTags}
              placeholder="Thêm tag để dễ tìm kiếm..."
            />
          </div>

          {/* Visibility */}
          <div>
            <label className="block text-sm font-medium mb-2">Quyền xem bài viết</label>
            <Select value={visibility} onValueChange={(value: 'public' | 'vip' | 'draft') => setVisibility(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn quyền xem" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">🌍 Công khai - Ai cũng có thể xem</SelectItem>
                <SelectItem value="vip">👑 VIP Only - Chỉ thành viên VIP</SelectItem>
                <SelectItem value="draft">📝 Bản nháp - Chỉ mình tôi xem</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Attachments */}
          <div>
            <label className="block text-sm font-medium mb-2">Đính kèm file & hình ảnh</label>
            <AttachmentUploader
              onFilesChange={setAttachments}
              maxFiles={5}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-between pt-6 border-t">
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleSaveDraft}
                disabled={isLoading}
              >
                📝 Lưu nháp
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
              >
                Hủy
              </Button>
            </div>
            <Button
              type="submit"
              disabled={isLoading || !title.trim()}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              {isLoading ? 'Đang xử lý...' : (post ? '✏️ Cập nhật bài viết' : '🚀 Đăng bài viết')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default PostEditor;
