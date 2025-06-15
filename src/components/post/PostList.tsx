
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Plus, SortDesc } from 'lucide-react';
import { Post, usePosts } from '@/hooks/usePosts';
import PostCard from './PostCard';
import PostEditor from './PostEditor';

interface PostListProps {
  showCreateButton?: boolean;
  filterByUser?: string;
}

const PostList = ({ showCreateButton = true, filterByUser }: PostListProps) => {
  const [showEditor, setShowEditor] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVisibility, setSelectedVisibility] = useState<string>('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  
  const { posts, loading, refetch, deletePost, togglePin } = usePosts();

  // Get all unique tags from posts
  const allTags = Array.from(new Set(posts.flatMap(post => post.tags)));

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.content?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesVisibility = selectedVisibility === 'all' || post.visibility === selectedVisibility;
    const matchesTags = selectedTags.length === 0 || selectedTags.some(tag => post.tags.includes(tag));
    const matchesUser = !filterByUser || post.user_id === filterByUser;
    
    return matchesSearch && matchesVisibility && matchesTags && matchesUser;
  });

  const handleCreatePost = () => {
    setEditingPost(undefined);
    setShowEditor(true);
  };

  const handleEditPost = (post: Post) => {
    setEditingPost(post);
    setShowEditor(true);
  };

  const handleDeletePost = async (postId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bài viết này?')) {
      await deletePost(postId);
    }
  };

  const handleTogglePin = async (postId: string, isPinned: boolean) => {
    await togglePin(postId, isPinned);
  };

  const handleEditorSubmit = (post: Post) => {
    setShowEditor(false);
    setEditingPost(undefined);
    refetch();
  };

  const handleEditorCancel = () => {
    setShowEditor(false);
    setEditingPost(undefined);
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  if (showEditor) {
    return (
      <PostEditor
        post={editingPost}
        onSubmit={handleEditorSubmit}
        onCancel={handleEditorCancel}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            {filterByUser ? 'Bài viết của tôi' : 'Cộng đồng thảo luận'}
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Chia sẻ kiến thức và thảo luận cùng cộng đồng
          </p>
        </div>
        
        {showCreateButton && (
          <Button
            onClick={handleCreatePost}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Tạo bài viết
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            placeholder="Tìm kiếm bài viết..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Visibility Filter */}
        <Select value={selectedVisibility} onValueChange={setSelectedVisibility}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Lọc theo quyền xem" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="public">Công khai</SelectItem>
            <SelectItem value="vip">VIP Only</SelectItem>
            <SelectItem value="draft">Bản nháp</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" className="flex items-center gap-2">
          <SortDesc className="w-4 h-4" />
          Sắp xếp
        </Button>
      </div>

      {/* Tag Filter */}
      {allTags.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Lọc theo tags:</h3>
          <div className="flex flex-wrap gap-2">
            {allTags.slice(0, 20).map((tag) => (
              <Badge
                key={tag}
                variant={selectedTags.includes(tag) ? "default" : "outline"}
                className="cursor-pointer hover:bg-blue-100"
                onClick={() => toggleTag(tag)}
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Posts */}
      <div className="space-y-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p className="text-purple-300">Đang tải bài viết...</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {posts.length === 0 ? 'Chưa có bài viết nào' : 'Không tìm thấy bài viết'}
            </h3>
            <p className="text-gray-600 mb-4">
              {posts.length === 0 
                ? 'Hãy tạo bài viết đầu tiên để bắt đầu thảo luận.'
                : 'Thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm.'
              }
            </p>
            {posts.length === 0 && showCreateButton && (
              <Button onClick={handleCreatePost} className="bg-gradient-to-r from-blue-500 to-purple-600">
                <Plus className="w-4 h-4 mr-2" />
                Tạo bài viết đầu tiên
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {filteredPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onEdit={handleEditPost}
                onDelete={handleDeletePost}
                onTogglePin={handleTogglePin}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PostList;
