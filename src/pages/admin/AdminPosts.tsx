
import React from 'react';
import PostList from '@/components/post/PostList';

const AdminPosts = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Posts Management</h1>
          <p className="text-slate-400">Quản lý bài viết và thảo luận của cộng đồng</p>
        </div>
      </div>

      <PostList showCreateButton={true} />
    </div>
  );
};

export default AdminPosts;
