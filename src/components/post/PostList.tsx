
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Plus, SortDesc, Sparkles, Users, TrendingUp } from 'lucide-react';
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
    <div className="space-y-8">
      {/* Hero Header */}
      <div className="text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 rounded-full border border-purple-500/30 backdrop-blur-sm">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span className="text-sm font-medium text-cyan-300">Community Hub</span>
        </div>
        
        <div className="space-y-4">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent font-space">
            {filterByUser ? 'Bài viết của tôi' : 'AI Automation Community'}
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Nơi chia sẻ kiến thức, thảo luận và kết nối cùng những người đam mê AI & Automation
          </p>
        </div>

        {/* Stats */}
        <div className="flex justify-center gap-8 mt-8">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{posts.length}</div>
            <div className="text-sm text-slate-400 flex items-center gap-1">
              <Users className="w-3 h-3" />
              Bài viết
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{allTags.length}</div>
            <div className="text-sm text-slate-400 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              Chủ đề
            </div>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="glass-card p-6 rounded-2xl border border-purple-500/20">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Tìm kiếm bài viết, chủ đề..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 bg-slate-800/50 border-slate-600 text-white placeholder-slate-400 focus:border-purple-500"
              />
            </div>

            {/* Visibility Filter */}
            <Select value={selectedVisibility} onValueChange={setSelectedVisibility}>
              <SelectTrigger className="w-48 bg-slate-800/50 border-slate-600 text-white">
                <SelectValue placeholder="Lọc theo quyền xem" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600">
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="public">🌍 Công khai</SelectItem>
                <SelectItem value="vip">👑 VIP Only</SelectItem>
                <SelectItem value="draft">📝 Bản nháp</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
              <SortDesc className="w-4 h-4 mr-2" />
              Sắp xếp
            </Button>
          </div>
          
          {showCreateButton && (
            <Button
              onClick={handleCreatePost}
              className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white shadow-lg hover:shadow-purple-500/25 transition-all duration-300"
            >
              <Plus className="w-4 h-4 mr-2" />
              Tạo bài viết
            </Button>
          )}
        </div>

        {/* Tag Filter */}
        {allTags.length > 0 && (
          <div className="mt-6 space-y-3">
            <h3 className="text-sm font-medium text-slate-300 flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Lọc theo chủ đề:
            </h3>
            <div className="flex flex-wrap gap-2">
              {allTags.slice(0, 20).map((tag) => (
                <Badge
                  key={tag}
                  variant={selectedTags.includes(tag) ? "default" : "outline"}
                  className={`cursor-pointer transition-all duration-200 ${
                    selectedTags.includes(tag) 
                      ? 'bg-gradient-to-r from-purple-500 to-cyan-500 text-white shadow-lg' 
                      : 'border-slate-600 text-slate-300 hover:bg-slate-700 hover:border-purple-500'
                  }`}
                  onClick={() => toggleTag(tag)}
                >
                  #{tag}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Posts Grid */}
      <div className="space-y-6">
        {loading ? (
          <div className="text-center py-20">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500 mx-auto mb-4"></div>
              <div className="absolute inset-0 rounded-full h-16 w-16 border-2 border-purple-500/20 mx-auto animate-pulse"></div>
            </div>
            <p className="text-purple-300 text-lg">Đang tải bài viết...</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-20">
            <div className="glass-card p-12 rounded-2xl border border-slate-600 max-w-md mx-auto">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-10 h-10 text-slate-400" />
              </div>
              <h3 className="text-2xl font-semibold text-white mb-3">
                {posts.length === 0 ? 'Chưa có bài viết nào' : 'Không tìm thấy bài viết'}
              </h3>
              <p className="text-slate-400 mb-6 leading-relaxed">
                {posts.length === 0 
                  ? 'Hãy tạo bài viết đầu tiên để bắt đầu xây dựng cộng đồng.'
                  : 'Thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm khác.'
                }
              </p>
              {posts.length === 0 && showCreateButton && (
                <Button 
                  onClick={handleCreatePost} 
                  className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Tạo bài viết đầu tiên
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid gap-6">
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
