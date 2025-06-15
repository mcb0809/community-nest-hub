
import React from 'react';
import PostList from '@/components/post/PostList';

const Community = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <PostList />
      </div>
    </div>
  );
};

export default Community;
