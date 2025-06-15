
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X, Plus, FileText, Image, Link } from 'lucide-react';
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
  
  const { createPost, updatePost } = usePosts();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const postData = {
        title,
        content,
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
        <CardTitle>{post ? 'Chỉnh sửa bài viết' : 'Tạo bài viết mới'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-2">Tiêu đề</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nhập tiêu đề bài viết..."
              required
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium mb-2">Nội dung</label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Viết nội dung bài viết của bạn..."
              rows={8}
              className="resize-none"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium mb-2">Tags</label>
            <TagSelector
              selectedTags={tags}
              onTagsChange={setTags}
            />
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="hover:text-red-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Visibility */}
          <div>
            <label className="block text-sm font-medium mb-2">Quyền xem</label>
            <Select value={visibility} onValueChange={(value: 'public' | 'vip' | 'draft') => setVisibility(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn quyền xem" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Công khai</SelectItem>
                <SelectItem value="vip">VIP Only</SelectItem>
                <SelectItem value="draft">Bản nháp</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Attachments */}
          <div>
            <label className="block text-sm font-medium mb-2">Đính kèm</label>
            <AttachmentUploader
              onFilesChange={setAttachments}
              maxFiles={5}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-between pt-4">
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleSaveDraft}
                disabled={isLoading}
              >
                Lưu nháp
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
              className="bg-gradient-to-r from-blue-500 to-purple-600"
            >
              {isLoading ? 'Đang xử lý...' : (post ? 'Cập nhật' : 'Đăng bài')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default PostEditor;
